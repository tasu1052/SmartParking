package com.example.smartParking.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserInfoResponseDto {
    private String userId;
    private String name;
    private Integer age;
    private String email;
    private String phone;
}
