import React, { useState } from 'react';
import { Shield, FileText, AlertTriangle, CheckCircle, Clock, Star, Trash2, CheckCircle2, XCircle, Filter, Car, CreditCard, Building2, Eye, ExternalLink, X, Check } from 'lucide-react';

export default function AdminPanel({ 
  auditLogs = [], 
  disputes = [], 
  auctions = [], 
  reviews = [], 
  payments = [],
  winningOrders = [],
  onModerateListing, 
  onResolveDispute,
  onDeleteReview,
  onAcknowledgePayment
}) {
  const [activeSubTab, setActiveSubTab] = useState('payments'); // 'payments' | 'approvals' | 'disputes' | 'reviews' | 'audit'
  
  // Payment filter & state
  const [paymentFilter, setPaymentFilter] = useState('PENDING_APPROVAL'); // 'ALL' | 'PENDING_APPROVAL' | 'SUCCESSFUL' | 'FAILED'
  const [rejectingPaymentId, setRejectingPaymentId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Listing Approvals filter
  const [listingFilter, setListingFilter] = useState('PENDING_APPROVAL'); // 'ALL' | 'PENDING_APPROVAL' | 'ACTIVE'

  // Dispute resolution state
  const [selectedDisputeId, setSelectedDisputeId] = useState(null);
  const [resolutionText, setResolutionText] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState('RESOLVED');
  const [disputeFilter, setDisputeFilter] = useState('ALL'); // 'ALL' | 'OPEN' | 'RESOLVED'

  // Merge payments from backend and orders for seamless updates
  const combinedPayments = React.useMemo(() => {
    const list = [...payments];
    (winningOrders || []).forEach(order => {
      const orderSlip = order.payment?.paymentSlipUrl || order.paymentSlipUrl;
      const orderTx = order.payment?.transactionReference || order.transactionReference;
      const orderStatus = order.payment?.paymentStatus || (order.orderStatus === 'PAID' ? 'SUCCESSFUL' : (order.orderStatus === 'PROCESSING' ? 'PROCESSING' : 'PENDING'));
      const hasExisting = list.some(p => (p.winningOrder?.orderId === order.orderId) || (p.orderId === order.orderId) || (p.paymentId && order.payment?.paymentId && p.paymentId === order.payment?.paymentId));
      if (!hasExisting && (orderSlip || order.orderStatus === 'PROCESSING' || order.orderStatus === 'PAID')) {
        list.push({
          paymentId: order.payment?.paymentId || order.orderId,
          winningOrder: order,
          paymentAmount: order.winningAmount,
          paymentDate: order.payment?.paymentDate || order.orderDate || new Date().toISOString(),
          paymentMethod: 'PAYMENT_SLIP',
          paymentStatus: orderStatus,
          transactionReference: orderTx || 'SLIP-' + order.orderId,
          paymentSlipUrl: orderSlip,
          adminNotes: order.payment?.adminNotes
        });
      }
    });
    return list;
  }, [payments, winningOrders]);

  const pendingPaymentsCount = combinedPayments.filter(p => p.paymentStatus === 'PROCESSING' || p.paymentStatus === 'PENDING').length;
  const pendingAuctionsCount = auctions.filter(a => a.status === 'PENDING_APPROVAL').length;
  const openDisputesCount = disputes.filter(d => (d.disputeStatus || 'OPEN') === 'OPEN').length;

  const filteredPayments = combinedPayments.filter(p => {
    if (paymentFilter === 'ALL') return true;
    if (paymentFilter === 'PENDING_APPROVAL') return p.paymentStatus === 'PROCESSING' || p.paymentStatus === 'PENDING';
    if (paymentFilter === 'SUCCESSFUL') return p.paymentStatus === 'SUCCESSFUL';
    if (paymentFilter === 'FAILED') return p.paymentStatus === 'FAILED';
    return true;
  });

  const filteredAuctions = auctions.filter(a => {
    if (listingFilter === 'ALL') return true;
    return a.status === listingFilter;
  });

  const filteredDisputes = disputes.filter(d => {
    if (disputeFilter === 'ALL') return true;
    if (disputeFilter === 'OPEN') return (d.disputeStatus || 'OPEN') === 'OPEN';
    if (disputeFilter === 'RESOLVED') return (d.disputeStatus || '') === 'RESOLVED';
    return true;
  });

  // Calculate review stats
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-5 font-sans">
      
      {/* Admin Header & Navigation Sub-Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 font-display">Administrator Oversight & Operations</h1>
            <p className="text-xs text-slate-500">Verify buyer payment slips, approve listings, resolve disputes, oversee reviews, and inspect audit trails.</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs flex-wrap">
          <button
            type="button"
            onClick={() => setActiveSubTab('payments')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'payments' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-purple-600" />
            <span>Payment Slips</span>
            {pendingPaymentsCount > 0 && (
              <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                {pendingPaymentsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('approvals')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'approvals' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Listing Approvals</span>
            {pendingAuctionsCount > 0 && (
              <span className="bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                {pendingAuctionsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('disputes')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'disputes' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>Dispute Tickets</span>
            {openDisputesCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                {openDisputesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('reviews')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'reviews' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>Reviews ({reviews.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'audit' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Audit Logs ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB: Buyer Payment Slip Approvals (Admin Verification) */}
      {/* ========================================================= */}
      {activeSubTab === 'payments' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>Buyer Bank Payment Slip Verification Queue</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect buyer bank payment slips. Approving a slip confirms funds, marks order as <strong>PAID</strong>, and begins vehicle delivery.
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setPaymentFilter('PENDING_APPROVAL')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  paymentFilter === 'PENDING_APPROVAL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending ({pendingPaymentsCount})
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter('SUCCESSFUL')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  paymentFilter === 'SUCCESSFUL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Approved ({combinedPayments.filter(p => p.paymentStatus === 'SUCCESSFUL').length})
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter('FAILED')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  paymentFilter === 'FAILED' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rejected ({combinedPayments.filter(p => p.paymentStatus === 'FAILED').length})
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  paymentFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({combinedPayments.length})
              </button>
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600">No payments in this filter.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">When buyers win bids and submit payments, they will appear here for verification.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredPayments.map(payment => {
                const order = payment.winningOrder || {};
                const isPending = payment.paymentStatus === 'PROCESSING' || payment.paymentStatus === 'PENDING';
                const isApproved = payment.paymentStatus === 'SUCCESSFUL';
                const isRejected = payment.paymentStatus === 'FAILED';

                return (
                  <div 
                    key={payment.paymentId || order.orderId}
                    className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-all bg-white flex flex-col md:flex-row gap-4 items-start justify-between shadow-xs"
                  >
                    {/* Left: Payment Method & Details (Strategy Pattern) */}
                    <div className="w-full md:w-56 shrink-0 space-y-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Payment Method</span>
                        <span className="font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                          {payment.transactionReference || 'TXN-REF'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-xs pt-1">
                        {payment.paymentMethod === 'BANK_TRANSFER' ? (
                          <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                        ) : (
                          <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                        <span>{payment.paymentMethod === 'BANK_TRANSFER' ? 'Direct Bank Transfer' : 'Credit / Debit Card'}</span>
                      </div>

                      <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200/80 break-words leading-relaxed font-mono">
                        {payment.paymentDetails || (payment.paymentMethod === 'BANK_TRANSFER' ? 'Escrow bank transfer' : 'Card payment verified')}
                      </div>
                    </div>

                    {/* Middle: Order and Buyer Details */}
                    <div className="flex-1 space-y-2 text-xs w-full">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900">
                          {order.auctionListing?.itemName || 'Vehicle Auction Item'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          Order #{order.orderId || payment.orderId}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase border ${
                          isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          isRejected ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending Verification'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 bg-slate-50/60 border border-slate-100 p-2.5 rounded-lg">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Buyer</span>
                          <span className="font-medium text-slate-800">
                            {order.buyer?.firstName} {order.buyer?.lastName} ({order.buyer?.email || 'Buyer'})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Seller</span>
                          <span className="font-medium text-slate-800">
                            {order.seller?.firstName} {order.seller?.lastName} ({order.seller?.email || 'Seller'})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Submitted At</span>
                          <span className="text-slate-700">
                            {payment.paymentDate ? new Date(payment.paymentDate).toLocaleString() : 'Recent'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Payment Method</span>
                          <span className="text-slate-800 font-medium">
                            {payment.paymentMethod === 'BANK_TRANSFER' ? 'Direct Bank Transfer' : 'Credit / Debit Card'}
                          </span>
                        </div>
                      </div>

                      {payment.adminNotes && (
                        <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-[11px] text-slate-700">
                          <strong className="text-slate-900">Admin Review Note:</strong> {payment.adminNotes}
                        </div>
                      )}

                      {/* Reject note input if user is actively rejecting this payment */}
                      {rejectingPaymentId === (payment.paymentId || order.orderId) && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg space-y-2 mt-2">
                          <label className="block font-semibold text-red-900 text-[11px]">
                            Enter Rejection Reason for Buyer:
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Payment verification failed, details do not match..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full bg-white border border-red-300 rounded-md px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-red-600"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onAcknowledgePayment(payment.paymentId || order.orderId, false, rejectReason || 'Payment rejected by administrator');
                                setRejectingPaymentId(null);
                                setRejectReason('');
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-1.5 rounded-md text-xs shadow-xs cursor-pointer"
                            >
                              Confirm Rejection
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingPaymentId(null);
                                setRejectReason('');
                              }}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-2.5 py-1.5 rounded-md text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Amount & Actions */}
                    <div className="w-full md:w-52 shrink-0 flex flex-col justify-between items-end text-right space-y-2.5">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">Winning Amount</span>
                        <span className="text-lg font-bold text-slate-900 tabular-nums block mt-0.5">
                          Rs. {Number(payment.paymentAmount || order.winningAmount || 0).toLocaleString()}
                        </span>
                      </div>

                      {isPending && rejectingPaymentId !== (payment.paymentId || order.orderId) && (
                        <div className="w-full space-y-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => onAcknowledgePayment(payment.paymentId || order.orderId, true, 'Payment verified and approved by Administrator')}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1.5 rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Accept Payment</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingPaymentId(payment.paymentId || order.orderId);
                              setRejectReason('');
                            }}
                            className="w-full bg-white hover:bg-slate-50 text-red-600 border border-slate-200 font-medium py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Reject Payment
                          </button>
                        </div>
                      )}

                      {isApproved && (
                        <div className="w-full bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-center text-xs text-emerald-800 font-medium">
                          ✓ Delivery in Progress
                        </div>
                      )}

                      {isRejected && (
                        <div className="w-full bg-red-50 border border-red-200 rounded-lg p-2 text-center text-xs text-red-800 font-medium">
                          ✗ Slip Rejected
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 1: Listing Approvals (Feature 02) */}
      {/* ========================================================= */}
      {activeSubTab === 'approvals' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Seller Listing Moderation Queue</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Auctions with <strong>PENDING_APPROVAL</strong> must be accepted by Admin before becoming live for buyers.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setListingFilter('PENDING_APPROVAL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  listingFilter === 'PENDING_APPROVAL' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending Approval ({pendingAuctionsCount})
              </button>
              <button
                type="button"
                onClick={() => setListingFilter('ACTIVE')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  listingFilter === 'ACTIVE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active ({auctions.filter(a => a.status === 'ACTIVE').length})
              </button>
              <button
                type="button"
                onClick={() => setListingFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  listingFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({auctions.length})
              </button>
            </div>
          </div>

          {filteredAuctions.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs">
              No auctions match the <strong>{listingFilter}</strong> filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Auction ID</th>
                    <th className="p-3">Vehicle Details</th>
                    <th className="p-3">Seller (Dealer)</th>
                    <th className="p-3">Starting Bid</th>
                    <th className="p-3">Time Limit</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuctions.map(a => {
                    const isPending = a.status === 'PENDING_APPROVAL';
                    return (
                      <tr key={a.auctionId} className={`hover:bg-slate-50 transition-colors ${isPending ? 'bg-amber-50/30' : ''}`}>
                        <td className="p-3 font-mono text-slate-500 font-semibold">#{a.auctionId}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{a.itemName}</div>
                          <div className="text-[11px] text-slate-500">
                            {a.brand} {a.model} • {a.vehicleType} • {a.yearManufactured || '2023'}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-slate-800">
                            {a.seller?.firstName ? `${a.seller.firstName} ${a.seller.lastName}` : 'Dealer'}
                          </div>
                          <div className="text-[11px] text-slate-400">{a.seller?.email || 'dealer@bidding.com'}</div>
                        </td>
                        <td className="p-3 font-semibold text-emerald-700 font-mono">
                          ${(a.startingBid || 0).toLocaleString()}
                        </td>
                        <td className="p-3 text-slate-600 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" />
                            {a.durationHours ? `${a.durationHours} Hours` : '5 Days'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            a.status === 'ACTIVE' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : a.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isPending ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onModerateListing(a.auctionId, 'APPROVE')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-xs flex items-center gap-1"
                                  title="Approve listing so buyers can start bidding"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Accept & Activate</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onModerateListing(a.auctionId, 'REJECT')}
                                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1"
                                  title="Reject this vehicle auction"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </>
                            ) : a.status === 'ACTIVE' ? (
                              <button
                                type="button"
                                onClick={() => onModerateListing(a.auctionId, 'REJECT')}
                                className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors"
                              >
                                Suspend / Close
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">No Action Needed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: Dispute Oversight Dashboard (Feature 03) */}
      {/* ========================================================= */}
      {activeSubTab === 'disputes' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Buyer Dispute Tickets Management</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review complaints, inspect evidence, and issue official resolution decisions for contested winning orders.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setDisputeFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  disputeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({disputes.length})
              </button>
              <button
                type="button"
                onClick={() => setDisputeFilter('OPEN')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  disputeFilter === 'OPEN' ? 'bg-red-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Open ({openDisputesCount})
              </button>
              <button
                type="button"
                onClick={() => setDisputeFilter('RESOLVED')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  disputeFilter === 'RESOLVED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Resolved ({disputes.filter(d => (d.disputeStatus || '') === 'RESOLVED').length})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredDisputes.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                No dispute tickets match this filter.
              </div>
            ) : (
              filteredDisputes.map(d => {
                const isOpen = (d.disputeStatus || 'OPEN') === 'OPEN';
                return (
                  <div key={d.disputeId} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-900 font-bold">Dispute Ticket #{d.disputeId}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold text-slate-700">Winning Order #{d.winningOrder?.orderId || d.orderId || '101'}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">
                          Vehicle: <strong className="text-slate-800">{d.winningOrder?.auctionListing?.itemName || 'Auction Item'}</strong>
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border self-start ${
                        isOpen 
                          ? 'bg-red-100 text-red-800 border-red-300 animate-pulse'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        {d.disputeStatus || 'OPEN'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-slate-500 font-medium text-[11px]">Reason for Dispute:</div>
                        <div className="font-bold text-slate-900 text-sm mt-0.5">{d.disputeReason}</div>
                        
                        <div className="text-slate-500 font-medium text-[11px] mt-2">Buyer Detailed Description:</div>
                        <p className="text-slate-700 mt-0.5 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                          {d.description}
                        </p>

                        {d.evidenceReference && (
                          <div className="mt-2 text-[11px] text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center gap-1.5">
                            <span className="font-semibold">Evidence Link / Documentation:</span>
                            <a href={d.evidenceReference} target="_blank" rel="noreferrer" className="underline truncate max-w-xs">
                              {d.evidenceReference}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Resolution Section */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between gap-2.5">
                        <div>
                          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Administrator Resolution Desk
                          </div>
                          {d.resolution ? (
                            <div className="mt-2 text-xs text-slate-600 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                              <span className="font-bold text-emerald-800">Recorded Resolution: </span>
                              {d.resolution}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-500 mt-1">
                              Enter settlement decision and administrator orders to close this dispute.
                            </p>
                          )}
                        </div>

                        {isOpen && (
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Decision Outcome:
                              </label>
                              <select
                                value={selectedDisputeId === d.disputeId ? resolutionStatus : 'RESOLVED'}
                                onChange={(e) => {
                                  setSelectedDisputeId(d.disputeId);
                                  setResolutionStatus(e.target.value);
                                }}
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                              >
                                <option value="RESOLVED">RESOLVED (Buyer Refund / Settlement Awarded)</option>
                                <option value="RESOLVED">RESOLVED (Seller Defense Validated)</option>
                                <option value="CLOSED">CLOSED (Parties Reached Mutual Agreement)</option>
                                <option value="REJECTED">REJECTED (Claim Deemed Invalid or Incomplete)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Official Remarks & Notes:
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Inspected evidence. Escrow partial refund authorized to buyer."
                                value={selectedDisputeId === d.disputeId ? resolutionText : ''}
                                onChange={(e) => {
                                  setSelectedDisputeId(d.disputeId);
                                  setResolutionText(e.target.value);
                                }}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                onResolveDispute(
                                  d.disputeId, 
                                  resolutionText || 'Dispute reviewed and resolved according to platform standards.',
                                  resolutionStatus
                                );
                                setSelectedDisputeId(null);
                                setResolutionText('');
                              }}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Submit Resolution & Close Ticket</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 3: Reviews & Ratings Oversight (Feature 03) */}
      {/* ========================================================= */}
      {activeSubTab === 'reviews' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Buyer Reviews & Ratings Dashboard</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect feedback submitted by buyers for completed orders. Flag or remove inappropriate reviews.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-xs">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-slate-900 text-sm">{averageRating}</span>
                <span className="text-slate-400">/5</span>
              </div>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 font-medium">{reviews.length} Total Reviews</span>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs">
              No customer reviews submitted yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map(r => (
                <div key={r.reviewId} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            className={`w-3.5 h-3.5 ${star <= r.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} 
                          />
                        ))}
                        <span className="font-bold text-slate-900 ml-1.5">{r.rating} Stars</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteReview && onDeleteReview(r.reviewId)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete this review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="mt-2 text-slate-800 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed font-medium">
                      "{r.reviewComment || r.comment || 'No comment provided.'}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <div>
                      Reviewer: <strong className="text-slate-700">{r.reviewer?.firstName || 'Buyer'} {r.reviewer?.lastName || ''}</strong>
                    </div>
                    <div>
                      Order #{r.winningOrder?.orderId || r.orderId || '101'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 4: Platform Audit Logs */}
      {/* ========================================================= */}
      {activeSubTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" /> Platform Security & Activity Audit Log
          </h2>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.logId} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500">#{log.logId}</td>
                    <td className="p-3 text-slate-500">{log.actionDateTime ? new Date(log.actionDateTime).toLocaleString() : 'Just now'}</td>
                    <td className="p-3 font-semibold text-blue-700">{log.actionType}</td>
                    <td className="p-3 text-slate-700">{log.user ? (log.user.email || log.user.firstName) : 'Automated System'}</td>
                    <td className="p-3 text-slate-800">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
