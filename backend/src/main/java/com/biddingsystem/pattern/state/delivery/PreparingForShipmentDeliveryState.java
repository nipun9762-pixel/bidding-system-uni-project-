package com.biddingsystem.pattern.state.delivery;

import com.biddingsystem.entity.Delivery;
import com.biddingsystem.entity.WinningOrder;

public class PreparingForShipmentDeliveryState implements DeliveryState {

    @Override
    public Delivery.DeliveryStatus getStatus() {
        return Delivery.DeliveryStatus.PREPARING_FOR_SHIPMENT;
    }

    @Override
    public String getMilestoneTitle() {
        return "Vehicle Prep & Inspection Completed";
    }

    @Override
    public String getDefaultDescription(Delivery delivery, String customNotes) {
        if (customNotes != null && !customNotes.trim().isEmpty()) {
            return customNotes;
        }
        return "Seller has inspected vehicle, prepped keys, title, and Bill of Lading for carrier pickup.";
    }

    @Override
    public boolean canTransitionTo(Delivery.DeliveryStatus nextStatus) {
        return nextStatus == Delivery.DeliveryStatus.SHIPPED 
            || nextStatus == Delivery.DeliveryStatus.COLLECTED
            || nextStatus == Delivery.DeliveryStatus.CANCELLED;
    }

    @Override
    public WinningOrder.OrderStatus getAssociatedOrderStatus() {
        return WinningOrder.OrderStatus.PAID;
    }
}
