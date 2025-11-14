package com.motorshop.MotorShopSystem.controllers;

import com.motorshop.MotorShopSystem.auth.AuthRequest;
import com.motorshop.MotorShopSystem.auth.AuthResponse;
import com.motorshop.MotorShopSystem.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor // Injects the AuthService via constructor
public class AuthController {

    private final AuthService authService;

    /**
     * Endpoint for user registration.
     * Receives AuthRequest and returns a new JWT upon success.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest request) {
        // The AuthService handles creating the user, encoding the password, and generating the token.
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(@RequestBody AuthRequest request) {
        // The AuthService handles authentication and token generation.
        AuthResponse response = authService.authenticate(request);
        return ResponseEntity.ok(response);
    }
}
