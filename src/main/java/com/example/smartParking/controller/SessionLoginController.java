package com.example.smartParking.controller;

import com.example.smartParking.dto.LoginRequestDto;
import com.example.smartParking.entity.User;
import com.example.smartParking.service.UserService;
import com.example.smartParking.session.SessionConst;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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

        return ResponseEntity.ok(Map.of(
                        "message", "로그인 성공",
                        "userId", user.getUserId(),
                        "role", user.getRole()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("로그아웃 성공");
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session) {
        Long userId = (Long) session.getAttribute(SessionConst.LOGIN_USER_ID);
        String role = (String) session.getAttribute(SessionConst.LOGIN_ROLE);
        if(userId == null){
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "role", role));
    }
}
