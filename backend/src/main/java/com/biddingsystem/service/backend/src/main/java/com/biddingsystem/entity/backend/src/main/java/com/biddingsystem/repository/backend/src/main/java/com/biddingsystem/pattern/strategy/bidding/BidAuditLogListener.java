package com.biddingsystem.pattern.observer.bidding;

import com.biddingsystem.entity.AuctionListing;
import com.biddingsystem.entity.AuditLog;
import com.biddingsystem.entity.Bid;
import com.biddingsystem.entity.User;
import com.biddingsystem.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Observer / Event Listener that appends an audit trail entry when a bid is placed.
 */
@Component
public class BidAuditLogListener {

    @Autowired
    private AuditLogRepository auditLogRepo;

    @EventListener
    public void recordAuditTrail(BidPlacedEvent event) {
        Bid newBid = event.getNewBid();
        AuctionListing auction = event.getAuction();
        User bidder = newBid.getBidder();

        auditLogRepo.save(new AuditLog(
            bidder,
            "BID_PLACED",
            String.format("Bid of $%.2f placed on Auction #%d ('%s') by User #%d (%s %s)",
                newBid.getBidAmount(), auction.getAuctionId(), auction.getItemName(),
                bidder.getUserId(), bidder.getFirstName(), bidder.getLastName())
        ));
    }
}
