package com.example.smartParking.service.scheduler;

import com.example.smartParking.entity.Reservation;
import com.example.smartParking.entity.ReservationStatus;
import com.example.smartParking.repository.ReservationRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ReservationScheduler {
    private final ReservationRepository reservationRepository;

    /*
    1분마다 종료된 예약을 COMPLETE로 변경
     */

    @Transactional
    @Scheduled(fixedRate = 60000)
    public void completeReservations() {
        LocalDateTime now = LocalDateTime.now();

        List<Reservation> expiredReservation =
                reservationRepository.findByStatusAndEndTimeBefore(
                        ReservationStatus.RESERVED, now
                );

        for(Reservation reservation : expiredReservation) {
            reservation.setStatus(ReservationStatus.COMPLETED);
        }
    }
}
