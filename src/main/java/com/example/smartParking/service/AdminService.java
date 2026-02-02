package com.example.smartParking.service;

import com.example.smartParking.dto.AdminParkingStatusResponseDto;
import com.example.smartParking.dto.AdminUserResponseDto;
import com.example.smartParking.entity.ReservationStatus;
import com.example.smartParking.repository.ReservationRepository;
import com.example.smartParking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    public List<AdminParkingStatusResponseDto> getCurrentParkingStatus(){
        return reservationRepository
                .findAllByStatus(ReservationStatus.RESERVED)
                .stream()
                .map(r -> new AdminParkingStatusResponseDto(
                        r.getUser().getUserId(),
                        r.getCarNumber(),
                        r.getParkingSpot().getSpotNumber(),
                        r.getStartTime(),
                        r.getEndTime()
                ))
                .toList();
    }

    public List<AdminUserResponseDto> getAllUsersInfo(){
        return userRepository.findAll()
                .stream()
                .map(user -> new AdminUserResponseDto(
                        user.getUserId(),
                        user.getUserName(),
                        user.getAge(),
                        user.getEmail(),
                        user.getPhoneNumber()
                ))
                .toList();
    }
}
