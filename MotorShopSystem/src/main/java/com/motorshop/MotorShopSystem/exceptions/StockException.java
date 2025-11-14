package com.motorshop.MotorShopSystem.exceptions;


// Use RuntimeException for unchecked behavior, allowing Spring to handle transactions
public class StockException extends RuntimeException {

    public StockException(String message) {
        super(message);
    }

    public StockException(String message, Throwable cause) {
        super(message, cause);
    }
}