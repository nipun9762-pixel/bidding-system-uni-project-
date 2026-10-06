package com.biddingsystem.pattern.strategy.bidding;

import com.biddingsystem.entity.AuctionListing;
import com.biddingsystem.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Standard implementation of BidValidationStrategy enforcing auction state, buyer role, and increment rules.
 */
@Component
public class StandardBidValidationStrategy implements BidValidationStrategy {

    @Override
    public void validateAuctionStatus(AuctionListing auction) {
        if (auction.getStatus() != AuctionListing.AuctionStatus.ACTIVE) {
            throw new IllegalStateException("Bidding rejected: Auction is not active.");
        }

        if (LocalDateTime.now().isAfter(auction.getEndDateTime())) {
            throw new IllegalStateException("Bidding rejected: Auction has expired.");
        }
    }

    @Override
    public void validateBidder(User bidder) {
        if (bidder.getRole() != User.Role.BUYER) {
            throw new IllegalArgumentException("Only a registered buyer account can place bids.");
        }

        if (bidder.getAccountStatus() != User.AccountStatus.ACTIVE) {
            throw new IllegalArgumentException("The registered buyer account must be active before bidding.");
        }
    }

    @Override
    public BigDecimal calculateMinimumRequiredBid(AuctionListing auction) {
        BigDecimal currentHighest = auction.getCurrentHighestBid();
        if (currentHighest == null || currentHighest.compareTo(BigDecimal.ZERO) == 0) {
            return auction.getStartingBid();
        }
        BigDecimal increment = auction.getBidIncrement() != null ? auction.getBidIncrement() : BigDecimal.ONE;
        return currentHighest.add(increment);
    }

    @Override
    public void validateBidAmount(BigDecimal bidAmount, BigDecimal minRequiredBid) {
        if (bidAmount.compareTo(minRequiredBid) < 0) {
            throw new IllegalArgumentException(
                String.format("Bid amount ($%.2f) is less than the required minimum bid ($%.2f).", bidAmount, minRequiredBid)
            );
        }
    }
}
