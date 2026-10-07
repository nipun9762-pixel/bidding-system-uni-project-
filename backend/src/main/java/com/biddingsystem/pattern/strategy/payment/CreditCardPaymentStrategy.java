package com.biddingsystem.pattern.strategy.payment;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Concrete Strategy: Credit / Debit Card Payment Processing.
 * Implements validation for cardholder name, PAN, expiry date, and CVV.
 * Securely masks payment credentials and produces an escrow transaction token.
 */
public class CreditCardPaymentStrategy implements PaymentStrategy {

    public static final String METHOD_NAME = "CREDIT_CARD";

    @Override
    public String getMethodName() {
        return METHOD_NAME;
    }

    @Override
    public String getDisplayName() {
        return "Credit / Debit Card";
    }

    @Override
    public void validate(PaymentRequest request) throws IllegalArgumentException {
        if (request == null) {
            throw new IllegalArgumentException("Payment request cannot be null.");
        }
        if (request.getAmount() == null || request.getAmount().signum() <= 0) {
            throw new IllegalArgumentException("Payable amount must be greater than zero.");
        }
        if (request.getCardHolderName() == null || request.getCardHolderName().trim().isEmpty()) {
            throw new IllegalArgumentException("Cardholder name is required.");
        }

        String rawCard = request.getCardNumber() != null ? request.getCardNumber().replaceAll("[\\s-]", "") : "";
        if (rawCard.length() < 12 || rawCard.length() > 19 || !rawCard.matches("\\d+")) {
            throw new IllegalArgumentException("Card number must contain between 12 and 19 valid digits.");
        }

        String expiry = request.getExpiryDate() != null ? request.getExpiryDate().trim() : "";
        if (!expiry.matches("^(0[1-9]|1[0-2])/\\d{2}$")) {
            throw new IllegalArgumentException("Card expiration date must be in MM/YY format.");
        }

        String cvv = request.getCvv() != null ? request.getCvv().trim() : "";
        if (!cvv.matches("^\\d{3,4}$")) {
            throw new IllegalArgumentException("Card CVV/CVC must be 3 or 4 digits.");
        }
    }

    @Override
    public PaymentResult execute(PaymentRequest request) {
        validate(request);

        String rawCard = request.getCardNumber().replaceAll("[\\s-]", "");
        String last4 = rawCard.substring(rawCard.length() - 4);
        String maskedCard = "**** **** **** " + last4;
        String holder = request.getCardHolderName().trim();
        String expiry = request.getExpiryDate().trim();

        String txRef = "CARD-" + System.currentTimeMillis() + "-" + last4;
        String maskedDetails = String.format("Card: %s | Name: %s | Exp: %s", maskedCard, holder, expiry);
        String message = String.format("Credit Card authorized for Rs. %.2f. Tokenized and queued for Administrator approval.", request.getAmount());

        return new PaymentResult(true, txRef, METHOD_NAME, request.getAmount(), maskedDetails, message);
    }
}
