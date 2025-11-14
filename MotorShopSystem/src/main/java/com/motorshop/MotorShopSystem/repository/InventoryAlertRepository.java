package com.motorshop.MotorShopSystem.repository;


import com.motorshop.MotorShopSystem.models.InventoryAlert;
import com.motorshop.MotorShopSystem.models.AlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InventoryAlertRepository extends JpaRepository<InventoryAlert, Long> {
    // Custom query to find existing OPEN alerts for a specific part
    List<InventoryAlert> findByPartIdAndStatus(Long partId, AlertStatus status);

    // Query for the Shop Owner/Manager to view all currently open alerts
    List<InventoryAlert> findByStatusOrderByDetectedAtDesc(AlertStatus status);
}