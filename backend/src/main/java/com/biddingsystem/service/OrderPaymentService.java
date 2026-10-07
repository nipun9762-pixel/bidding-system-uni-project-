package com.biddingsystem.service;

import com.biddingsystem.entity.*;
import com.biddingsystem.pattern.state.delivery.DeliveryState;
import com.biddingsystem.pattern.strategy.payment.*;
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

    /**
     * Executes payment processing using the Strategy Pattern (GoF Behavioral).
     * Validates credentials and prepares payment details via the appropriate PaymentStrategy,
     * sets status to PROCESSING for Administrator verification, and records delivery milestones.
     */
    @Transactional
    public Payment processPaymentWithStrategy(PaymentRequest request) {
        if (request == null || request.getOrderId() == null) {
            throw new IllegalArgumentException("Valid PaymentRequest with orderId is required.");
        }

        WinningOrder order = orderRepo.findById(request.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Winning order not found: " + request.getOrderId()));

        if (request.getAmount() == null) {
            request.setAmount(order.getWinningAmount());
        }

        // 1. Resolve strategy using PaymentStrategyFactory
        PaymentStrategy strategy = PaymentStrategyFactory.getStrategy(request.getPaymentMethod());

        // 2. Delegate execution to PaymentContext (Strategy Pattern)
        PaymentContext context = new PaymentContext(strategy);
        PaymentResult result = context.executePayment(request);

        // 3. Persist Payment record awaiting Administrator approval
        Payment payment = new Payment();
        payment.setWinningOrder(order);
        payment.setPaymentAmount(result.getAmount());
        payment.setPaymentMethod(result.getPaymentMethod());
        payment.setTransactionReference(result.getTransactionReference());
        payment.setPaymentDetails(result.getMaskedDetails());
        payment.setPaymentStatus(Payment.PaymentStatus.PROCESSING);
        Payment savedPayment = paymentRepo.save(payment);

        // 4. Update order status to PROCESSING awaiting admin verification
        order.setOrderStatus(WinningOrder.OrderStatus.PROCESSING);
        orderRepo.save(order);

        // 5. Record milestone on delivery record, keeping status at AWAITING_PAYMENT until Admin approves
        deliveryRepo.findByWinningOrder_OrderId(order.getOrderId()).ifPresent(delivery -> {
            delivery.setDeliveryStatus(Delivery.DeliveryStatus.AWAITING_PAYMENT);
            DeliveryMilestone milestone = new DeliveryMilestone(
                delivery,
                "Payment Submitted (" + strategy.getDisplayName() + ")",
                "Buyer submitted payment details (" + result.getMaskedDetails() + "). Awaiting Administrator review and approval.",
                "Admin Settlement Desk",
                Delivery.DeliveryStatus.AWAITING_PAYMENT
            );
            delivery.addMilestone(milestone);
            deliveryRepo.save(delivery);
        });

        // 6. Notifications & Audit Log
        notificationRepo.save(new Notification(
            order.getSeller(),
            "PAYMENT_SUBMITTED",
            String.format("Buyer submitted %s payment for Order #%d (Rs. %.2f). Awaiting Administrator verification.",
                    strategy.getDisplayName(), order.getOrderId(), order.getWinningAmount())
        ));

        auditLogRepo.save(new AuditLog(
            order.getBuyer(),
            "PAYMENT_SUBMITTED",
            String.format("Payment submitted via %s for Order #%d with reference %s.",
                    strategy.getDisplayName(), order.getOrderId(), result.getTransactionReference())
        ));

        return savedPayment;
    }

    @Transactional
    public Payment processPayment(Long orderId, String paymentMethod, String txRef) {
        return processPayment(orderId, paymentMethod, txRef, null);
    }

    @Transactional
    public Payment processPayment(Long orderId, String paymentMethod, String txRef, String paymentSlipUrl) {
        PaymentRequest request = new PaymentRequest();
        request.setOrderId(orderId);
        request.setPaymentMethod(paymentMethod != null ? paymentMethod : BankTransferPaymentStrategy.METHOD_NAME);
        request.setTransferReference(txRef);
        request.setBankName("Direct Settlement");
        request.setAccountNumber("0000");
        request.setAccountHolderName("Buyer");
        return processPaymentWithStrategy(request);
    }

    @Transactional
    public Payment acknowledgePaymentByProcessor(Long paymentIdOrOrderId, boolean isApproved, String notes) {
        // Find payment by paymentId, or fallback to finding by orderId
        Payment payment = paymentRepo.findById(paymentIdOrOrderId)
                .or(() -> paymentRepo.findByWinningOrder_OrderId(paymentIdOrOrderId).stream().findFirst())
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found for ID: " + paymentIdOrOrderId));

        WinningOrder order = payment.getWinningOrder();
        payment.setAdminNotes(notes);

        if (isApproved) {
            payment.setPaymentStatus(Payment.PaymentStatus.SUCCESSFUL);
            order.setOrderStatus(WinningOrder.OrderStatus.PAID);

            // Once admin approves, ONLY THEN does product processing and delivery process start!
            deliveryRepo.findByWinningOrder_OrderId(order.getOrderId()).ifPresent(delivery -> {
                delivery.transitionTo(Delivery.DeliveryStatus.PREPARING_FOR_SHIPMENT);
                delivery.setCurrentLocation("Seller Logistics Facility - Packaging & Title Preparation");
                delivery.addMilestone(new DeliveryMilestone(
                    delivery,
                    "Payment Approved by Administrator",
                    "Administrator verified and approved payment. Escrow cleared. Vehicle preparation and dispatch process has officially started.",
                    "Admin Operations Desk",
                    Delivery.DeliveryStatus.PREPARING_FOR_SHIPMENT
                ));
                deliveryRepo.save(delivery);
            });

            // Notifications
            notificationRepo.save(new Notification(
                order.getBuyer(),
                "PAYMENT_APPROVED",
                String.format("Your payment for Order #%d has been approved by Administrator! Vehicle preparation and delivery have started.", order.getOrderId())
            ));

            notificationRepo.save(new Notification(
                order.getSeller(),
                "PAYMENT_CONFIRMED",
                String.format("Administrator approved payment for Order #%d. Please begin vehicle preparation and dispatch.", order.getOrderId())
            ));

            auditLogRepo.save(new AuditLog(
                null,
                "PAYMENT_APPROVED",
                String.format("Administrator approved payment #%d for Order #%d. Vehicle preparation and delivery started.", payment.getPaymentId(), order.getOrderId())
            ));
        } else {
            payment.setPaymentStatus(Payment.PaymentStatus.FAILED);
            order.setOrderStatus(WinningOrder.OrderStatus.PENDING);

            deliveryRepo.findByWinningOrder_OrderId(order.getOrderId()).ifPresent(delivery -> {
                delivery.setDeliveryStatus(Delivery.DeliveryStatus.AWAITING_PAYMENT);
                delivery.addMilestone(new DeliveryMilestone(
                    delivery,
                    "Payment Rejected by Administrator",
                    "Administrator rejected payment: " + (notes != null && !notes.isBlank() ? notes : "Verification failed.") + ". Please resubmit payment.",
                    "Admin Operations Desk",
                    Delivery.DeliveryStatus.AWAITING_PAYMENT
                ));
                deliveryRepo.save(delivery);
            });

            notificationRepo.save(new Notification(
                order.getBuyer(),
                "PAYMENT_REJECTED",
                "Your payment was rejected by Administrator: " + (notes != null && !notes.isBlank() ? notes : "Verification failed.") + ". Please resubmit payment."
            ));

            auditLogRepo.save(new AuditLog(
                null,
                "PAYMENT_REJECTED",
                String.format("Administrator rejected payment #%d for Order #%d. Reason: %s", payment.getPaymentId(), order.getOrderId(), notes)
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
