package com.motorshop.MotorShopSystem.repository;

import com.motorshop.MotorShopSystem.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    /**
     * Custom method to find a user by their email, used by UserDetailsService.
     */
    Optional<User> findByEmail(String email);

}