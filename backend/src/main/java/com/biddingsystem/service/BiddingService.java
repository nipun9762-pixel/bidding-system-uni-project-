package com.biddingsystem.service;

import com.biddingsystem.entity.*;
import com.biddingsystem.pattern.observer.bidding.BidPlacedEvent;
import com.biddingsystem.pattern.strategy.bidding.BidValidationStrategy;
import com.biddingsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class BiddingService {

    @Autowired
    private AuctionListingRepository auctionRepo;

    @Autowired
    private BidRepository bidRepo;

    @Autowired
    private UserRepository userRepo;

    // Strategy Pattern: Injected validation & increment calculation strategy
    @Autowired(required = false)
    private BidValidationStrategy bidValidationStrategy = new com.biddingsystem.pattern.strategy.bidding.StandardBidValidationStrategy();

    // Observer Pattern: Spring ApplicationEventPublisher to broadcast domain events
    @Autowired(required = false)
    private ApplicationEventPublisher eventPublisher;
    @Transactional
    public Bid placeBid(Long auctionId, Long bidderId, BigDecimal bidAmount) {
        AuctionListing auction = auctionRepo.findById(auctionId)
                .orElseThrow(() -> new IllegalArgumentException("Auction listing not found: " + auctionId));

        User bidder = userRepo.findById(bidderId)
                .orElseThrow(() -> new IllegalArgumentException("Bidder user not found: " + bidderId));

        if (bidValidationStrategy == null) {
            bidValidationStrategy = new com.biddingsystem.pattern.strategy.bidding.StandardBidValidationStrategy();
        }

        // 1. Strategy Pattern: Delegate domain rule validation and min increment calculation
        bidValidationStrategy.validateAuctionStatus(auction);
        bidValidationStrategy.validateBidder(bidder);
        BigDecimal minRequiredBid = bidValidationStrategy.calculateMinimumRequiredBid(auction);
        bidValidationStrategy.validateBidAmount(bidAmount, minRequiredBid);
        // 2. Mark previous highest bid as OUTBID
        List<Bid> existingBids = bidRepo.findByAuctionListing_AuctionIdOrderByBidAmountDesc(auctionId);
        Optional<Bid> prevHighestOpt = Optional.empty();
        if (!existingBids.isEmpty()) {
            Bid prevHighest = existingBids.get(0);
            prevHighest.setBidStatus(Bid.BidStatus.OUTBID);
            bidRepo.save(prevHighest);
            prevHighestOpt = Optional.of(prevHighest);
        }

        // 3. Save New Bid & Update Auction Current Highest Bid
        Bid newBid = new Bid(auction, bidder, bidAmount, Bid.BidStatus.ACCEPTED);
        Bid savedBid = bidRepo.save(newBid);

        auction.setCurrentHighestBid(bidAmount);
        auctionRepo.save(auction);

        // 4. Observer Pattern: Decouple notifications and audit logging by publishing domain event
        if (eventPublisher != null) {
            eventPublisher.publishEvent(new BidPlacedEvent(this, savedBid, prevHighestOpt, auction));
        }

        return savedBid;
    }
}
