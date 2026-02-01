package com.example.smartParking.service;

import com.example.smartParking.dto.ReservationCreateRequest;
import com.example.smartParking.entity.ParkingSpot;
import com.example.smartParking.entity.Reservation;
import com.example.smartParking.entity.ReservationStatus;
import com.example.smartParking.entity.User;
import com.example.smartParking.repository.ParkingSpotRepository;
import com.example.smartParking.repository.ReservationRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final ParkingSpotRepository parkingSpotRepository;

    //예약 생성 메서드
    public void createReservation(User user, ReservationCreateRequest request){
        ParkingSpot parkingSpot = parkingSpotRepository.findById(request.getParkingSpotId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 주차 공간입니다."));

        //시간 유효성 체크
        if(request.getStartTime().isAfter(request.getEndTime())){
            throw new IllegalArgumentException("시작 시간이 종료 시간보다 늦을 수 없습니다.");
        }

        //중복 예약 검사
        boolean exists = reservationRepository
                .existsByParkingSpotAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                        parkingSpot,
                        ReservationStatus.RESERVED,
                        request.getEndTime(),
                        request.getStartTime()
                );
        if(exists){
            throw new IllegalArgumentException("이미 예약된 시간입니다.");
        }

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setParkingSpot(parkingSpot);
        reservation.setStartTime(request.getStartTime());
        reservation.setEndTime(request.getEndTime());
        reservation.setCarNumber(request.getCarNumber());
        reservation.setStatus(ReservationStatus.RESERVED);

        reservationRepository.save(reservation);
    }

    //예약 취소 메서드
    public void cancelReservation(User loginUser, Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("예약이 존재하지 않습니다."));

        if(reservation.getUser().getId() != loginUser.getId()){
            throw new IllegalArgumentException("본인의 예약만 취소할 수 있습니다.");
        }

        if(reservation.getStatus() != ReservationStatus.RESERVED){
            throw new IllegalStateException("이미 취소되었거나 완료된 예약입니다.");
        }

        reservation.setStatus(ReservationStatus.CANCELED);
    }

    //현재 예약 조회
    @Transactional(readOnly = true)
    public List<Reservation> getMyCurrentReservations(User user){
        return reservationRepository.findByUserAndStatusAndEndTimeAfter(
                user, ReservationStatus.RESERVED, LocalDateTime.now()
        );
    }

    @Transactional(readOnly = true)
    public List<Reservation> getMyPastReservations(User user){
        return reservationRepository.findByUserAndEndTimeBefore(
                user, LocalDateTime.now()
        );
    }
}
