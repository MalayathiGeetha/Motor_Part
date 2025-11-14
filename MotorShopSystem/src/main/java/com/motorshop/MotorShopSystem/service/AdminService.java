// com.motorshop.MotorShopSystem.service.AdminService.java (CORRECTED)

package com.motorshop.MotorShopSystem.service;

import com.motorshop.MotorShopSystem.models.User;
import com.motorshop.MotorShopSystem.models.Role; // FIX: Missing Import
import com.motorshop.MotorShopSystem.repository.UserRepository;
import com.motorshop.MotorShopSystem.exceptions.ResourceNotFoundException;
import com.motorshop.MotorShopSystem.auth.UpdateRoleRequest;
import jakarta.persistence.EntityNotFoundException; // FIX: Missing Import
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {
    private final AuditService auditService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(AuditService auditService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.auditService = auditService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // --- READ OPERATIONS (CRUD) ---
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Integer userId) {
        return userRepository.findById(userId);
    }

    // --- UPDATE OPERATIONS (CRUD) ---

    @Transactional
    public User updateUserDetails(Integer userId, User userDetails) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Use a simple comparison/check to see if something changed for logging
        String oldDetails = existingUser.toString(); // Simple way to capture old state

        // Uses the updateDetails method in the User model
        existingUser.updateDetails(userDetails);

        // Save the updated user
        User savedUser = userRepository.save(existingUser);

        // 1. Log the update (Audit)
        auditService.logAction("USER_DETAILS_UPDATE", "USER", userId.longValue(),
                "Details updated. Old: [" + oldDetails + "], New: [" + savedUser.toString() + "]");

        return savedUser;
    }

    @Transactional // Added @Transactional annotation for consistency
    // FIX: Changed Long userId to Integer userId for consistency (assuming User ID is Integer)
    public User updateUserRole(Integer userId, UpdateRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId)); // Used ResourceNotFoundException for consistency

        // Get old role for audit logging
        Role oldRole = user.getRole();

        // Update the user's role
        user.setRole(request.getNewRole());
        userRepository.save(user);

        // --- AUDIT LOGGING ---
        String details = String.format("Role changed from %s to %s for user: %s (ID: %d)",
                oldRole, request.getNewRole(), user.getEmail(), userId);

        // FIX: Changed userId to userId.longValue() to match AuditService signature
        auditService.logAction(
                "USER_ROLE_CHANGE",
                "USER",
                userId.longValue(),
                details
        );
        // --- END AUDIT LOGGING ---

        return user;
    }

    @Transactional
    public User resetPassword(Integer userId, String newPassword) {
        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("New password cannot be empty.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        user.setPassword(passwordEncoder.encode(newPassword));

        // Save the updated user
        User savedUser = userRepository.save(user);

        // 1. Log the password reset (Audit)
        auditService.logAction("USER_PASSWORD_RESET", "USER", userId.longValue(),
                "Password reset successfully.");

        return savedUser;
    }

    // --- DELETE OPERATION (CRUD) ---

    @Transactional
    public void deleteUser(Integer userId) {
        User userToDelete = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        userRepository.deleteById(userId);

        // 1. Log the deletion (Audit)
        auditService.logAction("USER_DELETED", "USER", userId.longValue(),
                "User " + userToDelete.getEmail() + " deleted.");
    }
}