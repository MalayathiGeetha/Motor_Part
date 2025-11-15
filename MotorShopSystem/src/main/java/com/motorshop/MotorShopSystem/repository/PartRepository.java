package com.motorshop.MotorShopSystem.repository;

import com.motorshop.MotorShopSystem.models.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartRepository extends JpaRepository<Part, Long> {

    Optional<Part> findByPartCode(String partCode);

    // --- NEW: Custom Search Queries ---

    /**
     * Finds parts matching the search term across name, code, or rack location.
     * Uses a single combined query for efficient searching.
     */
    @Query("SELECT p FROM Part p WHERE " +
            "LOWER(p.partName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.partCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.rackLocation) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Part> searchParts(@Param("query") String query);


    List<Part> findByCurrentStockLessThanEqual(Integer threshold);
    boolean existsByPartCode(String partCode);

}