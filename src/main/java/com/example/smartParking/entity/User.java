package com.example.smartParking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id; //db용 pk(auto increment)

    @Column(nullable = false, unique = true)
    private String userId; // 실제 유저 아이디

    @Column(nullable = false)
    private String userName;

    @Column(nullable = false)
    private String userPassword;

    private String phoneNumber;

    @Column(unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    private int age;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createAt;


}
