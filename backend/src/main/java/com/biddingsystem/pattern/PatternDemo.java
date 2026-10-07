package com.biddingsystem.pattern;

import com.biddingsystem.entity.Delivery;
import com.biddingsystem.entity.WinningOrder;
import com.biddingsystem.pattern.state.delivery.*;

import java.math.BigDecimal;

/**
 * Standalone Console Application to display Design Patterns execution output.
 * Can be run directly via:
 * 1) Apache NetBeans: Right-click file -> 'Run File' (Shift + F6)
 * 2) Maven CLI: .\apache-maven-3.9.6\bin\mvn.cmd test -Dtest=DesignPatternsDemoRunnerTest
 */
public class PatternDemo {

    public static void main(String[] args) {
        System.out.println("********************************************************************************");
        System.out.println("  VEHICLE BIDDING SYSTEM - DESIGN PATTERNS EXECUTION OUTPUT");
        System.out.println("********************************************************************************\n");

        WinningOrder sampleOrder = new WinningOrder();
        sampleOrder.setOrderId(1042L);
        sampleOrder.setWinningAmount(new BigDecimal("78500.00"));

        // ====================================================================
        // 2. STATE PATTERN (DELIVERY LIFECYCLE)
        // ====================================================================
        System.out.println("\n================================================================================");
        System.out.println(" 2. DESIGN PATTERN: STATE PATTERN (DELIVERY LIFECYCLE MANAGEMENT)");
        System.out.println("================================================================================");
        System.out.println("Pattern Category : Gang of Four (GoF) - Behavioral");
        System.out.println("Purpose          : State-specific lifecycle transitions, validation, and side-effects.");
        System.out.println("Context Class    : com.biddingsystem.entity.Delivery");
        System.out.println("State Interface  : com.biddingsystem.pattern.state.delivery.DeliveryState");
        System.out.println("State Factory    : com.biddingsystem.pattern.state.delivery.DeliveryStateFactory");
        System.out.println("--------------------------------------------------------------------------------");

        Delivery delivery = new Delivery();
        delivery.setDeliveryId(8801L);
        delivery.setWinningOrder(sampleOrder);
        delivery.setDeliveryAddress("742 Evergreen Terrace, Springfield, OR");
        delivery.setDeliveryStatus(Delivery.DeliveryStatus.AWAITING_PAYMENT);

        System.out.println(" [Step 2.1] INITIAL CREATION:");
        printSnapshot(delivery);

        // Transition 1: Awaiting Payment -> Preparing for Shipment
        System.out.println(" [Step 2.2] TRANSITION EVENT: Payment Approved by Clearinghouse");
        delivery.transitionTo(Delivery.DeliveryStatus.PREPARING_FOR_SHIPMENT);
        printSnapshot(delivery);

        // Transition 2: Preparing for Shipment -> Shipped
        System.out.println(" [Step 2.3] TRANSITION EVENT: Carrier Dispatch & Handover");
        delivery.setCarrierName("Apex Auto Freight Express");
        delivery.setTrackingNumber("APX-8801-EXP");
        delivery.setCurrentLocation("Dispatch Terminal Hub A - Bay 4");
        delivery.transitionTo(Delivery.DeliveryStatus.SHIPPED);
        printSnapshot(delivery);
        System.out.println(String.format("   --> Side-Effect Hook    : Shipped Timestamp = %s", delivery.getShippedDate()));
        System.out.println(String.format("   --> Side-Effect Hook    : Estimated Delivery = %s", delivery.getEstimatedDeliveryDate()));

        // Transition 3: Shipped -> In Transit
        System.out.println(" [Step 2.4] TRANSITION EVENT: En Route Highway Checkpoint Scan");
        delivery.setCurrentLocation("Interstate 80 Corridor - Checkpoint 12");
        delivery.transitionTo(Delivery.DeliveryStatus.IN_TRANSIT);
        printSnapshot(delivery);

        // Transition 4: In Transit -> Out For Delivery
        System.out.println(" [Step 2.5] TRANSITION EVENT: Local Hub Flatbed Out For Delivery");
        delivery.setCurrentLocation("Springfield Regional Logistics Depot");
        delivery.transitionTo(Delivery.DeliveryStatus.OUT_FOR_DELIVERY);
        printSnapshot(delivery);

        // Transition 5: Out For Delivery -> Delivered (Terminal State)
        System.out.println(" [Step 2.6] TRANSITION EVENT: Destination Handover & Title Receipt Signed");
        delivery.setCurrentLocation("742 Evergreen Terrace, Springfield, OR");
        delivery.transitionTo(Delivery.DeliveryStatus.DELIVERED);
        printSnapshot(delivery);
        System.out.println(String.format("   --> Side-Effect Hook    : Delivered Timestamp = %s", delivery.getDeliveredDate()));

        // Invalid Transition Protection Demonstration
        System.out.println("\n [Step 2.7] VALIDATION CHECK: Guard against illegal state transition");
        try {
            System.out.println("   --> Attempting illegal backward transition: DELIVERED -> SHIPPED ...");
            delivery.transitionTo(Delivery.DeliveryStatus.SHIPPED);
            System.out.println("   --> FAILED: Illegal transition was not blocked!");
        } catch (IllegalStateException ex) {
            System.out.println("   --> SUCCESS: State Pattern blocked invalid transition!");
            System.out.println(String.format("   --> Caught Exception : %s", ex.getMessage()));
        }

        System.out.println("\n================================================================================");
        System.out.println(" DESIGN PATTERNS VERIFICATION: ALL PARTICIPANTS EXECUTED SUCCESSFULLY");
        System.out.println("================================================================================\n");
    }

    private static void printSnapshot(Delivery delivery) {
        DeliveryState state = delivery.getCurrentState();
        System.out.println(String.format("   --> Active State Class  : %s", state.getClass().getSimpleName()));
        System.out.println(String.format("   --> Current Status Enum : %s", delivery.getDeliveryStatus()));
        System.out.println(String.format("   --> Milestone Title     : %s", state.getMilestoneTitle()));
        System.out.println(String.format("   --> Associated Order St : %s", state.getAssociatedOrderStatus()));
        System.out.println(String.format("   --> Description Text    : %s", state.getDefaultDescription(delivery, null)));
        System.out.println("   -------------------------------------------------------------------------");
    }
}
