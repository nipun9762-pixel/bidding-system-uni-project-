package com.biddingsystem.pattern.strategy.payment;

/**
 * Concrete Strategy: Direct Bank Transfer Payment Processing.
 * Validates bank name, account number, depositor name, and bank transaction reference.
 * Masks sensitive account numbers and prepares the payment for Administrator settlement review.
 */
public class BankTransferPaymentStrategy implements PaymentStrategy {

    public static final String METHOD_NAME = "BANK_TRANSFER";

    @Override
    public String getMethodName() {
        return METHOD_NAME;
    }

    @Override
    public String getDisplayName() {
        return "Direct Bank Transfer";
    }

    @Override
    public void validate(PaymentRequest request) throws IllegalArgumentException {
        if (request == null) {
            throw new IllegalArgumentException("Payment request cannot be null.");
        }
        if (request.getAmount() == null || request.getAmount().signum() <= 0) {
            throw new IllegalArgumentException("Payable amount must be greater than zero.");
        }
        if (request.getBankName() == null || request.getBankName().trim().isEmpty()) {
            throw new IllegalArgumentException("Bank name is required.");
        }
        if (request.getAccountNumber() == null || request.getAccountNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Account number is required.");
        }
        if (request.getAccountHolderName() == null || request.getAccountHolderName().trim().isEmpty()) {
            throw new IllegalArgumentException("Account holder / depositor name is required.");
        }
    }

    @Override
    public PaymentResult execute(PaymentRequest request) {
        validate(request);

        String bank = request.getBankName().trim();
        String acc = request.getAccountNumber().trim();
        String holder = request.getAccountHolderName().trim();
        String userRef = request.getTransferReference() != null ? request.getTransferReference().trim() : "";

        String maskedAcc = acc.length() > 4
                ? "••••" + acc.substring(acc.length() - 4)
                : acc;

        String txRef = !userRef.isEmpty()
                ? "BT-" + userRef
                : "BT-" + System.currentTimeMillis();

        String maskedDetails = String.format("Bank: %s | Acc: %s | Depositor: %s | Ref: %s", bank, maskedAcc, holder, txRef);
        String message = String.format("Bank transfer logged for Rs. %.2f. Queued for Administrator reconciliation and approval.", request.getAmount());

        return new PaymentResult(true, txRef, METHOD_NAME, request.getAmount(), maskedDetails, message);
    }
}
