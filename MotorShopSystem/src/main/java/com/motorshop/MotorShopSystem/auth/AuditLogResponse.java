package com.motorshop.MotorShopSystem.auth;


import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AuditLogResponse {
    private Long id;
    private String timestamp;
    private String actionType;
    private String details;
    private String performedBy;
}