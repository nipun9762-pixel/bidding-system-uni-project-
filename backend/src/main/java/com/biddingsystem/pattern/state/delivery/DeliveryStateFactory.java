package com.biddingsystem.pattern.state.delivery;

import com.biddingsystem.entity.Delivery;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

/**
 * State Factory for retrieving concrete DeliveryState handlers.
 */
@Component
public class DeliveryStateFactory {

    private static final Map<Delivery.DeliveryStatus, DeliveryState> STATE_MAP = new EnumMap<>(Delivery.DeliveryStatus.class);

    static {
        register(new AwaitingPaymentDeliveryState());
        register(new PreparingForShipmentDeliveryState());
        register(new ShippedDeliveryState());
        register(new InTransitDeliveryState());
        register(new OutForDeliveryDeliveryState());
        register(new DeliveredDeliveryState());
        register(new CollectedDeliveryState());
        register(new CancelledDeliveryState());
    }

    private static void register(DeliveryState state) {
        STATE_MAP.put(state.getStatus(), state);
    }

    public static DeliveryState getState(Delivery.DeliveryStatus status) {
        if (status == null) {
            return STATE_MAP.get(Delivery.DeliveryStatus.AWAITING_PAYMENT);
        }
        DeliveryState state = STATE_MAP.get(status);
        if (state == null) {
            throw new IllegalArgumentException("Unknown or unsupported delivery status: " + status);
        }
        return state;
    }
}
