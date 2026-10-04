[AuthController.java](https://github.com/user-attachments/files/33029412/AuthController.java)
[WatchlistController.java](https://github.com/user-attachments/files/33029414/WatchlistController.java)package com.biddingsystem.controller;

import com.biddingsystem.entity.AuctionListing;
import com.biddingsystem.entity.User;
import com.biddingsystem.entity.Watchlist;
import com.biddingsystem.repository.AuctionListingRepository;
import com.biddingsystem.repository.UserRepository;
import com.biddingsystem.repository.WatchlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/watchlist")
@CrossOrigin(origins = "*")
public class WatchlistController {

    @Autowired
    private WatchlistRepository watchlistRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private AuctionListingRepository auctionRepo;

    @GetMapping("/buyer/{buyerId}")
    public List<Watchlist> getWatchlistForBuyer(@PathVariable Long buyerId) {
        return watchlistRepo.findByBuyer_UserId(buyerId);
    }

    @PostMapping("/toggle")
    @Transactional
    public ResponseEntity<?> toggleWatchlist(@RequestBody Map<String, Object> payload) {
        try {
            Long buyerId = Long.parseLong(payload.get("buyerId").toString());
            Long auctionId = Long.parseLong(payload.get("auctionId").toString());

            Optional<Watchlist> existing = watchlistRepo.findByBuyer_UserIdAndAuctionListing_AuctionId(buyerId, auctionId);
            if (existing.isPresent()) {
                watchlistRepo.deleteByBuyer_UserIdAndAuctionListing_AuctionId(buyerId, auctionId);
                return ResponseEntity.ok(Map.of("status", "REMOVED", "message", "Auction removed from watchlist."));
            } else {
                User buyer = userRepo.findById(buyerId).orElseThrow(() -> new IllegalArgumentException("Buyer not found"));
                AuctionListing auction = auctionRepo.findById(auctionId).orElseThrow(() -> new IllegalArgumentException("Auction not found"));
                Watchlist w = new Watchlist(buyer, auction);
                Watchlist saved = watchlistRepo.save(w);
                return ResponseEntity.ok(Map.of("status", "ADDED", "watchlist", saved));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
