package com.biddingsystem.pattern.state.delivery;

import com.biddingsystem.entity.Delivery;
import com.biddingsystem.entity.WinningOrder;

public class CancelledDeliveryState implements DeliveryState {

    @Override
    public Delivery.DeliveryStatus getStatus() {
        return Delivery.DeliveryStatus.CANCELLED;
    }

    @Override
    public String getMilestoneTitle() {
        return "Delivery Cancelled";
    }

    @Override
    public String getDefaultDescription(Delivery delivery, String customNotes) {
        if (customNotes != null && !customNotes.trim().isEmpty()) {
            return customNotes;
        }
        return "Delivery process has been cancelled.";
    }

    @Override
    public boolean canTransitionTo(Delivery.DeliveryStatus nextStatus) {
        return false; // Terminal state
    }

    @Override
    public WinningOrder.OrderStatus getAssociatedOrderStatus() {
        return WinningOrder.OrderStatus.PENDING;
    }
}
