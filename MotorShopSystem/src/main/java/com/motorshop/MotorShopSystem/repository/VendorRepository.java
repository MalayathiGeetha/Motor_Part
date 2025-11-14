package com.motorshop.MotorShopSystem.repository;

import com.motorshop.MotorShopSystem.models.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    Optional<Vendor> findByVendorName(String vendorName);
}