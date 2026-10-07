package com.biddingsystem.controller;

import com.biddingsystem.entity.AuctionListing;
import com.biddingsystem.entity.Category;
import com.biddingsystem.entity.User;
import com.biddingsystem.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuctionControllerEditDeleteTest {

    private MockMvc mockMvc;

    @Mock
    private AuctionListingRepository auctionRepo;

    @Mock
    private CategoryRepository categoryRepo;

    @Mock
    private UserRepository userRepo;

    @Mock
    private ItemImageRepository imageRepo;

    @Mock
    private WatchlistRepository watchlistRepo;

    @Mock
    private BidRepository bidRepo;

    @Mock
    private AuditLogRepository auditLogRepo;

    @InjectMocks
    private AuctionController auctionController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(auctionController).build();
    }

    @Test
    void buyerCanCreateVehicleAuction() throws Exception {
        User buyer = new User();
        buyer.setUserId(3L);
        buyer.setEmail("buyer@example.com");
        buyer.setRole(User.Role.BUYER);
        buyer.setAccountStatus(User.AccountStatus.ACTIVE);

        Category category = new Category();
        category.setCategoryId(1L);
        category.setCategoryName("Sports");

        when(userRepo.findById(3L)).thenReturn(Optional.of(buyer));
        when(categoryRepo.findById(1L)).thenReturn(Optional.of(category));

        AuctionListing saved = new AuctionListing();
        saved.setAuctionId(101L);
        saved.setItemName("Buyer BMW M3");
        saved.setSeller(buyer);
        saved.setStartingBid(new BigDecimal("50000.00"));
        saved.setCurrentHighestBid(new BigDecimal("50000.00"));

        when(auctionRepo.save(any(AuctionListing.class))).thenReturn(saved);

        String payload = """
            {
                "sellerId": 3,
                "categoryId": 1,
                "itemName": "Buyer BMW M3",
                "brand": "BMW",
                "model": "M3",
                "vehicleType": "Sedan",
                "transmission": "Automatic",
                "startingBid": "50000",
                "bidIncrement": "1000",
                "estMarketValue": "60000",
                "imagePath": "https://example.com/bmw.jpg",
                "description": "Clean M3 from buyer"
            }
            """;

        mockMvc.perform(post("/api/auctions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.auctionId").value(101L))
                .andExpect(jsonPath("$.itemName").value("Buyer BMW M3"));
    }

    @Test
    void buyerCanUpdateOwnVehicleAuction() throws Exception {
        User buyer = new User();
        buyer.setUserId(3L);
        buyer.setEmail("buyer@example.com");
        buyer.setRole(User.Role.BUYER);
        buyer.setAccountStatus(User.AccountStatus.ACTIVE);

        AuctionListing auction = new AuctionListing();
        auction.setAuctionId(101L);
        auction.setItemName("Buyer BMW M3");
        auction.setSeller(buyer);
        auction.setStartingBid(new BigDecimal("50000.00"));
        auction.setCurrentHighestBid(new BigDecimal("50000.00"));

        when(auctionRepo.findById(101L)).thenReturn(Optional.of(auction));
        when(userRepo.findById(3L)).thenReturn(Optional.of(buyer));
        when(auctionRepo.save(any(AuctionListing.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String updatePayload = """
            {
                "userId": 3,
                "itemName": "Updated BMW M3 Competition",
                "startingBid": "55000"
            }
            """;

        mockMvc.perform(put("/api/auctions/101")
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatePayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemName").value("Updated BMW M3 Competition"))
                .andExpect(jsonPath("$.startingBid").value(55000));
    }

    @Test
    void unauthorizedUserCannotUpdateAnotherUsersAuction() throws Exception {
        User ownerBuyer = new User();
        ownerBuyer.setUserId(3L);
        ownerBuyer.setRole(User.Role.BUYER);

        User unauthorizedUser = new User();
        unauthorizedUser.setUserId(4L);
        unauthorizedUser.setRole(User.Role.BUYER);

        AuctionListing auction = new AuctionListing();
        auction.setAuctionId(101L);
        auction.setItemName("Original Listing");
        auction.setSeller(ownerBuyer);

        when(auctionRepo.findById(101L)).thenReturn(Optional.of(auction));
        when(userRepo.findById(4L)).thenReturn(Optional.of(unauthorizedUser));

        String updatePayload = """
            {
                "userId": 4,
                "itemName": "Hacked Title"
            }
            """;

        mockMvc.perform(put("/api/auctions/101")
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatePayload))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("You are not authorized to edit this auction listing."));
    }

    @Test
    void buyerCanDeleteOwnVehicleAuction() throws Exception {
        User buyer = new User();
        buyer.setUserId(3L);
        buyer.setEmail("buyer@example.com");
        buyer.setRole(User.Role.BUYER);

        AuctionListing auction = new AuctionListing();
        auction.setAuctionId(101L);
        auction.setItemName("Buyer BMW M3");
        auction.setSeller(buyer);

        when(auctionRepo.findById(101L)).thenReturn(Optional.of(auction));
        when(userRepo.findById(3L)).thenReturn(Optional.of(buyer));

        mockMvc.perform(delete("/api/auctions/101?userId=3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Auction listing #101 deleted successfully."));

        verify(watchlistRepo).deleteByAuctionListing_AuctionId(101L);
        verify(bidRepo).deleteByAuctionListing_AuctionId(101L);
        verify(auctionRepo).delete(auction);
    }

    @Test
    void unauthorizedUserCannotDeleteAnotherUsersAuction() throws Exception {
        User ownerBuyer = new User();
        ownerBuyer.setUserId(3L);
        ownerBuyer.setRole(User.Role.BUYER);

        User unauthorizedUser = new User();
        unauthorizedUser.setUserId(4L);
        unauthorizedUser.setRole(User.Role.BUYER);

        AuctionListing auction = new AuctionListing();
        auction.setAuctionId(101L);
        auction.setItemName("Original Listing");
        auction.setSeller(ownerBuyer);

        when(auctionRepo.findById(101L)).thenReturn(Optional.of(auction));
        when(userRepo.findById(4L)).thenReturn(Optional.of(unauthorizedUser));

        mockMvc.perform(delete("/api/auctions/101?userId=4"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("You are not authorized to delete this auction listing."));
    }
}
