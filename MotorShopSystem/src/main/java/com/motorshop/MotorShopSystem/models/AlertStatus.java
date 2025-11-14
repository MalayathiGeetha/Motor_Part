package com.motorshop.MotorShopSystem.models;
// Helper Enum for the status of the alert
public enum AlertStatus {
    OPEN,        // Needs attention
    ACKNOWLEDGED, // Manager has seen it
    RESOLVED     // Stock level is now above threshold
}
