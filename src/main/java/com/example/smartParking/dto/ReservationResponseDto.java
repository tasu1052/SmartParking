package com.example.smartParking.dto;

import com.example.smartParking.entity.Reservation;
import com.example.smartParking.entity.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ReservationResponseDto {

    private Long id;
    private String carNumber;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ReservationStatus status;

    // 주차공간
    private Long parkingSpotId;
    private Integer spotNumber;      // ParkingSpot에 spotNumber가 있을 때만 사용

    // 주차장(선택)
    private Long parkingLotId;
    private String parkingLotName;

    public static ReservationResponseDto from(Reservation r) {
        // LAZY라서 여기 접근할 때 트랜잭션 안이면 오류 날 수 있음
        // 지금 서비스가 @Transactional이라면 컨트롤러에서 호출 시 OK
        var spot = r.getParkingSpot();
        var lot = spot != null ? spot.getParkingLot() : null;

        return new ReservationResponseDto(
                r.getId(),
                r.getCarNumber(),
                r.getStartTime(),
                r.getEndTime(),
                r.getStatus(),
                spot != null ? spot.getId() : null,
                // spotNumber 필드가 없다면 아래 줄을 null로 바꾸거나 제거
                spot != null ? spot.getSpotNumber() : null,
                lot != null ? lot.getId() : null,
                lot != null ? lot.getName() : null
        );
    }
}
