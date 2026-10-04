package com.biddingsystem.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "winning_order")
public class WinningOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @OneToOne(optional = false)
    @JoinColumn(name = "auction_id", unique = true)
    private AuctionListing auctionListing;

    @ManyToOne(optional = false)
    @JoinColumn(name = "buyer_id")
    private User buyer;

    @ManyToOne(optional = false)
    @JoinColumn(name = "seller_id")
    private User seller;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal winningAmount;

    private LocalDateTime orderDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private OrderStatus orderStatus = OrderStatus.PENDING;

    public enum OrderStatus {
        PENDING, PROCESSING, PAID, SHIPPED, DELIVERED, COMPLETED, CANCELLED
    }

    public WinningOrder() {}

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public AuctionListing getAuctionListing() { return auctionListing; }
    public void setAuctionListing(AuctionListing auctionListing) { this.auctionListing = auctionListing; }

    public User getBuyer() { return buyer; }
    public void setBuyer(User buyer) { this.buyer = buyer; }

    public User getSeller() { return seller; }
    public void setSeller(User seller) { this.seller = seller; }

    public BigDecimal getWinningAmount() { return winningAmount; }
    public void setWinningAmount(BigDecimal winningAmount) { this.winningAmount = winningAmount; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public OrderStatus getOrderStatus() { return orderStatus; }
    public void setOrderStatus(OrderStatus orderStatus) { this.orderStatus = orderStatus; }
}
