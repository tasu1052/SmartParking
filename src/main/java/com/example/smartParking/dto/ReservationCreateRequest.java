package com.example.smartParking.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReservationCreateRequest {
    private Long parkingSpotId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String carNumber;
}
