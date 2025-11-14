package com.motorshop.MotorShopSystem.repository;

import com.motorshop.MotorShopSystem.models.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    // Custom finder methods can be added here, e.g., to find all open POs for a vendor.
    // List<PurchaseOrder> findByStatus(PurchaseOrder.OrderStatus status);
    List<PurchaseOrder> findByVendorId(Long vendorId);
}