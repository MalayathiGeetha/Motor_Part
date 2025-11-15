package com.motorshop.MotorShopSystem.service;

import com.motorshop.MotorShopSystem.models.AuditLog;
import com.motorshop.MotorShopSystem.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    /**
     * General audit logging method
     */
    public void logAction(
            String actionType,
            String details,
            String entityType,
            Long entityId,
            String oldValue,
            String newValue
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : "SYSTEM";

        String combinedDetails = details;

        // Append old and new values if provided
        if (oldValue != null || newValue != null) {
            combinedDetails += " | OLD: " + oldValue + " | NEW: " + newValue;
        }

        AuditLog auditLog = AuditLog.builder()
                .actionType(actionType)
                .details(combinedDetails)
                .entityType(entityType)
                .entityId(entityId)
                .timestamp(LocalDateTime.now())
                .username(username)
                .build();

        auditLogRepository.save(auditLog);
    }

    /**
     * Simple logging without old/new values
     */
    public void logSimpleAction(String actionType, String details, String entityType) {
        logAction(actionType, details, entityType, null, null, null);
    }
}
