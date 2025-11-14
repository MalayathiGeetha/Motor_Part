// com.motorshop.MotorShopSystem.service.SalesService.java (ENHANCED)

package com.motorshop.MotorShopSystem.service;

import com.motorshop.MotorShopSystem.auth.DailySummaryResponse;
import com.motorshop.MotorShopSystem.auth.SaleRequest;
import com.motorshop.MotorShopSystem.models.Part;
import com.motorshop.MotorShopSystem.models.Sale;
import com.motorshop.MotorShopSystem.models.SaleItem;
import com.motorshop.MotorShopSystem.repository.PartRepository;
import com.motorshop.MotorShopSystem.repository.SaleRepository;
import com.motorshop.MotorShopSystem.exceptions.ResourceNotFoundException; // ADDED
import com.motorshop.MotorShopSystem.exceptions.StockException; // ASSUMED/RECOMMENDED
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SalesService {

    private final SaleRepository saleRepository;
    private final PartRepository partRepository;
    private final InventoryService inventoryService; // ADDED: For correct stock deduction and auditing
    private final AuditService auditService;         // ADDED: To log the sale transaction

    private final double TAX_RATE = 0.05; // Example 5% tax

    @Transactional
    public Sale recordSale(SaleRequest request) {

        // 1. Get the identity of the user recording the sale
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String recorderEmail = authentication.getName();

        double subTotal = 0.0;
        List<SaleItem> saleItems = new ArrayList<>();

        // Prepare the new Sale transaction record
        Sale sale = Sale.builder()
                .invoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .transactionDate(LocalDateTime.now())
                .customerName(request.getCustomerName())
                .recordedBy(recorderEmail)
                .build();

        // 2. Process each item in the sale request
        for (SaleRequest.ItemSaleRequest itemRequest : request.getItems()) {

            // Use specific exception for consistency
            Part part = partRepository.findById(itemRequest.getPartId())
                    .orElseThrow(() -> new ResourceNotFoundException("Part not found: " + itemRequest.getPartId()));

            int quantitySold = itemRequest.getQuantity();

            // --- CRITICAL FIX 3: DELEGATE STOCK DEDUCTION ---
            try {
                // Call the InventoryService method which handles its own Auditing and error checks
                inventoryService.deductStock(part.getId(), quantitySold);
            } catch (IllegalArgumentException e) {
                // Convert the generic stock exception to your custom StockException if needed
                throw new StockException("Insufficient stock for part " + part.getPartName());
            }

            // After stock is confirmed deducted, proceed with financial record
            double unitPrice = part.getUnitPrice();
            double lineTotal = unitPrice * quantitySold;

            // 3. Create SaleItem record
            SaleItem saleItem = SaleItem.builder()
                    .sale(sale)
                    .part(part)
                    .quantitySold(quantitySold)
                    .unitPriceAtSale(unitPrice)
                    .lineTotal(lineTotal)
                    .build();

            saleItems.add(saleItem);
            subTotal += lineTotal;

            // REMOVED: Manual part.setCurrentStock() and partRepository.save(part);
            // This is now handled by InventoryService.deductStock(id, qty)
        }

        // 4. Finalize Sale Totals
        double taxAmount = subTotal * TAX_RATE;
        double grandTotal = subTotal + taxAmount;

        sale.setItems(saleItems);
        sale.setSubTotal(subTotal);
        sale.setTaxAmount(taxAmount);
        sale.setGrandTotal(grandTotal);

        // 5. Save the entire transaction
        Sale savedSale = saleRepository.save(sale); // Save the main sale object

        // 6. CRITICAL FIX 1: LOG THE TRANSACTION
        auditService.logAction(
                "SALE_COMPLETED",
                "SALE",
                savedSale.getId(),
                String.format("Invoice %s processed. Grand Total: %.2f.",
                        savedSale.getInvoiceNumber(), savedSale.getGrandTotal())
        );

        return savedSale;
    }


    public DailySummaryResponse getDailySummary() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        List<Sale> sales = saleRepository.findByTransactionDateBetween(startOfDay, endOfDay);

        // Compute summary
        double grossSales = sales.stream().mapToDouble(Sale::getSubTotal).sum();
        double tax = sales.stream().mapToDouble(Sale::getTaxAmount).sum();
        double net = sales.stream().mapToDouble(Sale::getGrandTotal).sum();

        DailySummaryResponse summary = new DailySummaryResponse();
        summary.setGrossSalesAmount(grossSales);
        summary.setTaxCollectedAmount(tax);
        summary.setNetRevenueAmount(net);
        summary.setTotalTransactions(sales.size());
        return summary;
    }

}