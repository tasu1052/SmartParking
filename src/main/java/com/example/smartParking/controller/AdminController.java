package com.example.smartParking.controller;

import com.example.smartParking.dto.AdminParkingStatusResponseDto;
import com.example.smartParking.dto.AdminUserResponseDto;
import com.example.smartParking.entity.User;
import com.example.smartParking.entity.UserRole;
import com.example.smartParking.service.AdminService;
import com.example.smartParking.service.UserService;
import com.example.smartParking.session.SessionConst;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;

    private User getLoginUser(HttpSession session) {
        Long loginUserId = (Long) session.getAttribute(SessionConst.LOGIN_USER_ID);
        if (loginUserId == null) return null;
        return userService.findById(loginUserId);
    }

    @GetMapping("/parking")
    public ResponseEntity<List<AdminParkingStatusResponseDto>> getParkingStatus(HttpSession session) {
        User loginUser = getLoginUser(session);

        if (loginUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (loginUser.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(adminService.getCurrentParkingStatus());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponseDto>> getUsers(HttpSession session) {
        User loginUser = getLoginUser(session);

        if (loginUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (loginUser.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(adminService.getAllUsersInfo());
    }
}
