package com.biddingsystem.controller;

import com.biddingsystem.entity.*;
import com.biddingsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ReviewDisputeController {

    @Autowired
    private ReviewRepository reviewRepo;

    @Autowired
    private DisputeRepository disputeRepo;

    @Autowired
    private WinningOrderRepository orderRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private AuditLogRepository auditLogRepo;

    // --- REVIEWS ---
    @PostMapping("/reviews")
    public ResponseEntity<?> submitReview(@RequestBody Map<String, Object> payload) {
        try {
            Long orderId = Long.parseLong(payload.get("orderId").toString());
            Long reviewerId = Long.parseLong(payload.get("reviewerId").toString());
            Long revieweeId = Long.parseLong(payload.get("revieweeId").toString());
            Integer rating = Integer.parseInt(payload.get("rating").toString());
            String comment = payload.get("comment") != null ? payload.get("comment").toString() : "";

            WinningOrder order = orderRepo.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
            User reviewer = userRepo.findById(reviewerId).orElseThrow(() -> new IllegalArgumentException("Reviewer not found"));
            User reviewee = userRepo.findById(revieweeId).orElseThrow(() -> new IllegalArgumentException("Reviewee not found"));

            Review review = new Review();
            review.setWinningOrder(order);
            review.setReviewer(reviewer);
            review.setReviewee(reviewee);
            review.setRating(rating);
            review.setReviewComment(comment);

            Review saved = reviewRepo.save(review);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/reviews")
    public List<Review> getAllReviews() {
        return reviewRepo.findAll();
    }

    @GetMapping("/reviews/user/{userId}")
    public List<Review> getReviewsForUser(@PathVariable Long userId) {
        return reviewRepo.findByReviewee_UserId(userId);
    }

    @GetMapping("/reviews/order/{orderId}")
    public List<Review> getReviewsForOrder(@PathVariable Long orderId) {
        return reviewRepo.findByWinningOrder_OrderId(orderId);
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        try {
            reviewRepo.deleteById(id);
            auditLogRepo.save(new AuditLog(null, "REVIEW_DELETED", "Admin removed Review #" + id));
            return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- DISPUTES ---
    @PostMapping("/disputes")
    public ResponseEntity<?> submitDispute(@RequestBody Map<String, Object> payload) {
        try {
            Long orderId = Long.parseLong(payload.get("orderId").toString());
            Long submittedBy = Long.parseLong(payload.get("submittedBy").toString());
            String reason = payload.get("disputeReason").toString();
            String description = payload.get("description").toString();
            String evidence = payload.get("evidenceReference") != null ? payload.get("evidenceReference").toString() : "";

            WinningOrder order = orderRepo.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
            User user = userRepo.findById(submittedBy).orElseThrow(() -> new IllegalArgumentException("User not found"));

            Dispute dispute = new Dispute();
            dispute.setWinningOrder(order);
            dispute.setSubmittedBy(user);
            dispute.setDisputeReason(reason);
            dispute.setDescription(description);
            dispute.setEvidenceReference(evidence);
            dispute.setDisputeStatus(Dispute.DisputeStatus.OPEN);

            Dispute saved = disputeRepo.save(dispute);
            auditLogRepo.save(new AuditLog(user, "DISPUTE_SUBMITTED", "Dispute submitted for Order #" + orderId + ": " + reason));

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/disputes")
    public List<Dispute> getAllDisputes() {
        return disputeRepo.findAll();
    }

    @PostMapping("/disputes/resolve")
    public ResponseEntity<?> resolveDispute(@RequestBody Map<String, Object> payload) {
        try {
            Long disputeId = Long.parseLong(payload.get("disputeId").toString());
            String resolution = payload.get("resolution").toString();
            String statusStr = payload.get("status") != null ? payload.get("status").toString() : "RESOLVED";

            Dispute dispute = disputeRepo.findById(disputeId).orElseThrow(() -> new IllegalArgumentException("Dispute not found"));
            dispute.setResolution(resolution);
            dispute.setDisputeStatus(Dispute.DisputeStatus.valueOf(statusStr));

            Dispute saved = disputeRepo.save(dispute);
            auditLogRepo.save(new AuditLog(null, "DISPUTE_RESOLVED", "Admin resolved Dispute #" + disputeId + " with status " + statusStr));

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
