package com.example.smartParking.repository;

import com.example.smartParking.entity.ParkingLot;
import com.example.smartParking.entity.ParkingSpot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {
    List<ParkingSpot> findByParkingLot(ParkingLot parkingLot);

    List<ParkingSpot> findByParkingLotAndActiveTrue(ParkingLot parkingLot);
}
