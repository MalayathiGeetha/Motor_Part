package com.motorshop.MotorShopSystem.controllers;

import com.motorshop.MotorShopSystem.models.SystemSetting;
import com.motorshop.MotorShopSystem.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SystemSettingController {

    private final SystemSettingService settingService;

    // GET ALL SETTINGS
    @GetMapping
    @PreAuthorize("hasAnyRole('SHOP_OWNER', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<SystemSetting>> getAllSettings() {
        return ResponseEntity.ok(settingService.getAllSettings());
    }

    // GET SETTING BY KEY
    @GetMapping("/{key}")
    @PreAuthorize("hasAnyRole('SHOP_OWNER', 'SYSTEM_ADMIN')")
    public ResponseEntity<SystemSetting> getSettingByKey(@PathVariable String key) {
        return ResponseEntity.ok(settingService.getSetting(key));
    }

    // UPDATE SETTINGS (Bulk update)
    @PutMapping
    @PreAuthorize("hasAnyRole('SHOP_OWNER', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<SystemSetting>> updateSettings(@RequestBody Map<String, String> settings) {
        List<SystemSetting> updatedSettings = settingService.updateMultipleSettings(settings);
        return ResponseEntity.ok(updatedSettings);
    }

    // CREATE OR UPDATE SINGLE SETTING
    @PostMapping
    @PreAuthorize("hasAnyRole('SHOP_OWNER', 'SYSTEM_ADMIN')")
    public ResponseEntity<SystemSetting> saveSetting(@RequestBody SystemSetting setting) {
        SystemSetting savedSetting = settingService.createOrUpdateSetting(setting);
        return ResponseEntity.ok(savedSetting);
    }

    // DELETE SETTING
    @DeleteMapping("/{key}")
    @PreAuthorize("hasAnyRole('SHOP_OWNER', 'SYSTEM_ADMIN')")
    public ResponseEntity<Void> deleteSetting(@PathVariable String key) {
        settingService.deleteSetting(key);
        return ResponseEntity.noContent().build();
    }
}