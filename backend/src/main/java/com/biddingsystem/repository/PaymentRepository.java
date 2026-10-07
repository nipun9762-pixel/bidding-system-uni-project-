package com.biddingsystem.repository;

import com.biddingsystem.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByWinningOrder_OrderId(Long orderId);
    List<Payment> findByPaymentStatus(Payment.PaymentStatus status);
    List<Payment> findAllByOrderByPaymentDateDesc();
}
