package com.biddingsystem.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bid")
public class Bid {
   @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bidId;
