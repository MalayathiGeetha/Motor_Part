package com.motorshop.MotorShopSystem.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "inventory_alerts")
public class InventoryAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to the part that is low in stock (assuming you have a Part entity)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false)
    private Part part; // IMPORTANT: Ensure you have a Part entity

    private Integer currentStock;
    private Integer threshold;

    @Enumerated(EnumType.STRING)
    private AlertStatus status = AlertStatus.OPEN;

    private LocalDateTime detectedAt = LocalDateTime.now();
    private LocalDateTime resolvedAt;
}

