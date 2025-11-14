package com.motorshop.MotorShopSystem.models;

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
@Table(name = "vendor")
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String vendorName;

    private String contactPerson;

    @Column(unique = true)
    private String email;

    private String phoneNumber;
    private String address;

    // Vendor status (e.g., Active, Inactive)
    private String status;
}