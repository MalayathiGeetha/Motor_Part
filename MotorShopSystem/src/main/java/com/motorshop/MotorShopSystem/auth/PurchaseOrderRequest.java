package com.motorshop.MotorShopSystem.auth;


import lombok.Data;
import java.util.List;
import java.time.LocalDate;

@Data
public class PurchaseOrderRequest {
    private Long vendorId;
    private LocalDate expectedDeliveryDate;
    private List<POItemRequest> items;

    @Data
    public static class POItemRequest {
        private Long partId;
        private Integer quantity;
        private Double unitCost; // The cost paid to the vendor
    }
}