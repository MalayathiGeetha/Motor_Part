// com.motorshop.MotorShopSystem.service.LowStockSchedulerService.java (FINALIZED)

package com.motorshop.MotorShopSystem.service;

import com.motorshop.MotorShopSystem.models.Part;
import com.motorshop.MotorShopSystem.models.InventoryAlert;
import com.motorshop.MotorShopSystem.models.AlertStatus;
import com.motorshop.MotorShopSystem.repository.PartRepository;
import com.motorshop.MotorShopSystem.repository.InventoryAlertRepository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LowStockSchedulerService {

    private final PartRepository partRepository;
    private final InventoryAlertRepository alertRepository;
    private final AuditService auditService; // ADDED: Inject AuditService

    public LowStockSchedulerService(PartRepository partRepository,
                                    InventoryAlertRepository alertRepository,
                                    AuditService auditService /* ADDED */) {
        this.partRepository = partRepository;
        this.alertRepository = alertRepository;
        this.auditService = auditService; // Initialized
    }

    // Runs every hour (e.g., 0 minutes, 0 hours, every day)
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void checkLowStockAndGenerateAlerts() {
        System.out.println("Running individual part low stock check at: " + LocalDateTime.now());

        List<Part> allParts = partRepository.findAll();

        for (Part part : allParts) {
            int currentStock = part.getCurrentStock();
            int threshold = part.getReorderThreshold();

            if (currentStock <= threshold) {

                List<InventoryAlert> existingAlerts = alertRepository.findByPartIdAndStatus(part.getId(), AlertStatus.OPEN);

                if (existingAlerts.isEmpty()) {

                    // Create a new alert
                    InventoryAlert newAlert = new InventoryAlert(
                            null,
                            part,
                            currentStock,
                            threshold,
                            AlertStatus.OPEN,
                            LocalDateTime.now(),
                            null
                    );
                    alertRepository.save(newAlert);
                    System.out.println("Generated new alert for part: " + part.getPartName() + " (Stock: " + currentStock + ")");

                    // CRITICAL ADDITION: Log the alert creation in the audit system
                    auditService.logAction(
                            "LOW_STOCK_ALERT",
                            "PART",
                            part.getId(),
                            String.format("Alert generated. Stock: %d <= Threshold: %d.", currentStock, threshold)
                    );
                }
            }
        }
    }
}