package com.motorshop.MotorShopSystem.controllers;


import com.motorshop.MotorShopSystem.auth.UpdateRoleRequest;
import com.motorshop.MotorShopSystem.models.User;
import com.motorshop.MotorShopSystem.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
// Only SHOP_OWNER and SYSTEM_ADMIN can access user management
@PreAuthorize("hasAnyAuthority('SHOP_OWNER', 'SYSTEM_ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // --- READ OPERATIONS ---

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        // NOTE: In production, map User entities to a UserResponseDTO
        // to filter out the password field before sending the response.
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable Integer userId) {
        return adminService.getUserById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // --- UPDATE OPERATIONS ---

    @PutMapping("/users/{userId}")
    public ResponseEntity<User> updateUserDetails(@PathVariable Integer userId, @RequestBody User userDetails) {
        // Use the fields provided in userDetails to update the existing user
        User updatedUser = adminService.updateUserDetails(userId, userDetails);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/users/{userId}/role")
    // Note: The specific path /api/admin/users/** must be protected in SecurityConfig
    // Use @PreAuthorize to ensure strict control.
    @PreAuthorize("hasAnyAuthority('SYSTEM_ADMIN', 'SHOP_OWNER')")
    public ResponseEntity<User> updateUserRole(@PathVariable Integer userId, @RequestBody UpdateRoleRequest request) {
        User updatedUser = adminService.updateUserRole(userId, request);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/users/{userId}/reset-password")
    public ResponseEntity<Void> resetPassword(@PathVariable Integer userId,
                                              @RequestBody Map<String, String> body) {
        String newPassword = body.get("newPassword");

        adminService.resetPassword(userId, newPassword);

        // Return 204 No Content for successful operation
        return ResponseEntity.noContent().build();
    }

    // --- DELETE OPERATION ---

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}