package com.biddingsystem.controller;

import com.biddingsystem.entity.AuditLog;
import com.biddingsystem.entity.AuctionListing;
import com.biddingsystem.entity.Category;
import com.biddingsystem.entity.ItemImage;
import com.biddingsystem.entity.User;
import com.biddingsystem.repository.AuctionListingRepository;
import com.biddingsystem.repository.AuditLogRepository;
import com.biddingsystem.repository.BidRepository;
import com.biddingsystem.repository.CategoryRepository;
import com.biddingsystem.repository.ItemImageRepository;
import com.biddingsystem.repository.UserRepository;
import com.biddingsystem.repository.WatchlistRepository;
import com.biddingsystem.service.AutomatedAuctionScheduler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auctions")
@CrossOrigin(origins = "*")
public class AuctionController {

    @Autowired
    private AuctionListingRepository auctionRepo;

    @Autowired
    private CategoryRepository categoryRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ItemImageRepository imageRepo;

    @Autowired
    private WatchlistRepository watchlistRepo;

    @Autowired
    private BidRepository bidRepo;

    @Autowired
    private AuditLogRepository auditLogRepo;

    @Autowired
    private AutomatedAuctionScheduler scheduler;

    @GetMapping
    public List<AuctionListing> getAllAuctions(
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String vehicleType,
            @RequestParam(required = false) String transmission,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long sellerId,
            @RequestParam(required = false) String requesterRole) {

        List<AuctionListing> all = auctionRepo.findAll();
        return all.stream().filter(a -> {
            // Buyer Dashboard: Closed/Sold auctions should NEVER be returned to buyers
            if ("BUYER".equalsIgnoreCase(requesterRole) && (a.getStatus() == AuctionListing.AuctionStatus.CLOSED || a.getStatus() == AuctionListing.AuctionStatus.COMPLETED)) {
                return false;
            }
            if (status != null && !status.isEmpty() && !a.getStatus().name().equalsIgnoreCase(status))
                return false;
            if (sellerId != null && (a.getSeller() == null || !a.getSeller().getUserId().equals(sellerId)))
                return false;
            if (brand != null && !brand.isEmpty() && !a.getBrand().equalsIgnoreCase(brand))
                return false;
            if (vehicleType != null && !vehicleType.isEmpty() && !a.getVehicleType().equalsIgnoreCase(vehicleType))
                return false;
            if (transmission != null && !transmission.isEmpty() && !a.getTransmission().equalsIgnoreCase(transmission))
                return false;
            return true;
        }).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuctionListing> getAuctionById(@PathVariable Long id) {
        return auctionRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/evaluate-winner")
    public ResponseEntity<?> evaluateWinner(@PathVariable Long id) {
        try {
            AuctionListing auction = auctionRepo.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Auction not found"));
            scheduler.closeAuctionAndProcessWinner(auction);
            return ResponseEntity
                    .ok(Map.of("message", "Auction #" + id + " evaluated and closed with highest bidder winner."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createAuction(@RequestBody Map<String, Object> payload) {
        try {
            Long sellerId = payload.get("sellerId") != null
                    ? Long.parseLong(payload.get("sellerId").toString())
                    : (payload.get("userId") != null ? Long.parseLong(payload.get("userId").toString()) : null);

            if (sellerId == null) {
                throw new IllegalArgumentException("Creator/Seller user ID is required.");
            }

            Long categoryId = payload.get("categoryId") != null ? Long.parseLong(payload.get("categoryId").toString())
                    : null;
            String itemName = payload.get("itemName") != null ? payload.get("itemName").toString() : "Vehicle Listing";
            String brand = payload.get("brand") != null ? payload.get("brand").toString() : "Generic";
            String model = payload.get("model") != null ? payload.get("model").toString() : "Model";
            String vehicleType = payload.get("vehicleType") != null ? payload.get("vehicleType").toString() : "Sedan";
            String transmission = payload.get("transmission") != null ? payload.get("transmission").toString()
                    : "Automatic";
            BigDecimal startingBid = new BigDecimal(payload.get("startingBid").toString());
            BigDecimal bidIncrement = payload.get("bidIncrement") != null
                    ? new BigDecimal(payload.get("bidIncrement").toString())
                    : new BigDecimal("1000");
            BigDecimal estMarketValue = payload.get("estMarketValue") != null
                    ? new BigDecimal(payload.get("estMarketValue").toString())
                    : startingBid;
            String description = payload.get("description") != null ? payload.get("description").toString() : "";
            String imagePath = payload.get("imagePath") != null ? payload.get("imagePath").toString()
                    : "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e";

            User seller = userRepo.findById(sellerId)
                    .orElseThrow(() -> new IllegalArgumentException("User account not found"));
            if (seller.getRole() != User.Role.SELLER && seller.getRole() != User.Role.ADMINISTRATOR) {
                throw new IllegalArgumentException("Only registered sellers can create vehicle auction listings.");
            }
            if (seller.getAccountStatus() != User.AccountStatus.ACTIVE) {
                throw new IllegalArgumentException("Your account must be active before creating a listing.");
            }

            Category category = null;
            if (categoryId != null) {
                category = categoryRepo.findById(categoryId).orElse(null);
            }
            if (category == null) {
                category = categoryRepo.findAll().stream().findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            }

            // Calculate duration and time limit (Feature 01)
            int durationHours = 120; // default 5 days
            if (payload.get("durationHours") != null && !payload.get("durationHours").toString().isEmpty()) {
                durationHours = Integer.parseInt(payload.get("durationHours").toString());
            }

            LocalDateTime start = LocalDateTime.now();
            LocalDateTime end = start.plusHours(durationHours);

            if (payload.get("endDateTime") != null && !payload.get("endDateTime").toString().isEmpty()) {
                try {
                    end = LocalDateTime.parse(payload.get("endDateTime").toString());
                } catch (Exception ignored) {
                }
            }

            AuctionListing auction = new AuctionListing();
            auction.setSeller(seller);
            auction.setCategory(category);
            auction.setItemName(itemName);
            auction.setBrand(brand);
            auction.setModel(model);
            auction.setVehicleType(vehicleType);
            auction.setTransmission(transmission);
            auction.setStartingBid(startingBid);
            auction.setCurrentHighestBid(startingBid);
            auction.setBidIncrement(bidIncrement);
            auction.setEstMarketValue(estMarketValue);
            auction.setDescription(description);
            auction.setDurationHours(durationHours);
            auction.setStartDateTime(start);
            auction.setEndDateTime(end);

            // Per Requirement 02: Seller submitted auction is PENDING_APPROVAL until Admin
            // accepts it
            if (seller.getRole() == User.Role.ADMINISTRATOR) {
                auction.setStatus(AuctionListing.AuctionStatus.ACTIVE);
            } else {
                auction.setStatus(AuctionListing.AuctionStatus.PENDING_APPROVAL);
            }

            if (payload.get("yearManufactured") != null) {
                auction.setYearManufactured(Integer.parseInt(payload.get("yearManufactured").toString()));
            }
            if (payload.get("mileageKm") != null) {
                auction.setMileageKm(Integer.parseInt(payload.get("mileageKm").toString()));
            }
            if (payload.get("color") != null) {
                auction.setColor(payload.get("color").toString());
            }
            if (payload.get("vinNumber") != null) {
                auction.setVinNumber(payload.get("vinNumber").toString());
            }

            AuctionListing saved = auctionRepo.save(auction);

            ItemImage img = new ItemImage(saved, imagePath);
            imageRepo.save(img);
            saved.getItemImages().add(img);

            auditLogRepo.save(new AuditLog(seller, "AUCTION_CREATED",
                    "Vehicle auction submitted: " + itemName + " (ID #" + saved.getAuctionId() +
                            ", Status: " + saved.getStatus() + ", Duration: " + durationHours + "h)"));

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAuction(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            AuctionListing auction = auctionRepo.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Auction listing not found"));

            // Authorization check
            Long requestUserId = null;
            if (payload.get("userId") != null) {
                requestUserId = Long.parseLong(payload.get("userId").toString());
            } else if (payload.get("sellerId") != null) {
                requestUserId = Long.parseLong(payload.get("sellerId").toString());
            }

            User requestingUser = null;
            if (requestUserId != null) {
                requestingUser = userRepo.findById(requestUserId).orElse(null);
            }

            if (requestingUser != null) {
                boolean isOwner = auction.getSeller() != null
                        && auction.getSeller().getUserId().equals(requestingUser.getUserId());
                boolean isAdmin = requestingUser.getRole() == User.Role.ADMINISTRATOR;
                if (!isOwner && !isAdmin) {
                    return ResponseEntity.status(403)
                            .body(Map.of("error", "You are not authorized to edit this auction listing."));
                }
            }

            if (payload.get("itemName") != null)
                auction.setItemName(payload.get("itemName").toString());
            if (payload.get("brand") != null)
                auction.setBrand(payload.get("brand").toString());
            if (payload.get("model") != null)
                auction.setModel(payload.get("model").toString());
            if (payload.get("vehicleType") != null)
                auction.setVehicleType(payload.get("vehicleType").toString());
            if (payload.get("transmission") != null)
                auction.setTransmission(payload.get("transmission").toString());
            if (payload.get("description") != null)
                auction.setDescription(payload.get("description").toString());
            if (payload.get("color") != null)
                auction.setColor(payload.get("color").toString());
            if (payload.get("vinNumber") != null)
                auction.setVinNumber(payload.get("vinNumber").toString());

            if (payload.get("yearManufactured") != null) {
                auction.setYearManufactured(Integer.parseInt(payload.get("yearManufactured").toString()));
            }
            if (payload.get("mileageKm") != null) {
                auction.setMileageKm(Integer.parseInt(payload.get("mileageKm").toString()));
            }
            if (payload.get("startingBid") != null) {
                BigDecimal nextStart = new BigDecimal(payload.get("startingBid").toString());
                if (auction.getCurrentHighestBid() == null
                        || auction.getCurrentHighestBid().compareTo(auction.getStartingBid()) == 0) {
                    auction.setCurrentHighestBid(nextStart);
                }
                auction.setStartingBid(nextStart);
            }
            if (payload.get("bidIncrement") != null) {
                auction.setBidIncrement(new BigDecimal(payload.get("bidIncrement").toString()));
            }
            if (payload.get("estMarketValue") != null) {
                auction.setEstMarketValue(new BigDecimal(payload.get("estMarketValue").toString()));
            }
            if (payload.get("status") != null) {
                auction.setStatus(AuctionListing.AuctionStatus.valueOf(payload.get("status").toString().toUpperCase()));
            }

            if (payload.get("imagePath") != null) {
                String imagePath = payload.get("imagePath").toString().trim();
                if (!imagePath.isEmpty()) {
                    List<ItemImage> images = imageRepo.findByAuctionListing_AuctionId(auction.getAuctionId());
                    if (images != null && !images.isEmpty()) {
                        ItemImage firstImg = images.get(0);
                        firstImg.setImagePath(imagePath);
                        imageRepo.save(firstImg);
                    } else {
                        ItemImage newImg = new ItemImage(auction, imagePath);
                        imageRepo.save(newImg);
                        auction.getItemImages().add(newImg);
                    }
                }
            }

            auction.setUpdatedDate(LocalDateTime.now());
            AuctionListing saved = auctionRepo.save(auction);

            User actor = requestingUser != null ? requestingUser : auction.getSeller();
            auditLogRepo.save(new AuditLog(actor, "AUCTION_UPDATED",
                    "Vehicle auction #" + id + " (" + auction.getItemName() + ") updated successfully."));

            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error updating auction: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAuction(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {
        try {
            AuctionListing auction = auctionRepo.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Auction listing not found"));

            User requestingUser = null;
            if (userId != null) {
                requestingUser = userRepo.findById(userId).orElse(null);
            }

            if (requestingUser != null) {
                boolean isOwner = auction.getSeller() != null
                        && auction.getSeller().getUserId().equals(requestingUser.getUserId());
                boolean isAdmin = requestingUser.getRole() == User.Role.ADMINISTRATOR;
                if (!isOwner && !isAdmin) {
                    return ResponseEntity.status(403)
                            .body(Map.of("error", "You are not authorized to delete this auction listing."));
                }
            }

            // Clean up foreign key associations
            watchlistRepo.deleteByAuctionListing_AuctionId(id);
            bidRepo.deleteByAuctionListing_AuctionId(id);
            List<ItemImage> images = imageRepo.findByAuctionListing_AuctionId(id);
            if (images != null && !images.isEmpty()) {
                imageRepo.deleteAll(images);
            }

            User actor = requestingUser != null ? requestingUser : auction.getSeller();
            String itemName = auction.getItemName();

            auctionRepo.delete(auction);

            auditLogRepo.save(new AuditLog(actor, "AUCTION_DELETED",
                    "Vehicle auction #" + id + " (" + itemName + ") deleted successfully."));

            return ResponseEntity.ok(Map.of("message", "Auction listing #" + id + " deleted successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error deleting auction: " + e.getMessage()));
        }
    }

    @PostMapping("/trigger-closure")
    public ResponseEntity<?> triggerClosure() {
        scheduler.processExpiredAuctions();
        return ResponseEntity.ok(Map.of("message", "Automated auction expiration evaluation executed successfully."));
    }
}
