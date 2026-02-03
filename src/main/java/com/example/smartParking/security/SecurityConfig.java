package com.example.smartParking.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // REST API 개발 단계에서는 보통 CSRF 끔 (Postman/프론트 테스트 편함)
                .csrf(AbstractHttpConfigurer::disable)

                // 기본 로그인 화면/Basic 인증 끄기 (원치 않는 401 방지)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)

                // 접근 권한 설정
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/users/signup",
                                "/api/auth/login"
                        ).permitAll()
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
