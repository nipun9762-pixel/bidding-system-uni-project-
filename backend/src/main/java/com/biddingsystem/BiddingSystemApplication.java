package com.biddingsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BiddingSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(BiddingSystemApplication.class, args);
    }
}
