package com.motorshop.MotorShopSystem.auth;


import lombok.Data;
import java.util.List;

@Data
public class SaleRequest {

    private String customerName;
    private List<ItemSaleRequest> items;

    // Nested DTO for each part sold
    @Data
    public static class ItemSaleRequest {
        private Long partId;
        private Integer quantity;
    }
}