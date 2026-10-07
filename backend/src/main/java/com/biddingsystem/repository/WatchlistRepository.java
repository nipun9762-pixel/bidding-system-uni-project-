package com.biddingsystem.repository;

import com.biddingsystem.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {
    List<Watchlist> findByBuyer_UserId(Long buyerId);
    Optional<Watchlist> findByBuyer_UserIdAndAuctionListing_AuctionId(Long buyerId, Long auctionId);
    void deleteByBuyer_UserIdAndAuctionListing_AuctionId(Long buyerId, Long auctionId);

    @Modifying
    @Transactional
    void deleteByAuctionListing_AuctionId(Long auctionId);
}
