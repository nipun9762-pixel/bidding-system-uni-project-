package com.biddingsystem.pattern.state.delivery;

import com.biddingsystem.entity.Delivery;
import com.biddingsystem.entity.WinningOrder;

public class InTransitDeliveryState implements DeliveryState {

    @Override
    public Delivery.DeliveryStatus getStatus() {
        return Delivery.DeliveryStatus.IN_TRANSIT;
    }

    @Override
    public String getMilestoneTitle() {
        return "In Transit - Checkpoint Scan";
    }

    @Override
    public String getDefaultDescription(Delivery delivery, String customNotes) {
        if (customNotes != null && !customNotes.trim().isEmpty()) {
            return customNotes;
        }
        String loc = delivery.getCurrentLocation() != null ? delivery.getCurrentLocation() : "Logistics Hub";
        return "Transporter in transit. GPS ping confirmed at: " + loc;
    }

    @Override
    public boolean canTransitionTo(Delivery.DeliveryStatus nextStatus) {
        return nextStatus == Delivery.DeliveryStatus.IN_TRANSIT
            || nextStatus == Delivery.DeliveryStatus.OUT_FOR_DELIVERY
            || nextStatus == Delivery.DeliveryStatus.DELIVERED
            || nextStatus == Delivery.DeliveryStatus.CANCELLED;
    }

    @Override
    public WinningOrder.OrderStatus getAssociatedOrderStatus() {
        return WinningOrder.OrderStatus.SHIPPED;
    }
}
