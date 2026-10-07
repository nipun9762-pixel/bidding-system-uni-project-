package com.biddingsystem.config;

import com.biddingsystem.entity.*;
import com.biddingsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private CategoryRepository categoryRepo;

    @Autowired
    private AuctionListingRepository auctionRepo;

    @Autowired
    private ItemImageRepository imageRepo;

    @Autowired
    private AuditLogRepository auditLogRepo;

    @Override
    public void run(String... args) throws Exception {
        // Ensure Default Users (Admin, Sellers, Buyer, PayProc) always exist
        User admin = userRepo.findByEmail("admin@bidding.com").orElseGet(() ->
                userRepo.save(new User(null, "Nadeesha", "Perera", "admin@bidding.com", "+94771234567", "admin123",
                        User.Role.ADMINISTRATOR, User.AccountStatus.ACTIVE)));

        User seller1 = userRepo.findByEmail("seller.callour@bidding.com").orElseGet(() ->
                userRepo.save(new User(null, "Kasun", "Wickramasinghe", "seller.callour@bidding.com",
                        "+94772345678", "seller123", User.Role.SELLER, User.AccountStatus.ACTIVE)));

        User seller2 = userRepo.findByEmail("seller.prime@bidding.com").orElseGet(() ->
                userRepo.save(new User(null, "Tharushi", "Fernando", "seller.prime@bidding.com", "+94773456789",
                        "seller123", User.Role.SELLER, User.AccountStatus.ACTIVE)));

        User buyer = userRepo.findByEmail("buyer.dilini@bidding.com").orElseGet(() ->
                userRepo.save(new User(null, "Dilini", "Rathnayake", "buyer.dilini@bidding.com", "+94774567890",
                        "buyer123", User.Role.BUYER, User.AccountStatus.ACTIVE)));

        User payProc = userRepo.findByEmail("payproc@bidding.com").orElseGet(() ->
                userRepo.save(new User(null, "Ravindu", "Jayasekara", "payproc@bidding.com", "+94775678901",
                        "pay123", User.Role.PAYMENT_PROCESSOR, User.AccountStatus.ACTIVE)));

        if (auctionRepo.count() > 0)
            return;

        // Seed Categories
        Category c1 = categoryRepo
                .save(new Category(null, "Luxury Sports Cars", "High performance exotic sports and luxury vehicles"));
        Category c2 = categoryRepo.save(new Category(null, "Supercars", "Ultra-exclusive supercars and hypercars"));
        Category c3 = categoryRepo
                .save(new Category(null, "Sedans & Executive", "Premium executive sedans and daily drivers"));

        // Seed Auction 1 (Porsche 911 Carrera S 2021) - Matching Image 3
        AuctionListing a1 = new AuctionListing();
        a1.setSeller(seller1);
        a1.setCategory(c1);
        a1.setItemName("Porsche 911 Carrera S (2021)");
        a1.setBrand("Porsche");
        a1.setModel("911 Carrera S");
        a1.setVehicleType("Sedan");
        a1.setTransmission("Rear-Wheel Drive");
        a1.setYearManufactured(2021);
        a1.setMileageKm(18400);
        a1.setColor("Red");
        a1.setVinNumber("WPOAB2A99MS123847");
        a1.setAiWorthScore(new BigDecimal("7.2"));
        a1.setAiValuationStatus("UNDERVALUED");
        a1.setEstMarketValue(new BigDecimal("128000.00"));
        a1.setDescription(
                "Pristine condition 2021 Porsche 911 Carrera S in Red with full service history, sport chrono package, and ceramic coating.");
        a1.setStartingBid(new BigDecimal("110000.00"));
        a1.setReservePrice(new BigDecimal("115000.00"));
        a1.setCurrentHighestBid(new BigDecimal("116500.00"));
        a1.setBidIncrement(new BigDecimal("1000.00"));
        a1.setStartDateTime(LocalDateTime.now().minusDays(1));
        a1.setEndDateTime(LocalDateTime.now().plusDays(4));
        a1.setStatus(AuctionListing.AuctionStatus.ACTIVE);
        AuctionListing savedA1 = auctionRepo.save(a1);

        imageRepo.save(new ItemImage(savedA1,
                "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80"));

        // Seed Auction 2 (Chevrolet Corvette Z06 2023) - Matching Image 3
        AuctionListing a2 = new AuctionListing();
        a2.setSeller(seller2);
        a2.setCategory(c1);
        a2.setItemName("Chevrolet Corvette Z06 (2023)");
        a2.setBrand("Chevrolet");
        a2.setModel("Corvette Z06");
        a2.setVehicleType("Coupe");
        a2.setTransmission("Rear-Wheel Drive");
        a2.setYearManufactured(2023);
        a2.setMileageKm(24900);
        a2.setColor("Dark Grey");
        a2.setVinNumber("YR7CV5X11LK290586");
        a2.setAiWorthScore(new BigDecimal("6.1"));
        a2.setAiValuationStatus("OVERVALUE");
        a2.setEstMarketValue(new BigDecimal("118000.00"));
        a2.setDescription("Aggressive Dark Grey Corvette Z06 featuring Z07 track package and carbon fibre aero kit.");
        a2.setStartingBid(new BigDecimal("105000.00"));
        a2.setReservePrice(new BigDecimal("110000.00"));
        a2.setCurrentHighestBid(new BigDecimal("116500.00"));
        a2.setBidIncrement(new BigDecimal("1000.00"));
        a2.setStartDateTime(LocalDateTime.now().minusDays(2));
        a2.setEndDateTime(LocalDateTime.now().plusDays(2));
        a2.setStatus(AuctionListing.AuctionStatus.ACTIVE);
        AuctionListing savedA2 = auctionRepo.save(a2);

        imageRepo.save(new ItemImage(savedA2,
                "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80"));

        // Seed Auction 3 (McLaren Senna 2020) - Matching Image 3
        AuctionListing a3 = new AuctionListing();
        a3.setSeller(seller1);
        a3.setCategory(c2);
        a3.setItemName("McLaren Senna (2020)");
        a3.setBrand("McLaren");
        a3.setModel("Senna");
        a3.setVehicleType("Hypercar");
        a3.setTransmission("Rear-Wheel Drive");
        a3.setYearManufactured(2020);
        a3.setMileageKm(52000);
        a3.setColor("Yellow");
        a3.setVinNumber("MD9FG3Z55NJ876321");
        a3.setAiWorthScore(new BigDecimal("9.5"));
        a3.setAiValuationStatus("UNDERVALUED");
        a3.setEstMarketValue(new BigDecimal("940000.00"));
        a3.setDescription("Rare yellow McLaren Senna 2020 edition. Impeccably tuned performance icon.");
        a3.setStartingBid(new BigDecimal("800000.00"));
        a3.setReservePrice(new BigDecimal("850000.00"));
        a3.setCurrentHighestBid(new BigDecimal("872000.00"));
        a3.setBidIncrement(new BigDecimal("5000.00"));
        a3.setStartDateTime(LocalDateTime.now().minusDays(3));
        a3.setEndDateTime(LocalDateTime.now().plusDays(5));
        a3.setStatus(AuctionListing.AuctionStatus.ACTIVE);
        AuctionListing savedA3 = auctionRepo.save(a3);

        imageRepo.save(new ItemImage(savedA3,
                "https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=800&q=80"));

        // Seed Auction 4 (Nissan GT-R Premium 2020) - Matching Image 3
        AuctionListing a4 = new AuctionListing();
        a4.setSeller(seller2);
        a4.setCategory(c1);
        a4.setItemName("Nissan GT-R Premium (2020)");
        a4.setBrand("Nissan");
        a4.setModel("GT-R Premium");
        a4.setVehicleType("Coupe");
        a4.setTransmission("Rear-Wheel Drive");
        a4.setYearManufactured(2020);
        a4.setMileageKm(12000);
        a4.setColor("Blue");
        a4.setVinNumber("XE3QA9B77HJ543910");
        a4.setAiWorthScore(new BigDecimal("5.9"));
        a4.setAiValuationStatus("OVERVALUE");
        a4.setEstMarketValue(new BigDecimal("102500.00"));
        a4.setDescription("Iconic Bayside Blue Nissan GT-R Premium. AWD powerhouse in mint factory condition.");
        a4.setStartingBid(new BigDecimal("95000.00"));
        a4.setReservePrice(new BigDecimal("100000.00"));
        a4.setCurrentHighestBid(new BigDecimal("116500.00"));
        a4.setBidIncrement(new BigDecimal("1000.00"));
        a4.setStartDateTime(LocalDateTime.now().minusDays(1));
        a4.setEndDateTime(LocalDateTime.now().plusDays(3));
        a4.setStatus(AuctionListing.AuctionStatus.ACTIVE);
        AuctionListing savedA4 = auctionRepo.save(a4);

        imageRepo.save(new ItemImage(savedA4,
                "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80"));

        // Seed Auction 5 (Audi R8 V10 - Closed/Sold for seller1)
        AuctionListing a5 = new AuctionListing();
        a5.setSeller(seller1);
        a5.setCategory(c1);
        a5.setItemName("Audi R8 V10 Performance (2022)");
        a5.setBrand("Audi");
        a5.setModel("R8 V10");
        a5.setVehicleType("Coupe");
        a5.setTransmission("All-Wheel Drive");
        a5.setYearManufactured(2022);
        a5.setMileageKm(14200);
        a5.setColor("Daytona Grey");
        a5.setVinNumber("WAUZZZ4S6N901234");
        a5.setAiWorthScore(new BigDecimal("8.4"));
        a5.setAiValuationStatus("FAIR");
        a5.setEstMarketValue(new BigDecimal("155000.00"));
        a5.setDescription("Sold & Closed Audi R8 V10 Performance edition. Completed vehicle auction.");
        a5.setStartingBid(new BigDecimal("135000.00"));
        a5.setReservePrice(new BigDecimal("140000.00"));
        a5.setCurrentHighestBid(new BigDecimal("148000.00"));
        a5.setBidIncrement(new BigDecimal("2000.00"));
        a5.setStartDateTime(LocalDateTime.now().minusDays(5));
        a5.setEndDateTime(LocalDateTime.now().minusDays(2));
        a5.setStatus(AuctionListing.AuctionStatus.CLOSED);
        AuctionListing savedA5 = auctionRepo.save(a5);

        imageRepo.save(new ItemImage(savedA5,
                "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80"));

        auditLogRepo.save(new AuditLog(admin, "SYSTEM_INITIALIZATION",
                "Spring Boot DataInitializer seeded categories, vehicle auction listings, images, and users successfully."));
    }
}
