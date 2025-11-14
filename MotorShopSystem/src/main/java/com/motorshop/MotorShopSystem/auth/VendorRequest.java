package com.motorshop.MotorShopSystem.auth;


import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorRequest {
    private String vendorName;
    private String contactPerson;
    private String email;
    private String phoneNumber;
    private String address;
}
