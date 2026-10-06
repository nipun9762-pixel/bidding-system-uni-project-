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
