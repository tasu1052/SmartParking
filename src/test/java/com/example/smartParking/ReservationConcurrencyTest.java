package com.example.smartParking;

import com.example.smartParking.dto.ReservationCreateRequest;
import com.example.smartParking.entity.*;
import com.example.smartParking.repository.*;
import com.example.smartParking.service.ReservationService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * 동시 예약 요청 시 중복 예약(race condition) 검증. 스레드 수 10/50/100으로 확대 측정.
 *
 *  - 테스트 1: 실제 서비스 로직(비관적 락 적용) → 몇 명이 동시에 요청해도 정확히 1건만 성공
 *  - 테스트 2: 락 없이 동일 로직 수행(체크-삽입 사이 동시 진입 재현) → 전원 중복 예약 발생
 */
@SpringBootTest
class ReservationConcurrencyTest {

    private static final int[] THREAD_COUNTS = {10, 50, 100};

    @Autowired ReservationService reservationService;
    @Autowired ReservationRepository reservationRepository;
    @Autowired ParkingSpotRepository parkingSpotRepository;
    @Autowired ParkingLotRepository parkingLotRepository;
    @Autowired UserRepository userRepository;
    @Autowired TransactionTemplate transactionTemplate;
    @PersistenceContext EntityManager em;

    private Long spotId;
    private List<User> users;
    private LocalDateTime start;
    private LocalDateTime end;

    private void prepare(int userCount) {
        reservationRepository.deleteAll();
        parkingSpotRepository.deleteAll();
        parkingLotRepository.deleteAll();
        userRepository.deleteAll();

        ParkingLot lot = new ParkingLot();
        lot.setName("테스트 주차장");
        lot.setLocation("서울");
        parkingLotRepository.save(lot);

        ParkingSpot spot = new ParkingSpot();
        spot.setParkingLot(lot);
        spot.setSpotNumber(1);
        spot.setActive(true);
        parkingSpotRepository.saveAndFlush(spot);
        spotId = spot.getId();

        List<User> newUsers = new ArrayList<>();
        for (int i = 0; i < userCount; i++) {
            User u = new User();
            u.setUserId("concurrent-user-" + i);
            u.setUserName("동시성테스트" + i);
            u.setUserPassword("pw");
            u.setRole(UserRole.USER);
            newUsers.add(u);
        }
        users = userRepository.saveAll(newUsers);

        start = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);
        end = start.plusHours(2);
    }

    private ReservationCreateRequest request() {
        ReservationCreateRequest req = new ReservationCreateRequest();
        req.setParkingSpotId(spotId);
        req.setStartTime(start);
        req.setEndTime(end);
        req.setCarNumber("12가3456");
        return req;
    }

    /** 락 적용 시나리오 1회 실행: N개 스레드 동시 출발 → (성공, 충돌, 저장 수, 전체 처리 시간) */
    private long[] runLockedScenario(int threads) throws Exception {
        prepare(threads);

        AtomicInteger success = new AtomicInteger();
        AtomicInteger conflict = new AtomicInteger();

        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CountDownLatch ready = new CountDownLatch(threads);
        CountDownLatch go = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(threads);

        for (int i = 0; i < threads; i++) {
            final User user = users.get(i);
            pool.submit(() -> {
                ready.countDown();
                try {
                    go.await();
                    reservationService.createReservation(user, request());
                    success.incrementAndGet();
                } catch (Exception e) {
                    conflict.incrementAndGet();
                } finally {
                    done.countDown();
                }
            });
        }

        ready.await();
        long t0 = System.nanoTime();
        go.countDown(); // 동시에 출발
        done.await(120, TimeUnit.SECONDS);
        long elapsedMs = (System.nanoTime() - t0) / 1_000_000;
        pool.shutdown();

        long saved = reservationRepository.count();
        return new long[]{success.get(), conflict.get(), saved, elapsedMs};
    }

    @Test
    @DisplayName("[락 적용] 동일 시간·공간 동시 예약 → 항상 1건만 성공 (10/50/100 스레드)")
    void withPessimisticLock_onlyOneSucceeds() throws Exception {
        // 워밍업: JIT·Hibernate 초기화·커넥션 풀 램프업 비용을 측정에서 제외
        for (int i = 0; i < 3; i++) {
            runLockedScenario(10);
        }

        for (int threads : THREAD_COUNTS) {
            long[] r = runLockedScenario(threads);
            System.out.printf("RESULT LOCKED threads=%d success=%d conflict=%d savedRows=%d totalElapsedMs=%d%n",
                    threads, r[0], r[1], r[2], r[3]);

            assertEquals(1, r[0], "성공은 정확히 1건이어야 함 (threads=" + threads + ")");
            assertEquals(threads - 1, r[1]);
            assertEquals(1, r[2], "DB에 중복 예약이 없어야 함");
        }
    }

    @Test
    @DisplayName("[락 미적용] 중복 체크만으로는 동시 진입 시 전원 중복 예약 (10/50/100 스레드)")
    void withoutLock_duplicatesOccur() throws Exception {
        for (int threads : THREAD_COUNTS) {
            prepare(threads);

            AtomicInteger success = new AtomicInteger();

            ExecutorService pool = Executors.newFixedThreadPool(threads);
            // 모든 스레드가 "중복 없음" 확인을 마친 뒤 삽입하도록 동기화
            // → 여러 요청이 동시에 검증을 통과하는 순간을 재현
            CyclicBarrier afterCheck = new CyclicBarrier(threads);
            CountDownLatch done = new CountDownLatch(threads);

            for (int i = 0; i < threads; i++) {
                final User user = users.get(i);
                pool.submit(() -> {
                    try {
                        transactionTemplate.executeWithoutResult(status -> {
                            // 락 없이 조회 (기존 findById와 동일하나 @Lock 미적용)
                            ParkingSpot spot = em.find(ParkingSpot.class, spotId);

                            boolean exists = reservationRepository
                                    .existsByParkingSpotAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                                            spot, ReservationStatus.RESERVED, end, start);

                            try {
                                afterCheck.await(60, TimeUnit.SECONDS);
                            } catch (Exception e) {
                                throw new IllegalStateException(e);
                            }

                            if (exists) {
                                throw new IllegalArgumentException("이미 예약된 시간입니다.");
                            }

                            Reservation r = new Reservation();
                            r.setUser(user);
                            r.setParkingSpot(spot);
                            r.setStartTime(start);
                            r.setEndTime(end);
                            r.setCarNumber("12가3456");
                            r.setStatus(ReservationStatus.RESERVED);
                            reservationRepository.save(r);
                        });
                        success.incrementAndGet();
                    } catch (Exception ignored) {
                    } finally {
                        done.countDown();
                    }
                });
            }

            done.await(120, TimeUnit.SECONDS);
            pool.shutdown();

            long saved = reservationRepository.count();
            System.out.printf("RESULT NOLOCK threads=%d passedCheck=%d savedRows=%d duplicates=%d%n",
                    threads, success.get(), saved, Math.max(0, saved - 1));

            assertEquals(threads, saved, "락이 없으면 전원이 중복 체크를 통과해 중복 예약이 발생");
        }
    }
}
