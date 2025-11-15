package com.motorshop.MotorShopSystem.auth;

import lombok.Data;

@Data
public class PurchaseOrderItemResponse {
    private Long id;
    private String partName;
    private Integer quantityOrdered;
    private Double unitCost;
    private Double lineTotal;
}