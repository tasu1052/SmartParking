package com.example.smartParking.service;

import com.example.smartParking.dto.UserSignupDto;
import com.example.smartParking.entity.User;
import com.example.smartParking.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User createUser(UserSignupDto dto){

        if(userRepository.existsByUserId(dto.getUserId())){
            throw new IllegalArgumentException("UserId already exists");
        }

        if(userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setUserId(dto.getUserId());
        user.setUserName(dto.getUserName());
        user.setUserPassword(passwordEncoder.encode(dto.getPassword()));
        user.setEmail(dto.getEmail());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setAge(dto.getAge());
        user.setRole("USER");

        return userRepository.save(user);
    }

    public User login(String userId, String rawPassword){
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if(!passwordEncoder.matches(rawPassword, user.getUserPassword())){
            throw new IllegalArgumentException("Wrong password");
        }

        return user;
    }
}
