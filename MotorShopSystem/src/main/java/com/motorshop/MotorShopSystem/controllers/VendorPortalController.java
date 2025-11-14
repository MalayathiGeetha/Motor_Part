package com.motorshop.MotorShopSystem.controllers;

import com.motorshop.MotorShopSystem.models.PurchaseOrder;
import com.motorshop.MotorShopSystem.service.VendorPortalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/vendor-portal")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('VENDOR')") // ⬅️ Enforce VENDOR role on ALL endpoints here
public class VendorPortalController {

    private final VendorPortalService vendorPortalService;

    /**
     * Feature: View purchase orders placed by shop (only orders assigned to the logged-in vendor).
     * Path: GET /api/vendor-portal/my-orders
     */
    @GetMapping("/my-orders")
    public ResponseEntity<List<PurchaseOrder>> getMyPurchaseOrders() {
        // The service automatically retrieves the Vendor ID from the security context
        List<PurchaseOrder> orders = vendorPortalService.getOrdersForAuthenticatedVendor();
        return ResponseEntity.ok(orders);
    }

    /**
     * Feature: Update availability status or expected delivery dates.
     * Path: PUT /api/vendor-portal/order/{poId}/update-delivery
     */
    @PutMapping("/order/{poId}/update-delivery")
    public ResponseEntity<PurchaseOrder> updateDeliveryDetails(
            @PathVariable Long poId,
            @RequestParam(required = false) String newStatus, // e.g., SHIPPED, DELAYED
            @RequestParam(required = false) LocalDate expectedDeliveryDate) {

        // Note: The service layer handles validation (PO ownership, status validity)
        PurchaseOrder updatedPo = vendorPortalService.updateDeliveryStatus(
                poId, newStatus, expectedDeliveryDate);

        return ResponseEntity.ok(updatedPo);
    }
}
