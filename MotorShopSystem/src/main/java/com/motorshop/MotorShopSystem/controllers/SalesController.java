package com.motorshop.MotorShopSystem.controllers;

import com.motorshop.MotorShopSystem.auth.DailySummaryResponse;
import com.motorshop.MotorShopSystem.auth.SaleRequest;
import com.motorshop.MotorShopSystem.auth.SaleResponse;
import com.motorshop.MotorShopSystem.models.Sale;
import com.motorshop.MotorShopSystem.service.SalesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SalesController {

    private final SalesService salesService;

    /**
     * Record a sale and return updated daily summary.
     */
    @PostMapping("/record")
    @PreAuthorize("hasAnyRole('SALES_EXECUTIVE', 'SHOP_OWNER')")
    public ResponseEntity<?> recordSale(@RequestBody SaleRequest request) {
        try {
            Sale newSale = salesService.recordSale(request);

            List<SaleResponse.ItemResponse> items = newSale.getItems().stream()
                    .map(item -> new SaleResponse.ItemResponse(
                            item.getPart().getPartName(),
                            item.getQuantitySold(),
                            item.getUnitPriceAtSale(),
                            item.getLineTotal()
                    ))
                    .toList();

            SaleResponse saleResponse = new SaleResponse(
                    newSale.getId(),
                    newSale.getTransactionDate().toString(),
                    newSale.getSubTotal(),
                    newSale.getTaxAmount(),
                    newSale.getGrandTotal(),
                    newSale.getCustomerName(),
                    items
            );

            // ✅ Fetch latest daily summary after this sale
            DailySummaryResponse updatedSummary = salesService.getDailySummary();

            // ✅ Wrap both responses in a map for frontend
            return ResponseEntity.ok(new java.util.HashMap<>() {{
                put("invoice", saleResponse);
                put("updatedSummary", updatedSummary);
            }});

        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("message", e.getMessage()));
        }
    }

    /**
     * Get today’s sales summary.
     */
    @GetMapping("/summary/daily")
    @PreAuthorize("hasAnyRole('SHOP_OWNER', 'SALES_EXECUTIVE', 'AUDITOR', 'SYSTEM_ADMIN')")
    public ResponseEntity<DailySummaryResponse> getDailySummary() {
        DailySummaryResponse summary = salesService.getDailySummary();
        return ResponseEntity.ok(summary);
    }

    /**
     * Get full sales history.
     */
    @GetMapping("/history")
    @PreAuthorize("hasAnyAuthority('AUDITOR', 'SHOP_OWNER', 'SYSTEM_ADMIN')")
    public ResponseEntity<String> getSalesHistory() {
        return ResponseEntity.ok("Sales History Report data...");
    }
}