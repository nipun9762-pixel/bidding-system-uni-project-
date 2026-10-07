package com.biddingsystem.pattern;

import com.biddingsystem.entity.Delivery;
import com.biddingsystem.entity.WinningOrder;
import com.biddingsystem.pattern.state.delivery.*;
import com.biddingsystem.pattern.strategy.payment.*;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Dedicated CLI Demonstration & Verification for Project Documentation.
 * Run via Maven:
 * mvn test -Dtest=DesignPatternsDemoRunnerTest
 */
public class DesignPatternsDemoRunnerTest {

    @Test
    void runDesignPatternsCliDemonstration() {
        printBanner("BIDDING SYSTEM DESIGN PATTERNS EXECUTION TRACE");

        WinningOrder testOrder = new WinningOrder();
        testOrder.setOrderId(1042L);
        testOrder.setWinningAmount(new BigDecimal("78500.00"));

        // ====================================================================
        // PATTERN 1: STRATEGY PATTERN (PAYMENT PROCESSING STRATEGIES)
        // ====================================================================
        System.out.println("================================================================================");
        System.out.println(" 1. DESIGN PATTERN: STRATEGY PATTERN (PAYMENT PROCESSING ARCHITECTURE)");
        System.out.println("================================================================================");
        System.out.println("Pattern Category : Gang of Four (GoF) - Behavioral");
        System.out.println("Purpose          : Encapsulates interchangeable payment processing algorithms,");
        System.out.println("                   allowing the client to switch payment mechanisms dynamically.");
        System.out.println("Context Class    : com.biddingsystem.pattern.strategy.payment.PaymentContext");
        System.out.println("Strategy Interf. : com.biddingsystem.pattern.strategy.payment.PaymentStrategy");
        System.out.println("Strategy Factory : com.biddingsystem.pattern.strategy.payment.PaymentStrategyFactory");
        System.out.println("Concrete Strat.  : CreditCardPaymentStrategy, BankTransferPaymentStrategy");
        System.out.println("--------------------------------------------------------------------------------");

        // 1.1 Credit Card Payment Strategy
        System.out.println(" [Step 1.1] STRATEGY A: Credit / Debit Card Processing");
        PaymentRequest cardRequest = new PaymentRequest();
        cardRequest.setOrderId(testOrder.getOrderId());
        cardRequest.setAmount(testOrder.getWinningAmount());
        cardRequest.setPaymentMethod("CREDIT_CARD");
        cardRequest.setCardHolderName("Nipun Rathnayake");
        cardRequest.setCardNumber("4532 8901 2345 9812");
        cardRequest.setExpiryDate("08/28");
        cardRequest.setCvv("742");

        PaymentStrategy cardStrategy = PaymentStrategyFactory.getStrategy(cardRequest.getPaymentMethod());
        PaymentContext context = new PaymentContext(cardStrategy);
        PaymentResult cardResult = context.executePayment(cardRequest);

        assertNotNull(cardResult);
        assertTrue(cardResult.isSuccessful());
        System.out.println(String.format("   --> Strategy Class      : %s", cardStrategy.getClass().getSimpleName()));
        System.out.println(String.format("   --> Transaction Ref     : %s", cardResult.getTransactionReference()));
        System.out.println(String.format("   --> Masked Credentials  : %s", cardResult.getMaskedDetails()));
        System.out.println(String.format("   --> Strategy Status     : %s", cardResult.isSuccessful() ? "SUCCESS" : "FAILED"));

        // 1.2 Direct Bank Transfer Strategy
        System.out.println("\n [Step 1.2] STRATEGY B: Dynamic Strategy Swap to Direct Bank Transfer");
        PaymentRequest bankRequest = new PaymentRequest();
        bankRequest.setOrderId(testOrder.getOrderId());
        bankRequest.setAmount(testOrder.getWinningAmount());
        bankRequest.setPaymentMethod("BANK_TRANSFER");
        bankRequest.setBankName("Commercial Bank of Ceylon");
        bankRequest.setAccountNumber("800492184491001");
        bankRequest.setAccountHolderName("Nipun Rathnayake");
        bankRequest.setTransferReference("CB-902841-SL");

        PaymentStrategy bankStrategy = PaymentStrategyFactory.getStrategy(bankRequest.getPaymentMethod());
        context.setStrategy(bankStrategy); // Dynamic strategy swap at runtime
        PaymentResult bankResult = context.executePayment(bankRequest);

        assertNotNull(bankResult);
        assertTrue(bankResult.isSuccessful());
        System.out.println(String.format("   --> Strategy Class      : %s", bankStrategy.getClass().getSimpleName()));
        System.out.println(String.format("   --> Transaction Ref     : %s", bankResult.getTransactionReference()));
        System.out.println(String.format("   --> Masked Credentials  : %s", bankResult.getMaskedDetails()));
        System.out.println(String.format("   --> Strategy Status     : %s", bankResult.isSuccessful() ? "SUCCESS" : "FAILED"));

        // ====================================================================
        // PATTERN 2: STATE PATTERN (DELIVERY LIFECYCLE MANAGEMENT)
        // ====================================================================
        System.out.println("\n================================================================================");
        System.out.println(" 2. DESIGN PATTERN: STATE PATTERN (DELIVERY LIFECYCLE MANAGEMENT)");
        System.out.println("================================================================================");
        System.out.println("Pattern Category : Gang of Four (GoF) - Behavioral");
        System.out.println("Purpose          : Allow the Delivery entity to alter its behavior when its internal");
        System.out.println("                   logistics state changes, enforcing strict lifecycle rules.");
        System.out.println("Context Class    : com.biddingsystem.entity.Delivery");
        System.out.println("State Interface  : com.biddingsystem.pattern.state.delivery.DeliveryState");
        System.out.println("State Factory    : com.biddingsystem.pattern.state.delivery.DeliveryStateFactory");
        System.out.println("--------------------------------------------------------------------------------");

        Delivery delivery = new Delivery();
        delivery.setDeliveryId(8801L);
        delivery.setWinningOrder(testOrder);
        delivery.setDeliveryAddress("742 Evergreen Terrace, Springfield, OR");
        delivery.setDeliveryStatus(Delivery.DeliveryStatus.AWAITING_PAYMENT);

        System.out.println(" [Step 2.1] INITIAL CREATION:");
        printDeliveryStateSnapshot(delivery);

        // Transition 1: Awaiting Payment -> Preparing for Shipment (Triggered by Admin Payment Acceptance)
        System.out.println(" [Step 2.2] TRANSITION EVENT: Payment Accepted by Administrator");
        delivery.transitionTo(Delivery.DeliveryStatus.PREPARING_FOR_SHIPMENT);
        printDeliveryStateSnapshot(delivery);

        // Transition 2: Preparing for Shipment -> Shipped
        System.out.println(" [Step 2.3] TRANSITION EVENT: Carrier Dispatch & Handover");
        delivery.setCarrierName("Apex Auto Freight Express");
        delivery.setTrackingNumber("APX-8801-EXP");
        delivery.setCurrentLocation("Dispatch Terminal Hub A - Bay 4");
        delivery.transitionTo(Delivery.DeliveryStatus.SHIPPED);
        printDeliveryStateSnapshot(delivery);
        System.out.println(String.format("   --> Side-Effect Hook    : Shipped Timestamp = %s", delivery.getShippedDate()));
        System.out.println(String.format("   --> Side-Effect Hook    : Estimated Delivery = %s", delivery.getEstimatedDeliveryDate()));

        // Transition 3: Shipped -> In Transit
        System.out.println(" [Step 2.4] TRANSITION EVENT: En Route Highway Checkpoint Scan");
        delivery.setCurrentLocation("Interstate 80 Corridor - Checkpoint 12");
        delivery.transitionTo(Delivery.DeliveryStatus.IN_TRANSIT);
        printDeliveryStateSnapshot(delivery);

        // Transition 4: In Transit -> Out For Delivery
        System.out.println(" [Step 2.5] TRANSITION EVENT: Local Hub Flatbed Out For Delivery");
        delivery.setCurrentLocation("Springfield Regional Logistics Depot");
        delivery.transitionTo(Delivery.DeliveryStatus.OUT_FOR_DELIVERY);
        printDeliveryStateSnapshot(delivery);

        // Transition 5: Out For Delivery -> Delivered (Terminal State)
        System.out.println(" [Step 2.6] TRANSITION EVENT: Destination Handover & Title Receipt Signed");
        delivery.setCurrentLocation("742 Evergreen Terrace, Springfield, OR");
        delivery.transitionTo(Delivery.DeliveryStatus.DELIVERED);
        printDeliveryStateSnapshot(delivery);
        System.out.println(String.format("   --> Side-Effect Hook    : Delivered Timestamp = %s", delivery.getDeliveredDate()));

        // Invalid Transition Protection Demonstration
        System.out.println("\n [Step 2.7] VALIDATION CHECK: Guard against illegal state transition");
        assertThrows(IllegalStateException.class, () -> {
            delivery.transitionTo(Delivery.DeliveryStatus.SHIPPED);
        });
        System.out.println("   --> SUCCESS: State Pattern blocked invalid transition!");

        System.out.println("\n================================================================================");
        System.out.println(" DESIGN PATTERNS VERIFICATION SUMMARY: ALL RUNTIME TRACES VALIDATED");
        System.out.println("================================================================================\n");
    }

    private void printDeliveryStateSnapshot(Delivery delivery) {
        DeliveryState state = delivery.getCurrentState();
        System.out.println(String.format("   --> Active State Class  : %s", state.getClass().getSimpleName()));
        System.out.println(String.format("   --> Current Status Enum : %s", delivery.getDeliveryStatus()));
        System.out.println(String.format("   --> Milestone Title     : %s", state.getMilestoneTitle()));
        System.out.println(String.format("   --> Associated Order St : %s", state.getAssociatedOrderStatus()));
        System.out.println(String.format("   --> Description Text    : %s", state.getDefaultDescription(delivery, null)));
        System.out.println("   -------------------------------------------------------------------------");
    }

    private void printBanner(String title) {
        System.out.println("\n********************************************************************************");
        System.out.println("  " + title);
        System.out.println("********************************************************************************\n");
    }
}
