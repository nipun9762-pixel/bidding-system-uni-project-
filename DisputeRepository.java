package com.biddingsystem.repository;

import com.biddingsystem.entity.Dispute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, Long> {
    List<Dispute> findByWinningOrder_OrderId(Long orderId);
    List<Dispute> findBySubmittedBy_UserId(Long userId);
}
