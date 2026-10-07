package com.biddingsystem.pattern.strategy.payment;

import java.util.HashMap;
import java.util.Map;

/**
 * Factory for Payment Strategies.
 * Resolves the appropriate PaymentStrategy implementation based on payment method key.
 */
public class PaymentStrategyFactory {

    private static final Map<String, PaymentStrategy> STRATEGIES = new HashMap<>();

    static {
        registerStrategy(new CreditCardPaymentStrategy());
        registerStrategy(new BankTransferPaymentStrategy());
    }

    private static void registerStrategy(PaymentStrategy strategy) {
        STRATEGIES.put(strategy.getMethodName().toUpperCase(), strategy);
    }

    /**
     * Retrieves the PaymentStrategy for the given payment method.
     * Fallback to CreditCardPaymentStrategy if null or unknown or legacy.
     */
    public static PaymentStrategy getStrategy(String method) {
        if (method == null || method.trim().isEmpty()) {
            return STRATEGIES.get(CreditCardPaymentStrategy.METHOD_NAME);
        }

        String normalized = method.trim().toUpperCase();

        if (normalized.contains("CARD") || normalized.contains("CREDIT") || normalized.contains("DEBIT")) {
            return STRATEGIES.get(CreditCardPaymentStrategy.METHOD_NAME);
        }
        if (normalized.contains("BANK") || normalized.contains("TRANSFER") || normalized.contains("SLIP")) {
            return STRATEGIES.get(BankTransferPaymentStrategy.METHOD_NAME);
        }

        PaymentStrategy strategy = STRATEGIES.get(normalized);
        if (strategy != null) {
            return strategy;
        }

        throw new IllegalArgumentException("Unsupported payment method: " + method + 
                ". Supported methods are: CREDIT_CARD, BANK_TRANSFER.");
    }
}
