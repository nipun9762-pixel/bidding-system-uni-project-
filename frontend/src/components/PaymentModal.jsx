import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle, AlertTriangle, Building2, Eye, ShieldCheck, RefreshCw } from 'lucide-react';

// Sample realistic payment slip placeholder data URI for quick testing
const SAMPLE_SLIP_IMAGE = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80';

export default function PaymentModal({ order, onClose, onProcessPayment, onAcknowledgePayment, currentRole }) {
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(order?.payment?.paymentSlipUrl || order?.paymentSlipUrl || '');
  const [txRef, setTxRef] = useState(order?.payment?.transactionReference || 'SLIP-' + Math.floor(100000 + Math.random() * 900000));
  const [depositorNote, setDepositorNote] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLargeSlip, setShowLargeSlip] = useState(false);

  const isAdmin = currentRole === 'ADMINISTRATOR';
  const existingSlipUrl = order?.payment?.paymentSlipUrl || order?.paymentSlipUrl || slipPreview;
  const isAwaitingAdmin = (order?.orderStatus === 'PROCESSING' || order?.payment?.paymentStatus === 'PROCESSING') && existingSlipUrl;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSlipFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setSlipPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUseSampleSlip = () => {
    setSlipPreview(SAMPLE_SLIP_IMAGE);
    setSlipFile({ name: 'bank_deposit_slip_verified.jpg', size: 142800 });
  };

  const handleSubmitSlip = async (e) => {
    e.preventDefault();
    if (!slipPreview) {
      alert('Please upload a bank payment slip image before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onProcessPayment(order.orderId, 'PAYMENT_SLIP', txRef, slipPreview);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 text-slate-600 font-semibold text-xs tracking-wider uppercase">
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>Payment Settlement • Bank Deposit</span>
        </div>
        <h2 className="text-base font-bold text-slate-900 mt-1">
          {isAdmin ? `Admin Review: Order #${order.orderId}` : `Deposit Slip Submission for Order #${order.orderId}`}
        </h2>

        {/* Order Summary Box */}
        <div className="my-3.5 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Auction Vehicle:</span>
            <span className="font-semibold text-slate-900">{order.auctionListing?.itemName || 'Vehicle Won'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Payable Amount:</span>
            <span className="font-bold text-slate-900 text-sm tabular-nums">
              Rs. {Number(order.winningAmount || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Order Status:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase border ${
              order.orderStatus === 'PAID' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : order.orderStatus === 'PROCESSING' 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {order.orderStatus || 'PENDING'}
            </span>
          </div>
        </div>

        {/* VIEW 1: ADMIN REVIEW VIEW */}
        {isAdmin ? (
          <div className="space-y-4 text-xs">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Administrator Slip Verification Desk</p>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  Inspect the uploaded bank deposit slip below. Once approved, product processing and vehicle delivery will officially start.
                </p>
              </div>
            </div>

            {/* Slip Preview in Admin View */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Submitted Payment Slip</label>
              {existingSlipUrl ? (
                <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-950 group">
                  <img
                    src={existingSlipUrl}
                    alt="Uploaded Bank Payment Slip"
                    className="w-full h-48 object-contain bg-slate-900"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowLargeSlip(true)}
                      className="bg-white text-slate-900 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-lg"
                    >
                      <Eye className="w-3.5 h-3.5" /> Zoom Slip
                    </button>
                    <a
                      href={existingSlipUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-lg"
                    >
                      Open in New Tab
                    </a>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-slate-300 rounded-2xl p-6 text-center text-slate-400">
                  No payment slip uploaded yet by the buyer.
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Administrator Review Notes</label>
              <textarea
                rows={2}
                placeholder="Add verification notes (e.g. Bank reference verified, funds confirmed in settlement account...)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onAcknowledgePayment(order.payment?.paymentId || order.orderId, false, notes || 'Payment slip rejected by administrator')}
                className="w-1/2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Reject Slip
              </button>
              <button
                type="button"
                onClick={() => onAcknowledgePayment(order.payment?.paymentId || order.orderId, true, notes || 'Approved by Administrator')}
                className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                Approve & Start Delivery
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 2: BUYER PAYMENT SLIP UPLOAD VIEW */
          <form onSubmit={handleSubmitSlip} className="space-y-4 text-xs">
            
            {/* Bank Deposit Instruction Card */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Official Settlement Bank Account Details</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Deposit or transfer the winning amount of <strong>Rs. {Number(order.winningAmount || 0).toLocaleString()}</strong> to the escrow account below, then upload your deposit slip.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] bg-white/80 p-2.5 rounded-xl border border-blue-100 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Bank:</span>
                  <span className="font-semibold text-slate-800">Commercial Bank</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Account No:</span>
                  <span className="font-bold text-blue-700">8004 9218 4491 001</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Beneficiary Name:</span>
                  <span className="font-semibold text-slate-800">Avtomat Motors Escrow</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Branch:</span>
                  <span className="font-semibold text-slate-800">Colombo City Branch</span>
                </div>
              </div>
            </div>

            {/* Slip Upload Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-800 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Upload Bank Deposit Slip</span>
                  <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleUseSampleSlip}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  Use Demo Slip
                </button>
              </div>

              {slipPreview ? (
                <div className="relative border border-slate-200 rounded-lg overflow-hidden bg-slate-900 p-1">
                  <img
                    src={slipPreview}
                    alt="Payment Slip Preview"
                    className="w-full h-40 object-contain rounded-md"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowLargeSlip(true)}
                      className="bg-black/70 hover:bg-black text-white p-1.5 rounded text-[10px] flex items-center gap-1"
                      title="Enlarge"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSlipPreview('');
                        setSlipFile(null);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="px-2 py-1 text-[11px] text-slate-300 truncate">
                    {slipFile?.name || 'Bank_Deposit_Slip.jpg'}
                  </div>
                </div>
              ) : (
                <label className="border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/60 transition-colors rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer text-center group">
                  <Upload className="w-6 h-6 text-slate-500 mb-1.5 transition-transform" />
                  <span className="font-semibold text-slate-800 text-xs">Click to browse or drop payment slip here</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WEBP, PDF (Max 10MB)</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Slip Transaction Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1 text-xs">
                  Deposit / Slip Ref # <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SLIP-893021"
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1 text-xs">Depositor Name / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Dilini Rathnayake"
                  value={depositorNote}
                  onChange={(e) => setDepositorNote(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Next Step:</strong> Once submitted, the slip is routed to the Administrator for approval. Vehicle preparation and dispatch will start as soon as verified.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !slipPreview}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Uploading Slip & Submitting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Submit Payment Slip for Administrator Review</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Modal: Full-size Zoom of Payment Slip */}
        {showLargeSlip && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-4 relative">
              <button
                type="button"
                onClick={() => setShowLargeSlip(false)}
                className="absolute top-3 right-3 text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-white font-bold text-sm mb-3">Payment Slip Verification Document</h3>
              <img
                src={existingSlipUrl || slipPreview}
                alt="Enlarged Slip"
                className="w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
