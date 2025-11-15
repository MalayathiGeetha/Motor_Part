package com.motorshop.MotorShopSystem.auth;

import lombok.Data;

@Data
public class VendorResponse {
    private Long id;
    private String vendorName;
    private String contactPerson;
    private String email;
    private String phoneNumber;
    private String address;
    private String status;
}
