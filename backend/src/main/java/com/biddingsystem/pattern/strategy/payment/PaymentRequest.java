package com.biddingsystem.pattern.strategy.payment;

import java.math.BigDecimal;

/**
 * Data Transfer Object encapsulating payment submission parameters
 * across different payment strategies (Credit Card, Bank Transfer, etc.).
 */
public class PaymentRequest {

    private Long orderId;
    private BigDecimal amount;
    private String paymentMethod; // e.g., CREDIT_CARD, BANK_TRANSFER

    // Credit / Debit Card Fields
    private String cardHolderName;
    private String cardNumber;
    private String expiryDate; // MM/YY
    private String cvv;

    // Bank Transfer Fields
    private String bankName;
    private String accountNumber;
    private String accountHolderName;
    private String transferReference;

    private String notes;

    public PaymentRequest() {}

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getCardHolderName() { return cardHolderName; }
    public void setCardHolderName(String cardHolderName) { this.cardHolderName = cardHolderName; }

    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

    public String getCvv() { return cvv; }
    public void setCvv(String cvv) { this.cvv = cvv; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getAccountHolderName() { return accountHolderName; }
    public void setAccountHolderName(String accountHolderName) { this.accountHolderName = accountHolderName; }

    public String getTransferReference() { return transferReference; }
    public void setTransferReference(String transferReference) { this.transferReference = transferReference; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
