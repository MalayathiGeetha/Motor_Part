// com.motorshop.MotorShopSystem.service.AdminService.java (CORRECTED)
package com.motorshop.MotorShopSystem.service;

import com.motorshop.MotorShopSystem.models.User;
import com.motorshop.MotorShopSystem.models.Role;
import com.motorshop.MotorShopSystem.repository.UserRepository;
import com.motorshop.MotorShopSystem.exceptions.ResourceNotFoundException;
import com.motorshop.MotorShopSystem.auth.UpdateRoleRequest;
import jakarta.persistence.EntityNotFoundException;
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

    // --- READ OPERATIONS ---
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Integer userId) {
        return userRepository.findById(userId);
    }

    // --- UPDATE USER DETAILS ---
    @Transactional
    public User updateUserDetails(Integer userId, User userDetails) {

        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // capture old state
        String oldDetails = existingUser.toString();

        existingUser.updateDetails(userDetails);
        User savedUser = userRepository.save(existingUser);

        // AUDIT — Correct signature
        auditService.logAction(
                "USER_DETAILS_UPDATE",
                "User details updated",
                "USER",
                userId.longValue(),
                oldDetails,
                savedUser.toString()
        );

        return savedUser;
    }

    // --- UPDATE USER ROLE ---
    @Transactional
    public User updateUserRole(Integer userId, UpdateRoleRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        Role oldRole = user.getRole();
        user.setRole(request.getNewRole());

        User savedUser = userRepository.save(user);

        // AUDIT — Correct signature
        auditService.logAction(
                "USER_ROLE_CHANGE",
                "Role updated",
                "USER",
                userId.longValue(),
                oldRole.toString(),
                request.getNewRole().toString()
        );

        return savedUser;
    }

    // --- RESET PASSWORD ---
    @Transactional
    public User resetPassword(Integer userId, String newPassword) {

        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("New password cannot be empty.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        String oldValue = "Password (Encrypted)";

        user.setPassword(passwordEncoder.encode(newPassword));
        User savedUser = userRepository.save(user);

        // AUDIT — Correct signature
        auditService.logAction(
                "USER_PASSWORD_RESET",
                "Password reset performed",
                "USER",
                userId.longValue(),
                oldValue,
                "Password Updated (Encrypted)"
        );

        return savedUser;
    }

    // --- DELETE USER ---
    @Transactional
    public void deleteUser(Integer userId) {

        User userToDelete = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        String oldDetails = userToDelete.toString();

        userRepository.deleteById(userId);

        // AUDIT — Correct signature
        auditService.logAction(
                "USER_DELETED",
                "User deleted",
                "USER",
                userId.longValue(),
                oldDetails,
                null
        );
    }
}
