package com.example.smartParking.controller;

import com.example.smartParking.dto.ReservationCreateRequest;
import com.example.smartParking.dto.ReservationResponseDto;
import com.example.smartParking.entity.Reservation;
import com.example.smartParking.entity.User;
import com.example.smartParking.service.ReservationService;
import com.example.smartParking.service.UserService;
import com.example.smartParking.session.SessionConst;
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
    private final UserService userService;

    private User getLoginUser(HttpSession session) {
        Long loginUserId = (Long) session.getAttribute(SessionConst.LOGIN_USER_ID);
        if (loginUserId == null) return null;
        return userService.findById(loginUserId);
    }

    @PostMapping
    public ResponseEntity<String> createReservation(
            @RequestBody ReservationCreateRequest request,
            HttpSession session
    ){
        User loginUser = getLoginUser(session);
        if(loginUser == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        reservationService.createReservation(loginUser, request);
        return ResponseEntity.ok("예약되었습니다.");
    }

    @DeleteMapping("/{reservationId}")
    public ResponseEntity<String> deleteReservation(
            @PathVariable Long reservationId,
            HttpSession session
    ){
        User loginUser = getLoginUser(session);
        if(loginUser == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            reservationService.cancelReservation(loginUser, reservationId);
            return ResponseEntity.ok("예약이 취소되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @GetMapping("/me/current")
    public ResponseEntity<List<ReservationResponseDto>> myCurrentReservations(HttpSession session){
        User loginUser = getLoginUser(session);
        if(loginUser == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<ReservationResponseDto> res = reservationService.getMyCurrentReservations(loginUser)
                .stream()
                .map(ReservationResponseDto::from)
                .toList();

        return ResponseEntity.ok(res);
    }

    @GetMapping("/me/history")
    public ResponseEntity<List<ReservationResponseDto>> myPastReservations(HttpSession session){
        User loginUser = getLoginUser(session);
        if(loginUser == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<ReservationResponseDto> res = reservationService.getMyPastReservations(loginUser)
                .stream()
                .map(ReservationResponseDto::from)
                .toList();

        return ResponseEntity.ok(res);
    }
}
