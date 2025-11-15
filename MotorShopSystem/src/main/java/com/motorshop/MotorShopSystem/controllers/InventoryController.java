package com.motorshop.MotorShopSystem.controllers;

import com.motorshop.MotorShopSystem.auth.AuditLogResponse;
import com.motorshop.MotorShopSystem.auth.PartRequest;
import com.motorshop.MotorShopSystem.auth.PartResponse;
import com.motorshop.MotorShopSystem.auth.StockLogResponse;
import com.motorshop.MotorShopSystem.models.AuditLog;
import com.motorshop.MotorShopSystem.models.Part;
import com.motorshop.MotorShopSystem.repository.AuditLogRepository;
import com.motorshop.MotorShopSystem.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final AuditLogRepository auditLogRepository;


    @PostMapping("/part")
    @PreAuthorize("hasAnyRole('SHOP_OWNER', 'INVENTORY_MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<PartResponse> createPart(@RequestBody PartRequest request) {
        System.out.println("✅ Inside controller - reached API");
        System.out.println("Current user roles: " +
                SecurityContextHolder.getContext().getAuthentication().getAuthorities());

        PartResponse response = inventoryService.createPart(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/part/{id}")
    @PreAuthorize("hasAnyRole('SHOP_OWNER', 'INVENTORY_MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<PartResponse> updatePart(
            @PathVariable Long id,
            @RequestBody PartRequest request
    ) {
        PartResponse response = inventoryService.updatePartDetails(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/stock/{id}/receive")
    @PreAuthorize("hasAnyRole('SHOP_OWNER', 'INVENTORY_MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<PartResponse> receiveStock(
            @PathVariable Long id,
            @RequestParam int quantity
    ) {
        PartResponse response = inventoryService.updateStock(id, quantity);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/parts")
    @PreAuthorize("hasAnyRole('SHOP_OWNER', 'INVENTORY_MANAGER', 'SALES_EXECUTIVE',  'SYSTEM_ADMIN')")
    public ResponseEntity<List<PartResponse>> getAllParts() {
        List<PartResponse> parts = inventoryService.getAllParts();
        return ResponseEntity.ok(parts);
    }

    // =====================================================
    // 5️⃣ SEARCH PARTS  → VIEW ACCESS FOR MULTIPLE ROLES
    // =====================================================

    /**
     * Search parts by name or code
     * Allowed Roles: SHOP_OWNER, INVENTORY_MANAGER, SALES_EXECUTIVE,
     * TECHNICIAN, AUDITOR, SYSTEM_ADMIN
     */
    @GetMapping("/parts/search")
    @PreAuthorize("hasAnyRole('SHOP_OWNER', 'INVENTORY_MANAGER', 'SALES_EXECUTIVE',  'SYSTEM_ADMIN')")
    public ResponseEntity<List<PartResponse>> searchParts(@RequestParam String query) {
        List<PartResponse> parts = inventoryService.searchParts(query);
        return ResponseEntity.ok(parts);
    }

    // =====================================================
    // 6️⃣ DELETE PART  → OWNER / ADMIN ONLY
    // =====================================================

    /**
     * Delete a part permanently
     * Allowed Roles: SHOP_OWNER, SYSTEM_ADMIN
     */
    @DeleteMapping("/part/{id}")
    @PreAuthorize("hasAnyRole('SHOP_OWNER', 'SYSTEM_ADMIN','INVENTORY_MANAGER')")
    public ResponseEntity<String> deletePart(@PathVariable Long id) {
        inventoryService.deletePart(id);
        return ResponseEntity.ok("Part deleted successfully.");
    }

    @PostMapping("/reorder/{id}")
    @PreAuthorize("hasAnyRole('SHOP_OWNER', 'INVENTORY_MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<String> reorderPart(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body // <-- Accept quantity from frontend
    ) {
        int quantity = body.get("quantity");
        PartResponse part = inventoryService.reorderPart(id, quantity);
        return ResponseEntity.ok("Purchase order created for " + part.getPartName());
    }




    @GetMapping("/part/{partId}/audit")
    @PreAuthorize("hasAnyRole('INVENTORY_MANAGER', 'SHOP_OWNER', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<AuditLogResponse>> getPartAuditLogs(@PathVariable Long partId) {
        try {
            List<AuditLog> auditLogs =
                    auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc("PART", partId);

            List<AuditLogResponse> response = auditLogs.stream()
                    .map(log -> {
                        AuditLogResponse resp = new AuditLogResponse();
                        resp.setId(log.getId());
                        resp.setTimestamp(log.getTimestamp().toString());
                        resp.setActionType(log.getActionType());    // FIXED
                        resp.setDetails(log.getDetails());          // FIXED
                        resp.setPerformedBy(log.getUsername());     // FIXED
                        return resp;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of());
        }
    }


    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('SHOP_OWNER','INVENTORY_MANAGER','SYSTEM_ADMIN')")
    public ResponseEntity<Map<String, Object>> getInventoryStats() {
        Map<String, Object> stats = inventoryService.getInventoryStats();
        return ResponseEntity.ok(stats);
    }



}
