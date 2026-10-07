package com.biddingsystem.service;

import com.biddingsystem.entity.*;
import com.biddingsystem.pattern.state.delivery.DeliveryState;
import com.biddingsystem.pattern.strategy.payment.PaymentResult;
import com.biddingsystem.pattern.strategy.payment.PaymentStrategy;
import com.biddingsystem.pattern.strategy.payment.PaymentStrategyFactory;
import com.biddingsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OrderPaymentService {

    @Autowired
    private WinningOrderRepository orderRepo;

    @Autowired
    private PaymentRepository paymentRepo;

    @Autowired
    private DeliveryRepository deliveryRepo;

    @Autowired
    private DeliveryMilestoneRepository milestoneRepo;

    @Autowired
    private NotificationRepository notificationRepo;

    @Autowired
    private AuditLogRepository auditLogRepo;

    // Strategy Pattern: Injected PaymentStrategyFactory
    @Autowired
    private PaymentStrategyFactory paymentStrategyFactory;

    @Transactional
    public Payment processPayment(Long orderId, String paymentMethod, String txRef) {
        WinningOrder order = orderRepo.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Winning order not found: " + orderId));

        // Strategy Pattern: Resolve appropriate payment processor strategy dynamically
        PaymentStrategy strategy = paymentStrategyFactory.getStrategy(paymentMethod);
        PaymentResult result = strategy.executePayment(order, order.getWinningAmount(), txRef);

        Payment payment = new Payment();
        payment.setWinningOrder(order);
        payment.setPaymentAmount(order.getWinningAmount());
        payment.setPaymentMethod(strategy.getPaymentMethod());
        payment.setTransactionReference(result.getTransactionReference());
        payment.setPaymentStatus(result.getStatus());
        Payment savedPayment = paymentRepo.save(payment);

        deliveryRepo.findByWinningOrder_OrderId(orderId).ifPresent(delivery -> {
            DeliveryMilestone milestone = new DeliveryMilestone(
                delivery,
                "Payment Submitted (" + strategy.getGatewayName() + ")",
                result.getGatewayMessage(),
                strategy.getGatewayName(),
                Delivery.DeliveryStatus.AWAITING_PAYMENT
            );
            delivery.addMilestone(milestone);
            deliveryRepo.save(delivery);
        });

        return savedPayment;
    }

    @Transactional
    public Payment acknowledgePaymentByProcessor(Long paymentId, boolean isApproved, String notes) {
        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found: " + paymentId));

        WinningOrder order = payment.getWinningOrder();

        if (isApproved) {
            payment.setPaymentStatus(Payment.PaymentStatus.SUCCESSFUL);
            order.setOrderStatus(WinningOrder.OrderStatus.PAID);

            // Update Delivery status to Preparing for Shipment via State Pattern transition
            deliveryRepo.findByWinningOrder_OrderId(order.getOrderId()).ifPresent(delivery -> {
                delivery.transitionTo(Delivery.DeliveryStatus.PREPARING_FOR_SHIPMENT);
                delivery.setCurrentLocation("Seller Dispatch Bay - Title & Vehicle Prep");
                delivery.addMilestone(new DeliveryMilestone(
                    delivery,
                    "Payment Verified & Escrow Cleared",
                    "Payment Processor confirmed receipt of funds. Seller is preparing vehicle registration, title transfer, and carrier dispatch.",
                    "Escrow & Settlement Clearinghouse",
                    Delivery.DeliveryStatus.PREPARING_FOR_SHIPMENT
                ));
                deliveryRepo.save(delivery);
            });

            // Notifications
            notificationRepo.save(new Notification(
                order.getBuyer(),
                "PAYMENT_CONFIRMED",
                String.format("Payment of $%.2f for order #%d has been verified. Seller is preparing shipment.", payment.getPaymentAmount(), order.getOrderId())
            ));

            notificationRepo.save(new Notification(
                order.getSeller(),
                "PAYMENT_RECEIVED",
                String.format("Payment for order #%d ($%.2f) confirmed by Payment Processor. Please ship item.", order.getOrderId(), payment.getPaymentAmount())
            ));

            auditLogRepo.save(new AuditLog(
                null,
                "PAYMENT_ACKNOWLEDGED",
                String.format("Payment Processor verified Payment #%d for Order #%d.", paymentId, order.getOrderId())
            ));
        } else {
            payment.setPaymentStatus(Payment.PaymentStatus.FAILED);
            order.setOrderStatus(WinningOrder.OrderStatus.PENDING);

            deliveryRepo.findByWinningOrder_OrderId(order.getOrderId()).ifPresent(delivery -> {
                delivery.addMilestone(new DeliveryMilestone(
                    delivery,
                    "Payment Verification Failed",
                    "Payment settlement was not approved: " + (notes != null ? notes : "Review failed."),
                    "Payment Clearinghouse",
                    Delivery.DeliveryStatus.AWAITING_PAYMENT
                ));
                deliveryRepo.save(delivery);
            });

            notificationRepo.save(new Notification(
                order.getBuyer(),
                "PAYMENT_FAILED",
                "Payment settlement failed: " + (notes != null ? notes : "Verification failed")
            ));

            auditLogRepo.save(new AuditLog(
                null,
                "PAYMENT_FAILED",
                String.format("Payment #%d failed verification for Order #%d.", paymentId, order.getOrderId())
            ));
        }

        orderRepo.save(order);
        return paymentRepo.save(payment);
    }

    @Transactional
    public Delivery updateDeliveryStatus(Long orderId, Delivery.DeliveryStatus newStatus, String trackingNumber, 
                                        String address, String carrierName, String currentLocation, 
                                        String notes, String recipientPhone) {
        Delivery delivery = deliveryRepo.findByWinningOrder_OrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Delivery record not found for order: " + orderId));

        if (address != null && !address.trim().isEmpty()) {
            delivery.setDeliveryAddress(address);
        }
        if (trackingNumber != null && !trackingNumber.trim().isEmpty()) {
            delivery.setTrackingNumber(trackingNumber);
        }
        if (carrierName != null && !carrierName.trim().isEmpty()) {
            delivery.setCarrierName(carrierName);
        }
        if (currentLocation != null && !currentLocation.trim().isEmpty()) {
            delivery.setCurrentLocation(currentLocation);
        }
        if (notes != null && !notes.trim().isEmpty()) {
            delivery.setDeliveryNotes(notes);
        }
        if (recipientPhone != null && !recipientPhone.trim().isEmpty()) {
            delivery.setRecipientPhone(recipientPhone);
        }

        // State Pattern: Validate transition & apply state-specific lifecycle side-effects
        delivery.transitionTo(newStatus);
        DeliveryState state = delivery.getCurrentState();

        String loc = delivery.getCurrentLocation() != null ? delivery.getCurrentLocation() : "Logistics Checkpoint";
        String milestoneTitle = state.getMilestoneTitle();
        String milestoneDesc = state.getDefaultDescription(delivery, notes);

        DeliveryMilestone milestone = new DeliveryMilestone(delivery, milestoneTitle, milestoneDesc, loc, newStatus);
        delivery.addMilestone(milestone);

        Delivery savedDelivery = deliveryRepo.save(delivery);

        WinningOrder order = delivery.getWinningOrder();
        WinningOrder.OrderStatus orderStatus = state.getAssociatedOrderStatus();
        if (orderStatus != null) {
            order.setOrderStatus(orderStatus);
            orderRepo.save(order);
        }

        notificationRepo.save(new Notification(
            order.getBuyer(),
            "DELIVERY_UPDATE",
            String.format("Order #%d delivery update: %s (%s). Location: %s. Tracking #: %s", 
                order.getOrderId(), newStatus, milestoneTitle, loc, 
                delivery.getTrackingNumber() != null ? delivery.getTrackingNumber() : "N/A")
        ));

        return savedDelivery;
    }

    // Backwards-compatible overload
    @Transactional
    public Delivery updateDeliveryStatus(Long orderId, Delivery.DeliveryStatus newStatus, String trackingNumber, String address) {
        return updateDeliveryStatus(orderId, newStatus, trackingNumber, address, null, null, null, null);
    }

    @Transactional
    public Delivery updateBuyerAddress(Long orderId, String address, String recipientPhone) {
        Delivery delivery = deliveryRepo.findByWinningOrder_OrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Delivery record not found for order: " + orderId));

        if (delivery.getDeliveryStatus() == Delivery.DeliveryStatus.DELIVERED) {
            throw new IllegalStateException("Cannot update address for an already delivered order.");
        }

        delivery.setDeliveryAddress(address);
        if (recipientPhone != null && !recipientPhone.trim().isEmpty()) {
            delivery.setRecipientPhone(recipientPhone);
        }

        DeliveryMilestone milestone = new DeliveryMilestone(
            delivery,
            "Destination Address Confirmed / Updated",
            "Buyer confirmed delivery destination: " + address + (recipientPhone != null ? " (Phone: " + recipientPhone + ")" : ""),
            "Buyer Portal",
            delivery.getDeliveryStatus()
        );
        delivery.addMilestone(milestone);

        return deliveryRepo.save(delivery);
    }

    @Transactional
    public Delivery addTrackingMilestone(Long deliveryId, String title, String description, String location, Delivery.DeliveryStatus status) {
        Delivery delivery = deliveryRepo.findById(deliveryId)
                .orElseThrow(() -> new IllegalArgumentException("Delivery record not found: " + deliveryId));

        if (status != null) {
            delivery.setDeliveryStatus(status);
        }
        if (location != null && !location.trim().isEmpty()) {
            delivery.setCurrentLocation(location);
        }

        DeliveryMilestone milestone = new DeliveryMilestone(delivery, title, description, location, delivery.getDeliveryStatus());
        delivery.addMilestone(milestone);

        return deliveryRepo.save(delivery);
    }

    public Optional<Delivery> getDeliveryByTrackingNumber(String trackingNumber) {
        return deliveryRepo.findByTrackingNumber(trackingNumber);
    }
}
