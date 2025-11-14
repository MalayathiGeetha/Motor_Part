// com.motorshop.MotorShopSystem.service.SystemSettingService.java

package com.motorshop.MotorShopSystem.service;

import com.motorshop.MotorShopSystem.models.SystemSetting;
import com.motorshop.MotorShopSystem.repository.SystemSettingRepository;
import com.motorshop.MotorShopSystem.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SystemSettingService {

    private final SystemSettingRepository settingRepository;

    public SystemSettingService(SystemSettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    // --- CRUD Operations for Admin ---

    public List<SystemSetting> getAllSettings() {
        return settingRepository.findAll();
    }

    public SystemSetting getSetting(String key) {
        return settingRepository.findById(key)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found with key: " + key));
    }

    @Transactional
    public SystemSetting createOrUpdateSetting(SystemSetting setting) {
        // Ensure key is always uppercase for consistency
        setting.setKey(setting.getKey().toUpperCase());

        // If the key exists, update the value and description. If not, create new.
        return settingRepository.save(setting);
    }

    @Transactional
    public void deleteSetting(String key) {
        if (!settingRepository.existsById(key)) {
            throw new ResourceNotFoundException("Setting not found with key: " + key);
        }
        settingRepository.deleteById(key);
    }

    // --- Utility Method for Other Services (e.g., Sales, Inventory) ---

    /**
     * Retrieves a setting value and attempts to parse it as a Double.
     * Throws an exception if the key is not found or value is not a number.
     */
    public Double getDoubleSettingValue(String key) {
        SystemSetting setting = getSetting(key);
        try {
            return Double.parseDouble(setting.getValue());
        } catch (NumberFormatException e) {
            throw new IllegalStateException("System setting '" + key + "' is not a valid number: " + setting.getValue());
        }
    }
}
