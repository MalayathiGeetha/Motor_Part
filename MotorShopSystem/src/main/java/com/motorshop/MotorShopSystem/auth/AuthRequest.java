package com.motorshop.MotorShopSystem.auth;


import com.motorshop.MotorShopSystem.models.Role;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;

    // ⬅️ NEW: Field to receive the desired role from the client
    private Role role;
}