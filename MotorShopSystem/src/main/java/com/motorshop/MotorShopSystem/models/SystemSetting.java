// com.motorshop.MotorShopSystem.models.SystemSetting.java

package com.motorshop.MotorShopSystem.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "system_settings")
public class SystemSetting {

    @Id
    @Column(name = "setting_key", nullable = false, unique = true, length = 50)
    private String key; // e.g., SALES_TAX_RATE, MIN_STOCK_THRESHOLD

    @Column(name = "setting_value", nullable = false, length = 255)
    private String value; // e.g., "0.05", "10"

    private String description; // Optional: Explains what the setting does
}