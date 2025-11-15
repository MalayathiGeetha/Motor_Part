package com.motorshop.MotorShopSystem.models;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@Table(name = "motor_part")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Part {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String partCode;        // Unique identifier for the part (e.g., OF-Z10)

    @Column(nullable = false)
    private String partName;        // Descriptive name (e.g., Oil Filter Z-10)

    private String description;
    @Column
    private String imageUrl; // URL or path of the image


    @Column(nullable = false)
    private Integer currentStock;   // Current quantity available

    @Column(nullable = false)
    private Integer reorderThreshold; // Minimum stock level before alerting

    @Column(nullable = false)
    private Double unitPrice;       // Selling price

    private String rackLocation;     // Where it's stored (for quick retrieval)

    // A relationship would typically be added here to link to a 'Vendor' entity
    // private Long vendorId;
}