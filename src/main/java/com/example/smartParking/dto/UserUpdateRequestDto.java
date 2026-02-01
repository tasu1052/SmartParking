package com.example.smartParking.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserUpdateRequestDto {
    private String currentPassword;
    private String newPassword;
    private String name;
    private Integer age;
    private String email;
    private String phone;
}
