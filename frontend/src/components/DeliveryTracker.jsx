import React, { useState } from 'react';
import { 
  Truck, Package, CheckCircle, Clock, MapPin, ArrowRight, ShieldCheck, 
  Copy, Check, ExternalLink, RefreshCw, AlertTriangle, Calendar, Phone, 
  User, Car, Gavel, CreditCard, ChevronRight, FileText, Printer, Search,
  Navigation, Eye, Sparkles, Send, Edit3, X, Star, MessageSquare, ShieldAlert, Upload
} from 'lucide-react';
import { isOrderForBuyer, isOrderForSeller } from '../utils/orderOwnership';

const TRACKING_STAGES = [
  { key: 'AUCTION_WON', label: 'Bid Won', icon: Gavel, desc: 'Buyer won the auction bid' },
  { key: 'PAID', label: 'Payment Verified', icon: CreditCard, desc: 'Escrow payment acknowledged & confirmed' },
  { key: 'PREPARING_FOR_SHIPMENT', label: 'Vehicle Prep', icon: Package, desc: 'Pre-shipment inspection & paperwork' },
  { key: 'SHIPPED', label: 'Dispatched', icon: Truck, desc: 'Loaded onto carrier transporter' },
  { key: 'IN_TRANSIT', label: 'In Transit', icon: Navigation, desc: 'En route through transit checkpoints' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: MapPin, desc: 'Local carrier out for destination handover' },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle, desc: 'Vehicle delivered & handover signed' }
];

export default function DeliveryTracker({
  orders = [],
  reviews = [],
  activeOrderId = null,
  onClose = null,
  isModal = false,
  onUpdateDelivery = null,
  onUpdateAddress = null,
  onSubmitReview = null,
  onOpenPaymentModal = null,
  onOpenDisputeModal = null,
  currentRole = 'BUYER',
  currentUser = null,
  showToast = () => {}
}) {
  const currentUserId = currentUser?.userId || currentUser?.id || (currentRole === 'SELLER' ? 2 : 3);
  const currentUserEmail = currentUser?.email || (currentRole === 'SELLER' ? 'seller.callour@bidding.com' : 'buyer.dilini@bidding.com');

  // Validation 1: Administrator cannot view delivery tracking
  if (currentRole === 'ADMINISTRATOR') {
    return (
      <div className={`${isModal ? 'fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4' : 'w-full'}`}>
        <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-xl mx-auto shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 font-['Outfit']">
            Administrator Access Restriction
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            Vehicle delivery tracking and carrier dispatch controls are restricted to the <strong>winning buyer</strong> and the <strong>seller who sold the vehicle</strong>. Administrators can monitor transactions, audit logs, and dispute resolutions in the Admin Portal.
          </p>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  // Validation 2: Filter orders strictly by ownership:
  // - Buyer can ONLY see orders where they are the winning buyer.
  // - Seller can ONLY see orders where they are the seller who sold that auction listing.
  const authorizedOrders = orders.filter(order => {
    if (currentRole === 'ADMINISTRATOR') return true;
    if (currentRole === 'BUYER') {
      return isOrderForBuyer(order, currentUser);
    } else if (currentRole === 'SELLER') {
      return isOrderForSeller(order, currentUser);
    }
    return false;
  });

  const [selectedOrderId, setSelectedOrderId] = useState(
    activeOrderId || (authorizedOrders.length > 0 ? authorizedOrders[0].orderId : null)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTracking, setCopiedTracking] = useState(false);
  
  // Destination Address Editing (Buyer exclusive)
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Carrier Management Checkpoint modal (Sold seller exclusive)
  const [showCheckpointModal, setShowCheckpointModal] = useState(false);
  const [customCheckpoint, setCustomCheckpoint] = useState({
    title: 'Regional Logistics Hub Checkpoint Scan',
    location: 'Central Transit Hub - Terminal 3',
    description: 'Vehicle GPS verified. Multi-point transporter security check passed.',
    status: 'IN_TRANSIT'
  });

  // Carrier Info Edit Modal (Sold seller exclusive)
  const [showCarrierModal, setShowCarrierModal] = useState(false);
  const [carrierData, setCarrierData] = useState({
    carrierName: 'Swift Auto Logistics',
    trackingNumber: '',
    estimatedDays: '4'
  });

  // Review & Comments Section State (Delivered status)
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewCommentText, setReviewCommentText] = useState('');
  const [isEditingExistingReview, setIsEditingExistingReview] = useState(false);

  // Active Selected Order from authorized list
  const activeOrder = authorizedOrders.find(o => 
    String(o.orderId) === String(selectedOrderId) || 
    (o.delivery && o.delivery.trackingNumber && o.delivery.trackingNumber.toLowerCase() === String(selectedOrderId).toLowerCase())
  ) || authorizedOrders[0] || null;

  const delivery = activeOrder?.delivery || {};
  const listing = activeOrder?.auctionListing || {};

  // Check if current user is the specific winning buyer or the specific sold seller
  const isWinningBuyer = currentRole === 'BUYER' && activeOrder && (
    (activeOrder.buyer?.userId && Number(activeOrder.buyer.userId) === Number(currentUserId)) ||
    (activeOrder.buyer?.email && activeOrder.buyer.email.toLowerCase() === currentUserEmail.toLowerCase()) ||
    (!currentUser && activeOrder.buyer?.userId === 3)
  );

  const isSoldSeller = currentRole === 'SELLER' && activeOrder && (
    (activeOrder.seller?.userId && Number(activeOrder.seller.userId) === Number(currentUserId)) ||
    (activeOrder.seller?.email && activeOrder.seller.email.toLowerCase() === currentUserEmail.toLowerCase()) ||
    (activeOrder.auctionListing?.seller?.userId && Number(activeOrder.auctionListing.seller.userId) === Number(currentUserId)) ||
    (!currentUser && (activeOrder.seller?.userId === 2 || activeOrder.auctionListing?.seller?.userId === 2))
  );

  // Existing Review for this order (if any)
  const orderReview = reviews.find(r => 
    (r.winningOrder?.orderId === activeOrder?.orderId) || 
    (r.orderId === activeOrder?.orderId)
  );

  // Determine active stage index (0 to 6)
  const getStageIndex = (delStatus, ordStatus) => {
    if (delStatus === 'DELIVERED' || ordStatus === 'DELIVERED' || ordStatus === 'COMPLETED') return 6;
    if (delStatus === 'OUT_FOR_DELIVERY') return 5;
    if (delStatus === 'IN_TRANSIT') return 4;
    if (delStatus === 'SHIPPED' || ordStatus === 'SHIPPED') return 3;
    if (delStatus === 'PREPARING_FOR_SHIPMENT') return 2;
    if (ordStatus === 'PAID') return 1;
    return 0; // AUCTION_WON / AWAITING_PAYMENT
  };

  const currentStageIndex = getStageIndex(delivery.deliveryStatus, activeOrder?.orderStatus);

  const handleCopyTracking = (trackNum) => {
    if (!trackNum) return;
    navigator.clipboard.writeText(trackNum);
    setCopiedTracking(true);
    showToast('Tracking number copied to clipboard: ' + trackNum);
    setTimeout(() => setCopiedTracking(false), 2500);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    // Check if shipment exists in user's authorized shipments
    const found = authorizedOrders.find(o => 
      String(o.orderId) === query || 
      (o.delivery?.trackingNumber && o.delivery.trackingNumber.toLowerCase() === query) ||
      (o.auctionListing?.itemName && o.auctionListing.itemName.toLowerCase().includes(query))
    );

    if (found) {
      setSelectedOrderId(found.orderId);
      showToast(`Tracking record loaded for Order #${found.orderId}`);
    } else {
      // Check if it exists in system but belongs to another user
      const existsElsewhere = orders.some(o => 
        String(o.orderId) === query || 
        (o.delivery?.trackingNumber && o.delivery.trackingNumber.toLowerCase() === query)
      );

      if (existsElsewhere) {
        showToast('Access Denied: You do not have permission to view other users\' shipment tracking.');
      } else {
        showToast(`No shipment found matching "${searchQuery}".`);
      }
    }
  };

  const handleSaveAddress = () => {
    if (!newAddress.trim()) {
      showToast('Please enter a valid shipping address.');
      return;
    }
    if (onUpdateAddress && activeOrder) {
      onUpdateAddress(activeOrder.orderId, newAddress, newPhone);
    }
    setIsEditingAddress(false);
    showToast('Delivery address updated successfully!');
  };

  // Sold Seller: Advance Stage
  const handleAdvanceStage = () => {
    if (!isSoldSeller) {
      showToast('Access Denied: Only the seller who sold this vehicle can manage delivery stages.');
      return;
    }
    if (!onUpdateDelivery || !activeOrder) return;

    if (currentStageIndex === 0 && activeOrder?.orderStatus !== 'PAID') {
      showToast('Action Blocked: Buyer bank deposit slip must first be approved by Administrator before delivery can start.');
      return;
    }

    const stagesInOrder = [
      { del: 'AWAITING_PAYMENT', ord: 'PENDING' },
      { del: 'PREPARING_FOR_SHIPMENT', ord: 'PAID' },
      { del: 'PREPARING_FOR_SHIPMENT', ord: 'PAID' },
      { del: 'SHIPPED', ord: 'SHIPPED' },
      { del: 'IN_TRANSIT', ord: 'SHIPPED' },
      { del: 'OUT_FOR_DELIVERY', ord: 'SHIPPED' },
      { del: 'DELIVERED', ord: 'DELIVERED' }
    ];

    const nextIndex = Math.min(currentStageIndex + 1, stagesInOrder.length - 1);
    const nextStage = stagesInOrder[nextIndex];

    const locations = [
      'Seller Depot - Vehicle Bay',
      'Escrow Verification Center',
      'Seller Inspection Bay - Colombo',
      'Dispatched - Express Auto Highway Port',
      'Central Transit Hub - Kandy Checkpoint A1',
      'Local Distribution Facility - Out on Carrier',
      'Buyer Destination - Handover Completed'
    ];

    onUpdateDelivery(activeOrder.orderId, {
      status: nextStage.del,
      orderStatus: nextStage.ord,
      currentLocation: locations[nextIndex],
      notes: `Seller confirmed stage update to: ${TRACKING_STAGES[nextIndex].label} at ${locations[nextIndex]}`,
      milestoneTitle: `${TRACKING_STAGES[nextIndex].label} Verified by Seller`,
      userId: currentUserId,
      role: currentRole
    });

    showToast(`Shipment advanced to: ${TRACKING_STAGES[nextIndex].label}!`);
  };

  // Sold Seller: Add Custom Milestone
  const handleAddCustomMilestone = (e) => {
    e.preventDefault();
    if (!isSoldSeller) {
      showToast('Access Denied: Only the seller who sold this vehicle can log checkpoints.');
      return;
    }
    if (!onUpdateDelivery || !activeOrder) return;

    onUpdateDelivery(activeOrder.orderId, {
      status: customCheckpoint.status,
      currentLocation: customCheckpoint.location,
      notes: customCheckpoint.description,
      milestoneTitle: customCheckpoint.title,
      userId: currentUserId,
      role: currentRole
    });

    setShowCheckpointModal(false);
    showToast('New tracking checkpoint added to delivery timeline!');
  };

  // Sold Seller: Save Carrier Info
  const handleSaveCarrierInfo = (e) => {
    e.preventDefault();
    if (!isSoldSeller || !onUpdateDelivery || !activeOrder) return;

    const days = parseInt(carrierData.estimatedDays) || 4;
    const eta = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    onUpdateDelivery(activeOrder.orderId, {
      status: delivery.deliveryStatus || 'PREPARING_FOR_SHIPMENT',
      carrierName: carrierData.carrierName,
      trackingNumber: carrierData.trackingNumber || delivery.trackingNumber,
      estimatedDeliveryDate: eta,
      notes: `Carrier assigned: ${carrierData.carrierName}. Tracking #: ${carrierData.trackingNumber || delivery.trackingNumber}`,
      milestoneTitle: 'Carrier Assigned & Scheduled',
      userId: currentUserId,
      role: currentRole
    });

    setShowCarrierModal(false);
    showToast('Carrier details and tracking number updated!');
  };

  // Buyer: Submit Review & Comments upon delivery
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!isWinningBuyer) {
      showToast('Access Denied: Only the buyer who won this bid can leave reviews and comments.');
      return;
    }
    if (!reviewCommentText.trim()) {
      showToast('Please provide your comments or feedback before submitting.');
      return;
    }

    if (onSubmitReview && activeOrder) {
      onSubmitReview(activeOrder.orderId, reviewRating, reviewCommentText.trim());
      setIsEditingExistingReview(false);
      showToast('Thank you! Your delivery handover review and comments have been recorded.');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // If no authorized orders for this user
  if (authorizedOrders.length === 0) {
    return (
      <div className={`${isModal ? 'fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4' : 'w-full'}`}>
        <div className="bg-white border border-slate-200 rounded-xl p-10 max-w-xl mx-auto shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 font-['Outfit']">
            {currentRole === 'BUYER' ? 'No Won Vehicle Deliveries Yet' : 'No Sold Vehicle Shipments to Manage'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {currentRole === 'BUYER' 
              ? 'Only auctions you have won as a buyer can be tracked here. Once an auction closes and you win the bid, live delivery tracking will appear automatically.'
              : 'Only vehicle auctions you have listed and sold can be managed here. Other sellers cannot view or manage your shipments.'}
          </p>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  // Destination address & contact
  const currentAddress = delivery.deliveryAddress || 'Pending Buyer Address Confirmation';
  const currentPhone = delivery.recipientPhone || activeOrder.buyer?.phoneNumber || '+94 77 456 7890';

  // Build milestones list: if none present from backend, synthesize clean standard milestones based on current stage
  const milestones = (delivery.milestones && delivery.milestones.length > 0) ? delivery.milestones : [
    {
      title: 'Auction Won & Order Placed',
      description: `Buyer won the auction bid for ${listing.itemName || 'vehicle'} at $${(activeOrder.winningAmount || 0).toLocaleString()}.`,
      location: 'Avtomat Bidding Engine',
      status: 'AWAITING_PAYMENT',
      timestamp: activeOrder.orderDate || new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
    },
    ...(currentStageIndex >= 1 ? [{
      title: 'Payment Cleared & Escrow Verified',
      description: 'Transaction settled and funds secured in escrow vault. Seller notified to initiate transport logistics.',
      location: 'Settlement Clearinghouse',
      status: 'PREPARING_FOR_SHIPMENT',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }] : []),
    ...(currentStageIndex >= 2 ? [{
      title: 'Vehicle Prep & Title Clearance',
      description: 'Seller completed pre-dispatch mechanical checklist, roadworthiness verification, and vehicle title documentation.',
      location: 'Seller Inspection Depot',
      status: 'PREPARING_FOR_SHIPMENT',
      timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
    }] : []),
    ...(currentStageIndex >= 3 ? [{
      title: 'Carrier Picked Up & Dispatched',
      description: `Loaded onto ${delivery.carrierName || 'Swift Auto Logistics'} enclosed transporter. Waybill & GPS beacon activated.`,
      location: 'Seller Logistics Port',
      status: 'SHIPPED',
      timestamp: delivery.shippedDate || new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    }] : []),
    ...(currentStageIndex >= 4 ? [{
      title: 'In Transit - Highway Checkpoint Scan',
      description: `Transporter verified at ${delivery.currentLocation || 'Central Highway Hub'}. Vehicle secured on transit bed.`,
      location: delivery.currentLocation || 'Central Transit Hub Checkpoint',
      status: 'IN_TRANSIT',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    }] : []),
    ...(currentStageIndex >= 5 ? [{
      title: 'Out for Final Delivery',
      description: 'Vehicle arrived at local delivery terminal. Dispatched on flatbed truck for final handover to buyer.',
      location: 'Local Regional Terminal',
      status: 'OUT_FOR_DELIVERY',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }] : []),
    ...(currentStageIndex >= 6 ? [{
      title: 'Delivered & Handover Confirmed',
      description: 'Vehicle successfully delivered to destination. Handover inspected and delivery completed.',
      location: currentAddress,
      status: 'DELIVERED',
      timestamp: delivery.deliveredDate || new Date().toISOString()
    }] : [])
  ];

  return (
    <div className={`${isModal ? 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto' : 'w-full'}`}>
      <div className={`bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden w-full ${isModal ? 'max-w-4xl max-h-[92vh] flex flex-col my-auto' : 'max-w-6xl mx-auto'}`}>
        
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Truck className="w-4 h-4 text-slate-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                  {isSoldSeller ? 'Seller Fulfillment & Dispatch' : 'Live Delivery Tracking'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-mono text-slate-300">
                  Order #{activeOrder.orderId}
                </span>
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {listing.itemName || 'Vehicle Shipment'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Switch Order Dropdown if multiple authorized orders exist */}
            {authorizedOrders.length > 1 && (
              <div className="hidden sm:block">
                <select
                  value={activeOrder.orderId}
                  onChange={(e) => setSelectedOrderId(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
                >
                  {authorizedOrders.map(o => (
                    <option key={o.orderId} value={o.orderId}>
                      Order #{o.orderId} - {o.auctionListing?.itemName?.substring(0, 22)}...
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handlePrintReceipt}
              title="Print Tracking Slip / Bill of Lading"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            >
              <Printer className="w-4 h-4" />
            </button>

            {isModal && onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Ownership Verification Banner */}
        <div className={`px-6 py-2.5 text-xs flex items-center justify-between gap-3 border-b ${
          isSoldSeller 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              {isSoldSeller 
                ? 'Authorized Seller Access: You listed and sold this vehicle. You have permission to manage tracking and dispatch.' 
                : 'Winning Buyer Access: You won this auction bid. You have permission to track this vehicle delivery.'}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/70 px-2 py-0.5 rounded border border-current">
            {currentRole}
          </span>
        </div>

        {/* Search Bar for user's shipments */}
        {!isModal && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your tracking number (e.g. TRK-98124) or Order ID..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-24 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition-all shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold px-3 py-1 rounded-lg transition-colors"
              >
                Track
              </button>
            </form>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Your Shipments:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-md py-1">
                {authorizedOrders.map(o => (
                  <button
                    key={o.orderId}
                    onClick={() => setSelectedOrderId(o.orderId)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                      o.orderId === activeOrder.orderId
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    #{o.orderId} • {o.delivery?.trackingNumber || 'TRK-Pending'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">

          {/* Top Hero Card: Vehicle Summary & Live Tracking Highlights */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
              
              {/* Left Column: Vehicle & Winner Badge */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide border flex items-center gap-1.5 ${
                    currentStageIndex === 6
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : currentStageIndex >= 3
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {TRACKING_STAGES[currentStageIndex].label}
                  </span>
                  <span className="text-xs text-slate-400">
                    Est. Arrival: <strong className="text-slate-200">
                      {delivery.estimatedDeliveryDate 
                        ? new Date(delivery.estimatedDeliveryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                        : '3-5 Business Days'}
                    </strong>
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {listing.itemName || 'Vehicle Shipment'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    VIN: <span className="font-mono text-slate-300">{listing.vinNumber || 'WPOAB2A99MS123847'}</span> • {listing.vehicleType || 'Coupe'} ({listing.color || 'Standard Finish'})
                  </p>
                </div>

                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <span>Winning Bid Settlement:</span>
                  <span className="font-bold text-emerald-400 text-sm tabular-nums">
                    Rs. {(activeOrder.winningAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Middle Column: Tracking Code & Carrier Card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4 space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold flex items-center justify-between">
                  <span>Carrier & Tracking</span>
                  {isSoldSeller && currentStageIndex < 6 && (
                    <button
                      onClick={() => {
                        setCarrierData({
                          carrierName: delivery.carrierName || 'Swift Auto Logistics',
                          trackingNumber: delivery.trackingNumber || '',
                          estimatedDays: '4'
                        });
                        setShowCarrierModal(true);
                      }}
                      className="text-[10px] text-blue-300 hover:text-white flex items-center gap-1 underline underline-offset-2"
                    >
                      <Edit3 className="w-3 h-3" /> Edit Carrier
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 bg-slate-900/60 rounded-lg p-2.5 border border-white/10">
                  <div className="font-mono text-sm font-bold text-white tracking-wider truncate">
                    {delivery.trackingNumber || 'TRK-' + (activeOrder.orderId * 1000 + 492)}
                  </div>
                  <button
                    onClick={() => handleCopyTracking(delivery.trackingNumber || 'TRK-' + (activeOrder.orderId * 1000 + 492))}
                    className="p-1.5 rounded-md hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                    title="Copy Tracking Number"
                  >
                    {copiedTracking ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1">
                  <span>Carrier: <strong>{delivery.carrierName || 'Swift Auto Logistics'}</strong></span>
                  <span className="text-slate-400">Enclosed Rig</span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center justify-between">
                  <span>Current Hub:</span>
                  <span className="text-emerald-300 font-medium truncate max-w-[150px]">
                    {delivery.currentLocation || 'Seller Dispatch Port'}
                  </span>
                </div>
              </div>

              {/* Right Column: Destination & Recipient */}
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4 space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold flex items-center justify-between">
                  <span>Delivery Address</span>
                  {isWinningBuyer && currentStageIndex < 6 && (
                    <button
                      onClick={() => {
                        setNewAddress(currentAddress);
                        setNewPhone(currentPhone);
                        setIsEditingAddress(true);
                      }}
                      className="text-[10px] text-blue-300 hover:text-blue-200 flex items-center gap-1 underline underline-offset-2"
                    >
                      <Edit3 className="w-3 h-3" /> Change
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-200 font-medium leading-relaxed bg-slate-900/60 rounded-lg p-2.5 border border-white/10">
                  <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    {activeOrder.buyer?.firstName ? `${activeOrder.buyer.firstName} ${activeOrder.buyer.lastName}` : 'Authorized Buyer'}
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{currentAddress}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 mt-1 text-[11px]">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{currentPhone}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Visual Step Progress Bar (7 Stages) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-600" /> Fulfillment & Transport Journey
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live status updates from auction victory to verified delivery.
                </p>
              </div>

              {/* Progress Percentage Badge */}
              <div className="text-right">
                <span className="text-lg font-extrabold text-blue-600 font-['Outfit']">
                  {Math.round(((currentStageIndex + 1) / TRACKING_STAGES.length) * 100)}%
                </span>
                <span className="text-xs text-slate-400 block -mt-1 font-medium">Completed</span>
              </div>
            </div>

            {/* Stepper Progress Nodes */}
            <div className="relative">
              <div className="absolute top-5 left-6 right-6 h-1 bg-slate-200 -z-0 hidden md:block" />
              <div 
                className="absolute top-5 left-6 h-1 bg-blue-600 transition-all duration-700 ease-out -z-0 hidden md:block"
                style={{ width: `${(currentStageIndex / (TRACKING_STAGES.length - 1)) * 92}%` }}
              />

              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 relative z-10">
                {TRACKING_STAGES.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isDone = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div 
                      key={stage.key} 
                      className={`flex md:flex-col items-center text-left md:text-center gap-3 md:gap-2 p-2 rounded-xl transition-all ${
                        isCurrent ? 'bg-blue-50/70 border border-blue-200/80 shadow-sm' : ''
                      }`}
                    >
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shrink-0 ${
                          isDone 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                            : isCurrent 
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-lg shadow-blue-500/30 animate-pulse' 
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {isDone ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className={`text-xs font-bold ${
                          isCurrent ? 'text-blue-700 font-extrabold' : isDone ? 'text-slate-800' : 'text-slate-400'
                        }`}>
                          {stage.label}
                        </div>
                        <div className="text-[10px] text-slate-500 hidden md:block line-clamp-2 mt-0.5">
                          {stage.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Requirement 3: Dedicated Reviews & Comments Section once DELIVERED */}
          {currentStageIndex === 6 && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow">
                    <Star className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 font-['Outfit'] flex items-center gap-2">
                      Delivery Completed — Buyer Review & Feedback
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        Verified Handover
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600">
                      Vehicle handover has concluded. Leave feedback on the vehicle condition, seller service, and carrier fulfillment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Case A: Buyer has already submitted a review */}
              {orderReview && !isEditingExistingReview ? (
                <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-5 h-5 ${star <= orderReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                        />
                      ))}
                      <span className="font-extrabold text-sm text-slate-800 ml-1.5">
                        {orderReview.rating}.0 / 5.0 Stars
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono">
                      Submitted on: {new Date(orderReview.reviewDate || Date.now()).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs text-slate-700 leading-relaxed italic">
                    "{orderReview.reviewComment || orderReview.comment}"
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-slate-500">
                      Reviewer: <strong>{orderReview.reviewer?.firstName || activeOrder.buyer?.firstName || 'Dilini'} {orderReview.reviewer?.lastName || activeOrder.buyer?.lastName || 'Rathnayake'}</strong> (Buyer)
                    </div>

                    {isWinningBuyer && (
                      <button
                        onClick={() => {
                          setReviewRating(orderReview.rating || 5);
                          setReviewCommentText(orderReview.reviewComment || orderReview.comment || '');
                          setIsEditingExistingReview(true);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Review & Comments
                      </button>
                    )}
                  </div>
                </div>
              ) : isWinningBuyer ? (
                /* Case B: Winning Buyer writing new / edited review */
                <form onSubmit={handleReviewSubmit} className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Your Rating (1 to 5 Stars):
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 hover:scale-110 transition-transform focus:outline-none"
                          >
                            <Star 
                              className={`w-6 h-6 transition-colors ${
                                (hoverRating || reviewRating) >= star 
                                  ? 'fill-amber-400 text-amber-400' 
                                  : 'text-slate-300'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-amber-700 ml-2">
                        {reviewRating === 5 ? '⭐⭐⭐⭐⭐ Exceptional (5/5)' :
                         reviewRating === 4 ? '⭐⭐⭐⭐ Very Good (4/5)' :
                         reviewRating === 3 ? '⭐⭐⭐ Good (3/5)' :
                         reviewRating === 2 ? '⭐⭐ Fair (2/5)' : '⭐ Needs Improvement (1/5)'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Feedback Chips */}
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-500 mb-1">Quick Compliments:</span>
                    <div className="flex items-center gap-2 flex-wrap text-[11px]">
                      {['Accurate Vehicle Description', 'Flawless Showroom Condition', 'Fast Carrier Delivery', 'Transparent Seller Handover', 'Seamless Escrow Payment'].map((tag) => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => {
                            if (!reviewCommentText.includes(tag)) {
                              setReviewCommentText(prev => prev ? `${prev} • ${tag}` : tag);
                            }
                          }}
                          className="bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Your Comments & Review on the Vehicle Handover:
                    </label>
                    <textarea
                      rows={3}
                      value={reviewCommentText}
                      onChange={(e) => setReviewCommentText(e.target.value)}
                      placeholder="Write your honest comments regarding the car condition, the seller's transparency, and delivery transport..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {isEditingExistingReview && (
                      <button
                        type="button"
                        onClick={() => setIsEditingExistingReview(false)}
                        className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      className="ml-auto bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isEditingExistingReview ? 'Update Review & Comments' : 'Post Review & Comments'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Sold Seller viewing delivered order waiting for buyer review */
                <div className="bg-white border border-amber-200 rounded-2xl p-5 text-center text-xs text-slate-500">
                  <MessageSquare className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                  <p className="font-semibold text-slate-700">Awaiting Buyer's Post-Delivery Review</p>
                  <p className="text-[11px] mt-0.5">The winning buyer has received the vehicle and will submit their delivery review and feedback shortly.</p>
                </div>
              )}
            </div>
          )}

          {/* Two-Column Split: Detailed Milestone History & Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left 2 Cols: Chronological Milestone History */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Live Checkpoint & Milestone History
                  </h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {milestones.length} logged checkpoints
                </span>
              </div>

              {/* Timeline list */}
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {milestones.slice().reverse().map((m, idx) => (
                  <div key={idx} className="relative group">
                    <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-125 ${
                      idx === 0 ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-400'
                    }`} />

                    <div className="bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                          <span>{m.title}</span>
                          {idx === 0 && (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800">
                              Latest Scan
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {m.timestamp ? new Date(m.timestamp).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          }) : 'Just now'}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {m.description}
                      </p>

                      {m.location && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-200/60">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Checkpoint Location: <strong>{m.location}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 1 Col: Controls Center */}
            <div className="space-y-4">

              {/* Section 1: Sold Seller Management Controls (Exclusive to the Seller who sold the bid) */}
              {isSoldSeller && (
                <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-200 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-blue-400" /> Seller Dispatch Controls
                    </h4>
                    <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800 font-semibold">
                      Seller Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    As the seller of this vehicle, manage tracking stages, log hub checkpoints, and confirm delivery to buyer.
                  </p>

                  {currentStageIndex < 6 ? (
                    <button
                      onClick={handleAdvanceStage}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Advance to Next Stage</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="text-center py-2 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800 rounded-xl">
                      ✓ Final Stage Reached: Vehicle Delivered
                    </div>
                  )}

                  <button
                    onClick={() => setShowCheckpointModal(true)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs py-2 rounded-xl transition-colors border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Log Carrier Checkpoint Scan
                  </button>

                  <button
                    onClick={() => {
                      setCarrierData({
                        carrierName: delivery.carrierName || 'Swift Auto Logistics',
                        trackingNumber: delivery.trackingNumber || '',
                        estimatedDays: '4'
                      });
                      setShowCarrierModal(true);
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs py-2 rounded-xl transition-colors border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Configure Carrier & Tracking #
                  </button>
                </div>
              )}

              {/* Section 2: Winning Buyer Actions (Exclusive to the Buyer who won the bid) */}
              {isWinningBuyer && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Winning Buyer Portal
                  </h4>

                  {/* If Awaiting Payment or Approval Pending */}
                  {currentStageIndex === 0 && (
                    <>
                      {(activeOrder?.orderStatus === 'PROCESSING' || activeOrder?.payment?.paymentStatus === 'PROCESSING') ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900">
                            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Payment Submitted — Awaiting Administrator Approval</span>
                          </div>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            Your payment has been logged and is currently awaiting <strong>Administrator Review & Approval</strong>. Once accepted, vehicle preparation and delivery tracking will begin immediately.
                          </p>
                          <div className="bg-white/80 border border-amber-200/60 rounded-lg p-2 font-mono text-[11px] text-slate-700 space-y-0.5">
                            <div>Method: <strong className="font-sans text-slate-900">{activeOrder?.payment?.paymentMethod === 'BANK_TRANSFER' ? 'Direct Bank Transfer' : 'Credit / Debit Card'}</strong></div>
                            <div>Ref: <span className="text-blue-700">{activeOrder?.payment?.transactionReference || activeOrder?.transactionReference || 'PENDING-TXN'}</span></div>
                            {activeOrder?.payment?.paymentDetails && (
                              <div className="text-slate-500 font-sans">{activeOrder?.payment?.paymentDetails}</div>
                            )}
                          </div>
                        </div>
                      ) : activeOrder?.payment?.paymentStatus === 'FAILED' ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-red-900">
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                            <span>Payment Rejected by Administrator</span>
                          </div>
                          <p className="text-[11px] text-red-800 leading-relaxed">
                            Reason: {activeOrder?.payment?.adminNotes || 'Verification failed. Please resubmit your payment.'}
                          </p>
                          {onOpenPaymentModal && (
                            <button
                              onClick={() => onOpenPaymentModal(activeOrder)}
                              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <CreditCard className="w-4 h-4" />
                              <span>Resubmit Payment</span>
                            </button>
                          )}
                        </div>
                      ) : onOpenPaymentModal && (
                        <button
                          onClick={() => onOpenPaymentModal(activeOrder)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Complete Payment</span>
                        </button>
                      )}
                    </>
                  )}

                  {/* Update Address Button before delivery */}
                  {currentStageIndex < 6 && (
                    <button
                      onClick={() => {
                        setNewAddress(currentAddress);
                        setNewPhone(currentPhone);
                        setIsEditingAddress(true);
                      }}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Update Destination Address / Contact
                    </button>
                  )}

                  {/* Report Dispute Option */}
                  {onOpenDisputeModal && (
                    <button
                      onClick={() => onOpenDisputeModal(activeOrder)}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Report Issue / Dispute
                    </button>
                  )}
                </div>
              )}

              {/* Carrier Hotline & Support Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2 text-slate-600">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" /> Carrier Dispatch Contact
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Carrier: <strong>{delivery.carrierName || 'Swift Auto Logistics'}</strong>
                </p>
                <div className="font-mono text-slate-800 font-bold bg-white p-2 rounded-lg border border-slate-200">
                  Dispatcher: +94 11 234 5678 (24/7)
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Edit Address Modal (Buyer) */}
      {isEditingAddress && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-slate-900 mb-1 font-['Outfit']">
              Update Delivery Destination Address
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter the exact destination address where the vehicle transporter should deliver the car.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Street Address, City & Postal Code</label>
                <textarea
                  rows={3}
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  placeholder="e.g., No. 45, Galle Road, Colombo 03, Sri Lanka"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone Number for Delivery Driver</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  placeholder="+94 77 123 4567"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow transition-colors"
                >
                  Save Address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Custom Checkpoint Modal (Sold Seller) */}
      {showCheckpointModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddCustomMilestone} className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-slate-900 mb-1 font-['Outfit']">
              Log Carrier Checkpoint Scan
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a real-time transit checkpoint to the shipment tracking audit log for the buyer.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Checkpoint Status</label>
                <select
                  value={customCheckpoint.status}
                  onChange={(e) => setCustomCheckpoint({ ...customCheckpoint, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="PREPARING_FOR_SHIPMENT">Preparing for Shipment</option>
                  <option value="SHIPPED">Shipped / Dispatched</option>
                  <option value="IN_TRANSIT">In Transit Checkpoint</option>
                  <option value="OUT_FOR_DELIVERY">Out for Final Delivery</option>
                  <option value="DELIVERED">Delivered & Completed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Milestone Event Title</label>
                <input
                  type="text"
                  value={customCheckpoint.title}
                  onChange={(e) => setCustomCheckpoint({ ...customCheckpoint, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Checkpoint Location</label>
                <input
                  type="text"
                  value={customCheckpoint.location}
                  onChange={(e) => setCustomCheckpoint({ ...customCheckpoint, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Scan Notes</label>
                <textarea
                  rows={2}
                  value={customCheckpoint.description}
                  onChange={(e) => setCustomCheckpoint({ ...customCheckpoint, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCheckpointModal(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow transition-colors"
                >
                  Log Checkpoint
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Configure Carrier & Tracking Info Modal (Sold Seller) */}
      {showCarrierModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveCarrierInfo} className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-slate-900 mb-1 font-['Outfit']">
              Configure Carrier & Tracking Information
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter courier partner details and assign tracking numbers for the buyer.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Carrier Name / Transport Service</label>
                <input
                  type="text"
                  value={carrierData.carrierName}
                  onChange={(e) => setCarrierData({ ...carrierData, carrierName: e.target.value })}
                  placeholder="e.g., Swift Auto Logistics, FedEx Transport"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Waybill / Tracking Number</label>
                <input
                  type="text"
                  value={carrierData.trackingNumber}
                  onChange={(e) => setCarrierData({ ...carrierData, trackingNumber: e.target.value })}
                  placeholder="e.g., TRK-98124"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Transport Days to Destination</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={carrierData.estimatedDays}
                  onChange={(e) => setCarrierData({ ...carrierData, estimatedDays: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCarrierModal(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow transition-colors"
                >
                  Save Carrier Info
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
