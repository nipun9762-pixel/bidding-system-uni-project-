package com.biddingsystem.service;

import com.biddingsystem.entity.AuctionListing;
import com.biddingsystem.entity.User;
import com.biddingsystem.repository.AuctionListingRepository;
import com.biddingsystem.repository.AuditLogRepository;
import com.biddingsystem.repository.BidRepository;
import com.biddingsystem.repository.NotificationRepository;
import com.biddingsystem.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BiddingServiceRoleValidationTest {

    @Mock private AuctionListingRepository auctionRepo;
    @Mock private BidRepository bidRepo;
    @Mock private UserRepository userRepo;
    @Mock private NotificationRepository notificationRepo;
    @Mock private AuditLogRepository auditLogRepo;

    @InjectMocks private BiddingService biddingService;

    @Test
    void placeBidRejectsSellerRoleAndRequiresRegisteredBuyerAccount() {
        AuctionListing auction = new AuctionListing();
        auction.setAuctionId(100L);
        auction.setStatus(AuctionListing.AuctionStatus.ACTIVE);
        auction.setEndDateTime(LocalDateTime.now().plusDays(1));
        auction.setStartingBid(BigDecimal.valueOf(10));
        auction.setCurrentHighestBid(BigDecimal.ZERO);
        auction.setBidIncrement(BigDecimal.ONE);
        auction.setItemName("Test Auction");

        User seller = new User();
        seller.setUserId(1L);
        seller.setRole(User.Role.SELLER);
        seller.setAccountStatus(User.AccountStatus.ACTIVE);
        auction.setSeller(seller);

        when(auctionRepo.findById(100L)).thenReturn(Optional.of(auction));

        User bidder = new User();
        bidder.setUserId(2L);
        bidder.setRole(User.Role.SELLER);
        bidder.setAccountStatus(User.AccountStatus.ACTIVE);
        when(userRepo.findById(2L)).thenReturn(Optional.of(bidder));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> biddingService.placeBid(100L, 2L, BigDecimal.valueOf(10)));

        assertTrue(ex.getMessage().contains("buyer account"));
    }
}
