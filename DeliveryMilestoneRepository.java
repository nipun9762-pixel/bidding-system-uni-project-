package com.biddingsystem.repository;

import com.biddingsystem.entity.DeliveryMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryMilestoneRepository extends JpaRepository<DeliveryMilestone, Long> {
    List<DeliveryMilestone> findByDelivery_DeliveryIdOrderByTimestampAsc(Long deliveryId);
}
