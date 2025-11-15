// com.motorshop.MotorShopSystem.service.LowStockSchedulerService.java (CORRECTED)

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
    private final AuditService auditService;

    public LowStockSchedulerService(PartRepository partRepository,
                                    InventoryAlertRepository alertRepository,
                                    AuditService auditService) {
        this.partRepository = partRepository;
        this.alertRepository = alertRepository;
        this.auditService = auditService;
    }

    @Scheduled(cron = "0 0 * * * *") // every hour
    @Transactional
    public void checkLowStockAndGenerateAlerts() {

        System.out.println("Running individual part low stock check at: " + LocalDateTime.now());

        List<Part> allParts = partRepository.findAll();

        for (Part part : allParts) {

            int currentStock = part.getCurrentStock();
            int threshold = part.getReorderThreshold();

            if (currentStock <= threshold) {

                List<InventoryAlert> existingAlerts =
                        alertRepository.findByPartIdAndStatus(part.getId(), AlertStatus.OPEN);

                if (existingAlerts.isEmpty()) {

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

                    System.out.println("Generated new alert for part: " +
                            part.getPartName() + " (Stock: " + currentStock + ")");

                    // ✅ CORRECTED AUDIT LOG CALL
                    auditService.logAction(
                            "LOW_STOCK_ALERT",              // action
                            "Low stock alert generated",    // description
                            "PART",                         // entityType
                            part.getId(),                   // entityId
                            null,                           // oldValue
                            String.format(                  // newValue
                                    "Stock %d <= Threshold %d",
                                    currentStock,
                                    threshold
                            )
                    );
                }
            }
        }
    }
}
