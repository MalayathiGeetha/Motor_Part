package com.motorshop.MotorShopSystem.auth;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PurchaseOrderResponse {
    private Long id;
    private String orderNumber;
    private VendorResponse vendor;
    private LocalDateTime orderDate;
    private LocalDateTime expectedDeliveryDate;
    private LocalDateTime actualDeliveryDate;
    private Double totalOrderValue;
    private String status;
    private String placedBy;
    private List<PurchaseOrderItemResponse> items;
}