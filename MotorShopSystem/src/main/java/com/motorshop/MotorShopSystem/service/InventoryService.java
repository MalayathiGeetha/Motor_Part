package com.motorshop.MotorShopSystem.service;

import com.motorshop.MotorShopSystem.auth.PartRequest;
import com.motorshop.MotorShopSystem.auth.PartResponse;
import com.motorshop.MotorShopSystem.exceptions.StockException;
import com.motorshop.MotorShopSystem.models.Part;
import com.motorshop.MotorShopSystem.models.InventoryAlert;
import com.motorshop.MotorShopSystem.models.AlertStatus;
import com.motorshop.MotorShopSystem.repository.PartRepository;
import com.motorshop.MotorShopSystem.repository.InventoryAlertRepository; // <-- NEW
import com.motorshop.MotorShopSystem.exceptions.ResourceNotFoundException; // <-- NEW (Using custom exception)
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime; // <-- NEW
import java.util.List;
import java.util.stream.Collectors;

@Service
// Use constructor injection for all final fields
@RequiredArgsConstructor
public class InventoryService {

    private final PartRepository partRepository;
    private final AuditService auditService; // <-- INJECTED
    private final InventoryAlertRepository alertRepository; // <-- INJECTED

    // --- Core CRUD Operations ---

    @Transactional
    public PartResponse createPart(PartRequest request) {
        var part = Part.builder()
                .partCode(request.getPartCode())
                .partName(request.getPartName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .unitPrice(request.getUnitPrice())
                .reorderThreshold(request.getReorderThreshold())
                .rackLocation(request.getRackLocation())
                .currentStock(request.getInitialStock() != null ? request.getInitialStock() : 0)
                .build();

        Part savedPart = partRepository.save(part);

        // Log the creation (Audit)
        auditService.logAction("PART_CREATED", "PART", savedPart.getId(),
                "New part " + savedPart.getPartCode() + " created with initial stock: " + savedPart.getCurrentStock());

        return mapToPartResponse(savedPart);
    }

    @Transactional
    public PartResponse updatePartDetails(Long partId, PartRequest request) {
        Part part = partRepository.findById(partId)
                // Use the custom ResourceNotFoundException
                .orElseThrow(() -> new ResourceNotFoundException("Part not found with ID: " + partId));

        String oldDetails = part.getPartName() + " | " + part.getUnitPrice(); // Capture old state for log

        part.setPartName(request.getPartName());
        part.setDescription(request.getDescription());
        part.setImageUrl(request.getImageUrl());
        part.setUnitPrice(request.getUnitPrice());
        part.setReorderThreshold(request.getReorderThreshold());
        part.setRackLocation(request.getRackLocation());

        // Log the update (Audit)
        String newDetails = part.getPartName() + " | " + part.getUnitPrice();
        auditService.logAction("PART_UPDATED", "PART", partId,
                "Details updated. Old: [" + oldDetails + "], New: [" + newDetails + "]");

        return mapToPartResponse(part); // Part is automatically saved due to @Transactional
    }

    // --- Stock Management Operations (CONSOLIDATED & MODIFIED) ---

    @Transactional
    // Unified method for receiving stock shipment
    public PartResponse updateStock(Long partId, int quantityReceived) {
        Part part = partRepository.findById(partId)
                .orElseThrow(() -> new ResourceNotFoundException("Part not found with ID: " + partId));

        int oldStock = part.getCurrentStock();
        int newStock = oldStock + quantityReceived;
        part.setCurrentStock(newStock);

        // 1. Log the stock inflow (Audit)
        auditService.logAction("STOCK_RECEIVED", "PART", partId,
                "Stock increased by " + quantityReceived + ". New stock: " + newStock);

        // 2. Resolve Open Alerts (Integration with Alert Module)
        resolveLowStockAlerts(part);

        return mapToPartResponse(part);
    }

    @Transactional
    public Part deductStock(Long partId, int quantity) {
        Part part = partRepository.findById(partId)
                .orElseThrow(() -> new ResourceNotFoundException("Part not found with ID: " + partId));

        if (part.getCurrentStock() < quantity) {
            // Throw the custom StockException
            throw new StockException("Insufficient stock for part " + part.getPartCode() +
                    ". Required: " + quantity + ", Available: " + part.getCurrentStock());
        }

        int oldStock = part.getCurrentStock();
        int newStock = oldStock - quantity;

        part.setCurrentStock(newStock);
        Part updatedPart = partRepository.save(part);

        // AUDIT: Log the stock deduction (MANDATORY)
        auditService.logAction(
                "STOCK_DEDUCTED",
                "PART",
                partId,
                String.format("Stock deducted by %d for a sale. Old: %d, New: %d.", quantity, oldStock, newStock)
        );

        return updatedPart;
    }

    // --- Retrieval ---
    // (Existing methods here)
    public List<PartResponse> getAllParts() {
        return partRepository.findAll().stream()
                .map(this::mapToPartResponse)
                .collect(Collectors.toList());
    }

    public List<PartResponse> searchParts(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        // Assuming PartRepository::searchParts is implemented using custom query or Specification
        return partRepository.searchParts(query).stream()
                .map(this::mapToPartResponse)
                .collect(Collectors.toList());
    }

    // --- ALERT RESOLUTION (Helper Method) ---
    private void resolveLowStockAlerts(Part part) {
        // Only proceed if the new stock is safely above the reorder threshold
        if (part.getCurrentStock() > part.getReorderThreshold()) {

            // Find any open alerts for this part
            List<InventoryAlert> openAlerts = alertRepository.findByPartIdAndStatus(part.getId(), AlertStatus.OPEN);

            if (!openAlerts.isEmpty()) {
                for (InventoryAlert alert : openAlerts) {
                    alert.setStatus(AlertStatus.RESOLVED);
                    alert.setResolvedAt(LocalDateTime.now());
                    alertRepository.save(alert);
                }
            }
        }
    }

    // --- Mapper (Helper method to convert Entity to DTO) ---
    private PartResponse mapToPartResponse(Part part) {
        String stockStatus = determineStockStatus(part.getCurrentStock(), part.getReorderThreshold());

        return PartResponse.builder()
                .id(part.getId())
                .partCode(part.getPartCode())
                .partName(part.getPartName())
                .description(part.getDescription()) // ADD THIS
                .imageUrl(part.getImageUrl())
                .unitPrice(part.getUnitPrice())
                .currentStock(part.getCurrentStock())
                .reorderThreshold(part.getReorderThreshold())
                .rackLocation(part.getRackLocation())
                .stockStatus(stockStatus)
                .build();
    }

    private String determineStockStatus(int stock, int threshold) {
        if (stock <= 0) return "Out of Stock";
        if (stock <= threshold) return "Low Stock";
        return "In Stock";
    }


    @Transactional
    public PartResponse reorderPart(Long partId, int quantity) {
        // This could be simply adding stock or triggering a purchase order workflow
        return updateStock(partId, quantity);
    }


    @Transactional
    public void deletePart(Long partId) {
        Part part = partRepository.findById(partId)
                .orElseThrow(() -> new ResourceNotFoundException("Part not found with ID: " + partId));

        // Log before deleting
        auditService.logAction("PART_DELETED", "PART", partId,
                "Part " + part.getPartCode() + " (" + part.getPartName() + ") deleted from inventory.");

        partRepository.delete(part);
    }

}