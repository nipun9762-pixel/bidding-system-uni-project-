package com.biddingsystem.controller;

import com.biddingsystem.entity.Bid;
import com.biddingsystem.repository.BidRepository;
import com.biddingsystem.service.BiddingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bids")
@CrossOrigin(origins = "*")
public class BidController {

    @Autowired
    private BiddingService biddingService;

    @Autowired
    private BidRepository bidRepo;

}
