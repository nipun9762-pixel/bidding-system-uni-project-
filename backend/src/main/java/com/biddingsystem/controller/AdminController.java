package com.biddingsystem.controller;

import com.biddingsystem.entity.AuditLog;
import com.biddingsystem.entity.AuctionListing;
import com.biddingsystem.repository.AuditLogRepository;
import com.biddingsystem.repository.AuctionListingRepository;
import com.biddingsystem.repository.ItemImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AuctionListingRepository auctionRepo;

    @Autowired
    private ItemImageRepository imageRepo;

    @Autowired
    private AuditLogRepository auditLogRepo;

    @GetMapping("/audit-logs")
    public List<AuditLog> getAuditLogs() {
        return auditLogRepo.findAllByOrderByActionDateTimeDesc();
    }

    @PostMapping("/moderate-listing")
    @Transactional
    public ResponseEntity<?> moderateListing(@RequestBody Map<String, Object> payload) {
        try {
            Long auctionId = Long.parseLong(payload.get("auctionId").toString());
            String action = payload.get("action").toString(); // APPROVE, REJECT, SUSPEND

            AuctionListing auction = auctionRepo.findById(auctionId)
                    .orElseThrow(() -> new IllegalArgumentException("Auction not found with ID: " + auctionId));

            if ("APPROVE".equalsIgnoreCase(action)) {
                auction.setStatus(AuctionListing.AuctionStatus.ACTIVE);
                // When approved, start the timer now so buyers get the full allotted duration
                auction.setStartDateTime(java.time.LocalDateTime.now());
                int duration = auction.getDurationHours() != null ? auction.getDurationHours() : 120;
                auction.setEndDateTime(auction.getStartDateTime().plusHours(duration));
            } else if ("REJECT".equalsIgnoreCase(action) || "SUSPEND".equalsIgnoreCase(action)) {
                auction.setStatus(AuctionListing.AuctionStatus.CANCELLED);
            }

            AuctionListing saved = auctionRepo.save(auction);
            // Ensure images are retained in response
            saved.setItemImages(imageRepo.findByAuctionListing_AuctionId(auctionId));

            auditLogRepo.save(new AuditLog(null, "ADMIN_MODERATION", "Admin executed action " + action + " on Auction #" + auctionId + " (Status: " + saved.getStatus() + ")"));

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
