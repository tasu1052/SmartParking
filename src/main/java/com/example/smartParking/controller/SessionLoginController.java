package com.example.smartParking.controller;

import com.example.smartParking.dto.LoginRequestDto;
import com.example.smartParking.entity.User;
import com.example.smartParking.service.UserService;
import com.example.smartParking.session.SessionConst;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class SessionLoginController {
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequestDto dto,
            HttpSession session) {
        User user = userService.login(dto.getUserId(), dto.getPassword());

        session.setAttribute(SessionConst.LOGIN_USER_ID, user.getId());
        session.setAttribute(SessionConst.LOGIN_ROLE, user.getRole());

        return ResponseEntity.ok("로그인 성공");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("로그아웃 성공");
    }
}
