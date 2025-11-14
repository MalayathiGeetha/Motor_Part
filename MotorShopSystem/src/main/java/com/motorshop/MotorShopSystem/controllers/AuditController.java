package com.motorshop.MotorShopSystem.controllers;


import com.motorshop.MotorShopSystem.models.AuditLog;
import com.motorshop.MotorShopSystem.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/audit")
// Only the Auditor and System Admin should see all logs
@PreAuthorize("hasAnyAuthority('AUDITOR', 'SYSTEM_ADMIN','SHOP_OWNER')")
public class AuditController {

    private final AuditLogRepository auditRepository;

    public AuditController(AuditLogRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    /**
     * View all logs (System Admin/Auditor Requirement).
     */
    @GetMapping
    public ResponseEntity<Page<AuditLog>> getAllLogs(
            // Default size of 20 logs per page, allowing customization via request
            @PageableDefault(size = 20) Pageable pageable
    ) {
        // Use the paging method provided by JpaRepository
        return ResponseEntity.ok(auditRepository.findAll(pageable));
    }

    /**
     * Search logs by entity (e.g., show all changes made to a specific Part ID).
     */
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<AuditLog>> getLogsByEntity(@PathVariable String entityType, @PathVariable Long entityId) {
        List<AuditLog> logs = auditRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType.toUpperCase(), entityId);
        return ResponseEntity.ok(logs);
    }
}
