package com.biddingsystem.repository;

import com.biddingsystem.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByReviewee_UserId(Long revieweeId);
    List<Review> findByWinningOrder_OrderId(Long orderId);
}
