package com.biddingsystem.pattern.strategy.payment;

/**
 * Strategy Interface (Gang of Four - Behavioral Design Pattern).
 * Defines the contract for all concrete payment processing strategies.
 */
public interface PaymentStrategy {

    /**
     * Unique identifier for the payment strategy (e.g. CREDIT_CARD, BANK_TRANSFER).
     */
    String getMethodName();

    /**
     * Human-readable display name for the payment method.
     */
    String getDisplayName();

    /**
     * Validates payment inputs specific to this strategy.
     * @throws IllegalArgumentException if required fields are missing or invalid.
     */
    void validate(PaymentRequest request) throws IllegalArgumentException;

    /**
     * Executes the payment logic for this strategy.
     */
    PaymentResult execute(PaymentRequest request);
}
