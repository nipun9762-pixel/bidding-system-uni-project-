-- =========================================================
-- Web-Based Bidding System Database Schema (MySQL)
-- Based on SLIIT EER Diagram and Requirement Specification
-- =========================================================

CREATE DATABASE IF NOT EXISTS bidding_system_db;
USE bidding_system_db;

-- Drop tables in reverse order of dependencies if re-executing
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS dispute;
DROP TABLE IF EXISTS review;
DROP TABLE IF EXISTS watchlist;
DROP TABLE IF EXISTS delivery;
DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS winning_order;
DROP TABLE IF EXISTS bid;
DROP TABLE IF EXISTS item_image;
DROP TABLE IF EXISTS auction_listing;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS user;

-- 1. USER TABLE
-- Buyer and seller accounts use the same user table through the role column.
-- Registration and login CRUD flows are supported by the auth controller and repository.
CREATE TABLE user (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role ENUM('BUYER', 'SELLER', 'ADMINISTRATOR', 'PAYMENT_PROCESSOR') NOT NULL,
    account_status ENUM('ACTIVE', 'SUSPENDED', 'PENDING') DEFAULT 'ACTIVE',
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. CATEGORY TABLE
CREATE TABLE category (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL,
    description TEXT
);

-- 3. AUCTION_LISTING TABLE
CREATE TABLE auction_listing (
    auction_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    seller_id BIGINT NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    brand VARCHAR(50),
    model VARCHAR(50),
    vehicle_type VARCHAR(50),
    transmission VARCHAR(30),
    year_manufactured INT,
    mileage_km INT,
    color VARCHAR(30),
    vin_number VARCHAR(100),
    ai_worth_score DECIMAL(3, 1) DEFAULT 7.5,
    ai_valuation_status VARCHAR(30) DEFAULT 'UNDERVALUED',
    est_market_value DECIMAL(12, 2) NOT NULL,
    description TEXT,
    category_id BIGINT NOT NULL,
    starting_bid DECIMAL(12, 2) NOT NULL,
    reserve_price DECIMAL(12, 2) DEFAULT 0.00,
    current_highest_bid DECIMAL(12, 2) DEFAULT 0.00,
    bid_increment DECIMAL(12, 2) NOT NULL,
    start_date_time DATETIME NOT NULL,
    end_date_time DATETIME NOT NULL,
    status ENUM('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'CLOSED', 'CANCELLED', 'COMPLETED') DEFAULT 'ACTIVE',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category(category_id)
);

-- 4. ITEM_IMAGE TABLE
CREATE TABLE item_image (
    image_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    auction_id BIGINT NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auction_listing(auction_id) ON DELETE CASCADE
);

-- 5. BID TABLE
CREATE TABLE bid (
    bid_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    auction_id BIGINT NOT NULL,
    bidder_id BIGINT NOT NULL,
    bid_amount DECIMAL(12, 2) NOT NULL,
    bid_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    bid_status ENUM('ACCEPTED', 'REJECTED', 'OUTBID', 'WINNING') DEFAULT 'ACCEPTED',
    FOREIGN KEY (auction_id) REFERENCES auction_listing(auction_id) ON DELETE CASCADE,
    FOREIGN KEY (bidder_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- 6. WINNING_ORDER TABLE
CREATE TABLE winning_order (
    order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    auction_id BIGINT UNIQUE NOT NULL,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    winning_amount DECIMAL(12, 2) NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    order_status ENUM('PENDING', 'PROCESSING', 'PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    FOREIGN KEY (auction_id) REFERENCES auction_listing(auction_id),
    FOREIGN KEY (buyer_id) REFERENCES user(user_id),
    FOREIGN KEY (seller_id) REFERENCES user(user_id)
);

-- 7. PAYMENT TABLE
CREATE TABLE payment (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    payment_amount DECIMAL(12, 2) NOT NULL,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) DEFAULT 'CREDIT_CARD',
    transaction_reference VARCHAR(100) UNIQUE,
    payment_status ENUM('PENDING', 'PROCESSING', 'SUCCESSFUL', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    FOREIGN KEY (order_id) REFERENCES winning_order(order_id) ON DELETE CASCADE
);

-- 8. DELIVERY TABLE
CREATE TABLE delivery (
    delivery_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNIQUE NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_method VARCHAR(50) DEFAULT 'STANDARD_COURIER',
    tracking_number VARCHAR(100),
    carrier_name VARCHAR(100) DEFAULT 'Swift Auto Logistics',
    current_location VARCHAR(150) DEFAULT 'Seller Logistics Depot',
    estimated_delivery_date DATETIME,
    delivery_notes TEXT,
    recipient_phone VARCHAR(50),
    delivery_status ENUM('AWAITING_PAYMENT', 'PREPARING_FOR_SHIPMENT', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COLLECTED', 'CANCELLED') DEFAULT 'AWAITING_PAYMENT',
    shipped_date DATETIME,
    delivered_date DATETIME,
    FOREIGN KEY (order_id) REFERENCES winning_order(order_id) ON DELETE CASCADE
);

-- 8.1 DELIVERY_MILESTONE TABLE (TRACKING HISTORY)
CREATE TABLE delivery_milestone (
    milestone_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    delivery_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(150),
    status VARCHAR(50),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES delivery(delivery_id) ON DELETE CASCADE
);

-- 9. WATCHLIST TABLE
CREATE TABLE watchlist (
    watchlist_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id BIGINT NOT NULL,
    auction_id BIGINT NOT NULL,
    added_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_buyer_auction (buyer_id, auction_id),
    FOREIGN KEY (buyer_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (auction_id) REFERENCES auction_listing(auction_id) ON DELETE CASCADE
);

-- 10. REVIEW TABLE
CREATE TABLE review (
    review_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    reviewee_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_comment TEXT,
    review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    review_status ENUM('PENDING', 'APPROVED', 'FLAGGED') DEFAULT 'APPROVED',
    FOREIGN KEY (order_id) REFERENCES winning_order(order_id),
    FOREIGN KEY (reviewer_id) REFERENCES user(user_id),
    FOREIGN KEY (reviewee_id) REFERENCES user(user_id)
);

-- 11. DISPUTE TABLE
CREATE TABLE dispute (
    dispute_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    submitted_by BIGINT NOT NULL,
    dispute_reason VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    evidence_reference VARCHAR(255),
    submitted_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    dispute_status ENUM('OPEN', 'UNDER_REVIEW', 'AWAITING_RESPONSE', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
    resolution TEXT,
    FOREIGN KEY (order_id) REFERENCES winning_order(order_id),
    FOREIGN KEY (submitted_by) REFERENCES user(user_id)
);

-- 12. NOTIFICATION TABLE
CREATE TABLE notification (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    sent_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_status BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- 13. AUDIT_LOG TABLE
CREATE TABLE audit_log (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    action_date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE SET NULL
);

-- =========================================================
-- SEED INITIAL DATA
-- =========================================================

-- Insert Sample Users
INSERT INTO user (first_name, last_name, email, phone_number, password, role, account_status) VALUES
('Nadeesha', 'Perera', 'admin@bidding.com', '+94771234567', '$2a$10$e7v1g7v...', 'ADMINISTRATOR', 'ACTIVE'),
('Kasun', 'Wickramasinghe', 'seller.callour@bidding.com', '+94772345678', '$2a$10$e7v1g7v...', 'SELLER', 'ACTIVE'),
('Tharushi', 'Fernando', 'seller.prime@bidding.com', '+94773456789', '$2a$10$e7v1g7v...', 'SELLER', 'ACTIVE'),
('Dilini', 'Rathnayake', 'buyer.dilini@bidding.com', '+94774567890', '$2a$10$e7v1g7v...', 'BUYER', 'ACTIVE'),
('Ravindu', 'Jayasekara', 'payproc@bidding.com', '+94775678901', '$2a$10$e7v1g7v...', 'PAYMENT_PROCESSOR', 'ACTIVE');

-- Insert Sample Categories
INSERT INTO category (category_name, description) VALUES
('Luxury Sports Cars', 'High performance exotic sports and luxury vehicles'),
('Supercars', 'Ultra-exclusive supercars and hypercars'),
('Sedans & Executive', 'Premium executive sedans and daily drivers'),
('SUV & Off-Road', 'Luxury SUVs and performance crossovers');

-- Insert Sample Auction Listings (Matching Image 3 Mockup)
INSERT INTO auction_listing 
(seller_id, item_name, brand, model, vehicle_type, transmission, year_manufactured, mileage_km, color, vin_number, ai_worth_score, ai_valuation_status, est_market_value, description, category_id, starting_bid, reserve_price, current_highest_bid, bid_increment, start_date_time, end_date_time, status) 
VALUES
(2, 'Porsche 911 Carrera S (2021)', 'Porsche', '911 Carrera S', 'Sedan', 'Automatic', 2021, 18400, 'Red', 'WPOAB2A99MS123847', 7.2, 'UNDERVALUED', 128000.00, 'Pristine condition 2021 Porsche 911 Carrera S in Red with full service history and ceramic coating.', 1, 110000.00, 115000.00, 116500.00, 1000.00, NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY), 'ACTIVE'),

(3, 'Chevrolet Corvette Z06 (2023)', 'Chevrolet', 'Corvette Z06', 'Coupe', 'Automatic', 2023, 24900, 'Dark Grey', 'YR7CV5X11LK290586', 6.1, 'OVERVALUE', 118000.00, 'Aggressive Dark Grey Corvette Z06 featuring track package and carbon fibre aero kit.', 1, 105000.00, 110000.00, 116500.00, 1000.00, NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), 'ACTIVE'),

(2, 'McLaren Senna (2020)', 'McLaren', 'Senna', 'Hypercar', 'Sequential', 2020, 52000, 'Yellow', 'MD9FG3Z55NJ876321', 9.5, 'UNDERVALUED', 940000.00, 'Rare yellow McLaren Senna 2020 edition. Impeccably tuned performance icon with low track usage.', 2, 800000.00, 850000.00, 872000.00, 5000.00, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'ACTIVE'),

(3, 'Nissan GT-R Premium (2020)', 'Nissan', 'GT-R Premium', 'Coupe', 'Dual-Clutch', 2020, 12000, 'Blue', 'XE3QA9B77HJ543910', 5.9, 'OVERVALUE', 102500.00, 'Iconic Bayside Blue Nissan GT-R Premium. AWD powerhouse in mint factory condition.', 1, 95000.00, 100000.00, 116500.00, 1000.00, NOW(), DATE_ADD(NOW(), INTERVAL 4 DAY), 'ACTIVE');

-- Insert Sample Images
INSERT INTO item_image (auction_id, image_path) VALUES
(1, 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80'),
(2, 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'),
(3, 'https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=800&q=80'),
(4, 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80');

-- Insert Initial Audit Log
INSERT INTO audit_log (user_id, action_type, description) VALUES
(1, 'SYSTEM_INITIALIZATION', 'Bidding System database initialized with categories, vehicle listings, and default security configuration.');
