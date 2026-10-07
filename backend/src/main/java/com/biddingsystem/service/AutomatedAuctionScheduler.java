package com.biddingsystem.service;

import com.biddingsystem.entity.*;
import com.biddingsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AutomatedAuctionScheduler {

    @Autowired
    private AuctionListingRepository auctionRepo;

    @Autowired
    private BidRepository bidRepo;

    @Autowired
    private WinningOrderRepository orderRepo;

    @Autowired
    private DeliveryRepository deliveryRepo;

    @Autowired
    private NotificationRepository notificationRepo;

    @Autowired
    private AuditLogRepository auditLogRepo;

    // Run automatically every 30 seconds
    @Scheduled(fixedRate = 30000)
    @Transactional
    public void processExpiredAuctions() {
        List<AuctionListing> expiredAuctions = auctionRepo.findExpiredActiveAuctions(LocalDateTime.now());
        for (AuctionListing auction : expiredAuctions) {
            closeAuctionAndProcessWinner(auction);
        }
    }

    @Transactional
    public void closeAuctionAndProcessWinner(AuctionListing auction) {
        auction.setStatus(AuctionListing.AuctionStatus.CLOSED);
        auctionRepo.save(auction);

        Optional<WinningOrder> existingOrder = orderRepo.findByAuctionListing_AuctionId(auction.getAuctionId());
        if (existingOrder.isPresent()) {
            return;
        }

        Optional<Bid> winningBidOpt = bidRepo.findFirstByAuctionListing_AuctionIdOrderByBidAmountDesc(auction.getAuctionId());

        if (winningBidOpt.isPresent()) {
            Bid winningBid = winningBidOpt.get();
            winningBid.setBidStatus(Bid.BidStatus.WINNING);
            bidRepo.save(winningBid);

            User winner = winningBid.getBidder();

            // Create Winning Order (FR5.4)
            WinningOrder order = new WinningOrder();
            order.setAuctionListing(auction);
            order.setBuyer(winner);
            order.setSeller(auction.getSeller());
            order.setWinningAmount(winningBid.getBidAmount());
            order.setOrderStatus(WinningOrder.OrderStatus.PENDING);
            WinningOrder savedOrder = orderRepo.save(order);

            // Create Delivery Record (FR6.5)
            Delivery delivery = new Delivery();
            delivery.setWinningOrder(savedOrder);
            delivery.setDeliveryAddress("Pending Buyer Address Confirmation");
            delivery.setDeliveryStatus(Delivery.DeliveryStatus.AWAITING_PAYMENT);
            delivery.setTrackingNumber("TRK-" + (10000 + (long)(Math.random() * 89999)));
            delivery.setCarrierName("Swift Auto Logistics");
            delivery.setCurrentLocation("Seller Depot / Inspection Center");
            delivery.setEstimatedDeliveryDate(LocalDateTime.now().plusDays(5));
            delivery.addMilestone(new DeliveryMilestone(
                delivery,
                "Bid Won & Order Created",
                String.format("Buyer won bid for '%s' at $%.2f. Awaiting buyer payment settlement.", auction.getItemName(), winningBid.getBidAmount()),
                "Seller Dispatch Hub",
                Delivery.DeliveryStatus.AWAITING_PAYMENT
            ));
            deliveryRepo.save(delivery);

            // Notify Winner (FR5.3)
            notificationRepo.save(new Notification(
                winner,
                "AUCTION_WON",
                String.format("Congratulations! You won the auction for '%s' with a final bid of $%.2f. Please proceed to payment settlement.", auction.getItemName(), winningBid.getBidAmount())
            ));

            // Notify Seller (FR5.3)
            notificationRepo.save(new Notification(
                auction.getSeller(),
                "AUCTION_CLOSED_WITH_WINNER",
                String.format("Auction for '%s' has closed! Winner: %s %s at $%.2f.", auction.getItemName(), winner.getFirstName(), winner.getLastName(), winningBid.getBidAmount())
            ));

            // Audit Log (FR8.3)
            auditLogRepo.save(new AuditLog(
                null,
                "AUTOMATED_AUCTION_CLOSURE",
                String.format("Automated system finalized Auction #%d (%s). Winner: User #%d at $%.2f.", auction.getAuctionId(), auction.getItemName(), winner.getUserId(), winningBid.getBidAmount())
            ));
        } else {
            // No bids placed
            auditLogRepo.save(new AuditLog(
                null,
                "AUTOMATED_AUCTION_CLOSURE",
                String.format("Automated system closed Auction #%d (%s) with no valid bids.", auction.getAuctionId(), auction.getItemName())
            ));
        }
    }
}
