package com.motorshop.MotorShopSystem.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "purchase_order")
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderNumber; // Unique PO number

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor; // The vendor this PO is addressed to

    private LocalDateTime orderDate;
    private LocalDateTime expectedDeliveryDate;
    private LocalDateTime actualDeliveryDate;

    private Double totalOrderValue;

    @Enumerated(EnumType.STRING)
    private OrderStatus status; // e.g., PENDING, SHIPPED, RECEIVED, CANCELLED

    private String placedBy; // Email or ID of the user (Shop Owner/Inventory Manager) who placed it

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseOrderItem> items;

    public enum OrderStatus {
        PENDING, SHIPPED, RECEIVED, CANCELLED
    }
}