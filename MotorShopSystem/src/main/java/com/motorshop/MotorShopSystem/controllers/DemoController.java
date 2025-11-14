package com.motorshop.MotorShopSystem.controllers;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/demo")
public class DemoController {

    /**
     * This endpoint is secured by the SecurityConfig.
     * Accessing it without a valid JWT will result in a 403 Forbidden or 401 Unauthorized error.
     */
    @GetMapping
    public ResponseEntity<String> sayHello() {
        return ResponseEntity.ok("Hello from the Secured Endpoint! Your JWT worked. 🎉");
    }

    // Example of a role-based endpoint (requires @EnableMethodSecurity in SecurityConfig)
    /*
    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> adminOnly() {
        return ResponseEntity.ok("This is an ADMIN-only endpoint.");
    }
    */
}