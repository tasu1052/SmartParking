package com.example.smartParking.controller;

import com.example.smartParking.dto.UserInfoResponseDto;
import com.example.smartParking.dto.UserSignupDto;
import com.example.smartParking.dto.UserUpdateRequestDto;
import com.example.smartParking.entity.User;
import com.example.smartParking.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserSignupDto dto){
        userService.createUser(dto);
        return ResponseEntity.ok("Signup Successful");
    }

    @GetMapping("/me")
    public ResponseEntity<UserInfoResponseDto> getMyInfo(HttpSession session){
        User loginUser = (User) session.getAttribute("loginUser");

        if(loginUser == null){
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(userService.getMyInfo(loginUser));
    }

    @PutMapping
    public ResponseEntity<String> updateMyInfo(@RequestBody UserUpdateRequestDto requestDto,
                                               HttpSession session){
        User loginUser = (User) session.getAttribute("loginUser");

        if(loginUser == null){
            return ResponseEntity.status(401).build();
        }

        userService.updateMyInfo(loginUser,requestDto);
        return ResponseEntity.ok("Update Successful");
    }
}
