package com.biddingsystem.controller;

import com.biddingsystem.entity.Delivery;
import com.biddingsystem.entity.Payment;
import com.biddingsystem.entity.WinningOrder;
import com.biddingsystem.repository.DeliveryRepository;
import com.biddingsystem.repository.PaymentRepository;
import com.biddingsystem.repository.WinningOrderRepository;
import com.biddingsystem.service.OrderPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class OrderPaymentController {

    @Autowired
    private WinningOrderRepository orderRepo;

    @Autowired
    private PaymentRepository paymentRepo;

    @Autowired
    private DeliveryRepository deliveryRepo;

    @Autowired
    private OrderPaymentService orderPaymentService;

    @GetMapping("/orders")
    public List<WinningOrder> getOrders(@RequestParam(required = false) Long buyerId,
            @RequestParam(required = false) Long sellerId) {
        if (buyerId != null)
            return orderRepo.findByBuyer_UserId(buyerId);
        if (sellerId != null)
            return orderRepo.findBySeller_UserId(sellerId);
        return orderRepo.findAll();
    }

    @PostMapping("/payments/pay")
    public ResponseEntity<?> initiatePayment(@RequestBody Map<String, Object> payload) {
        try {
            Long orderId = Long.parseLong(payload.get("orderId").toString());
            String method = payload.get("paymentMethod") != null ? payload.get("paymentMethod").toString()
                    : "CREDIT_CARD";
            String txRef = payload.get("transactionReference") != null ? payload.get("transactionReference").toString()
                    : "TXN-" + System.currentTimeMillis();

            Payment payment = orderPaymentService.processPayment(orderId, method, txRef);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/payments/acknowledge")
    public ResponseEntity<?> acknowledgePayment(@RequestBody Map<String, Object> payload) {
        try {
            Long paymentId = Long.parseLong(payload.get("paymentId").toString());
            boolean approved = Boolean.parseBoolean(payload.get("isApproved").toString());
            String notes = payload.get("notes") != null ? payload.get("notes").toString() : "";

            Payment payment = orderPaymentService.acknowledgePaymentByProcessor(paymentId, approved, notes);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/deliveries")
    public List<Delivery> getAllDeliveries(@RequestParam(required = false) Long buyerId,
            @RequestParam(required = false) Long sellerId) {
        if (buyerId != null) {
            return deliveryRepo.findByWinningOrder_Buyer_UserId(buyerId);
        }
        if (sellerId != null) {
            return deliveryRepo.findByWinningOrder_Seller_UserId(sellerId);
        }
        return deliveryRepo.findAll();
    }

    @GetMapping("/deliveries/order/{orderId}")
    public ResponseEntity<Delivery> getDeliveryByOrder(@PathVariable Long orderId) {
        return deliveryRepo.findByWinningOrder_OrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/deliveries/track/{trackingNumber}")
    public ResponseEntity<Delivery> getDeliveryByTrackingNumber(@PathVariable String trackingNumber) {
        return deliveryRepo.findByTrackingNumber(trackingNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/deliveries/update")
    public ResponseEntity<?> updateDelivery(@RequestBody Map<String, Object> payload) {
        try {
            Long orderId = Long.parseLong(payload.get("orderId").toString());
            Delivery.DeliveryStatus status = Delivery.DeliveryStatus.valueOf(payload.get("status").toString());
            String trackingNumber = payload.get("trackingNumber") != null ? payload.get("trackingNumber").toString()
                    : null;
            String address = payload.get("address") != null ? payload.get("address").toString() : null;
            String carrierName = payload.get("carrierName") != null ? payload.get("carrierName").toString() : null;
            String currentLocation = payload.get("currentLocation") != null ? payload.get("currentLocation").toString()
                    : null;
            String notes = payload.get("notes") != null ? payload.get("notes").toString() : null;
            String recipientPhone = payload.get("recipientPhone") != null ? payload.get("recipientPhone").toString()
                    : null;

            Delivery delivery = orderPaymentService.updateDeliveryStatus(
                    orderId, status, trackingNumber, address, carrierName, currentLocation, notes, recipientPhone);
            return ResponseEntity.ok(delivery);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/deliveries/update-address")
    public ResponseEntity<?> updateBuyerAddress(@RequestBody Map<String, Object> payload) {
        try {
            Long orderId = Long.parseLong(payload.get("orderId").toString());
            String address = payload.get("address").toString();
            String recipientPhone = payload.get("recipientPhone") != null ? payload.get("recipientPhone").toString()
                    : null;

            Delivery delivery = orderPaymentService.updateBuyerAddress(orderId, address, recipientPhone);
            return ResponseEntity.ok(delivery);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/deliveries/milestone")
    public ResponseEntity<?> addMilestone(@RequestBody Map<String, Object> payload) {
        try {
            Long deliveryId = Long.parseLong(payload.get("deliveryId").toString());
            String title = payload.get("title").toString();
            String description = payload.get("description") != null ? payload.get("description").toString() : "";
            String location = payload.get("location") != null ? payload.get("location").toString() : "";
            Delivery.DeliveryStatus status = payload.get("status") != null
                    ? Delivery.DeliveryStatus.valueOf(payload.get("status").toString())
                    : null;

            Delivery delivery = orderPaymentService.addTrackingMilestone(deliveryId, title, description, location,
                    status);
            return ResponseEntity.ok(delivery);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
