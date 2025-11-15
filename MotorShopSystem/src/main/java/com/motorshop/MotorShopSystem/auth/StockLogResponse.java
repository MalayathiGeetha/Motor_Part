package com.motorshop.MotorShopSystem.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
public class StockLogResponse {
    private Long id;
    private String timestamp;
    private String action;
    private String description;
    private String performedBy;
    public StockLogResponse(Long id, String timestamp, String action, String description, String performedBy) {
        this.id = id;
        this.timestamp = timestamp;
        this.action = action;
        this.description = description;
        this.performedBy = performedBy;
    }


}
