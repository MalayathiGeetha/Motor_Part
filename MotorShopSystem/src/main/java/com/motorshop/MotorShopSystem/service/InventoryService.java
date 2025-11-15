package com.motorshop.MotorShopSystem.service;

import com.motorshop.MotorShopSystem.auth.PartRequest;
import com.motorshop.MotorShopSystem.auth.PartResponse;
import com.motorshop.MotorShopSystem.auth.StockLogResponse;
import com.motorshop.MotorShopSystem.exceptions.StockException;
import com.motorshop.MotorShopSystem.models.AuditLog;
import com.motorshop.MotorShopSystem.models.Part;
import com.motorshop.MotorShopSystem.models.InventoryAlert;
import com.motorshop.MotorShopSystem.models.AlertStatus;
import com.motorshop.MotorShopSystem.repository.AuditLogRepository;
import com.motorshop.MotorShopSystem.repository.PartRepository;
import com.motorshop.MotorShopSystem.repository.InventoryAlertRepository;
import com.motorshop.MotorShopSystem.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final PartRepository partRepository;
    private final AuditService auditService;
    private final InventoryAlertRepository alertRepository;
    private final AuditLogRepository auditLogRepository;

    // ----------------------------------------------------------
    // CREATE PART
    // ----------------------------------------------------------
    @Transactional
    public PartResponse createPart(PartRequest request) {

        if (partRepository.existsByPartCode(request.getPartCode())) {
            throw new RuntimeException("Part with code " + request.getPartCode() + " already exists.");
        }

        Part part = Part.builder()
                .partName(request.getPartName())
                .partCode(request.getPartCode())
                .description(request.getDescription())
                .unitPrice(request.getUnitPrice())
                .currentStock(request.getInitialStock() != null ? request.getInitialStock() : 0)
                .reorderThreshold(request.getReorderThreshold() != null ? request.getReorderThreshold() : 10)
                .rackLocation(request.getRackLocation())
                .imageUrl(request.getImageUrl())
                .build();

        Part savedPart = partRepository.save(part);

        auditService.logAction(
                "CREATE_PART",
                "Created new part: " + savedPart.getPartName(),
                "PART",
                savedPart.getId(),
                null,
                "Initial stock: " + savedPart.getCurrentStock()
        );

        return mapToPartResponse(savedPart);
    }

    // ----------------------------------------------------------
    // UPDATE PART DETAILS
    // ----------------------------------------------------------
    @Transactional
    public PartResponse updatePartDetails(Long partId, PartRequest request) {

        Part part = partRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Part not found with id: " + partId));

        String oldValue = "Name:" + part.getPartName() +
                ", Desc:" + part.getDescription() +
                ", Price:" + part.getUnitPrice() +
                ", Stock:" + part.getCurrentStock();

        part.setPartName(request.getPartName());
        part.setDescription(request.getDescription());
        part.setUnitPrice(request.getUnitPrice());
        part.setReorderThreshold(request.getReorderThreshold());
        part.setRackLocation(request.getRackLocation());
        part.setImageUrl(request.getImageUrl());

        Part updated = partRepository.save(part);

        String newValue = "Name:" + updated.getPartName() +
                ", Desc:" + updated.getDescription() +
                ", Price:" + updated.getUnitPrice() +
                ", Stock:" + updated.getCurrentStock();

        auditService.logAction(
                "UPDATE_PART",
                "Updated part: " + updated.getPartName(),
                "PART",
                updated.getId(),
                oldValue,
                newValue
        );

        return mapToPartResponse(updated);
    }

    // ----------------------------------------------------------
    // ADD STOCK
    // ----------------------------------------------------------
    @Transactional
    public PartResponse updateStock(Long partId, int quantity) {

        Part part = partRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Part not found"));

        int oldStock = part.getCurrentStock();
        int newStock = oldStock + quantity;

        part.setCurrentStock(newStock);
        Part updated = partRepository.save(part);

        auditService.logAction(
                "UPDATE_STOCK",
                "Received stock. +" + quantity,
                "PART",
                updated.getId(),
                String.valueOf(oldStock),
                String.valueOf(newStock)
        );

        return mapToPartResponse(updated);
    }

    // ----------------------------------------------------------
    // DEDUCT STOCK (SALE)
    // ----------------------------------------------------------
    @Transactional
    public Part deductStock(Long partId, int quantity) {

        Part part = partRepository.findById(partId)
                .orElseThrow(() -> new ResourceNotFoundException("Part not found"));

        if (part.getCurrentStock() < quantity) {
            throw new StockException("Insufficient stock for part " + part.getPartName());
        }

        int oldStock = part.getCurrentStock();
        int newStock = oldStock - quantity;

        part.setCurrentStock(newStock);
        Part saved = partRepository.save(part);

        auditService.logAction(
                "STOCK_DEDUCTED",
                "Deducted " + quantity + " units",
                "PART",
                partId,
                String.valueOf(oldStock),
                String.valueOf(newStock)
        );

        return saved;
    }

    // ----------------------------------------------------------
    // GET ALL PARTS
    // ----------------------------------------------------------
    public List<PartResponse> getAllParts() {
        return partRepository.findAll().stream()
                .map(this::mapToPartResponse)
                .collect(Collectors.toList());
    }

    // ----------------------------------------------------------
    // SEARCH PARTS
    // ----------------------------------------------------------
    public List<PartResponse> searchParts(String query) {
        if (query == null || query.trim().isEmpty()) return List.of();

        return partRepository.searchParts(query).stream()
                .map(this::mapToPartResponse)
                .collect(Collectors.toList());
    }

    // ----------------------------------------------------------
    // REORDER PART
    // ----------------------------------------------------------
    @Transactional
    public PartResponse reorderPart(Long partId, int qty) {

        Part part = partRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Part not found"));

        auditService.logAction(
                "REORDER_PART",
                "Reorder initiated. Qty: " + qty,
                "PART",
                partId,
                null,
                "Requested qty: " + qty
        );

        return mapToPartResponse(part);
    }

    // ----------------------------------------------------------
    // DELETE PART
    // ----------------------------------------------------------
    @Transactional
    public void deletePart(Long partId) {

        Part part = partRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Part not found"));

        auditService.logAction(
                "DELETE_PART",
                "Deleted part: " + part.getPartName(),
                "PART",
                partId,
                "Stock:" + part.getCurrentStock(),
                null
        );

        partRepository.delete(part);
    }

    // ----------------------------------------------------------
    // GET AUDIT LOGS FOR PART
    // ----------------------------------------------------------
    public List<StockLogResponse> getPartAuditLogs(Long partId) {

        List<AuditLog> logs =
                auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc("PART", partId);

        return logs.stream()
                .map(log -> new StockLogResponse(
                        log.getId(),
                        log.getTimestamp().toString(),
                        log.getActionType(),
                        log.getDetails(),
                        log.getUsername()
                ))
                .collect(Collectors.toList());
    }

    // ----------------------------------------------------------
    // MAP ENTITY TO RESPONSE
    // ----------------------------------------------------------
    private PartResponse mapToPartResponse(Part part) {

        String status;
        if (part.getCurrentStock() <= 0) status = "Out of Stock";
        else if (part.getCurrentStock() <= part.getReorderThreshold()) status = "Low Stock";
        else status = "In Stock";

        return PartResponse.builder()
                .id(part.getId())
                .partCode(part.getPartCode())
                .partName(part.getPartName())
                .description(part.getDescription())
                .unitPrice(part.getUnitPrice())
                .currentStock(part.getCurrentStock())
                .reorderThreshold(part.getReorderThreshold())
                .rackLocation(part.getRackLocation())
                .imageUrl(part.getImageUrl())
                .stockStatus(status)
                .build();
    }


    public Map<String, Object> getInventoryStats() {
        long totalParts = partRepository.count();

        double inventoryValue = partRepository.findAll().stream()
                .mapToDouble(p -> p.getUnitPrice() * p.getCurrentStock())
                .sum();

        long lowStockAlerts = alertRepository.countByStatus(AlertStatus.OPEN);

        return Map.of(
                "totalParts", totalParts,
                "inventoryValue", inventoryValue,
                "lowStockAlerts", lowStockAlerts
        );
    }

}
