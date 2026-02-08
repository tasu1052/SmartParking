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
@RequestMapping("/api/auth")
public class SessionLoginController {
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto dto, HttpSession session) {
        try {
            User user = userService.login(dto.getUserId(), dto.getPassword());

            session.setAttribute(SessionConst.LOGIN_USER_ID, user.getId());
            session.setAttribute(SessionConst.LOGIN_ROLE, user.getRole().name()); // ✅ String 저장

            return ResponseEntity.ok(Map.of(
                    "message", "로그인 성공",
                    "userId", user.getUserId(),
                    "role", user.getRole().name() // ✅ "USER"/"ADMIN"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of(
                    "message", "아이디 또는 비밀번호가 올바르지 않습니다."
            ));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("로그아웃 성공");
    }

    //현재 로그인 상태인지(권한 확인)
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
