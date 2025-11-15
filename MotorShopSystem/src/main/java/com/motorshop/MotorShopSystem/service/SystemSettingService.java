package com.motorshop.MotorShopSystem.service;

import com.motorshop.MotorShopSystem.models.SystemSetting;
import com.motorshop.MotorShopSystem.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;

    public List<SystemSetting> getAllSettings() {
        return systemSettingRepository.findAll();
    }

    public SystemSetting getSetting(String key) {
        return systemSettingRepository.findById(key)
                .orElseThrow(() -> new RuntimeException("Setting not found: " + key));
    }

    public SystemSetting createOrUpdateSetting(SystemSetting setting) {
        return systemSettingRepository.save(setting);
    }

    @Transactional
    public List<SystemSetting> updateMultipleSettings(Map<String, String> settings) {
        List<SystemSetting> updatedSettings = new ArrayList<>();

        for (Map.Entry<String, String> entry : settings.entrySet()) {
            SystemSetting setting = systemSettingRepository.findById(entry.getKey())
                    .orElse(new SystemSetting(entry.getKey(), entry.getValue(), ""));

            setting.setValue(entry.getValue());
            SystemSetting savedSetting = systemSettingRepository.save(setting);
            updatedSettings.add(savedSetting);
        }

        return updatedSettings;
    }

    public void deleteSetting(String key) {
        systemSettingRepository.deleteById(key);
    }
}