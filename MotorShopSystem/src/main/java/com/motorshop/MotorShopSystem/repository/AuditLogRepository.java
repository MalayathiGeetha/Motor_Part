// com.motorshop.MotorShopSystem.repository.AuditLogRepository.java

package com.motorshop.MotorShopSystem.repository;

import com.motorshop.MotorShopSystem.models.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    // Custom queries for the Auditor/Admin
    List<AuditLog> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, Long entityId);
   // List<AuditLog> findByActionTypeOrderByTimestampDesc(String action);

}


