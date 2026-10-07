package com.biddingsystem.pattern.state.delivery;

import com.biddingsystem.entity.Delivery;
import com.biddingsystem.entity.WinningOrder;
import java.time.LocalDateTime;

public class ShippedDeliveryState implements DeliveryState {

    @Override
    public Delivery.DeliveryStatus getStatus() {
        return Delivery.DeliveryStatus.SHIPPED;
    }

    @Override
    public String getMilestoneTitle() {
        return "Picked Up by Carrier & Dispatched";
    }

    @Override
    public String getDefaultDescription(Delivery delivery, String customNotes) {
        if (customNotes != null && !customNotes.trim().isEmpty()) {
            return customNotes;
        }
        return String.format("Vehicle loaded onto %s transporter. Tracking Number: %s.",
                delivery.getCarrierName() != null ? delivery.getCarrierName() : "Carrier",
                delivery.getTrackingNumber() != null ? delivery.getTrackingNumber() : "Assigned");
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

    @Override
    public void applyStateSideEffects(Delivery delivery) {
        LocalDateTime now = LocalDateTime.now();
        if (delivery.getShippedDate() == null) {
            delivery.setShippedDate(now);
        }
        if (delivery.getEstimatedDeliveryDate() == null) {
            delivery.setEstimatedDeliveryDate(now.plusDays(3));
        }
    }
}
