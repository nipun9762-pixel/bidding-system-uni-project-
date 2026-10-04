package com.biddingsystem.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery")
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deliveryId;

    @OneToOne(optional = false)
    @JoinColumn(name = "order_id", unique = true)
    private WinningOrder winningOrder;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String deliveryAddress;

    private String deliveryMethod = "STANDARD_COURIER";

    private String trackingNumber;

    @Enumerated(EnumType.STRING)
    private DeliveryStatus deliveryStatus = DeliveryStatus.AWAITING_PAYMENT;

    private LocalDateTime shippedDate;
    private LocalDateTime deliveredDate;

    public enum DeliveryStatus {
        AWAITING_PAYMENT, PREPARING_FOR_SHIPMENT, SHIPPED, IN_TRANSIT, DELIVERED, COLLECTED, CANCELLED
    }

    public Delivery() {}

    public Long getDeliveryId() { return deliveryId; }
    public void setDeliveryId(Long deliveryId) { this.deliveryId = deliveryId; }

    public WinningOrder getWinningOrder() { return winningOrder; }
    public void setWinningOrder(WinningOrder winningOrder) { this.winningOrder = winningOrder; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public String getDeliveryMethod() { return deliveryMethod; }
    public void setDeliveryMethod(String deliveryMethod) { this.deliveryMethod = deliveryMethod; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public DeliveryStatus getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(DeliveryStatus deliveryStatus) { this.deliveryStatus = deliveryStatus; }

    public LocalDateTime getShippedDate() { return shippedDate; }
    public void setShippedDate(LocalDateTime shippedDate) { this.shippedDate = shippedDate; }

    public LocalDateTime getDeliveredDate() { return deliveredDate; }
    public void setDeliveredDate(LocalDateTime deliveredDate) { this.deliveredDate = deliveredDate; }
}
