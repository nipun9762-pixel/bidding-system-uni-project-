package com.biddingsystem.repository;

import com.biddingsystem.entity.WinningOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WinningOrderRepository extends JpaRepository<WinningOrder, Long> {
    List<WinningOrder> findByBuyer_UserId(Long buyerId);
    List<WinningOrder> findBySeller_UserId(Long sellerId);
    Optional<WinningOrder> findByAuctionListing_AuctionId(Long auctionId);
}
