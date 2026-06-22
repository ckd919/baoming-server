package com.xiaozongxiong.baoming.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // CORS 预检请求必须放行
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // ==================== 公开接口 ====================
                        .requestMatchers(HttpMethod.POST, "/api/auth/admin/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/admin/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/user/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/wechat-login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/form/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/form/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/templates/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/health").permitAll()
                        // ==================== 活动管理（需 ADMIN 角色） ====================
                        .requestMatchers("/api/activities/**").hasRole("ADMIN")
                        // ==================== 用户自助接口（登录即可） ====================
                        .requestMatchers(HttpMethod.GET, "/api/user/submissions").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/user/managed-activities").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/submissions/*/cancel").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/auth/bind-phone").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/auth/profile").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
