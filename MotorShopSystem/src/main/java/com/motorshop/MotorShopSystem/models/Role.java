package com.motorshop.MotorShopSystem.models;


// These role names correspond to the authorities checked by Spring Security (e.g., hasAuthority('SHOP_OWNER'))
public enum Role {

    // Core Roles
    SHOP_OWNER,
    INVENTORY_MANAGER,
    SALES_EXECUTIVE,
    SYSTEM_ADMIN,
    AUDITOR,
    CUSTOMER,

    // External/Specific Roles
    VENDOR,
    TECHNICIAN,
    DELIVERY_STAFF
}


//{
//    "firstName": "Alex",
//    "lastName": "Audit",
//    "email": "auditor@motorshop.com",
//    "password": "SecurePassword123",
//    "role": "AUDITOR"
//}