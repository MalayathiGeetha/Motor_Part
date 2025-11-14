package com.motorshop.MotorShopSystem.auth;


import com.motorshop.MotorShopSystem.models.Role;
import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class UpdateRoleRequest {
    @NotNull(message = "Role is required")
    private Role newRole;
}