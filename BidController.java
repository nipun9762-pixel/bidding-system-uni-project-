package com.biddingsystem.controller;

import com.biddingsystem.entity.Bid;
import com.biddingsystem.repository.BidRepository;
import com.biddingsystem.service.BiddingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bids")
@CrossOrigin(origins = "*")
public class BidController {

    @Autowired
    private BiddingService biddingService;

    @Autowired
    private BidRepository bidRepo;

    @PostMapping("/place")
    public ResponseEntity<?> placeBid(@RequestBody Map<String, Object> payload) {
        try {
            Long auctionId = Long.parseLong(payload.get("auctionId").toString());
            Long bidderId = Long.parseLong(payload.get("bidderId").toString());
            BigDecimal bidAmount = new BigDecimal(payload.get("bidAmount").toString());

            Bid placedBid = biddingService.placeBid(auctionId, bidderId, bidAmount);
            return ResponseEntity.ok(placedBid);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping("/auction/{auctionId}")
    public List<Bid> getBidsForAuction(@PathVariable Long auctionId) {
        return bidRepo.findByAuctionListing_AuctionIdOrderByBidAmountDesc(auctionId);
    }
}
