package com.example.smartParking.controller;

import com.example.smartParking.dto.UserInfoResponseDto;
import com.example.smartParking.dto.UserSignupDto;
import com.example.smartParking.dto.UserUpdateRequestDto;
import com.example.smartParking.entity.User;
import com.example.smartParking.service.UserService;
import com.example.smartParking.session.SessionConst;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserSignupDto dto){
        System.out.println("=== SIGNUP HIT === " + dto.getUserId());
        userService.createUser(dto);
        return ResponseEntity.ok("Signup Successful - v2");
    }

    @GetMapping("/me")
    public ResponseEntity<UserInfoResponseDto> getMyInfo(HttpSession session){
        Long loginUserId = (Long) session.getAttribute(SessionConst.LOGIN_USER_ID);
        if(loginUserId == null){
            return ResponseEntity.status(401).build();
        }
        User loginUser = userService.findById(loginUserId); // 필요
        return ResponseEntity.ok(userService.getMyInfo(loginUser));
    }

    @PutMapping
    public ResponseEntity<String> updateMyInfo(
            @RequestBody UserUpdateRequestDto requestDto,
            HttpSession session
    ){
        Long loginUserId = (Long) session.getAttribute(SessionConst.LOGIN_USER_ID);
        if(loginUserId == null){
            return ResponseEntity.status(401).build();
        }

        User loginUser = userService.findById(loginUserId);
        userService.updateMyInfo(loginUser, requestDto);
        return ResponseEntity.ok("Update Successful");
    }
}
