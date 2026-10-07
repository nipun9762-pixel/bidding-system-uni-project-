package com.biddingsystem.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "watchlist", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"buyer_id", "auction_id"})
})
public class Watchlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long watchlistId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "buyer_id")
    private User buyer;

    @ManyToOne(optional = false)
    @JoinColumn(name = "auction_id")
    private AuctionListing auctionListing;

    private LocalDateTime addedDate = LocalDateTime.now();

    public Watchlist() {}

    public Watchlist(User buyer, AuctionListing auctionListing) {
        this.buyer = buyer;
        this.auctionListing = auctionListing;
    }

    public Long getWatchlistId() { return watchlistId; }
    public void setWatchlistId(Long watchlistId) { this.watchlistId = watchlistId; }

    public User getBuyer() { return buyer; }
    public void setBuyer(User buyer) { this.buyer = buyer; }

    public AuctionListing getAuctionListing() { return auctionListing; }
    public void setAuctionListing(AuctionListing auctionListing) { this.auctionListing = auctionListing; }

    public LocalDateTime getAddedDate() { return addedDate; }
    public void setAddedDate(LocalDateTime addedDate) { this.addedDate = addedDate; }
}
