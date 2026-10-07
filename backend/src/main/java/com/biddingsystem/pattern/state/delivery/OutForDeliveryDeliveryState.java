package com.biddingsystem.pattern.state.delivery;

import com.biddingsystem.entity.Delivery;
import com.biddingsystem.entity.WinningOrder;

public class OutForDeliveryDeliveryState implements DeliveryState {

    @Override
    public Delivery.DeliveryStatus getStatus() {
        return Delivery.DeliveryStatus.OUT_FOR_DELIVERY;
    }

    @Override
    public String getMilestoneTitle() {
        return "Out for Final Delivery";
    }

    @Override
    public String getDefaultDescription(Delivery delivery, String customNotes) {
        if (customNotes != null && !customNotes.trim().isEmpty()) {
            return customNotes;
        }
        return "Vehicle has arrived at local depot and is out on carrier for final handover to destination address.";
    }

    @Override
    public boolean canTransitionTo(Delivery.DeliveryStatus nextStatus) {
        return nextStatus == Delivery.DeliveryStatus.DELIVERED
            || nextStatus == Delivery.DeliveryStatus.COLLECTED
            || nextStatus == Delivery.DeliveryStatus.CANCELLED;
    }

    @Override
    public WinningOrder.OrderStatus getAssociatedOrderStatus() {
        return WinningOrder.OrderStatus.SHIPPED;
    }
}
