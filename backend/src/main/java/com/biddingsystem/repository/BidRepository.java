package com.biddingsystem.repository;

import com.biddingsystem.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {

    List<Bid> findByAuctionListing_AuctionIdOrderByBidAmountDesc(Long auctionId);

    Optional<Bid> findFirstByAuctionListing_AuctionIdOrderByBidAmountDesc(Long auctionId);

    List<Bid> findByBidder_UserId(Long bidderId);

    @Modifying
    @Transactional
    void deleteByAuctionListing_AuctionId(Long auctionId);
}
