package com.motorshop.MotorShopSystem.service;

import com.motorshop.MotorShopSystem.models.PurchaseOrder;
import com.motorshop.MotorShopSystem.models.PurchaseOrder.OrderStatus;
import com.motorshop.MotorShopSystem.models.User;
import com.motorshop.MotorShopSystem.repository.PurchaseOrderRepository;
import com.motorshop.MotorShopSystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorPortalService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final UserRepository userRepository; // To retrieve Vendor ID from User

    /**
     * Helper method to get the current authenticated Vendor's ID.
     */
    private Long getCurrentVendorId() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String principalName = authentication.getName(); // This holds the value from the JWT 'sub'

        User user = userRepository.findByEmail(principalName) // ⬅️ USE findByEmail if the principal is the email
                    .orElseThrow(() -> new SecurityException("User not found in context."));

        if (user.getVendorId() == null) {
            throw new SecurityException("Authenticated user is not linked to a Vendor company.");
        }
        return user.getVendorId();
    }

    // --- View Own POs Logic ---

    /**
     * Retrieves all Purchase Orders linked to the currently authenticated vendor user.
     */
    public List<PurchaseOrder> getOrdersForAuthenticatedVendor() {
        Long vendorId = getCurrentVendorId();
        // ⬅️ Requires a new method in PurchaseOrderRepository
        return purchaseOrderRepository.findByVendorId(vendorId);
    }

    // --- Update Delivery Status Logic ---

    /**
     * Allows the authenticated vendor to update the status or expected delivery date of their PO.
     */
    @Transactional
    public PurchaseOrder updateDeliveryStatus(Long poId, String newStatusName, LocalDate expectedDeliveryDate) {
        Long authenticatedVendorId = getCurrentVendorId();

        PurchaseOrder po = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found."));

        // CRITICAL SECURITY CHECK: Ensure the PO belongs to the logged-in vendor
        if (!po.getVendor().getId().equals(authenticatedVendorId)) {
            throw new SecurityException("Access denied: This Purchase Order does not belong to your company.");
        }

        // 1. Update Expected Delivery Date
        if (expectedDeliveryDate != null) {
            po.setExpectedDeliveryDate(expectedDeliveryDate.atStartOfDay());
        }

        // 2. Update Status (Partial fulfillment of PO update duty)
        if (newStatusName != null) {
            OrderStatus newStatus;
            try {
                // Ensure vendor only uses appropriate statuses (e.g., PENDING, SHIPPED, DELAYED, but NOT RECEIVED)
                newStatus = OrderStatus.valueOf(newStatusName.toUpperCase());

                // Prevent vendor from prematurely marking as 'RECEIVED' (that's for internal staff)
                if (newStatus == OrderStatus.RECEIVED) {
                    throw new IllegalArgumentException("Vendors cannot mark orders as RECEIVED.");
                }

                po.setStatus(newStatus);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid status provided: " + newStatusName);
            }
        }

        return purchaseOrderRepository.save(po);
    }
}