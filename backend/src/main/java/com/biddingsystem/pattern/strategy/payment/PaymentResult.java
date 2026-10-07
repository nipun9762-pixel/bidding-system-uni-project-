package com.biddingsystem.pattern.strategy.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Result returned after a PaymentStrategy validates and prepares a payment.
 */
public class PaymentResult {

    private boolean successful;
    private String transactionReference;
    private String paymentMethod;
    private BigDecimal amount;
    private String maskedDetails;
    private String message;
    private LocalDateTime processedAt;

    public PaymentResult(boolean successful, String transactionReference, String paymentMethod,
                         BigDecimal amount, String maskedDetails, String message) {
        this.successful = successful;
        this.transactionReference = transactionReference;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.maskedDetails = maskedDetails;
        this.message = message;
        this.processedAt = LocalDateTime.now();
    }

    public boolean isSuccessful() { return successful; }
    public String getTransactionReference() { return transactionReference; }
    public String getPaymentMethod() { return paymentMethod; }
    public BigDecimal getAmount() { return amount; }
    public String getMaskedDetails() { return maskedDetails; }
    public String getMessage() { return message; }
    public LocalDateTime getProcessedAt() { return processedAt; }
}
