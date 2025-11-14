//package com.motorshop.MotorShopSystem.config;
//
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.CorsRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
//@Configuration
//public class CorsConfig implements WebMvcConfigurer {
//
//    @Override
//    public void addCorsMappings(CorsRegistry registry) {
//        registry.addMapping("/**") // Apply to all API endpoints
//                .allowedOrigins("http://localhost:5173") // <-- CRITICAL: YOUR FRONTEND URL
//                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allow these methods
//                .allowedHeaders("*") // Allow all headers
//                .allowCredentials(true); // Allows cookies/tokens (if needed)
//    }
//}
