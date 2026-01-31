package com.example.smartParking.controller;

import com.example.smartParking.dto.ParkingSpotResponseDto;
import com.example.smartParking.entity.ParkingLot;
import com.example.smartParking.repository.ParkingLotRepository;
import com.example.smartParking.service.ParkingSpotService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/parking-lots")
public class ParkingSpotController {
    private final ParkingLotRepository parkingLotRepository;
    private final ParkingSpotService parkingSpotService;

    @GetMapping("/{parkingLotId}/spots")
    public List<ParkingSpotResponseDto> getParkingSpots(@PathVariable Long parkingLotId) {
        ParkingLot parkingLot = parkingLotRepository.findById(parkingLotId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 주차장입니다."));

        return parkingSpotService.getParkingSpotsByParkingLot(parkingLot);
    }
}
