package com.xiaozongxiong.baoming.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("POST", "/api/auth/admin/login").permitAll()
                        .requestMatchers("POST", "/api/auth/user/login").permitAll()
                        .requestMatchers("GET", "/api/form/**").permitAll()
                        .requestMatchers("POST", "/api/form/**").permitAll()
                        .requestMatchers("GET", "/api/templates/**").permitAll()
                        .requestMatchers("GET", "/api/health").permitAll()
                        // Admin endpoints
                        .requestMatchers("/api/activities/**").hasRole("ADMIN")
                        // User self-service endpoints
                        .requestMatchers("GET", "/api/user/submissions").authenticated()
                        .requestMatchers("DELETE", "/api/submissions/*/cancel").authenticated()
                        // Auth required for /me
                        .requestMatchers("GET", "/api/auth/me").authenticated()
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
