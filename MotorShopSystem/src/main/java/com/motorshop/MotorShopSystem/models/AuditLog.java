// com.motorshop.MotorShopSystem.models.AuditLog.java

package com.motorshop.MotorShopSystem.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private String username; // The user who performed the action

    @Column(nullable = false)
    private String actionType; // e.g., INVENTORY_UPDATE, USER_ROLE_CHANGE, SALE_CREATED

    private String entityType; // e.g., PART, USER, PURCHASE_ORDER

    private Long entityId; // The ID of the affected entity

    @Column(columnDefinition = "TEXT")
    private String details; // A detailed description of the change

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
