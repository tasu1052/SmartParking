package com.example.smartParking.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminUserResponseDto {
    private String userId;
    private String userName;
    private Integer age;
    private String email;
    private String phoneNumber;
}
