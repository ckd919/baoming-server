package com.xiaozongxiong.baoming.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 配置
 * 注意：CORS 配置统一在 SecurityConfig.corsConfigurationSource() 中管理，
 * 避免双重 CORS 配置冲突导致 "Invalid CORS request" 错误。
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    // CORS 由 SecurityConfig 中的 CorsConfigurationSource 统一处理
}
