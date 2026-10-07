package com.biddingsystem.pattern.state.delivery;

import com.biddingsystem.entity.Delivery;
import com.biddingsystem.entity.WinningOrder;

/**
 * State Pattern Interface for Delivery Lifecycle Management.
 * Encapsulates status-specific behaviors, allowed transitions, and milestone metadata.
 */
public interface DeliveryState {

    Delivery.DeliveryStatus getStatus();

    String getMilestoneTitle();

    String getDefaultDescription(Delivery delivery, String customNotes);

    boolean canTransitionTo(Delivery.DeliveryStatus nextStatus);

    WinningOrder.OrderStatus getAssociatedOrderStatus();

    default void applyStateSideEffects(Delivery delivery) {
        // Optional hook for state-specific timestamps or side-effects
    }
}
