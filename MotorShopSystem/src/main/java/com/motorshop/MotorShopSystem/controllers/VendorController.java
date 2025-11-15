package com.motorshop.MotorShopSystem.controllers;

import com.motorshop.MotorShopSystem.auth.PurchaseOrderRequest;
import com.motorshop.MotorShopSystem.auth.PurchaseOrderResponse;
import com.motorshop.MotorShopSystem.auth.VendorRequest;
import com.motorshop.MotorShopSystem.models.PurchaseOrder;
import com.motorshop.MotorShopSystem.models.Vendor;
import com.motorshop.MotorShopSystem.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendor")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;

    // --- VENDOR MANAGEMENT ENDPOINTS ---

    /**
     * Functionality: Create a new vendor.
     * ACCESS: Restricted to SHOP_OWNER and SYSTEM_ADMIN (high-level control).
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SHOP_OWNER','SYSTEM_ADMIN')")
    public ResponseEntity<Vendor> createVendor(@RequestBody VendorRequest request) {
        Vendor vendor = vendorService.createVendor(request);
        return new ResponseEntity<>(vendor, HttpStatus.CREATED);
    }

    /**
     * Functionality: View vendor information.
     * ACCESS: SHOP_OWNER and INVENTORY_MANAGER (needed for placing orders).
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SHOP_OWNER', 'INVENTORY_MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<Vendor>> getAllVendors() {
        List<Vendor> vendors = vendorService.getAllVendors();
        return ResponseEntity.ok(vendors);
    }


    @GetMapping("/debug/roles")
    public ResponseEntity<?> checkRoles(org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(authentication.getAuthorities());
    }


    // --- PURCHASE ORDER ENDPOINTS ---

    /**
     * Functionality: Create a new purchase order.
     * ACCESS: SHOP_OWNER and INVENTORY_MANAGER.
     */
    @PostMapping("/order")
    @PreAuthorize("hasAnyRole('SHOP_OWNER', 'INVENTORY_MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<PurchaseOrder> createPurchaseOrder(@RequestBody PurchaseOrderRequest request) {
        PurchaseOrder po = vendorService.createPurchaseOrder(request);
        return new ResponseEntity<>(po, HttpStatus.CREATED);
    }

    /**
     * Functionality: Mark a purchase order as received and update stock. (Stock Intake Log)
     * ACCESS: SHOP_OWNER and INVENTORY_MANAGER.
     */
    @PutMapping("/order/{poId}/receive")
    @PreAuthorize("hasAnyRole('SHOP_OWNER', 'INVENTORY_MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<PurchaseOrder> receivePurchaseOrder(@PathVariable Long poId) {
        PurchaseOrder po = vendorService.receivePurchaseOrder(poId);
        return ResponseEntity.ok(po);
    }

    /**
     * Functionality: View purchase order history (Reorder History).
     * ACCESS: SHOP_OWNER, INVENTORY_MANAGER (duty fulfilled).
     */
    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('SHOP_OWNER', 'INVENTORY_MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<PurchaseOrderResponse>> getOrderHistory() {
        List<PurchaseOrderResponse> history = vendorService.getOrderHistory();
        return ResponseEntity.ok(history);
    }

}