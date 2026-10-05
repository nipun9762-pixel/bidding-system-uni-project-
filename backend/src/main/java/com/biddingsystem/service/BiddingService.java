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

}
