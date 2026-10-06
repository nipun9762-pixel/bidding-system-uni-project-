package com.biddingsystem.repository;

import com.biddingsystem.entity.ItemImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemImageRepository extends JpaRepository<ItemImage, Long> {
    List<ItemImage> findByAuctionListing_AuctionId(Long auctionId);
}
