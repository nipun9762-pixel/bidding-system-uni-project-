package com.biddingsystem.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dispute")
public class Dispute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long disputeId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "order_id")
    private WinningOrder winningOrder;

    @ManyToOne(optional = false)
    @JoinColumn(name = "submitted_by")
    private User submittedBy;

    @Column(nullable = false, length = 100)
    private String disputeReason;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    private String evidenceReference;

    private LocalDateTime submittedDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private DisputeStatus disputeStatus = DisputeStatus.OPEN;

    @Column(columnDefinition = "TEXT")
    private String resolution;

    public enum DisputeStatus {
        OPEN, UNDER_REVIEW, AWAITING_RESPONSE, RESOLVED, CLOSED
    }

    public Dispute() {}

    public Long getDisputeId() { return disputeId; }
    public void setDisputeId(Long disputeId) { this.disputeId = disputeId; }

    public WinningOrder getWinningOrder() { return winningOrder; }
    public void setWinningOrder(WinningOrder winningOrder) { this.winningOrder = winningOrder; }

    public User getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(User submittedBy) { this.submittedBy = submittedBy; }

    public String getDisputeReason() { return disputeReason; }
    public void setDisputeReason(String disputeReason) { this.disputeReason = disputeReason; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getEvidenceReference() { return evidenceReference; }
    public void setEvidenceReference(String evidenceReference) { this.evidenceReference = evidenceReference; }

    public LocalDateTime getSubmittedDate() { return submittedDate; }
    public void setSubmittedDate(LocalDateTime submittedDate) { this.submittedDate = submittedDate; }

    public DisputeStatus getDisputeStatus() { return disputeStatus; }
    public void setDisputeStatus(DisputeStatus disputeStatus) { this.disputeStatus = disputeStatus; }

    public String getResolution() { return resolution; }
    public void setResolution(String resolution) { this.resolution = resolution; }
}
