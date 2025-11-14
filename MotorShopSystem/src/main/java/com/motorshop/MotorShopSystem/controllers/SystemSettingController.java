package com.motorshop.MotorShopSystem.controllers;
// com.motorshop.MotorShopSystem.controllers.SystemSettingController.java

import com.motorshop.MotorShopSystem.models.SystemSetting;
import com.motorshop.MotorShopSystem.service.SystemSettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/settings")
// Protect this controller using the highest roles
@PreAuthorize("hasAnyAuthority('SHOP_OWNER', 'SYSTEM_ADMIN')")
public class SystemSettingController {

    private final SystemSettingService settingService;

    public SystemSettingController(SystemSettingService settingService) {
        this.settingService = settingService;
    }

    // GET ALL SETTINGS
    @GetMapping
    public ResponseEntity<List<SystemSetting>> getAllSettings() {
        return ResponseEntity.ok(settingService.getAllSettings());
    }

    // GET SETTING BY KEY
    @GetMapping("/{key}")
    public ResponseEntity<SystemSetting> getSettingByKey(@PathVariable String key) {
        return ResponseEntity.ok(settingService.getSetting(key.toUpperCase()));
    }

    // CREATE OR UPDATE SETTING (Admin fulfills the "Manage permissions and system settings" requirement)
    @PostMapping
    @PutMapping
    public ResponseEntity<SystemSetting> saveSetting(@RequestBody SystemSetting setting) {
        SystemSetting savedSetting = settingService.createOrUpdateSetting(setting);
        return ResponseEntity.ok(savedSetting);
    }

    // DELETE SETTING
    @DeleteMapping("/{key}")
    public ResponseEntity<Void> deleteSetting(@PathVariable String key) {
        settingService.deleteSetting(key.toUpperCase());
        return ResponseEntity.noContent().build();
    }
}