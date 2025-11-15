package com.motorshop.MotorShopSystem.service;

import com.motorshop.MotorShopSystem.auth.*;
import com.motorshop.MotorShopSystem.models.*;
import com.motorshop.MotorShopSystem.models.PurchaseOrder.OrderStatus;
import com.motorshop.MotorShopSystem.repository.PartRepository;
import com.motorshop.MotorShopSystem.repository.PurchaseOrderRepository;
import com.motorshop.MotorShopSystem.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository vendorRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PartRepository partRepository;
    private final InventoryService inventoryService; // To update stock when PO is received

    // --- Vendor Management (SHOP_OWNER only) ---

    @Transactional
    public Vendor createVendor(VendorRequest request) {
        var vendor = Vendor.builder()
                .vendorName(request.getVendorName())
                .contactPerson(request.getContactPerson())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .status("Active")
                .build();
        return vendorRepository.save(vendor);
    }

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    // --- Purchase Order Management (INVENTORY_MANAGER / SHOP_OWNER) ---

    /**
     * Creates a new Purchase Order for a vendor.
     */
    @Transactional
    public PurchaseOrder createPurchaseOrder(PurchaseOrderRequest request) {
        Vendor vendor = vendorRepository.findById(request.getVendorId())
                .orElseThrow(() -> new RuntimeException("Vendor not found: " + request.getVendorId()));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String placedBy = authentication.getName();

        double totalOrderValue = 0.0;
        List<PurchaseOrderItem> poItems = new java.util.ArrayList<>();

        // Create the main PO object
        PurchaseOrder po = PurchaseOrder.builder()
                .orderNumber("PO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .vendor(vendor)
                .orderDate(LocalDateTime.now())
                .expectedDeliveryDate(request.getExpectedDeliveryDate().atStartOfDay())
                .status(OrderStatus.PENDING)
                .placedBy(placedBy)
                .build();

        // Process line items
        for (PurchaseOrderRequest.POItemRequest itemRequest : request.getItems()) {
            Part part = partRepository.findById(itemRequest.getPartId())
                    .orElseThrow(() -> new RuntimeException("Part not found: " + itemRequest.getPartId()));

            double lineTotal = itemRequest.getQuantity() * itemRequest.getUnitCost();
            totalOrderValue += lineTotal;

            PurchaseOrderItem poItem = PurchaseOrderItem.builder()
                    .purchaseOrder(po)
                    .part(part)
                    .quantityOrdered(itemRequest.getQuantity())
                    .unitCost(itemRequest.getUnitCost())
                    .lineTotal(lineTotal)
                    .build();
            poItems.add(poItem);
        }

        po.setTotalOrderValue(totalOrderValue);
        po.setItems(poItems);
        return purchaseOrderRepository.save(po);
    }

    /**
     * Marks a Purchase Order as RECEIVED and updates the inventory stock levels.
     */
    @Transactional
    public PurchaseOrder receivePurchaseOrder(Long poId) {
        PurchaseOrder po = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found: " + poId));

        if (po.getStatus() == OrderStatus.RECEIVED) {
            throw new RuntimeException("Purchase Order already received.");
        }

        // 1. Update Inventory for each item
        for (PurchaseOrderItem item : po.getItems()) {
            // Use the existing InventoryService to update stock
            inventoryService.updateStock(item.getPart().getId(), item.getQuantityOrdered());
            // Note: In a real system, you'd also log the stock intake here.
        }

        // 2. Update PO status
        po.setStatus(OrderStatus.RECEIVED);
        po.setActualDeliveryDate(LocalDateTime.now());

        return purchaseOrderRepository.save(po);
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getOrderHistory() {
        List<PurchaseOrder> orders = purchaseOrderRepository.findAll();

        return orders.stream().map(order -> {
            PurchaseOrderResponse response = new PurchaseOrderResponse();
            response.setId(order.getId());
            response.setOrderNumber(order.getOrderNumber());
            response.setOrderDate(order.getOrderDate());
            response.setExpectedDeliveryDate(order.getExpectedDeliveryDate());
            response.setActualDeliveryDate(order.getActualDeliveryDate());
            response.setTotalOrderValue(order.getTotalOrderValue());
            response.setStatus(order.getStatus().name());
            response.setPlacedBy(order.getPlacedBy());

            // Set vendor
            if (order.getVendor() != null) {
                VendorResponse vendorResponse = new VendorResponse();
                vendorResponse.setId(order.getVendor().getId());
                vendorResponse.setVendorName(order.getVendor().getVendorName());
                vendorResponse.setContactPerson(order.getVendor().getContactPerson());
                vendorResponse.setEmail(order.getVendor().getEmail());
                vendorResponse.setPhoneNumber(order.getVendor().getPhoneNumber());
                vendorResponse.setAddress(order.getVendor().getAddress());
                vendorResponse.setStatus(order.getVendor().getStatus());
                response.setVendor(vendorResponse);
            }

            // Set items
            if (order.getItems() != null) {
                List<PurchaseOrderItemResponse> itemResponses = order.getItems().stream().map(item -> {
                    PurchaseOrderItemResponse itemResponse = new PurchaseOrderItemResponse();
                    itemResponse.setId(item.getId());
                    itemResponse.setPartName(item.getPart().getPartName());
                    itemResponse.setQuantityOrdered(item.getQuantityOrdered());
                    itemResponse.setUnitCost(item.getUnitCost());
                    itemResponse.setLineTotal(item.getLineTotal());
                    return itemResponse;
                }).collect(Collectors.toList());
                response.setItems(itemResponses);
            }

            return response;
        }).collect(Collectors.toList());
    }
}