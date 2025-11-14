package com.motorshop.MotorShopSystem.auth;

import com.motorshop.MotorShopSystem.models.Role;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data // Provides @Getter and @Setter
@Builder // Allows AuthResponse.builder()...build()
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;

    // 🚨 FIX: Add the user's role to the response DTO
    private Role role;
}
