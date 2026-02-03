import com.example.smartParking.interceptor.AdminCheckInterceptor;
import com.example.smartParking.interceptor.LoginCheckInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {
    private final LoginCheckInterceptor loginCheckInterceptor;
    private final AdminCheckInterceptor adminCheckInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry){

        // 로그인 사용자만 접근 가능 (API 전체 보호)
        registry.addInterceptor(loginCheckInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/auth/login",
                        "/api/auth/logout",// 로그인/로그아웃
                        "/api/users/signup"     // 회원가입
                );

        // 관리자만 접근 가능
        registry.addInterceptor(adminCheckInterceptor)
                .addPathPatterns("/api/admin/**");
    }
}
