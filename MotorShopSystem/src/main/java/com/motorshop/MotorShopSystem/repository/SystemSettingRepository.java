// com.motorshop.MotorShopSystem.repository.SystemSettingRepository.java

package com.motorshop.MotorShopSystem.repository;

import com.motorshop.MotorShopSystem.models.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, String> {
    // Inherits findAll(), findById(String), save(), delete()
}