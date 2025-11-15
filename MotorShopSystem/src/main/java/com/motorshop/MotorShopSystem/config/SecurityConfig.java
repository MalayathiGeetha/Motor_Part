package com.motorshop.MotorShopSystem.config;

import com.motorshop.MotorShopSystem.filter.JwtAuthenticationFilter;
import com.motorshop.MotorShopSystem.service.impl.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth

                        // Public
                        .requestMatchers("/api/auth/**").permitAll()

                        // Vendor Portal (Vendor ONLY)
                        .requestMatchers("/api/vendor-portal/**")
                        .hasRole("VENDOR")

                        // Vendor Management (internal admin/inventory only)
                        .requestMatchers("/api/vendor/**")
                        .hasAnyRole("SHOP_OWNER", "INVENTORY_MANAGER", "SYSTEM_ADMIN")

                        // Sales Module
                        .requestMatchers("/api/sales/**")
                        .hasAnyRole("SHOP_OWNER", "SALES_EXECUTIVE", "SYSTEM_ADMIN")

                        // Inventory Module
                        .requestMatchers("/api/inventory/**")
                        .hasAnyRole("SHOP_OWNER", "INVENTORY_MANAGER", "SYSTEM_ADMIN","SALES_EXECUTIVE")

                        // Purchase Orders
                        .requestMatchers("/api/purchase-order/**")
                        .hasAnyRole("SHOP_OWNER", "INVENTORY_MANAGER", "SYSTEM_ADMIN")

                        // Admin
                        .requestMatchers("/api/admin/**")
                        .hasAnyRole("SHOP_OWNER", "SYSTEM_ADMIN")

                        .requestMatchers("/api/customers/profile").hasRole("CUSTOMER")
                        .requestMatchers("/api/customers/stats").hasRole("CUSTOMER")
                        // Admin endpoints for customer management
                        .requestMatchers("/api/customers").hasAnyRole("SYSTEM_ADMIN", "SHOP_OWNER", "SALES_EXECUTIVE")
                        .requestMatchers("/api/customers/**").hasAnyRole("SYSTEM_ADMIN", "SHOP_OWNER", "SALES_EXECUTIVE")

                        .requestMatchers("/api/admin/audit/**")
                        .hasAnyRole("AUDITOR", "SYSTEM_ADMIN", "SHOP_OWNER")

                        // Everything else
                        .anyRequest().authenticated()
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ✅ Define a CORS configuration bean for Spring Security
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow your React dev ports
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:5173"
        ));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true); // works with allowedOriginPatterns

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
