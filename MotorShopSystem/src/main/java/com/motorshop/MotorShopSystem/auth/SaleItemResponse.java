package com.motorshop.MotorShopSystem.auth;



import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SaleItemResponse {
    private Long id;
    private Long partId;
    private String partName;
    private String partCode;
    private Integer quantity;
    private Double unitPrice;
    private Double totalPrice;
}