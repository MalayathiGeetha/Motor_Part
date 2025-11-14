package com.motorshop.MotorShopSystem.auth;


import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartRequest {

    private String partCode;
    private String partName;
    private String description;
    private Double unitPrice;
    private Integer reorderThreshold;
    private String rackLocation;
    private String imageUrl; // URL or path of the image


    // Initial stock is often included in the creation request
    private Integer initialStock;
}