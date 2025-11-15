/*
package com.motorshop.MotorShopSystem.service;

import com.motorshop.MotorShopSystem.models.User;
import com.motorshop.MotorShopSystem.models.Role;
import com.motorshop.MotorShopSystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final UserRepository userRepository;

    */
/**
     * Get customer profile (for customers to view their own profile)
     *//*

    public User getCustomerProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    */
/**
     * Update customer profile
     *//*

    public User updateCustomerProfile(User updatedCustomer) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User existingCustomer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Update allowed fields
        if (updatedCustomer.getFirstName() != null) {
            existingCustomer.setFirstName(updatedCustomer.getFirstName());
        }
        if (updatedCustomer.getLastName() != null) {
            existingCustomer.setLastName(updatedCustomer.getLastName());
        }
        if (updatedCustomer.getPhone() != null) {
            existingCustomer.setPhone(updatedCustomer.getPhone());
        }
        if (updatedCustomer.getAddress() != null) {
            existingCustomer.setAddress(updatedCustomer.getAddress());
        }
        if (updatedCustomer.getCity() != null) {
            existingCustomer.setCity(updatedCustomer.getCity());
        }
        if (updatedCustomer.getState() != null) {
            existingCustomer.setState(updatedCustomer.getState());
        }
        if (updatedCustomer.getZipCode() != null) {
            existingCustomer.setZipCode(updatedCustomer.getZipCode());
        }
        if (updatedCustomer.getCountry() != null) {
            existingCustomer.setCountry(updatedCustomer.getCountry());
        }

        return userRepository.save(existingCustomer);
    }

    */
/**
     * Get all customers (for admin/shop owner)
     *//*

    public List<User> getAllCustomers() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user has permission to view all customers
        if (!hasPermissionToViewCustomers(currentUser.getRole())) {
            throw new AccessDeniedException("Access denied");
        }

        return userRepository.findByRole(Role.CUSTOMER);
    }

    */
/**
     * Get customer by ID (for admin/shop owner)
     *//*

    public User getCustomerById(Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user has permission to view customers
        if (!hasPermissionToViewCustomers(currentUser.getRole())) {
            throw new AccessDeniedException("Access denied");
        }

        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    private boolean hasPermissionToViewCustomers(Role role) {
        return role == Role.SYSTEM_ADMIN ||
                role == Role.SHOP_OWNER ||
                role == Role.SALES_EXECUTIVE ||
                role == Role.INVENTORY_MANAGER;
    }

    */
/**
     * Deactivate customer account
     *//*

    public void deactivateCustomer(Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only admin/shop owner can deactivate customers
        if (currentUser.getRole() != Role.SYSTEM_ADMIN && currentUser.getRole() != Role.SHOP_OWNER) {
            throw new AccessDeniedException("Access denied");
        }

        User customer = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        customer.setIsActive(false);
        userRepository.save(customer);
    }
}*/
