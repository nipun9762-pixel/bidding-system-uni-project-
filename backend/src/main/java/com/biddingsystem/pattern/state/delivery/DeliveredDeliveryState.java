package com.biddingsystem.pattern.state.delivery;

import com.biddingsystem.entity.Delivery;
import com.biddingsystem.entity.WinningOrder;
import java.time.LocalDateTime;

public class DeliveredDeliveryState implements DeliveryState {

    @Override
    public Delivery.DeliveryStatus getStatus() {
        return Delivery.DeliveryStatus.DELIVERED;
    }

    @Override
    public String getMilestoneTitle() {
        return "Delivered & Signed by Buyer";
    }

    @Override
    public String getDefaultDescription(Delivery delivery, String customNotes) {
        if (customNotes != null && !customNotes.trim().isEmpty()) {
            return customNotes;
        }
        return "Vehicle delivered to destination. Handover receipt signed and delivery completed.";
    }

    @Override
    public boolean canTransitionTo(Delivery.DeliveryStatus nextStatus) {
        return false; // Terminal state
    }

    @Override
    public WinningOrder.OrderStatus getAssociatedOrderStatus() {
        return WinningOrder.OrderStatus.DELIVERED;
    }

    @Override
    public void applyStateSideEffects(Delivery delivery) {
        if (delivery.getDeliveredDate() == null) {
            delivery.setDeliveredDate(LocalDateTime.now());
        }
    }
}
