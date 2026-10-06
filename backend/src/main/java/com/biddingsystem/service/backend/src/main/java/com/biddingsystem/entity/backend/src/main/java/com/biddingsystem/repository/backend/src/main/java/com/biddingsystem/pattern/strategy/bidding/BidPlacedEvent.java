package com.biddingsystem.pattern.observer.bidding;

import com.biddingsystem.entity.AuctionListing;
import com.biddingsystem.entity.Bid;
import org.springframework.context.ApplicationEvent;

import java.util.Optional;

/**
 * Domain Event published when a valid bid is successfully placed.
 * Observers/listeners handle asynchronous side effects like notifications and auditing.
 */
public class BidPlacedEvent extends ApplicationEvent {

    private final Bid newBid;
    private final Optional<Bid> previousHighestBid;
    private final AuctionListing auction;

    public BidPlacedEvent(Object source, Bid newBid, Optional<Bid> previousHighestBid, AuctionListing auction) {
        super(source);
        this.newBid = newBid;
        this.previousHighestBid = previousHighestBid;
        this.auction = auction;
    }

    public Bid getNewBid() {
        return newBid;
    }

    public Optional<Bid> getPreviousHighestBid() {
        return previousHighestBid;
    }

    public AuctionListing getAuction() {
        return auction;
    }
}
