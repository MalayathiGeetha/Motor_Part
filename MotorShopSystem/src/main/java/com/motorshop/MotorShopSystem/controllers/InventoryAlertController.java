package com.motorshop.MotorShopSystem.controllers;

import com.motorshop.MotorShopSystem.models.InventoryAlert;
import com.motorshop.MotorShopSystem.models.AlertStatus;
import com.motorshop.MotorShopSystem.repository.InventoryAlertRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class InventoryAlertController {

    private final InventoryAlertRepository alertRepository;

    public InventoryAlertController(InventoryAlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    // View Low Stock Alerts (Shop Owner and Inventory Manager Requirement)
    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyAuthority('SHOP_OWNER', 'INVENTORY_MANAGER')")
    public ResponseEntity<List<InventoryAlert>> viewOpenLowStockAlerts() {
        // Find all alerts that are currently OPEN
        List<InventoryAlert> openAlerts = alertRepository.findByStatusOrderByDetectedAtDesc(AlertStatus.OPEN);
        return ResponseEntity.ok(openAlerts);
    }

    // Action to acknowledge an alert (Optional but recommended)
    @PutMapping("/{alertId}/acknowledge")
    @PreAuthorize("hasAnyAuthority('SHOP_OWNER', 'INVENTORY_MANAGER')")
    public ResponseEntity<Void> acknowledgeAlert(@PathVariable Long alertId) {
        // Simple logic: find alert, set status to ACKNOWLEDGED, save.
        alertRepository.findById(alertId).ifPresent(alert -> {
            alert.setStatus(AlertStatus.ACKNOWLEDGED);
            alertRepository.save(alert);
        });
        return ResponseEntity.noContent().build();
    }
}