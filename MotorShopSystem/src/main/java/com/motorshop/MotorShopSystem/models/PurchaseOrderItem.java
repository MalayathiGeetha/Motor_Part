package com.motorshop.MotorShopSystem.models;

import com.fasterxml.jackson.annotation.JsonIgnore; // Import to prevent recursion
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "purchase_order_item")
public class PurchaseOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    @JsonIgnore // Break recursion loop when serializing PurchaseOrder
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false)
    private Part part; // The part being ordered

    private Integer quantityOrdered;
    private Double unitCost; // Cost paid to the vendor for this part
    private Double lineTotal;
}