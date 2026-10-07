import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FilterSidebar from './components/FilterSidebar';
import AuctionCard from './components/AuctionCard';
import BidModal from './components/BidModal';
import CreateAuctionModal from './components/CreateAuctionModal';
import PaymentModal from './components/PaymentModal';
import AdminPanel from './components/AdminPanel';
import ReviewModal from './components/ReviewModal';
import DisputeModal from './components/DisputeModal';
import AuthPortal from './components/AuthPortal';
import DeliveryTracker from './components/DeliveryTracker';
import { PlusCircle, Flame, CheckCircle, Package, Truck, Sparkles, AlertTriangle, Star, Clock, Car, Trophy, Gavel, CreditCard } from 'lucide-react';
import { isOrderForBuyer, isOrderForSeller, canAccessOrder } from './utils/orderOwnership';

const MOCK_AUCTIONS = [
  {
    auctionId: 1,
    itemName: 'Porsche 911 Carrera S (2021)',
    brand: 'Porsche',
    model: '911 Carrera S',
    vehicleType: 'Sedan',
    transmission: 'Rear-Wheel Drive',
    yearManufactured: 2021,
    mileageKm: 18400,
    color: 'Red',
    vinNumber: 'WPOAB2A99MS123847',
    aiWorthScore: 7.2,
    aiValuationStatus: 'UNDERVALUED',
    estMarketValue: 128000,
    startingBid: 110000,
    currentHighestBid: 116500,
    bidIncrement: 1000,
    durationHours: 72,
    startDateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endDateTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    seller: { userId: 2, firstName: 'Kasun', lastName: 'Wickramasinghe', email: 'seller.callour@bidding.com', role: 'SELLER' },
    itemImages: [{ imagePath: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80' }]
  },
  {
    auctionId: 2,
    itemName: 'Chevrolet Corvette Z06 (2023)',
    brand: 'Chevrolet',
    model: 'Corvette Z06',
    vehicleType: 'Coupe',
    transmission: 'Rear-Wheel Drive',
    yearManufactured: 2023,
    mileageKm: 24900,
    color: 'Dark Grey',
    vinNumber: 'YR7CV5X11LK290586',
    aiWorthScore: 6.1,
    aiValuationStatus: 'OVERVALUE',
    estMarketValue: 118000,
    startingBid: 105000,
    currentHighestBid: 116500,
    bidIncrement: 1000,
    durationHours: 24,
    startDateTime: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    endDateTime: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    seller: { userId: 4, firstName: 'Tharushi', lastName: 'Fernando', email: 'tharushi@bidding.com', role: 'SELLER' },
    itemImages: [{ imagePath: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80' }]
  },
  {
    auctionId: 3,
    itemName: 'McLaren Senna (2020)',
    brand: 'McLaren',
    model: 'Senna',
    vehicleType: 'Hypercar',
    transmission: 'Rear-Wheel Drive',
    yearManufactured: 2020,
    mileageKm: 52000,
    color: 'Yellow',
    vinNumber: 'MD9FG3Z55NJ876321',
    aiWorthScore: 9.5,
    aiValuationStatus: 'UNDERVALUED',
    estMarketValue: 940000,
    startingBid: 800000,
    currentHighestBid: 872000,
    bidIncrement: 5000,
    durationHours: 120,
    startDateTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    endDateTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    seller: { userId: 2, firstName: 'Kasun', lastName: 'Wickramasinghe', email: 'seller.callour@bidding.com', role: 'SELLER' },
    itemImages: [{ imagePath: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=800&q=80' }]
  },
  {
    auctionId: 4,
    itemName: 'Nissan GT-R Premium (2020)',
    brand: 'Nissan',
    model: 'GT-R Premium',
    vehicleType: 'Coupe',
    transmission: 'Rear-Wheel Drive',
    yearManufactured: 2020,
    mileageKm: 12000,
    color: 'Blue',
    vinNumber: 'XE3QA9B77HJ543910',
    aiWorthScore: 5.9,
    aiValuationStatus: 'OVERVALUE',
    estMarketValue: 102500,
    startingBid: 95000,
    currentHighestBid: 116500,
    bidIncrement: 1000,
    durationHours: 168,
    startDateTime: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    endDateTime: new Date(Date.now() + 132 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    seller: { userId: 4, firstName: 'Tharushi', lastName: 'Fernando', email: 'tharushi@bidding.com', role: 'SELLER' },
    itemImages: [{ imagePath: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80' }]
  },
  {
    auctionId: 5,
    itemName: 'BMW M3 Competition (2023)',
    brand: 'BMW',
    model: 'M3 Competition',
    vehicleType: 'Sedan',
    transmission: 'All-Wheel Drive',
    yearManufactured: 2023,
    mileageKm: 8900,
    color: 'Isle of Man Green',
    vinNumber: 'WBA33AY08NP998811',
    aiWorthScore: 8.8,
    aiValuationStatus: 'UNDERVALUED',
    estMarketValue: 88000,
    startingBid: 76000,
    currentHighestBid: 76000,
    bidIncrement: 1000,
    durationHours: 48,
    startDateTime: new Date().toISOString(),
    endDateTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    status: 'PENDING_APPROVAL',
    seller: { userId: 2, firstName: 'Kasun', lastName: 'Wickramasinghe', email: 'seller.callour@bidding.com', role: 'SELLER' },
    itemImages: [{ imagePath: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80' }]
  },
  {
    auctionId: 6,
    itemName: 'Audi R8 V10 Performance (2022)',
    brand: 'Audi',
    model: 'R8 V10',
    vehicleType: 'Coupe',
    transmission: 'All-Wheel Drive',
    yearManufactured: 2022,
    mileageKm: 14200,
    color: 'Daytona Grey',
    vinNumber: 'WAUZZZ4S6N901234',
    aiWorthScore: 8.4,
    aiValuationStatus: 'FAIR',
    estMarketValue: 155000,
    startingBid: 135000,
    currentHighestBid: 148000,
    bidIncrement: 2000,
    durationHours: 72,
    startDateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    endDateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'CLOSED',
    seller: { userId: 2, firstName: 'Kasun', lastName: 'Wickramasinghe', email: 'seller.callour@bidding.com', role: 'SELLER' },
    itemImages: [{ imagePath: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80' }]
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bidding_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed?.user ? parsed.user : parsed;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const saved = localStorage.getItem('bidding_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        const u = parsed?.user ? parsed.user : parsed;
        if (u?.role === 'ADMINISTRATOR') return 'admin';
        if (u?.role === 'SELLER') return 'my-listings';
      }
    } catch {}
    return 'bidding';
  });

  const currentRole = currentUser?.role || 'BUYER';
  const [sellerStatusFilter, setSellerStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'PENDING' | 'SOLD'

  // Sync normalized user object into localStorage if it was previously saved wrapped
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bidding_auth_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Security guard: In Buyer Dashboard, sold auctions must NOT be seen. Redirect if buyer enters 'sold' tab.
  useEffect(() => {
    if (currentRole === 'BUYER' && activeTab === 'sold') {
      setActiveTab('bidding');
    }
  }, [currentRole, activeTab]);

  const handleLoginSuccess = (userOrData) => {
    const user = userOrData?.user ? userOrData.user : userOrData;
    setCurrentUser(user);
    localStorage.setItem('bidding_auth_user', JSON.stringify(user));
    setSellerStatusFilter('ALL');
    if (user?.role === 'ADMINISTRATOR') {
      setActiveTab('admin');
    } else if (user?.role === 'SELLER') {
      setActiveTab('my-listings');
    } else {
      setActiveTab('bidding');
    }
    fetchOrdersAndDeliveries();
    showToast(`Welcome, ${user?.firstName || 'User'}! Logged in as ${user?.role || 'BUYER'}.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bidding_auth_user');
    setSellerStatusFilter('ALL');
    setActiveTab('bidding');
    showToast('Signed out of Avtomat Bidding System.');
  };

  const [auctions, setAuctions] = useState(MOCK_AUCTIONS);
  const [watchlist, setWatchlist] = useState([]);
  const [winningOrders, setWinningOrders] = useState([
    {
      orderId: 101,
      auctionListing: MOCK_AUCTIONS[0],
      winningAmount: 116500,
      orderStatus: 'SHIPPED',
      orderDate: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      buyer: { userId: 4, firstName: 'Dilini', lastName: 'Rathnayake', email: 'buyer.dilini@bidding.com', phoneNumber: '+94 77 456 7890' },
      seller: MOCK_AUCTIONS[0].seller,
      delivery: {
        deliveryId: 1,
        deliveryStatus: 'IN_TRANSIT',
        trackingNumber: 'TRK-98124',
        carrierName: 'Swift Auto Logistics',
        currentLocation: 'Central Transit Hub - Kandy Checkpoint A1',
        deliveryAddress: 'No. 45, Galle Road, Colombo 03, Sri Lanka',
        recipientPhone: '+94 77 456 7890',
        estimatedDeliveryDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        shippedDate: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
        milestones: [
          {
            title: 'Auction Won & Order Placed',
            description: 'Dilini Rathnayake won the auction bid for Porsche 911 Carrera S (2021) at $116,500.',
            location: 'Avtomat Bidding Engine',
            status: 'AWAITING_PAYMENT',
            timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
          },
          {
            title: 'Payment Cleared & Escrow Secured',
            description: 'Settlement processor approved transaction reference TXN-948102. Escrow funds locked.',
            location: 'Financial Settlement Clearinghouse',
            status: 'PREPARING_FOR_SHIPMENT',
            timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString()
          },
          {
            title: 'Vehicle Pre-Shipment Inspection & Title Cleared',
            description: 'Seller completed pre-dispatch mechanical checklist and vehicle title documentation.',
            location: 'Seller Inspection Depot - Colombo Port',
            status: 'PREPARING_FOR_SHIPMENT',
            timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
          },
          {
            title: 'Carrier Picked Up & Dispatched',
            description: 'Loaded onto Swift Auto Logistics enclosed transporter rig #HAUL-712. GPS beacon activated.',
            location: 'Seller Logistics Port',
            status: 'SHIPPED',
            timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString()
          },
          {
            title: 'In Transit - Central Highway Checkpoint Scan',
            description: 'Transporter verified at Central Transit Hub - Kandy Checkpoint A1. Vehicle secured on transit bed.',
            location: 'Central Transit Hub - Kandy Checkpoint A1',
            status: 'IN_TRANSIT',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
          }
        ]
      }
    }
  ]);

  const [disputes, setDisputes] = useState([
    {
      disputeId: 1,
      winningOrder: MOCK_AUCTIONS[0],
      orderId: 101,
      disputeReason: 'Minor Paint Scratches Upon Delivery',
      description: 'Found two noticeable scratches on the rear bumper that were not disclosed in the listing photos.',
      evidenceReference: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e',
      disputeStatus: 'OPEN',
      submittedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ]);

  const [reviews, setReviews] = useState([
    {
      reviewId: 1,
      rating: 5,
      reviewComment: 'Exceptional dealer! The Porsche arrived in flawless showroom condition and the transaction was seamless.',
      reviewer: { firstName: 'Dilini', lastName: 'Rathnayake' },
      winningOrder: { orderId: 101 },
      orderId: 101,
      reviewDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { logId: 1, actionDateTime: new Date().toISOString(), actionType: 'SYSTEM_INIT', description: 'Platform initialization completed.', user: { email: 'admin@bidding.com' } }
  ]);

  // Filters State
  const [filters, setFilters] = useState({
    brand: '',
    vehicleType: '',
    transmission: '',
    minYear: '2020',
    maxYear: '2026'
  });

  // Modal States
  const [selectedBidAuction, setSelectedBidAuction] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [auctionToEdit, setAuctionToEdit] = useState(null);
  const [selectedPaymentOrder, setSelectedPaymentOrder] = useState(null);
  const [selectedReviewOrder, setSelectedReviewOrder] = useState(null);
  const [selectedDisputeOrder, setSelectedDisputeOrder] = useState(null);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [payments, setPayments] = useState([]);

  // Fetch payments helper
  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/payments');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data)) {
          setPayments(data);
        }
      }
    } catch (e) {
      console.warn('Payments fetch error:', e);
    }
  };

  // Fetch orders and deliveries helper
  const fetchOrdersAndDeliveries = async () => {
    try {
      const ordersRes = await fetch('/api/orders');
      if (!ordersRes.ok) return;
      const ordersData = await ordersRes.json();
      if (!ordersData || !Array.isArray(ordersData)) return;

      let delData = [];
      try {
        const delRes = await fetch('/api/deliveries');
        if (delRes.ok) delData = await delRes.json();
      } catch (err) {
        console.warn('Deliveries fetch offline', err);
      }

      let payData = [];
      try {
        const payRes = await fetch('/api/payments');
        if (payRes.ok) {
          payData = await payRes.json();
          if (Array.isArray(payData)) setPayments(payData);
        }
      } catch (err) {
        console.warn('Payments fetch offline', err);
      }

      const mergedBackend = ordersData.map(o => {
        const d = (delData || []).find(del => (del.winningOrder?.orderId === o.orderId) || (del.orderId === o.orderId));
        const p = (payData || []).find(pay => (pay.winningOrder?.orderId === o.orderId) || (pay.orderId === o.orderId));
        return { 
          ...o, 
          delivery: d || o.delivery,
          payment: p || o.payment,
          paymentSlipUrl: p?.paymentSlipUrl || o.paymentSlipUrl
        };
      });

      setWinningOrders(prev => {
        // Retain client-only orders that aren't already in backend
        const nonBackend = prev.filter(p => !mergedBackend.some(b => b.orderId === p.orderId));
        return [...mergedBackend, ...nonBackend];
      });
    } catch (err) {
      console.warn('Orders fetch error:', err);
    }
  };

  // Fetch initial data from backend API
  useEffect(() => {
    fetch('/api/auctions')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.length > 0) setAuctions(data);
      })
      .catch(() => console.log('Using local state for live auction interactive demo.'));

    fetchOrdersAndDeliveries();
    fetchPayments();

    fetch('/api/disputes')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.length > 0) setDisputes(data);
      })
      .catch(() => {});

    fetch('/api/reviews')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.length > 0) setReviews(data);
      })
      .catch(() => {});

    fetch('/api/admin/audit-logs')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.length > 0) setAuditLogs(data);
      })
      .catch(() => {});
  }, []);

  // Re-fetch orders whenever user navigates to Winning Orders or Tracking portal
  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'tracking') {
      fetchOrdersAndDeliveries();
    }
  }, [activeTab]);

  // Periodic check for expired auctions to award highest bidder (Feature 01)
  useEffect(() => {
    const checkExpirations = () => {
      const now = Date.now();
      setAuctions(prev => {
        let updated = false;
        const newAuctions = prev.map(a => {
          if (a.status === 'ACTIVE' && a.endDateTime && new Date(a.endDateTime).getTime() <= now) {
            updated = true;
            // Determine winner: highestBidder or fallback if bid placed
            const winner = a.highestBidder || (a.currentHighestBid > a.startingBid ? {
              userId: 4,
              firstName: 'Dilini',
              lastName: 'Rathnayake',
              email: 'buyer.dilini@bidding.com',
              phoneNumber: '+94 77 456 7890'
            } : null);

            if (winner) {
              const winningAmt = a.currentHighestBid || a.startingBid;
              const newOrder = {
                orderId: 100 + winningOrders.length + 1,
                auctionListing: { ...a, status: 'CLOSED' },
                winningAmount: winningAmt,
                orderStatus: 'PENDING',
                orderDate: new Date().toISOString(),
                buyer: winner,
                seller: a.seller,
                delivery: {
                  deliveryId: 10 + winningOrders.length + 1,
                  deliveryStatus: 'AWAITING_PAYMENT',
                  trackingNumber: 'TRK-' + Math.floor(10000 + Math.random() * 90000),
                  carrierName: 'Swift Auto Logistics',
                  currentLocation: 'Seller Logistics Depot - Inspection Center',
                  deliveryAddress: 'Pending Buyer Address Confirmation',
                  recipientPhone: winner.phoneNumber || '+94 77 456 7890',
                  estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                  milestones: [
                    {
                      title: 'Auction Won & Order Placed',
                      description: `${winner.firstName || 'Buyer'} won the auction bid for "${a.itemName}" at Rs. ${winningAmt.toLocaleString()}. Awaiting payment settlement.`,
                      location: 'Avtomat Bidding Engine',
                      status: 'AWAITING_PAYMENT',
                      timestamp: new Date().toISOString()
                    }
                  ]
                }
              };
              setWinningOrders(prevOrders => [newOrder, ...prevOrders]);
              showToast(`Auction for "${a.itemName}" has ended! Winning order generated for ${winner.firstName || 'highest bidder'}.`);
            }
            return { ...a, status: 'CLOSED' };
          }
          return a;
        });
        return updated ? newAuctions : prev;
      });
    };

    const interval = setInterval(() => {
      checkExpirations();
      fetchOrdersAndDeliveries();
    }, 15000);
    return () => clearInterval(interval);
  }, [winningOrders.length]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const isAuctionOwner = (auction) => {
    if (!currentUser) return false;
    const currentUserId = currentUser.userId || currentUser.id;
    const sellerId = auction.seller?.userId || auction.seller?.id;
    return Boolean(
      (currentUser.email && auction.seller?.email && currentUser.email.trim().toLowerCase() === auction.seller.email.trim().toLowerCase()) ||
      (currentUserId != null && sellerId != null && String(currentUserId) === String(sellerId))
    );
  };

  // Filter logic:
  // 1. In Buyer Dashboard (currentRole === 'BUYER'):
  //    Sold & closed auctions MUST NOT be seen by buyers. Buyers only see ACTIVE approved listings.
  // 2. In Seller Dashboard (activeTab === 'my-listings'):
  //    Sold auctions can ONLY be seen by the seller dashboard under that particular seller account.
  const filteredAuctions = auctions.filter(a => {
    // BUYER SECURITY: Buyers must NEVER see sold/closed auctions in their dashboard
    if (currentRole === 'BUYER') {
      if (a.status !== 'ACTIVE') return false;
    }

    if (activeTab === 'bidding') {
      // In live dealer bidding, only approved ACTIVE auctions are shown
      if (a.status !== 'ACTIVE') return false;
    }

    if (activeTab === 'sold') {
      // Sold tab is strictly restricted to the seller who owns the listing
      if (currentRole !== 'SELLER') return false;
      if (!isAuctionOwner(a)) return false;
      if (a.status !== 'CLOSED' && a.status !== 'COMPLETED' && a.status !== 'SOLD') return false;
    }

    if (activeTab === 'my-listings') {
      // Seller Dashboard: strictly restricted to the logged-in seller account
      if (!isAuctionOwner(a)) return false;

      // Status pill filter within Seller Dashboard
      if (sellerStatusFilter === 'ACTIVE' && a.status !== 'ACTIVE') return false;
      if (sellerStatusFilter === 'PENDING' && a.status !== 'PENDING_APPROVAL') return false;
      if (sellerStatusFilter === 'SOLD' && (a.status !== 'CLOSED' && a.status !== 'COMPLETED' && a.status !== 'SOLD')) return false;
    }

    if (filters.brand && a.brand?.toLowerCase() !== filters.brand.toLowerCase()) return false;
    if (filters.vehicleType && a.vehicleType?.toLowerCase() !== filters.vehicleType.toLowerCase()) return false;
    if (filters.transmission && a.transmission?.toLowerCase() !== filters.transmission.toLowerCase()) return false;
    return true;
  });

  // Handlers
  const handlePlaceBid = async (auctionId, amount) => {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showToast('Validation Error: Bid amount must be greater than zero. Negative bids are not allowed.');
      return;
    }

    // Determine correct bidder ID (Dilini is ID 4 in backend DB)
    const bidderId = (currentUser?.email === 'buyer.dilini@bidding.com')
      ? 4
      : (currentUser?.userId || currentUser?.id || 4);

    try {
      const res = await fetch('/api/bids/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auctionId,
          bidderId,
          bidAmount: numericAmount
        })
      });
      if (res.ok) {
        console.log('Bid placed successfully on backend');
      } else {
        const errData = await res.json().catch(() => null);
        console.warn('Backend bid returned status, using client state sync:', errData?.error);
      }
    } catch (e) {
      console.warn('Backend bid placement offline, updating local state', e);
    }

    // Always update client state so the bid is placed and functions smoothly for the buyer!
    setAuctions(prev => prev.map(a => {
      if (a.auctionId === auctionId) {
        return { 
          ...a, 
          currentHighestBid: numericAmount,
          highestBidder: currentUser || { userId: bidderId, firstName: 'Dilini', lastName: 'Rathnayake', email: 'buyer.dilini@bidding.com' }
        };
      }
      return a;
    }));

    setSelectedBidAuction(null);
    showToast(`Bid of Rs. ${numericAmount.toLocaleString()} placed successfully!`);

    // Log to Audit Log
    setAuditLogs(prev => [
      { 
        logId: prev.length + 1, 
        actionDateTime: new Date().toISOString(), 
        actionType: 'BID_PLACED', 
        description: `Bidder ${currentUser?.firstName || 'User'} placed bid of Rs. ${numericAmount.toLocaleString()} on Auction #${auctionId}`, 
        user: { email: currentUser?.email || 'buyer@bidding.com' } 
      },
      ...prev
    ]);
  };

  const handleEndAuction = async (auctionId) => {
    const targetAuction = auctions.find(a => a.auctionId === auctionId);
    if (!targetAuction) return;

    if (!window.confirm(`Are you sure you want to end the bidding for "${targetAuction.itemName}" manually? The current highest bidder will win.`)) {
      return;
    }

    const currentUserId = currentUser?.userId || currentUser?.id || '';
    try {
      const res = await fetch(`/api/auctions/${auctionId}/end-bid?userId=${currentUserId}`, {
        method: 'POST'
      });
      if (!res.ok) {
        await fetch(`/api/auctions/${auctionId}/evaluate-winner`, { method: 'POST' }).catch(() => {});
      }
    } catch (e) {
      console.warn('Backend end-bid offline, proceeding with client state update', e);
    }

    // Mark auction as CLOSED
    setAuctions(prev => prev.map(a => a.auctionId === auctionId ? { ...a, status: 'CLOSED' } : a));

    // Create a winning order if bids were placed
    const winningAmt = targetAuction.currentHighestBid || targetAuction.startingBid;
    const trackingNum = 'TRK-' + (10000 + Math.floor(Math.random() * 89999));
    const newOrderId = 100 + winningOrders.length + 1;

    const newOrder = {
      orderId: newOrderId,
      auctionListing: { ...targetAuction, status: 'CLOSED' },
      winningAmount: winningAmt,
      orderStatus: 'PENDING',
      orderDate: new Date().toISOString(),
      buyer: targetAuction.highestBidder || { userId: 4, firstName: 'Dilini', lastName: 'Rathnayake', email: 'buyer.dilini@bidding.com', phoneNumber: '+94 77 456 7890' },
      seller: targetAuction.seller,
      delivery: {
        deliveryId: 10 + winningOrders.length + 1,
        deliveryStatus: 'AWAITING_PAYMENT',
        trackingNumber: trackingNum,
        carrierName: 'Swift Auto Logistics',
        currentLocation: 'Seller Inspection Depot',
        deliveryAddress: 'Pending Buyer Address Confirmation',
        recipientPhone: '+94 77 456 7890',
        estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        milestones: [
          {
            title: 'Auction Ended Manually by Seller',
            description: `Seller manually ended auction for "${targetAuction.itemName}" at Rs. ${winningAmt.toLocaleString()}. Highest bidder evaluated as winner.`,
            location: 'Avtomat Bidding Engine',
            status: 'AWAITING_PAYMENT',
            timestamp: new Date().toISOString()
          }
        ]
      }
    };

    setWinningOrders(prevOrders => [newOrder, ...prevOrders]);
    await fetchOrdersAndDeliveries();
    showToast(`Auction for "${targetAuction.itemName}" ended manually! Winning order generated for highest bidder.`);

    setAuditLogs(prev => [
      {
        logId: prev.length + 1,
        actionDateTime: new Date().toISOString(),
        actionType: 'AUCTION_ENDED_MANUALLY',
        description: `Seller ${currentUser?.firstName || 'User'} manually ended Auction #${auctionId} (${targetAuction.itemName}) at Rs. ${winningAmt.toLocaleString()}`,
        user: { email: currentUser?.email || 'seller@bidding.com' }
      },
      ...prev
    ]);
  };

  const handleToggleWatchlist = (auctionId) => {
    if (watchlist.includes(auctionId)) {
      setWatchlist(prev => prev.filter(id => id !== auctionId));
      showToast('Removed from watchlist.');
    } else {
      setWatchlist(prev => [...prev, auctionId]);
      showToast('Added to your watchlist!');
    }
  };

  const handleCreateListing = async (formData) => {
    const startingBid = Number(formData.startingBid);
    const bidIncrement = Number(formData.bidIncrement);
    const estMarketValue = Number(formData.estMarketValue || formData.startingBid);
    const mileageKm = Number(formData.mileageKm || 0);
    const yearManufactured = Number(formData.yearManufactured || 2023);

    if (startingBid <= 0 || bidIncrement <= 0 || estMarketValue <= 0 || mileageKm < 0 || yearManufactured <= 0) {
      showToast('Validation Error: Listing values cannot be negative or zero.');
      return;
    }

    const currentUserId = currentUser?.userId || currentUser?.id || 2;
    const isSeller = currentUser?.role === 'SELLER';
    const durationHours = Number(formData.durationHours || 24);

    const payload = {
      sellerId: currentUserId,
      userId: currentUserId,
      categoryId: 1,
      ...formData,
      startingBid,
      bidIncrement,
      estMarketValue,
      mileageKm,
      yearManufactured,
      durationHours
    };

    try {
      const res = await fetch('/api/auctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        setAuctions(prev => [saved, ...prev]);
        setShowCreateModal(false);
        if (saved.status === 'PENDING_APPROVAL') {
          showToast('Auction listing submitted! Awaiting administrator approval before going live.');
        } else {
          showToast('New Vehicle Auction created successfully!');
        }
        return;
      }
    } catch (err) {
      console.warn('Backend auction creation failed, falling back to client state', err);
    }

    // Client fallback
    const start = new Date();
    const end = formData.endDateTime 
      ? new Date(formData.endDateTime) 
      : new Date(start.getTime() + durationHours * 60 * 60 * 1000);

    const newAuction = {
      auctionId: Date.now(),
      ...formData,
      currentHighestBid: Number(formData.startingBid),
      startingBid: Number(formData.startingBid),
      bidIncrement: Number(formData.bidIncrement || 1000),
      estMarketValue: Number(formData.estMarketValue || formData.startingBid),
      durationHours,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
      aiWorthScore: 8.1,
      aiValuationStatus: 'UNDERVALUED',
      // Per Feature 02: Initial status is PENDING_APPROVAL for sellers
      status: currentUser?.role === 'ADMINISTRATOR' ? 'ACTIVE' : 'PENDING_APPROVAL',
      seller: {
        id: currentUserId,
        userId: currentUserId,
        firstName: currentUser?.firstName || 'Kasun',
        lastName: currentUser?.lastName || 'Wickramasinghe',
        email: currentUser?.email || 'seller.callour@bidding.com',
        role: currentUser?.role || 'SELLER'
      },
      itemImages: [{ imagePath: formData.imagePath }]
    };

    setAuctions(prev => [newAuction, ...prev]);
    setShowCreateModal(false);
    if (newAuction.status === 'PENDING_APPROVAL') {
      showToast('Auction submitted! It will appear to buyers once approved by Administrator.');
    } else {
      showToast('New Vehicle Auction created successfully!');
    }
  };

  const handleEditAuction = (auction) => {
    setAuctionToEdit(auction);
    setShowCreateModal(true);
  };

  const handleUpdateListing = async (auctionId, formData) => {
    const startingBid = Number(formData.startingBid);
    const bidIncrement = Number(formData.bidIncrement);
    const estMarketValue = Number(formData.estMarketValue || formData.startingBid);
    const mileageKm = Number(formData.mileageKm || 0);
    const yearManufactured = Number(formData.yearManufactured || 2023);

    if (startingBid <= 0 || bidIncrement <= 0 || estMarketValue <= 0 || mileageKm < 0 || yearManufactured <= 0) {
      showToast('Validation Error: Listing values cannot be negative or zero.');
      return;
    }

    const currentUserId = currentUser?.userId || currentUser?.id || 2;
    const payload = {
      userId: currentUserId,
      sellerId: currentUserId,
      categoryId: 1,
      ...formData,
      startingBid,
      bidIncrement,
      estMarketValue,
      mileageKm,
      yearManufactured
    };

    try {
      const res = await fetch(`/api/auctions/${auctionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setAuctions(prev => prev.map(a => a.auctionId === auctionId ? updated : a));
        setAuctionToEdit(null);
        setShowCreateModal(false);
        showToast('Vehicle Auction listing updated successfully!');
        return;
      }
    } catch (err) {
      console.warn('Backend auction update failed, falling back to client state', err);
    }

    setAuctions(prev => prev.map(auction => {
      if (auction.auctionId !== auctionId) return auction;
      return {
        ...auction,
        ...formData,
        auctionId
      };
    }));
    setAuctionToEdit(null);
    setShowCreateModal(false);
    showToast('Vehicle Auction listing updated successfully!');
  };

  const handleDeleteAuction = async (auctionId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle auction listing?')) {
      return;
    }

    const currentUserId = currentUser?.userId || currentUser?.id || '';
    try {
      const res = await fetch(`/api/auctions/${auctionId}?userId=${currentUserId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setAuctions(prev => prev.filter(auction => auction.auctionId !== auctionId));
        showToast('Vehicle Auction listing deleted successfully!');
        return;
      }
    } catch (err) {
      console.warn('Backend auction delete failed, removing from client state', err);
    }

    setAuctions(prev => prev.filter(auction => auction.auctionId !== auctionId));
    showToast('Vehicle Auction listing deleted successfully!');
  };

  const handleTriggerAutomatedScheduler = () => {
    const activeAuction = auctions.find(a => a.status === 'ACTIVE');
    if (activeAuction) {
      setAuctions(prev => prev.map(a => a.auctionId === activeAuction.auctionId ? { ...a, status: 'CLOSED' } : a));
      
      const newOrderId = 100 + winningOrders.length + 1;
      const trackingNum = 'TRK-' + (10000 + Math.floor(Math.random() * 89999));
      const winningAmt = activeAuction.currentHighestBid || activeAuction.startingBid;

      const newOrder = {
        orderId: newOrderId,
        auctionListing: activeAuction,
        winningAmount: winningAmt,
        orderStatus: 'PENDING',
        orderDate: new Date().toISOString(),
        buyer: activeAuction.highestBidder || currentUser || { userId: 4, firstName: 'Dilini', lastName: 'Rathnayake', email: 'buyer.dilini@bidding.com', phoneNumber: '+94 77 456 7890' },
        seller: activeAuction.seller,
        delivery: {
          deliveryId: 10 + winningOrders.length + 1,
          deliveryStatus: 'AWAITING_PAYMENT',
          trackingNumber: trackingNum,
          carrierName: 'Swift Auto Logistics',
          currentLocation: 'Seller Logistics Depot - Colombo',
          deliveryAddress: 'Pending Buyer Address Confirmation',
          recipientPhone: '+94 77 456 7890',
          estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          milestones: [
            {
              title: 'Auction Won & Order Placed',
              description: `Buyer won bid for "${activeAuction.itemName}" at $${winningAmt.toLocaleString()}. Awaiting payment settlement.`,
              location: 'Avtomat Bidding Engine',
              status: 'AWAITING_PAYMENT',
              timestamp: new Date().toISOString()
            }
          ]
        }
      };
      setWinningOrders(prev => [newOrder, ...prev]);

      setAuditLogs(prev => [
        { logId: prev.length + 1, actionDateTime: new Date().toISOString(), actionType: 'AUTO_AUCTION_CLOSE', description: `Automated System closed Auction #${activeAuction.auctionId} and awarded Winning Order #${newOrder.orderId} to highest bidder.`, user: null },
        ...prev
      ]);

      showToast(`Auction closed! Winning Order #${newOrder.orderId} created with Tracking #${trackingNum}!`);
    } else {
      showToast('Automated System evaluated: All auctions are currently active.');
    }
  };

  const handleProcessPayment = async (orderId, method, txRef, slipUrl) => {
    const slip = slipUrl || '';
    const paymentMethod = method || 'PAYMENT_SLIP';
    try {
      await fetch('/api/payments/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId, 
          paymentMethod, 
          transactionReference: txRef,
          paymentSlipUrl: slip
        })
      });
    } catch (e) {
      console.warn('Backend payment pay failed, updating local state', e);
    }

    setWinningOrders(prev => prev.map(o => {
      if (o.orderId === orderId) {
        const currentDel = o.delivery || {};
        const payMilestone = {
          title: 'Bank Payment Slip Uploaded',
          description: `Buyer deposited payment slip (Ref: ${txRef}). Awaiting Administrator verification and approval before product processing.`,
          location: 'Admin Settlement Desk',
          status: 'AWAITING_PAYMENT',
          timestamp: new Date().toISOString()
        };

        return {
          ...o,
          orderStatus: 'PROCESSING',
          paymentSlipUrl: slip,
          payment: {
            paymentAmount: o.winningAmount,
            paymentMethod: 'PAYMENT_SLIP',
            paymentStatus: 'PROCESSING',
            transactionReference: txRef,
            paymentSlipUrl: slip
          },
          delivery: {
            ...currentDel,
            deliveryStatus: 'AWAITING_PAYMENT',
            milestones: [...(currentDel.milestones || []), payMilestone]
          }
        };
      }
      return o;
    }));

    if (fetchPayments) fetchPayments();
    setSelectedPaymentOrder(null);
    showToast('Payment slip uploaded successfully! Awaiting Administrator approval.');
  };

  const handleAcknowledgePayment = async (paymentIdOrOrderId, isApproved, notes) => {
    try {
      await fetch('/api/payments/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: paymentIdOrOrderId, isApproved, notes })
      });
    } catch (e) {
      console.warn('Backend payment acknowledge failed, updating local state', e);
    }

    setWinningOrders(prev => prev.map(o => {
      const match = o.orderId === paymentIdOrOrderId || o.payment?.paymentId === paymentIdOrOrderId;
      if (match) {
        const currentDel = o.delivery || {};
        const ackMilestone = {
          title: isApproved ? 'Payment Slip Approved by Administrator' : 'Payment Slip Rejected by Administrator',
          description: isApproved 
            ? 'Administrator verified bank payment slip. Escrow cleared. Vehicle preparation and delivery process has officially started.' 
            : `Administrator rejected payment slip: ${notes || 'Verification failed'}. Please upload a valid payment slip.`,
          location: 'Admin Operations Desk',
          status: isApproved ? 'PREPARING_FOR_SHIPMENT' : 'AWAITING_PAYMENT',
          timestamp: new Date().toISOString()
        };

        return {
          ...o,
          orderStatus: isApproved ? 'PAID' : 'PENDING',
          payment: {
            ...(o.payment || {}),
            paymentStatus: isApproved ? 'SUCCESSFUL' : 'FAILED',
            adminNotes: notes
          },
          delivery: {
            ...currentDel,
            deliveryStatus: isApproved ? 'PREPARING_FOR_SHIPMENT' : 'AWAITING_PAYMENT',
            currentLocation: isApproved ? 'Seller Logistics Facility - Packaging & Title Preparation' : currentDel.currentLocation,
            milestones: [...(currentDel.milestones || []), ackMilestone]
          }
        };
      }
      return o;
    }));

    if (fetchPayments) fetchPayments();
    setSelectedPaymentOrder(null);
    showToast(isApproved ? `Payment slip APPROVED! Processing and delivery have started.` : `Payment slip REJECTED.`);
  };

  const handleUpdateDelivery = async (orderId, updateData) => {
    try {
      await fetch('/api/deliveries/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: updateData.status,
          trackingNumber: updateData.trackingNumber,
          address: updateData.address,
          carrierName: updateData.carrierName,
          currentLocation: updateData.currentLocation,
          notes: updateData.notes,
          recipientPhone: updateData.recipientPhone
        })
      });
    } catch (e) {
      console.warn('Backend delivery update failed, updating local state', e);
    }

    setWinningOrders(prev => prev.map(o => {
      if (o.orderId === orderId) {
        const currentDel = o.delivery || {};
        const newStatus = updateData.status || currentDel.deliveryStatus;
        const newOrdStatus = updateData.orderStatus || (
          newStatus === 'DELIVERED' ? 'DELIVERED' : 
          newStatus === 'SHIPPED' || newStatus === 'IN_TRANSIT' || newStatus === 'OUT_FOR_DELIVERY' ? 'SHIPPED' : 
          o.orderStatus
        );

        const newMilestone = {
          title: updateData.milestoneTitle || `Shipment Status: ${newStatus}`,
          description: updateData.notes || `Carrier event scan: ${newStatus}`,
          location: updateData.currentLocation || currentDel.currentLocation || 'Logistics Hub',
          status: newStatus,
          timestamp: new Date().toISOString()
        };

        return {
          ...o,
          orderStatus: newOrdStatus,
          delivery: {
            ...currentDel,
            deliveryStatus: newStatus,
            currentLocation: updateData.currentLocation || currentDel.currentLocation,
            carrierName: updateData.carrierName || currentDel.carrierName,
            trackingNumber: updateData.trackingNumber || currentDel.trackingNumber,
            shippedDate: newStatus === 'SHIPPED' && !currentDel.shippedDate ? new Date().toISOString() : currentDel.shippedDate,
            deliveredDate: newStatus === 'DELIVERED' && !currentDel.deliveredDate ? new Date().toISOString() : currentDel.deliveredDate,
            milestones: [...(currentDel.milestones || []), newMilestone]
          }
        };
      }
      return o;
    }));
  };

  const handleUpdateAddress = async (orderId, address, recipientPhone) => {
    try {
      await fetch('/api/deliveries/update-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, address, recipientPhone })
      });
    } catch (e) {
      console.warn('Backend address update failed, updating local state', e);
    }

    setWinningOrders(prev => prev.map(o => {
      if (o.orderId === orderId) {
        const currentDel = o.delivery || {};
        const addrMilestone = {
          title: 'Delivery Address Confirmed / Updated',
          description: `Destination updated to: ${address} (Phone: ${recipientPhone || 'N/A'})`,
          location: 'Buyer Portal',
          status: currentDel.deliveryStatus,
          timestamp: new Date().toISOString()
        };

        return {
          ...o,
          delivery: {
            ...currentDel,
            deliveryAddress: address,
            recipientPhone: recipientPhone || currentDel.recipientPhone,
            milestones: [...(currentDel.milestones || []), addrMilestone]
          }
        };
      }
      return o;
    }));
  };

  // Feature 02: Admin Moderate Listing (Approve / Reject)
  const handleModerateListing = async (auctionId, action) => {
    try {
      const res = await fetch('/api/admin/moderate-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId, action })
      });
      if (res.ok) {
        const saved = await res.json();
        setAuctions(prev => prev.map(a => a.auctionId === auctionId ? saved : a));
        showToast(action === 'APPROVE' ? `Auction #${auctionId} APPROVED & ACTIVATED for buyers!` : `Auction #${auctionId} REJECTED.`);
        return;
      }
    } catch (err) {
      console.warn('Backend moderate listing failed, updating local state', err);
    }

    setAuctions(prev => prev.map(a => {
      if (a.auctionId === auctionId) {
        const isApprove = action === 'APPROVE';
        const now = new Date();
        const duration = a.durationHours || 120;
        const end = new Date(now.getTime() + duration * 60 * 60 * 1000);
        return { 
          ...a, 
          status: isApprove ? 'ACTIVE' : 'CANCELLED',
          startDateTime: now.toISOString(),
          endDateTime: end.toISOString()
        };
      }
      return a;
    }));

    showToast(action === 'APPROVE' ? `Auction #${auctionId} APPROVED & ACTIVATED for buyers!` : `Auction #${auctionId} REJECTED.`);
  };

  // Feature 03: Admin Resolve Dispute Ticket
  const handleResolveDispute = async (disputeId, resolution, status = 'RESOLVED') => {
    try {
      const res = await fetch('/api/disputes/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disputeId, resolution, status })
      });
      if (res.ok) {
        const saved = await res.json();
        setDisputes(prev => prev.map(d => d.disputeId === disputeId ? saved : d));
        showToast(`Dispute #${disputeId} marked as ${status}.`);
        return;
      }
    } catch (err) {
      console.warn('Backend resolve dispute failed, updating local state', err);
    }

    setDisputes(prev => prev.map(d => d.disputeId === disputeId ? { ...d, disputeStatus: status, resolution } : d));
    showToast(`Dispute #${disputeId} marked as ${status}.`);
  };

  // Feature 03: Buyer Submit Dispute Ticket
  const handleSubmitDispute = async ({ orderId, disputeReason, description, evidenceReference }) => {
    const currentUserId = currentUser?.userId || currentUser?.id || 3;
    const payload = {
      orderId,
      submittedBy: currentUserId,
      disputeReason,
      description,
      evidenceReference
    };

    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        setDisputes(prev => [saved, ...prev]);
        setSelectedDisputeOrder(null);
        showToast(`Dispute Ticket #${saved.disputeId} filed successfully! Administrator will review.`);
        return;
      }
    } catch (err) {
      console.warn('Backend dispute submission failed, using local state', err);
    }

    const order = winningOrders.find(o => o.orderId === orderId);
    const newDispute = {
      disputeId: 10 + disputes.length + 1,
      winningOrder: order,
      orderId,
      disputeReason,
      description,
      evidenceReference,
      disputeStatus: 'OPEN',
      submittedDate: new Date().toISOString()
    };

    setDisputes(prev => [newDispute, ...prev]);
    setSelectedDisputeOrder(null);
    showToast(`Dispute Ticket #${newDispute.disputeId} filed successfully! Administrator will review.`);
  };

  // Feature 03: Buyer Submit Review
  const handleSubmitReview = async (orderId, rating, comment) => {
    const currentUserId = currentUser?.userId || currentUser?.id || 3;
    const order = winningOrders.find(o => o.orderId === orderId);
    const sellerId = order?.auctionListing?.seller?.userId || order?.auctionListing?.seller?.id || 2;

    const payload = {
      orderId,
      reviewerId: currentUserId,
      revieweeId: sellerId,
      rating,
      comment
    };

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        setReviews(prev => [saved, ...prev]);
        setSelectedReviewOrder(null);
        showToast(`Review submitted! Rating: ${rating} Stars.`);
        return;
      }
    } catch (err) {
      console.warn('Backend review submission failed, using local state', err);
    }

    const newReview = {
      reviewId: Date.now(),
      winningOrder: order,
      orderId,
      rating,
      reviewComment: comment,
      reviewer: { firstName: currentUser?.firstName || 'Dilini', lastName: currentUser?.lastName || 'Rathnayake' },
      reviewDate: new Date().toISOString()
    };
    setReviews(prev => [newReview, ...prev]);
    setSelectedReviewOrder(null);
    showToast(`Review submitted! Rating: ${rating} Stars.`);
  };

  // Feature 03: Admin Delete Review
  const handleDeleteReview = async (reviewId) => {
    try {
      await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
    } catch (err) {}
    setReviews(prev => prev.filter(r => r.reviewId !== reviewId));
    showToast('Review removed by Administrator.');
  };

  // If user is not logged in, display the Buyer, Seller, Administrator login & registration portal
  if (!currentUser) {
    return (
      <>
        {toastMessage && (
          <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white font-medium text-xs px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <span>{toastMessage}</span>
          </div>
        )}
        <AuthPortal onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-['Inter',sans-serif]">
      
      {/* Top Navbar with Authenticated User Profile & Logout */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        unreadNotifsCount={3}
        onTriggerScheduler={handleTriggerAutomatedScheduler}
        onOpenCreateModal={() => {
          setAuctionToEdit(null);
          setShowCreateModal(true);
        }}
        sellerStatusFilter={sellerStatusFilter}
        onSelectSellerFilter={setSellerStatusFilter}
        activeDeliveriesCount={winningOrders.filter(o => {
          if (o.delivery?.deliveryStatus === 'DELIVERED') return false;
          if (currentRole === 'ADMINISTRATOR') return true;
          if (currentRole === 'BUYER') {
            return isOrderForBuyer(o, currentUser);
          }
          if (currentRole === 'SELLER') {
            return isOrderForSeller(o, currentUser);
          }
          return false;
        }).length}
      />

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto w-full px-6 py-6 flex-1 flex flex-col">
        
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white font-medium text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* View switching based on activeTab */}
        {activeTab === 'admin' ? (
          <AdminPanel
            auditLogs={auditLogs}
            disputes={disputes}
            auctions={auctions}
            reviews={reviews}
            payments={payments}
            winningOrders={winningOrders}
            onModerateListing={handleModerateListing}
            onResolveDispute={handleResolveDispute}
            onDeleteReview={handleDeleteReview}
            onAcknowledgePayment={handleAcknowledgePayment}
          />
        ) : activeTab === 'tracking' ? (
          <div className="space-y-4">
            <DeliveryTracker
              orders={winningOrders}
              reviews={reviews}
              onUpdateDelivery={handleUpdateDelivery}
              onUpdateAddress={handleUpdateAddress}
              onSubmitReview={handleSubmitReview}
              onOpenPaymentModal={(order) => setSelectedPaymentOrder(order)}
              onOpenDisputeModal={(order) => setSelectedDisputeOrder(order)}
              onAcknowledgePayment={handleAcknowledgePayment}
              currentRole={currentRole}
              currentUser={currentUser}
              showToast={showToast}
            />
          </div>
        ) : activeTab === 'orders' ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" /> Won Bids, Fulfillment & Delivery Tracking
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track your won vehicles in real-time from auction victory to doorstep delivery. Settle payments, monitor checkpoints, or file review/dispute tickets.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('tracking')}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-xs px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Open Full Tracking Portal</span>
              </button>
            </div>

            <div className="space-y-4">
              {(() => {
                const visibleOrders = winningOrders.filter(order => {
                  if (currentRole === 'ADMINISTRATOR') return true;
                  if (currentRole === 'BUYER') {
                    return isOrderForBuyer(order, currentUser);
                  } else if (currentRole === 'SELLER') {
                    return isOrderForSeller(order, currentUser);
                  }
                  return false;
                });

                if (visibleOrders.length === 0) {
                  return (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500 space-y-2">
                      <Package className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                      <p className="font-bold text-slate-700 text-sm">
                        {currentRole === 'BUYER' ? 'No Won Vehicle Orders Found' : 'No Sold Vehicle Orders Found'}
                      </p>
                      <p className="max-w-md mx-auto leading-relaxed">
                        {currentRole === 'BUYER' 
                          ? `This dashboard only displays winning vehicle orders won by your account (${currentUser?.email || 'buyer account'}). Other users cannot view your won vehicles.` 
                          : 'As a seller, you can only view and manage shipments for vehicles you listed and sold. Other sellers\' orders are private.'}
                      </p>
                      {currentRole === 'BUYER' && (
                        <button
                          onClick={() => setActiveTab('bidding')}
                          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <Gavel className="w-3.5 h-3.5" />
                          <span>Explore Live Dealer Bidding</span>
                        </button>
                      )}
                    </div>
                  );
                }

                return visibleOrders.map(order => {
                  const orderDispute = disputes.find(d => (d.winningOrder?.orderId === order.orderId) || (d.orderId === order.orderId));
                  const orderReviews = reviews.filter(r => (r.winningOrder?.orderId === order.orderId) || (r.orderId === order.orderId));
                  const currentDelStatus = order.delivery?.deliveryStatus || 'AWAITING_PAYMENT';
                  const trackingNum = order.delivery?.trackingNumber || 'TRK-Pending';

                  const statusColor = 
                    currentDelStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    currentDelStatus === 'IN_TRANSIT' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    currentDelStatus === 'SHIPPED' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                    currentDelStatus === 'PREPARING_FOR_SHIPMENT' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    'bg-amber-50 text-amber-700 border-amber-200';

                  return (
                    <div key={order.orderId} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all hover:border-slate-300 shadow-xs">
                      <div className="flex-1 space-y-2.5 w-full">
                        <div className="flex items-center gap-2 flex-wrap justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-900 text-sm">
                              {order.auctionListing?.itemName}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase border ${statusColor}`}>
                              {currentDelStatus.replace(/_/g, ' ')}
                            </span>
                          </div>

                          {orderDispute && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              orderDispute.disputeStatus === 'RESOLVED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              Dispute #{orderDispute.disputeId}: {orderDispute.disputeStatus}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span>Order: <strong className="text-slate-700">#{order.orderId}</strong></span>
                          <span>Winning Bid: <strong className="text-slate-900 font-semibold tabular-nums">Rs. {Number(order.winningAmount || 0).toLocaleString()}</strong></span>
                          <span>Carrier: <strong className="text-slate-700">{order.delivery?.carrierName || 'Swift Auto Logistics'}</strong></span>
                          <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 text-[11px]">
                            {trackingNum}
                          </span>
                        </div>

                        {/* Mini Checkpoint Progress Bar */}
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <Truck className="w-3.5 h-3.5 text-slate-500" />
                              Location: <strong>{order.delivery?.currentLocation || 'Seller Dispatch Port'}</strong>
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {currentDelStatus === 'DELIVERED' ? '✓ Delivered' : 'En route'}
                            </span>
                          </div>

                          <div className="grid grid-cols-6 gap-1 pt-0.5">
                            {['Won', 'Paid', 'Prep', 'Shipped', 'Transit', 'Delivered'].map((step, idx) => {
                              const stepDone = 
                                (idx === 0) ||
                                (idx === 1 && (order.orderStatus === 'PAID' || currentDelStatus !== 'AWAITING_PAYMENT')) ||
                                (idx === 2 && (currentDelStatus !== 'AWAITING_PAYMENT')) ||
                                (idx === 3 && (currentDelStatus === 'SHIPPED' || currentDelStatus === 'IN_TRANSIT' || currentDelStatus === 'OUT_FOR_DELIVERY' || currentDelStatus === 'DELIVERED')) ||
                                (idx === 4 && (currentDelStatus === 'IN_TRANSIT' || currentDelStatus === 'OUT_FOR_DELIVERY' || currentDelStatus === 'DELIVERED')) ||
                                (idx === 5 && (currentDelStatus === 'DELIVERED'));

                              return (
                                <div key={step} className="flex flex-col items-center">
                                  <div className={`w-full h-1 rounded-full transition-colors ${stepDone ? 'bg-slate-800' : 'bg-slate-200'}`} />
                                  <span className={`text-[9px] mt-0.5 font-medium ${stepDone ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                                    {step}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {orderReviews.length > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50/70 border border-amber-200 px-2.5 py-1 rounded-md">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                            <span className="font-semibold">Review ({orderReviews[0].rating}★):</span>
                            <span className="text-slate-700 italic">"{orderReviews[0].reviewComment || orderReviews[0].comment}"</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons Column */}
                      <div className="flex flex-wrap lg:flex-col items-stretch gap-1.5 shrink-0 w-full lg:w-44 justify-end">
                        <button
                          onClick={() => setSelectedTrackingOrder(order)}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3 py-2 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5 text-slate-300" />
                          <span>{currentRole === 'SELLER' ? 'Manage Delivery' : 'Track Delivery'}</span>
                        </button>

                        {(order.orderStatus === 'PENDING' || currentDelStatus === 'AWAITING_PAYMENT') && currentRole === 'BUYER' && (
                          <button
                            onClick={() => setSelectedPaymentOrder(order)}
                            className={`w-full font-medium text-xs px-3 py-2 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                              (order.payment?.paymentSlipUrl || order.paymentSlipUrl)
                                ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>
                              {(order.payment?.paymentSlipUrl || order.paymentSlipUrl)
                                ? 'Slip Uploaded (Pending)'
                                : 'Upload Payment Slip'}
                            </span>
                          </button>
                        )}

                        {currentRole === 'ADMINISTRATOR' && (order.orderStatus === 'PROCESSING' || currentDelStatus === 'AWAITING_PAYMENT') && (
                          <button
                            onClick={() => setSelectedPaymentOrder(order)}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs px-3 py-2 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Review Payment Slip</span>
                          </button>
                        )}

                        {currentRole === 'BUYER' && currentDelStatus === 'DELIVERED' && (
                          <button
                            onClick={() => setSelectedTrackingOrder(order)}
                            className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500" />
                            <span>Leave Review</span>
                          </button>
                        )}

                        {currentRole === 'BUYER' && (
                          <button
                            onClick={() => setSelectedDisputeOrder(order)}
                            className="w-full bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 font-medium text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                            <span>Report Dispute</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        ) : activeTab === 'about' ? (
          <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">About Us</span>
              <h2 className="mt-3 text-3xl font-black font-['Outfit'] text-slate-900">Avtomat Vehicle Marketplace</h2>
              <p className="mt-4 text-sm text-slate-600 leading-6">
                Avtomat is a trusted vehicle bidding platform where buyers, sellers, and administrators can discover,
                manage, and complete automotive trading workflows in one secure place.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="font-bold text-slate-900">Buyer Access</div>
                  <div className="text-xs text-slate-500 mt-1">Browse verified inventory, submit live bids within time limits, and win orders.</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="font-bold text-slate-900">Seller Portal</div>
                  <div className="text-xs text-slate-500 mt-1">Create vehicle auctions, select time limits, and submit for admin approval.</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="font-bold text-slate-900">Admin Oversight</div>
                  <div className="text-xs text-slate-500 mt-1">Approve pending listings, resolve buyer dispute tickets, and moderate reviews.</div>
                </div>
              </div>
            </div>
          </section>
        ) : activeTab === 'contact' ? (
          <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Contact Us</span>
              <h2 className="mt-3 text-3xl font-black font-['Outfit'] text-slate-900">Let’s Help You Bid Better</h2>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <div className="text-xs font-bold uppercase text-slate-500">Support Email</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">support@avtomat.com</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <div className="text-xs font-bold uppercase text-slate-500">Phone</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">+1 (555) 482-9100</div>
                </div>
              </div>
              <div className="mt-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl">
                  Request Callback
                </button>
              </div>
            </div>
          </section>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              onResetFilters={() => setFilters({ brand: '', vehicleType: '', transmission: '', minYear: '2020', maxYear: '2026' })}
            />

            <div className="flex-1 space-y-4">
              {/* Seller Dashboard Header & Quick Actions */}
              {activeTab === 'my-listings' && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">
                        Seller Dashboard
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Manage your vehicle listings and live auctions.
                      </p>
                    </div>

                    {/* ONLY available to SELLER (or ADMINISTRATOR) */}
                    {(currentRole === 'SELLER' || currentRole === 'ADMINISTRATOR') && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuctionToEdit(null);
                          setShowCreateModal(true);
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                        title="Create a new vehicle auction listing"
                      >
                        + Create Auction
                      </button>
                    )}
                  </div>

                  {/* Seller Inventory Metrics (Interactive Status Filters) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSellerStatusFilter('ALL')}
                      className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                        sellerStatusFilter === 'ALL'
                          ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-100'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs text-slate-500 font-medium">All Listings</div>
                      <div className="text-lg font-bold text-slate-900 mt-0.5">
                        {auctions.filter(a => isAuctionOwner(a)).length}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSellerStatusFilter('ACTIVE')}
                      className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                        sellerStatusFilter === 'ACTIVE'
                          ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-100'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs text-emerald-700 font-medium">Active (Live)</div>
                      <div className="text-lg font-bold text-slate-900 mt-0.5">
                        {auctions.filter(a => isAuctionOwner(a) && a.status === 'ACTIVE').length}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSellerStatusFilter('PENDING')}
                      className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                        sellerStatusFilter === 'PENDING'
                          ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-100'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs text-amber-700 font-medium">Pending Approval</div>
                      <div className="text-lg font-bold text-slate-900 mt-0.5">
                        {auctions.filter(a => isAuctionOwner(a) && a.status === 'PENDING_APPROVAL').length}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSellerStatusFilter('SOLD')}
                      className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                        sellerStatusFilter === 'SOLD'
                          ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-100'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs text-purple-700 font-medium">Closed / Sold</div>
                      <div className="text-lg font-bold text-slate-900 mt-0.5">
                        {auctions.filter(a => isAuctionOwner(a) && (a.status === 'CLOSED' || a.status === 'COMPLETED' || a.status === 'SOLD')).length}
                      </div>
                    </button>
                  </div>

                  {sellerStatusFilter === 'SOLD' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 text-xs text-purple-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                        <span>
                          Showing <strong>Closed & Sold</strong> vehicles listed by your seller account (<strong>{currentUser?.email}</strong>). These sold auctions are completely hidden from buyer accounts.
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setSellerStatusFilter('ALL')} 
                        className="text-purple-700 font-bold underline hover:text-purple-900 shrink-0 cursor-pointer self-start sm:self-auto"
                      >
                        View All My Listings
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* If seller has pending listings, show advisory in My Listings */}
              {activeTab === 'my-listings' && auctions.some(a => isAuctionOwner(a) && a.status === 'PENDING_APPROVAL') && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                  Listings pending Administrator review will appear to buyers once approved.
                </div>
              )}

              {filteredAuctions.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 text-xs shadow-sm space-y-3">
                  <div className="font-semibold text-slate-700 text-sm">
                    {activeTab === 'my-listings'
                      ? (sellerStatusFilter === 'SOLD'
                          ? 'No sold vehicles found'
                          : sellerStatusFilter === 'ACTIVE'
                          ? 'No active vehicle auctions'
                          : 'No vehicle listings in your inventory')
                      : 'No vehicles found'}
                  </div>
                  <p className="max-w-sm mx-auto">
                    {activeTab === 'my-listings'
                      ? (sellerStatusFilter === 'SOLD'
                          ? 'You do not have any closed or sold vehicle auctions yet under this seller account.'
                          : 'You have not created any vehicle auctions matching this filter yet.')
                      : 'No vehicles match the selected filter criteria.'}
                  </p>
                  {activeTab === 'my-listings' && currentRole === 'SELLER' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuctionToEdit(null);
                        setShowCreateModal(true);
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      + Create Your First Auction
                    </button>
                  )}
                </div>
              ) : (
                filteredAuctions.map(auction => (
                  <AuctionCard
                    key={auction.auctionId}
                    auction={auction}
                    onOpenBidModal={(auctionToBid) => setSelectedBidAuction(auctionToBid)}
                    onToggleWatchlist={handleToggleWatchlist}
                    isWatchlisted={watchlist.includes(auction.auctionId)}
                    currentRole={currentRole}
                    currentUser={currentUser}
                    onEditAuction={handleEditAuction}
                    onDeleteAuction={handleDeleteAuction}
                    onEndAuction={handleEndAuction}
                    onViewOrders={() => setActiveTab('orders')}
                  />
                ))
              )}
            </div>
          </div>
        )}

      </main>

      {/* Modals */}
      {selectedBidAuction && (
        <BidModal
          auction={selectedBidAuction}
          onClose={() => setSelectedBidAuction(null)}
          onSubmitBid={handlePlaceBid}
        />
      )}

      {showCreateModal && (
        <CreateAuctionModal
          onClose={() => {
            setShowCreateModal(false);
            setAuctionToEdit(null);
          }}
          onCreateListing={handleCreateListing}
          onUpdateListing={handleUpdateListing}
          onDeleteListing={handleDeleteAuction}
          auctionToEdit={auctionToEdit}
          currentUser={currentUser}
        />
      )}

      {selectedPaymentOrder && (
        <PaymentModal
          order={selectedPaymentOrder}
          onClose={() => setSelectedPaymentOrder(null)}
          onProcessPayment={handleProcessPayment}
          onAcknowledgePayment={handleAcknowledgePayment}
          currentRole={currentRole}
        />
      )}

      {selectedReviewOrder && (
        <ReviewModal
          order={selectedReviewOrder}
          onClose={() => setSelectedReviewOrder(null)}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {selectedDisputeOrder && (
        <DisputeModal
          order={selectedDisputeOrder}
          onClose={() => setSelectedDisputeOrder(null)}
          onSubmitDispute={handleSubmitDispute}
        />
      )}

      {selectedTrackingOrder && (
        <DeliveryTracker
          orders={winningOrders}
          reviews={reviews}
          activeOrderId={selectedTrackingOrder.orderId}
          onClose={() => setSelectedTrackingOrder(null)}
          isModal={true}
          onUpdateDelivery={handleUpdateDelivery}
          onUpdateAddress={handleUpdateAddress}
          onSubmitReview={handleSubmitReview}
          onOpenPaymentModal={(order) => {
            setSelectedTrackingOrder(null);
            setSelectedPaymentOrder(order);
          }}
          onOpenDisputeModal={(order) => {
            setSelectedTrackingOrder(null);
            setSelectedDisputeOrder(order);
          }}
          onAcknowledgePayment={handleAcknowledgePayment}
          currentRole={currentRole}
          currentUser={currentUser}
          showToast={showToast}
        />
      )}

    </div>
  );
}
