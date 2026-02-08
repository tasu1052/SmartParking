package com.example.smartParking.service;

import com.example.smartParking.dto.UserInfoResponseDto;
import com.example.smartParking.dto.UserSignupDto;
import com.example.smartParking.dto.UserUpdateRequestDto;
import com.example.smartParking.entity.User;
import com.example.smartParking.entity.UserRole;
import com.example.smartParking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    //회원가입 메서드
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
        user.setRole(UserRole.USER);

        return userRepository.save(user);
    }

    //로그인 메서드
    public User login(String userId, String rawPassword){
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if(!passwordEncoder.matches(rawPassword, user.getUserPassword())){
            throw new IllegalArgumentException("Wrong password");
        }

        return user;
    }

    //회원 정보 조회 메서드
    @Transactional(readOnly = true)
    public UserInfoResponseDto getMyInfo(User loginUser){
        User user = userRepository.findById(loginUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new UserInfoResponseDto(
                user.getUserId(),
                user.getUserName(),
                user.getAge(),
                user.getEmail(),
                user.getPhoneNumber()
        );
    }

    //회원 정보 수정 메서드
    @Transactional
    public void updateMyInfo(User loginUser, UserUpdateRequestDto requestDto){
        User user = userRepository.findById(loginUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if(requestDto.getNewPassword() != null && !requestDto.getNewPassword().isBlank()){
        //비밀번호 변경
            if(requestDto.getCurrentPassword() == null ||
                !passwordEncoder.matches(
                        requestDto.getCurrentPassword(),
                        user.getUserPassword())
                ){
                throw new IllegalArgumentException("기존 비밀번호가 일치하지 않습니다.");
            }
            user.setUserPassword(passwordEncoder.encode(requestDto.getNewPassword()));
        }

        if (requestDto.getName() != null) {
            user.setUserName(requestDto.getName());
        }

        if (requestDto.getAge() != null) {
            user.setAge(requestDto.getAge());
        }

        if (requestDto.getEmail() != null && !requestDto.getEmail().equals(user.getEmail())) {
        //이메일 변경 시 중복 검사
            if(userRepository.existsByEmail((requestDto.getEmail()))) {
                throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
            }
            user.setEmail(requestDto.getEmail());
        }

        if (requestDto.getPhone() != null && !requestDto.getPhone().equals(user.getPhoneNumber())) {
        //전화번호 변경 시 중복 검사
            if(userRepository.existsByPhoneNumber(requestDto.getPhone())){
                throw new IllegalArgumentException("이미 사용 중인 전화번호입니다.");
            }

            user.setPhoneNumber(requestDto.getPhone());
        }

    }

    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
