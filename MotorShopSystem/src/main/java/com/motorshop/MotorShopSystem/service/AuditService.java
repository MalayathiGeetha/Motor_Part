// com.motorshop.MotorShopSystem.service.AuditService.java

package com.motorshop.MotorShopSystem.service;

import com.motorshop.MotorShopSystem.models.AuditLog;
import com.motorshop.MotorShopSystem.repository.AuditLogRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private final AuditLogRepository auditRepository;

    public AuditService(AuditLogRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    /**
     * Records a critical operation to the audit log.
     * Propagation.REQUIRES_NEW ensures the log entry is saved even if the main transaction fails.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(String actionType, String entityType, Long entityId, String details) {

        // 1. Get the current authenticated user's name/email
        String username = "SYSTEM"; // Default for scheduled or system tasks
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !("anonymousUser").equals(authentication.getPrincipal())) {
            username = authentication.getName(); // Assuming username is stored as the principal name
        }

        AuditLog log = AuditLog.builder()
                .username(username)
                .actionType(actionType)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .build();

        auditRepository.save(log);
    }
}
