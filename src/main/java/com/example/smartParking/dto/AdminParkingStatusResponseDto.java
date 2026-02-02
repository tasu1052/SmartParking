package com.example.smartParking.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class AdminParkingStatusResponseDto {
    private String userId;
    private String carNumber;
    private Integer parkingSpotNumber;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
