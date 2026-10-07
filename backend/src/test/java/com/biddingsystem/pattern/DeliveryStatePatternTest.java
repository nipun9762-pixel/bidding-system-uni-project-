package com.biddingsystem.pattern;

import com.biddingsystem.entity.Delivery;
import com.biddingsystem.entity.WinningOrder;
import com.biddingsystem.pattern.state.delivery.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class DeliveryStatePatternTest {

    private Delivery delivery;
    private WinningOrder order;

    @BeforeEach
    void setUp() {
        order = new WinningOrder();
        order.setOrderId(200L);
        order.setOrderStatus(WinningOrder.OrderStatus.PENDING);

        delivery = new Delivery();
        delivery.setDeliveryId(1L);
        delivery.setWinningOrder(order);
        delivery.setDeliveryAddress("123 Beverly Hills, CA");
        delivery.setDeliveryStatus(Delivery.DeliveryStatus.AWAITING_PAYMENT);
    }

    @Test
    void testInitialStateIsAwaitingPayment() {
        assertEquals(Delivery.DeliveryStatus.AWAITING_PAYMENT, delivery.getDeliveryStatus());
        DeliveryState state = delivery.getCurrentState();
        assertTrue(state instanceof AwaitingPaymentDeliveryState);
        assertEquals(WinningOrder.OrderStatus.PENDING, state.getAssociatedOrderStatus());
    }

    @Test
    void testStandardDeliveryLifecycleTransitions() {
        // Awaiting Payment -> Preparing for Shipment
        delivery.transitionTo(Delivery.DeliveryStatus.PREPARING_FOR_SHIPMENT);
        assertEquals(Delivery.DeliveryStatus.PREPARING_FOR_SHIPMENT, delivery.getDeliveryStatus());
        assertTrue(delivery.getCurrentState() instanceof PreparingForShipmentDeliveryState);

        // Preparing for Shipment -> Shipped
        delivery.setCarrierName("TransAuto Logistics");
        delivery.setTrackingNumber("TRK-998877");
        delivery.transitionTo(Delivery.DeliveryStatus.SHIPPED);
        assertEquals(Delivery.DeliveryStatus.SHIPPED, delivery.getDeliveryStatus());
        assertNotNull(delivery.getShippedDate());
        assertNotNull(delivery.getEstimatedDeliveryDate());

        // Shipped -> In Transit
        delivery.transitionTo(Delivery.DeliveryStatus.IN_TRANSIT);
        assertEquals(Delivery.DeliveryStatus.IN_TRANSIT, delivery.getDeliveryStatus());

        // In Transit -> Out For Delivery
        delivery.transitionTo(Delivery.DeliveryStatus.OUT_FOR_DELIVERY);
        assertEquals(Delivery.DeliveryStatus.OUT_FOR_DELIVERY, delivery.getDeliveryStatus());

        // Out For Delivery -> Delivered
        delivery.transitionTo(Delivery.DeliveryStatus.DELIVERED);
        assertEquals(Delivery.DeliveryStatus.DELIVERED, delivery.getDeliveryStatus());
        assertNotNull(delivery.getDeliveredDate());
    }

    @Test
    void testDirectLocalDepotPickupTransition() {
        delivery.transitionTo(Delivery.DeliveryStatus.PREPARING_FOR_SHIPMENT);
        delivery.transitionTo(Delivery.DeliveryStatus.COLLECTED);

        assertEquals(Delivery.DeliveryStatus.COLLECTED, delivery.getDeliveryStatus());
        assertNotNull(delivery.getDeliveredDate());
        assertTrue(delivery.getCurrentState() instanceof CollectedDeliveryState);
        assertEquals(WinningOrder.OrderStatus.COMPLETED, delivery.getCurrentState().getAssociatedOrderStatus());
    }

    @Test
    void testDisallowedTransitionThrowsIllegalStateException() {
        // Cannot jump directly from AWAITING_PAYMENT to DELIVERED
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            delivery.transitionTo(Delivery.DeliveryStatus.DELIVERED);
        });

        assertTrue(ex.getMessage().contains("Invalid delivery status transition"));
    }

    @Test
    void testTerminalStateCannotTransition() {
        delivery.transitionTo(Delivery.DeliveryStatus.PREPARING_FOR_SHIPMENT);
        delivery.transitionTo(Delivery.DeliveryStatus.COLLECTED);

        // From COLLECTED (terminal), cannot go to SHIPPED or IN_TRANSIT
        assertThrows(IllegalStateException.class, () -> {
            delivery.transitionTo(Delivery.DeliveryStatus.SHIPPED);
        });
    }

    @Test
    void testFactoryResolvesAllStatuses() {
        for (Delivery.DeliveryStatus status : Delivery.DeliveryStatus.values()) {
            DeliveryState state = DeliveryStateFactory.getState(status);
            assertNotNull(state);
            assertEquals(status, state.getStatus());
        }
    }
}
