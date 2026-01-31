package com.example.smartParking.repository;

import com.example.smartParking.entity.ParkingSpot;
import com.example.smartParking.entity.Reservation;
import com.example.smartParking.entity.ReservationStatus;
import com.example.smartParking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    boolean existsByParkingSpotAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
            ParkingSpot parkingSpot,
            ReservationStatus status,
            LocalDateTime endTime,
            LocalDateTime startTime);

    List<Reservation> findByUser(User user);

    List<Reservation> findByParkingSpot(ParkingSpot parkingSpot);
}
