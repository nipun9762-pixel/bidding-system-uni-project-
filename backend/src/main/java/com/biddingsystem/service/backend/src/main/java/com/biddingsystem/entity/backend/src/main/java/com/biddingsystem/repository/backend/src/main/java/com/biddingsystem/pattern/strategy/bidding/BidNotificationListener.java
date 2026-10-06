package com.biddingsystem.pattern.observer.bidding;

import com.biddingsystem.entity.AuctionListing;
import com.biddingsystem.entity.Bid;
import com.biddingsystem.entity.Notification;
import com.biddingsystem.entity.User;
import com.biddingsystem.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Observer / Event Listener that delivers real-time notifications when a bid is placed.
 */
@Component
public class BidNotificationListener {

    @Autowired
    private NotificationRepository notificationRepo;

    @EventListener
    public void handleBidPlaced(BidPlacedEvent event) {
        Bid newBid = event.getNewBid();
        AuctionListing auction = event.getAuction();
        User bidder = newBid.getBidder();

        // 1. Notify previous highest bidder if they were outbid
        event.getPreviousHighestBid().ifPresent(prevBid -> {
            // Avoid notifying self if re-bidding
            if (!prevBid.getBidder().getUserId().equals(bidder.getUserId())) {
                notificationRepo.save(new Notification(
                    prevBid.getBidder(),
                    "OUTBID_ALERT",
                    String.format("You have been outbid on '%s'. Current highest bid is now $%.2f.",
                        auction.getItemName(), newBid.getBidAmount())
                ));
            }
        });

        // 2. Notify seller of the new bid received
        if (auction.getSeller() != null) {
            notificationRepo.save(new Notification(
                auction.getSeller(),
                "NEW_BID_RECEIVED",
                String.format("A new bid of $%.2f was placed on your listing '%s' by %s %s.",
                    newBid.getBidAmount(), auction.getItemName(), bidder.getFirstName(), bidder.getLastName())
            ));
        }
    }
}
