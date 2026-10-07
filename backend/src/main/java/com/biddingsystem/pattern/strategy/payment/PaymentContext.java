package com.biddingsystem.pattern.strategy.payment;

/**
 * Context Class for the Strategy Pattern (GoF Behavioral).
 * Maintains a reference to a concrete PaymentStrategy and delegates execution to it.
 * This decouples the client and business logic from specific payment processing algorithms.
 */
public class PaymentContext {

    private PaymentStrategy strategy;

    public PaymentContext() {
        // Default strategy
        this.strategy = new CreditCardPaymentStrategy();
    }

    public PaymentContext(PaymentStrategy strategy) {
        this.strategy = strategy;
    }

    public PaymentStrategy getStrategy() {
        return strategy;
    }

    public void setStrategy(PaymentStrategy strategy) {
        this.strategy = strategy;
    }

    /**
     * Executes the payment strategy using the current strategy algorithm.
     */
    public PaymentResult executePayment(PaymentRequest request) {
        if (this.strategy == null) {
            throw new IllegalStateException("Payment strategy has not been set.");
        }
        this.strategy.validate(request);
        return this.strategy.execute(request);
    }
}
