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
@Table(name = "sales_transaction")
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String invoiceNumber; // Unique invoice number
    private LocalDateTime transactionDate;

    private Double subTotal;
    private Double taxAmount;
    private Double grandTotal;

    private String customerName;
    private String recordedBy; // Email or ID of the Sales Executive/Owner

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleItem> items;
}
