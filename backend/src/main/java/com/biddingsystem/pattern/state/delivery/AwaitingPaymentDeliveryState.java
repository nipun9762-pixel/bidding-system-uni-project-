package com.biddingsystem.pattern.state.delivery;

import com.biddingsystem.entity.Delivery;
import com.biddingsystem.entity.WinningOrder;

public class AwaitingPaymentDeliveryState implements DeliveryState {

    @Override
    public Delivery.DeliveryStatus getStatus() {
        return Delivery.DeliveryStatus.AWAITING_PAYMENT;
    }

    @Override
    public String getMilestoneTitle() {
        return "Awaiting Payment Settlement";
    }

    @Override
    public String getDefaultDescription(Delivery delivery, String customNotes) {
        if (customNotes != null && !customNotes.trim().isEmpty()) {
            return customNotes;
        }
        return "Order created. Awaiting buyer payment confirmation and processor clearance before dispatch preparation.";
    }

    @Override
    public boolean canTransitionTo(Delivery.DeliveryStatus nextStatus) {
        return nextStatus == Delivery.DeliveryStatus.PREPARING_FOR_SHIPMENT 
            || nextStatus == Delivery.DeliveryStatus.CANCELLED;
    }

    @Override
    public WinningOrder.OrderStatus getAssociatedOrderStatus() {
        return WinningOrder.OrderStatus.PENDING;
    }
}
