package com.motorshop.MotorShopSystem.service;

import com.motorshop.MotorShopSystem.auth.AuthRequest;
import com.motorshop.MotorShopSystem.auth.AuthResponse;
import com.motorshop.MotorShopSystem.models.Role;
import com.motorshop.MotorShopSystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Registers a new user and returns a JWT, using the role specified in the request.
     */
    public AuthResponse register(AuthRequest request) {
        if (request.getRole() == Role.SYSTEM_ADMIN) {
            // You can throw an exception or assign a default role
            throw new IllegalArgumentException("Cannot self-register as System Admin.");
        }
        // 1. Build the User entity using Lombok's @Builder
        var user = com.motorshop.MotorShopSystem.models.User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // Encode the password!
                .role(request.getRole()) // ⬅️ UPDATED: Use the role from the request
                .build();

        // 2. Save to database
        userRepository.save(user);

        // 3. Generate JWT
        var jwtToken = jwtService.generateToken(user);

        // 4. Return the token in the response DTO
        return AuthResponse.builder().token(jwtToken).role(user.getRole()).build();
    }

    /**
     * Authenticates an existing user and returns a JWT with the user's role.
     */
    public AuthResponse authenticate(AuthRequest request) {
        try {
            System.out.println("🔐 Login attempt for: " + request.getEmail());
            System.out.println("📝 Password length: " + (request.getPassword() != null ? request.getPassword().length() : "null"));

            // 1. Authenticate the user
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            System.out.println("✅ Authentication successful");

            // 2. Retrieve the full User object
            var user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found after successful authentication."));
            System.out.println("👤 User found: " + user.getEmail() + " with role: " + user.getRole());

            // 3. Generate JWT
            var jwtToken = jwtService.generateToken(user);
            System.out.println("🎫 JWT generated successfully");

            return AuthResponse.builder()
                    .token(jwtToken)
                    .role(user.getRole())
                    .build();

        } catch (Exception e) {
            System.out.println("❌ Authentication failed: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }
}
