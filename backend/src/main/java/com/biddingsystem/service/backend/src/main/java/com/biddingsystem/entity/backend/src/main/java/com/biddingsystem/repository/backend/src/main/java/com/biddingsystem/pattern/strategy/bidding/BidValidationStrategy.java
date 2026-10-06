package com.biddingsystem.pattern.strategy.bidding;

import com.biddingsystem.entity.AuctionListing;
import com.biddingsystem.entity.User;

import java.math.BigDecimal;

/**
 * Strategy Pattern Interface for Bidding Validation and Minimum Increment Calculation.
 */
public interface BidValidationStrategy {

    void validateAuctionStatus(AuctionListing auction);

    void validateBidder(User bidder);

    BigDecimal calculateMinimumRequiredBid(AuctionListing auction);

    void validateBidAmount(BigDecimal bidAmount, BigDecimal minRequiredBid);
}
