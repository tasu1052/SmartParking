package com.example.smartParking.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ParkingSpotResponseDto {
    private Long id;
    private int spotNumber;
    private boolean available;
}
