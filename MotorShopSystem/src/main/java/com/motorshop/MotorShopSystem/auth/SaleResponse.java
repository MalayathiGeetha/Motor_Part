package com.motorshop.MotorShopSystem.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SaleResponse {
    private Long id;
    private String date;
    private Double subTotal;
    private Double taxAmount;
    private Double grandTotal;
    private String customerName;
    private List<ItemResponse> items;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ItemResponse {
        private String partName;
        private Integer quantitySold;
        private Double unitPriceAtSale;
        private Double lineTotal;
    }
}
