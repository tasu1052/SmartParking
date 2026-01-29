package com.example.smartParking.interceptor;

import com.example.smartParking.session.SessionConst;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.HandlerInterceptor;

public class AdminCheckInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {
        HttpSession session = request.getSession(false);

        if(session==null){
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            return false;
        }

        String role = (String) session.getAttribute(SessionConst.LOGIN_ROLE);

        if(!"ADMIN".equals(role)){
            response.setStatus(HttpStatus.FORBIDDEN.value());
            return false;
        }
        return true;
    }
}
