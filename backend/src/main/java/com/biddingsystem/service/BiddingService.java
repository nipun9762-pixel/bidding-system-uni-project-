package com.biddingsystem.service;

import com.biddingsystem.entity.*;
import com.biddingsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BiddingService {

    @Autowired
    private AuctionListingRepository auctionRepo;

    @Autowired
    private BidRepository bidRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private NotificationRepository notificationRepo;

    @Autowired
    private AuditLogRepository auditLogRepo;

    @Transactional
    public Bid placeBid(Long auctionId, Long bidderId, BigDecimal bidAmount) {
        // 0. Validate Positive Bid Amount
        if (bidAmount == null || bidAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Validation Error: Bid amount must be a positive value greater than zero. Negative or zero bids are strictly not allowed.");
        }

        AuctionListing auction = auctionRepo.findById(auctionId)
                .orElseThrow(() -> new IllegalArgumentException("Auction listing not found: " + auctionId));

        User bidder = userRepo.findById(bidderId)
                .orElseThrow(() -> new IllegalArgumentException("Bidder user not found: " + bidderId));

        // 1. Validate Auction Status & Expiry
        if (auction.getStatus() != AuctionListing.AuctionStatus.ACTIVE) {
            throw new IllegalStateException("Bidding rejected: Auction is not active.");
        }

        if (LocalDateTime.now().isAfter(auction.getEndDateTime())) {
            throw new IllegalStateException("Bidding rejected: Auction has expired.");
        }

        // 2. Validate Bidder Role & Account Status
        if (bidder.getRole() != User.Role.BUYER) {
            throw new IllegalArgumentException("Only a registered buyer account can place bids.");
        }

        if (bidder.getAccountStatus() != User.AccountStatus.ACTIVE) {
            throw new IllegalArgumentException("The registered buyer account must be active before bidding.");
        }

        // 3. Validate Minimum Bid Increment Rule
        BigDecimal minRequiredBid = calculateMinimumRequiredBid(auction);
        if (bidAmount.compareTo(minRequiredBid) < 0) {
            throw new IllegalArgumentException(
                String.format("Bid amount ($%.2f) is less than the required minimum bid ($%.2f).", bidAmount, minRequiredBid)
            );
        }

        // 4. Mark previous highest bid as OUTBID & notify bidder
        List<Bid> existingBids = bidRepo.findByAuctionListing_AuctionIdOrderByBidAmountDesc(auctionId);
        if (!existingBids.isEmpty()) {
            Bid prevHighest = existingBids.get(0);
            prevHighest.setBidStatus(Bid.BidStatus.OUTBID);
            bidRepo.save(prevHighest);

            if (notificationRepo != null && !prevHighest.getBidder().getUserId().equals(bidder.getUserId())) {
                notificationRepo.save(new Notification(
                    prevHighest.getBidder(),
                    "OUTBID_ALERT",
                    String.format("You have been outbid on '%s'. Current highest bid is now $%.2f.",
                        auction.getItemName(), bidAmount)
                ));
            }
        }

        // 5. Save New Bid & Update Auction Current Highest Bid
        Bid newBid = new Bid(auction, bidder, bidAmount, Bid.BidStatus.ACCEPTED);
        Bid savedBid = bidRepo.save(newBid);

        auction.setCurrentHighestBid(bidAmount);
        auctionRepo.save(auction);

        // 6. Notify seller of the new bid received
        if (notificationRepo != null && auction.getSeller() != null) {
            notificationRepo.save(new Notification(
                auction.getSeller(),
                "NEW_BID_RECEIVED",
                String.format("A new bid of $%.2f was placed on your listing '%s' by %s %s.",
                    bidAmount, auction.getItemName(), bidder.getFirstName(), bidder.getLastName())
            ));
        }

        // 7. Record audit log entry
        if (auditLogRepo != null) {
            auditLogRepo.save(new AuditLog(
                bidder,
                "BID_PLACED",
                String.format("Bid of $%.2f placed on Auction #%d ('%s') by User #%d (%s %s)",
                    bidAmount, auction.getAuctionId(), auction.getItemName(),
                    bidder.getUserId(), bidder.getFirstName(), bidder.getLastName())
            ));
        }

        return savedBid;
    }

    private BigDecimal calculateMinimumRequiredBid(AuctionListing auction) {
        BigDecimal currentHighest = auction.getCurrentHighestBid();
        if (currentHighest == null || currentHighest.compareTo(BigDecimal.ZERO) == 0) {
            return auction.getStartingBid();
        }
        BigDecimal increment = auction.getBidIncrement() != null ? auction.getBidIncrement() : BigDecimal.ONE;
        return currentHighest.add(increment);
    }
}
