//package com.motorshop.MotorShopSystem.controllers;
//
//import com.motorshop.MotorShopSystem.models.User;
//import com.motorshop.MotorShopSystem.service.CustomerService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/customers")
//@RequiredArgsConstructor
//public class CustomerController {
//
//    private final CustomerService customerService;
//
//    /**
//     * Get customer's own profile
//     */
//    @GetMapping("/profile")
//    public ResponseEntity<User> getCustomerProfile() {
//        User customer = customerService.getCustomerProfile();
//        return ResponseEntity.ok(customer);
//    }
//
//    /**
//     * Update customer's own profile
//     */
//    @PutMapping("/profile")
//    public ResponseEntity<User> updateCustomerProfile(@RequestBody User updatedCustomer) {
//        User customer = customerService.updateCustomerProfile(updatedCustomer);
//        return ResponseEntity.ok(customer);
//    }
//
//    /**
//     * Get all customers (for admin/shop owner)
//     */
//    @GetMapping
//    public ResponseEntity<List<User>> getAllCustomers() {
//        List<User> customers = customerService.getAllCustomers();
//        return ResponseEntity.ok(customers);
//    }
//
//    /**
//     * Get customer by ID (for admin/shop owner)
//     */
//    @GetMapping("/{id}")
//    public ResponseEntity<User> getCustomerById(@PathVariable Long id) {
//        User customer = customerService.getCustomerById(id);
//        return ResponseEntity.ok(customer);
//    }
//
//    /**
//     * Deactivate customer account (admin/shop owner only)
//     */
//    @PutMapping("/{id}/deactivate")
//    public ResponseEntity<Map<String, String>> deactivateCustomer(@PathVariable Long id) {
//        customerService.deactivateCustomer(id);
//        return ResponseEntity.ok(Map.of("message", "Customer deactivated successfully"));
//    }
//
//    /**
//     * Get customer stats (for dashboard)
//     */
//    @GetMapping("/stats")
//    public ResponseEntity<Map<String, Object>> getCustomerStats() {
//        // Mock stats - replace with actual implementation
//        Map<String, Object> stats = Map.of(
//                "totalOrders", 17,
//                "pendingOrders", 2,
//                "completedOrders", 15,
//                "loyaltyPoints", 450
//        );
//        return ResponseEntity.ok(stats);
//    }
//}