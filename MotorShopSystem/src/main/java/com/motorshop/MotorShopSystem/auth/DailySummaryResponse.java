package com.motorshop.MotorShopSystem.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AccessLevel;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PUBLIC) // ✅ ensures constructor is public
public class DailySummaryResponse {
    private LocalDate date;
    private long totalTransactions;
    private double grossSalesAmount;
    private double taxCollectedAmount;
    private double netRevenueAmount;
}
