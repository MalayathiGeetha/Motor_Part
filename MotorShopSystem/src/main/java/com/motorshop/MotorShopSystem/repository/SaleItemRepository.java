package com.motorshop.MotorShopSystem.repository;


import com.motorshop.MotorShopSystem.models.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    // Find all sale items for a specific sale
    List<SaleItem> findBySaleId(Long saleId);

    // Find all sale items for a specific part
    List<SaleItem> findByPartId(Long partId);

    // Find sale items by sale ID and part ID
    List<SaleItem> findBySaleIdAndPartId(Long saleId, Long partId);

    // Count total quantity sold for a specific part
    // This can be useful for sales analytics
    // @Query("SELECT SUM(si.quantitySold) FROM SaleItem si WHERE si.part.id = :partId")
    // Integer findTotalQuantitySoldByPartId(@Param("partId") Long partId);
}