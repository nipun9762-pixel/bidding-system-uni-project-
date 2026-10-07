package com.biddingsystem.repository;

import com.biddingsystem.entity.AuctionListing;
import com.biddingsystem.entity.AuctionListing.AuctionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuctionListingRepository extends JpaRepository<AuctionListing, Long> {

    List<AuctionListing> findByStatus(AuctionStatus status);

    List<AuctionListing> findBySeller_UserId(Long sellerId);

    @Query("SELECT a FROM AuctionListing a WHERE a.status = 'ACTIVE' AND a.endDateTime <= :now")
    List<AuctionListing> findExpiredActiveAuctions(LocalDateTime now);
}
