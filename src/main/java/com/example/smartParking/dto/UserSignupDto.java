package com.example.smartParking.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSignupDto {
    private String userId;
    private String userName;
    private String password;
    private String email;
    private String phoneNumber;
    private int age;

}
