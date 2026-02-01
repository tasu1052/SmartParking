package com.example.smartParking.repository;

import com.example.smartParking.entity.ParkingLot;
import com.example.smartParking.entity.ParkingSpot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.List;
import java.util.Optional;

public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ParkingSpot> findById(Long id);

    List<ParkingSpot> findByParkingLot(ParkingLot parkingLot);

    List<ParkingSpot> findByParkingLotAndActiveTrue(ParkingLot parkingLot);
}