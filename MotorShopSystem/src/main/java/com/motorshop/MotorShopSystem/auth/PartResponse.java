package com.motorshop.MotorShopSystem.auth;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartResponse {

    private Long id;
    private String partCode;
    private String partName;
    private String description;
    private String imageUrl;

    private Double unitPrice;
    private Integer currentStock;
    private Integer reorderThreshold;
    private String rackLocation;

    private String stockStatus; // e.g., "In Stock", "Low", "Out of Stock"
}