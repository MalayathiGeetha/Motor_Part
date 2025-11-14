package com.motorshop.MotorShopSystem.repository;


import com.motorshop.MotorShopSystem.models.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    // Custom method to fetch sales by the user who recorded them
    List<Sale> findByRecordedBy(String recordedByEmail);

    // Custom method for Auditing/Reporting (e.g., getting the last 30 days of sales)
    // List<Sale> findByTransactionDateAfter(LocalDateTime date);
    @Query("SELECT s FROM Sale s WHERE s.transactionDate BETWEEN :startOfDay AND :endOfDay")
    List<Sale> findByTransactionDateBetween(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

}