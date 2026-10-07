package com.biddingsystem.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    private String carrierName = "Swift Auto Logistics";

    private String currentLocation = "Seller Logistics Depot";

    private LocalDateTime estimatedDeliveryDate;

    @Column(columnDefinition = "TEXT")
    private String deliveryNotes;

    private String recipientPhone;

    @Enumerated(EnumType.STRING)
    private DeliveryStatus deliveryStatus = DeliveryStatus.AWAITING_PAYMENT;

    private LocalDateTime shippedDate;
    private LocalDateTime deliveredDate;

    @OneToMany(mappedBy = "delivery", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("timestamp ASC")
    private List<DeliveryMilestone> milestones = new ArrayList<>();

    public enum DeliveryStatus {
        AWAITING_PAYMENT, PREPARING_FOR_SHIPMENT, SHIPPED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, COLLECTED, CANCELLED
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

    public String getCarrierName() { return carrierName; }
    public void setCarrierName(String carrierName) { this.carrierName = carrierName; }

    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }

    public LocalDateTime getEstimatedDeliveryDate() { return estimatedDeliveryDate; }
    public void setEstimatedDeliveryDate(LocalDateTime estimatedDeliveryDate) { this.estimatedDeliveryDate = estimatedDeliveryDate; }

    public String getDeliveryNotes() { return deliveryNotes; }
    public void setDeliveryNotes(String deliveryNotes) { this.deliveryNotes = deliveryNotes; }

    public String getRecipientPhone() { return recipientPhone; }
    public void setRecipientPhone(String recipientPhone) { this.recipientPhone = recipientPhone; }

    public DeliveryStatus getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(DeliveryStatus deliveryStatus) { this.deliveryStatus = deliveryStatus; }

    public LocalDateTime getShippedDate() { return shippedDate; }
    public void setShippedDate(LocalDateTime shippedDate) { this.shippedDate = shippedDate; }

    public LocalDateTime getDeliveredDate() { return deliveredDate; }
    public void setDeliveredDate(LocalDateTime deliveredDate) { this.deliveredDate = deliveredDate; }

    public List<DeliveryMilestone> getMilestones() { return milestones; }
    public void setMilestones(List<DeliveryMilestone> milestones) { this.milestones = milestones; }

    public void addMilestone(DeliveryMilestone milestone) {
        if (milestones == null) {
            milestones = new ArrayList<>();
        }
        milestones.add(milestone);
        milestone.setDelivery(this);
    }

    /**
     * State Pattern: Returns the active DeliveryState implementation corresponding to current deliveryStatus.
     */
    @Transient
    public com.biddingsystem.pattern.state.delivery.DeliveryState getCurrentState() {
        return com.biddingsystem.pattern.state.delivery.DeliveryStateFactory.getState(this.deliveryStatus);
    }

    /**
     * State Pattern: Transitions delivery to a new state after validating the lifecycle transition rules.
     */
    public void transitionTo(DeliveryStatus newStatus) {
        if (this.deliveryStatus == newStatus) {
            return;
        }
        com.biddingsystem.pattern.state.delivery.DeliveryState current = getCurrentState();
        if (!current.canTransitionTo(newStatus)) {
            throw new IllegalStateException(
                String.format("Invalid delivery status transition from %s to %s.", this.deliveryStatus, newStatus)
            );
        }
        this.deliveryStatus = newStatus;
        com.biddingsystem.pattern.state.delivery.DeliveryState nextState = com.biddingsystem.pattern.state.delivery.DeliveryStateFactory.getState(newStatus);
        nextState.applyStateSideEffects(this);
    }
}
