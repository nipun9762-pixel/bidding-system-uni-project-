package com.biddingsystem.pattern.state.delivery;

import com.biddingsystem.entity.Delivery;
import com.biddingsystem.entity.WinningOrder;
import java.time.LocalDateTime;

public class CollectedDeliveryState implements DeliveryState {

    @Override
    public Delivery.DeliveryStatus getStatus() {
        return Delivery.DeliveryStatus.COLLECTED;
    }

    @Override
    public String getMilestoneTitle() {
        return "Vehicle Collected by Buyer";
    }

    @Override
    public String getDefaultDescription(Delivery delivery, String customNotes) {
        if (customNotes != null && !customNotes.trim().isEmpty()) {
            return customNotes;
        }
        return "Buyer collected vehicle directly from logistics delivery center.";
    }

    @Override
    public boolean canTransitionTo(Delivery.DeliveryStatus nextStatus) {
        return false; // Terminal state
    }

    @Override
    public WinningOrder.OrderStatus getAssociatedOrderStatus() {
        return WinningOrder.OrderStatus.COMPLETED;
    }

    @Override
    public void applyStateSideEffects(Delivery delivery) {
        if (delivery.getDeliveredDate() == null) {
            delivery.setDeliveredDate(LocalDateTime.now());
        }
    }
}
