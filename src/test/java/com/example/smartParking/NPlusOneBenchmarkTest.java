package com.example.smartParking;

import com.example.smartParking.dto.ReservationResponseDto;
import com.example.smartParking.entity.*;
import com.example.smartParking.repository.*;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 예약 내역 조회 N+1 벤치마크. 예약 내역 100 / 500 / 1,000건으로 확대 측정.
 *
 * 조회 후 DTO 변환 시 parkingSpot, parkingLot 에 접근 (실제 API와 동일 경로).
 *  - Before: findByUser (fetch join 없음) → 예약 1 + 공간 N + 주차장 L 쿼리
 *  - After : findMyHistoryWithSpotLot (fetch join) → 1 쿼리
 */
@SpringBootTest
class NPlusOneBenchmarkTest {

    private static final int LOTS = 10;
    private static final int[] SIZES = {10, 100, 1000, 5000, 10000}; // 예약 내역 수 (= 주차공간 수)
    private static final int WARMUP = 5;
    private static final int ITERATIONS = 30;

    @Autowired ReservationRepository reservationRepository;
    @Autowired ParkingSpotRepository parkingSpotRepository;
    @Autowired ParkingLotRepository parkingLotRepository;
    @Autowired UserRepository userRepository;
    @Autowired TransactionTemplate transactionTemplate;
    @Autowired EntityManagerFactory emf;

    private User user;

    private void seed(int reservations) {
        reservationRepository.deleteAll();
        parkingSpotRepository.deleteAll();
        parkingLotRepository.deleteAll();
        userRepository.deleteAll();

        User u = new User();
        u.setUserId("bench-user");
        u.setUserName("벤치마크");
        u.setUserPassword("pw");
        u.setRole(UserRole.USER);
        user = userRepository.save(u);

        List<ParkingLot> lots = new ArrayList<>();
        for (int l = 0; l < LOTS; l++) {
            ParkingLot lot = new ParkingLot();
            lot.setName("주차장" + l);
            lot.setLocation("서울 " + l);
            lots.add(lot);
        }
        parkingLotRepository.saveAll(lots);

        // 10,000건 × 30분 간격 ≈ 208일 → 전부 과거가 되도록 3년 전을 기준점으로
        LocalDateTime base = LocalDateTime.now().minusYears(3);
        List<ParkingSpot> spots = new ArrayList<>();
        List<Reservation> rs = new ArrayList<>();
        for (int i = 0; i < reservations; i++) {
            ParkingSpot spot = new ParkingSpot();
            spot.setParkingLot(lots.get(i % LOTS));
            spot.setSpotNumber(i + 1);
            spot.setActive(true);
            spots.add(spot);

            Reservation r = new Reservation();
            r.setUser(user);
            r.setParkingSpot(spot);
            r.setStartTime(base.plusMinutes(i * 30L));
            r.setEndTime(base.plusMinutes(i * 30L + 20)); // 과거 → 이용 내역
            r.setCarNumber("12가3456");
            r.setStatus(ReservationStatus.COMPLETED);
            rs.add(r);
        }
        parkingSpotRepository.saveAll(spots);
        reservationRepository.saveAll(rs);
    }

    /** Before: fetch join 없는 조회 + DTO 변환 (지연 로딩으로 N+1 발생) */
    private List<ReservationResponseDto> runWithoutFetchJoin() {
        LocalDateTime now = LocalDateTime.now();
        return transactionTemplate.execute(status ->
                reservationRepository.findByUser(user).stream()
                        .filter(r -> r.getEndTime().isBefore(now))
                        .map(ReservationResponseDto::from)
                        .toList());
    }

    /** After: fetch join 조회 + DTO 변환 */
    private List<ReservationResponseDto> runWithFetchJoin() {
        return transactionTemplate.execute(status ->
                reservationRepository.findMyHistoryWithSpotLot(user, LocalDateTime.now()).stream()
                        .map(ReservationResponseDto::from)
                        .toList());
    }

    @Test
    @DisplayName("N+1 쿼리 수·응답시간 측정: findByUser vs fetch join (100/500/1000건)")
    void benchmark() {
        Statistics stats = emf.unwrap(SessionFactory.class).getStatistics();
        stats.setStatisticsEnabled(true);

        for (int size : SIZES) {
            seed(size);

            // 워밍업 (JIT, 커넥션 풀, 쿼리 플랜 캐시)
            for (int i = 0; i < WARMUP; i++) {
                assertEquals(size, runWithoutFetchJoin().size());
                assertEquals(size, runWithFetchJoin().size());
            }

            // ---- 쿼리 수 측정 ----
            stats.clear();
            runWithoutFetchJoin();
            long naiveQueries = stats.getPrepareStatementCount();

            stats.clear();
            runWithFetchJoin();
            long fetchJoinQueries = stats.getPrepareStatementCount();

            // ---- 응답시간 측정 ----
            long[] naiveTimes = new long[ITERATIONS];
            long[] fetchTimes = new long[ITERATIONS];
            for (int i = 0; i < ITERATIONS; i++) {
                long t0 = System.nanoTime();
                runWithoutFetchJoin();
                naiveTimes[i] = System.nanoTime() - t0;

                long t1 = System.nanoTime();
                runWithFetchJoin();
                fetchTimes[i] = System.nanoTime() - t1;
            }

            double naiveAvg = avgMs(naiveTimes);
            double fetchAvg = avgMs(fetchTimes);
            double naiveMed = medianMs(naiveTimes);
            double fetchMed = medianMs(fetchTimes);
            double improvementAvg = (1 - fetchAvg / naiveAvg) * 100;
            double improvementMed = (1 - fetchMed / naiveMed) * 100;

            System.out.printf(
                    "RESULT NPLUS1 size=%d lots=%d iterations=%d | naiveQueries=%d fetchJoinQueries=%d | " +
                    "naiveAvgMs=%.3f naiveMedMs=%.3f fetchAvgMs=%.3f fetchMedMs=%.3f | improvAvg=%.1f%% improvMed=%.1f%%%n",
                    size, LOTS, ITERATIONS, naiveQueries, fetchJoinQueries,
                    naiveAvg, naiveMed, fetchAvg, fetchMed, improvementAvg, improvementMed);

            assertEquals(1, fetchJoinQueries, "fetch join 적용 시 쿼리는 1회여야 함");
            assertTrue(naiveQueries > size,
                    "미적용 시 N+1로 예약 수 이상의 쿼리가 발생해야 함 (실제: " + naiveQueries + ")");
        }
    }

    private double avgMs(long[] nanos) {
        return Arrays.stream(nanos).average().orElse(0) / 1_000_000.0;
    }

    private double medianMs(long[] nanos) {
        long[] sorted = nanos.clone();
        Arrays.sort(sorted);
        return sorted[sorted.length / 2] / 1_000_000.0;
    }
}
