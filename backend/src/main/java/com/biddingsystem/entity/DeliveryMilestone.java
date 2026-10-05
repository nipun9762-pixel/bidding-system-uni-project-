package com.biddingsystem.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_milestone")
public class DeliveryMilestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long milestoneId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "delivery_id")
    @JsonIgnore
    private Delivery delivery;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String location;

    @Enumerated(EnumType.STRING)
    private Delivery.DeliveryStatus status;

    private LocalDateTime timestamp = LocalDateTime.now();

    public DeliveryMilestone() {}

    public DeliveryMilestone(Delivery delivery, String title, String description, String location, Delivery.DeliveryStatus status) {
        this.delivery = delivery;
        this.title = title;
        this.description = description;
        this.location = location;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    public Long getMilestoneId() { return milestoneId; }
    public void setMilestoneId(Long milestoneId) { this.milestoneId = milestoneId; }

    public Delivery getDelivery() { return delivery; }
    public void setDelivery(Delivery delivery) { this.delivery = delivery; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Delivery.DeliveryStatus getStatus() { return status; }
    public void setStatus(Delivery.DeliveryStatus status) { this.status = status; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
