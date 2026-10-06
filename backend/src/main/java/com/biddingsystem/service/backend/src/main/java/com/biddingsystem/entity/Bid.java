package com.biddingsystem.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bid")
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bidId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "auction_id")
    private AuctionListing auctionListing;

    @ManyToOne(optional = false)
    @JoinColumn(name = "bidder_id")
    private User bidder;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal bidAmount;

    private LocalDateTime bidTime = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private BidStatus bidStatus = BidStatus.ACCEPTED;

    public enum BidStatus {
        ACCEPTED, REJECTED, OUTBID, WINNING
    }

    public Bid() {}

    public Bid(AuctionListing auctionListing, User bidder, BigDecimal bidAmount, BidStatus bidStatus) {
        this.auctionListing = auctionListing;
        this.bidder = bidder;
        this.bidAmount = bidAmount;
        this.bidStatus = bidStatus;
    }

    public Long getBidId() { return bidId; }
    public void setBidId(Long bidId) { this.bidId = bidId; }

    public AuctionListing getAuctionListing() { return auctionListing; }
    public void setAuctionListing(AuctionListing auctionListing) { this.auctionListing = auctionListing; }

    public User getBidder() { return bidder; }
    public void setBidder(User bidder) { this.bidder = bidder; }

    public BigDecimal getBidAmount() { return bidAmount; }
    public void setBidAmount(BigDecimal bidAmount) { this.bidAmount = bidAmount; }

    public LocalDateTime getBidTime() { return bidTime; }
    public void setBidTime(LocalDateTime bidTime) { this.bidTime = bidTime; }

    public BidStatus getBidStatus() { return bidStatus; }
    public void setBidStatus(BidStatus bidStatus) { this.bidStatus = bidStatus; }
}
