package com.biddingsystem.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "item_image")
public class ItemImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long imageId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "auction_id")
    @JsonIgnore
    private AuctionListing auctionListing;

    @Column(columnDefinition = "LONGTEXT")
    private String imagePath;

    private LocalDateTime uploadDate = LocalDateTime.now();

    public ItemImage() {}

    public ItemImage(AuctionListing auctionListing, String imagePath) {
        this.auctionListing = auctionListing;
        this.imagePath = imagePath;
    }

    public Long getImageId() { return imageId; }
    public void setImageId(Long imageId) { this.imageId = imageId; }

    public AuctionListing getAuctionListing() { return auctionListing; }
    public void setAuctionListing(AuctionListing auctionListing) { this.auctionListing = auctionListing; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    public LocalDateTime getUploadDate() { return uploadDate; }
    public void setUploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; }
}
