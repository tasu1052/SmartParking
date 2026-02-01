package com.example.smartParking.controller;

import com.example.smartParking.dto.ReservationCreateRequest;
import com.example.smartParking.entity.Reservation;
import com.example.smartParking.entity.User;
import com.example.smartParking.service.ReservationService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/reservations")
public class ReservationController {
    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<String> createReservation(
            @RequestBody ReservationCreateRequest request,
            HttpSession session
    ){
        User loginUser = (User) session.getAttribute("loginUser");

        if(loginUser == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("로그인이 필요합니다.");
        }

        reservationService.createReservation(loginUser, request);

        return ResponseEntity.ok("예약되었습니다.");
    }

    @DeleteMapping("/{reservationId}")
    public ResponseEntity<String> deleteReservation(
            @PathVariable Long reservationId,
            HttpSession session
    ){
        User loginUser = (User) session.getAttribute("loginUser");

        if(loginUser == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("로그인이 필요합니다.");
        }

        reservationService.cancelReservation(loginUser, reservationId);

        return ResponseEntity.ok("예약이 취소되었습니다.");
    }

    @GetMapping("/me/current")
    public ResponseEntity<List<Reservation>> myCurrentReservations(HttpSession session){
        User loginUser = (User) session.getAttribute("loginUser");

        if(loginUser == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        return ResponseEntity.ok(reservationService.getMyCurrentReservations(loginUser));
    }

    @GetMapping("/me/history")
    public ResponseEntity<List<Reservation>> myPastReservations(HttpSession session){
        User loginUser = (User) session.getAttribute("loginUser");

        if(loginUser == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        return ResponseEntity.ok(reservationService.getMyPastReservations(loginUser));
    }
}
