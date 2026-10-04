package com.biddingsystem.repository;

import com.biddingsystem.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    Optional<Delivery> findByWinningOrder_OrderId(Long orderId);
    Optional<Delivery> findByTrackingNumber(String trackingNumber);
    List<Delivery> findByWinningOrder_Buyer_UserId(Long buyerId);
    List<Delivery> findByWinningOrder_Seller_UserId(Long sellerId);
}
