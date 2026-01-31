package com.example.smartParking.service;

import com.example.smartParking.dto.ParkingSpotResponseDto;
import com.example.smartParking.entity.ParkingLot;
import com.example.smartParking.entity.ReservationStatus;
import com.example.smartParking.repository.ParkingSpotRepository;
import com.example.smartParking.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ParkingSpotService {
    private final ParkingSpotRepository parkingSpotRepository;
    private final ReservationRepository reservationRepository;

    public List<ParkingSpotResponseDto> getParkingSpotsByParkingLot(ParkingLot parkingLot) {
        LocalDateTime now = LocalDateTime.now();

        return parkingSpotRepository.findByParkingLotAndActiveTrue(parkingLot)
                .stream()
                .map(spot -> {
                    boolean isReserved = reservationRepository
                            .existsByParkingSpotAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                                    spot, ReservationStatus.RESERVED, now, now
                            );
                    return new ParkingSpotResponseDto(
                            spot.getId(),
                            spot.getSpotNumber(),
                            !isReserved
                    );
                }).toList();
    }
}
