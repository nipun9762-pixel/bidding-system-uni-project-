import React, { useState } from 'react';
import { X, CreditCard, Building2, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';

export default function PaymentModal({ order, onClose, onProcessPayment, onAcknowledgePayment, currentRole }) {
  const isAdmin = currentRole === 'ADMINISTRATOR';

  // Payment Strategy state: 'CREDIT_CARD' or 'BANK_TRANSFER'
  const [method, setMethod] = useState('CREDIT_CARD');

  // Credit Card fields
  const [cardHolder, setCardHolder] = useState(
    order?.buyer ? `${order.buyer.firstName || ''} ${order.buyer.lastName || ''}`.trim() : ''
  );
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Bank Transfer fields
  const [bankName, setBankName] = useState('Commercial Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState(
    order?.buyer ? `${order.buyer.firstName || ''} ${order.buyer.lastName || ''}`.trim() : ''
  );
  const [transferRef, setTransferRef] = useState('');

  // Admin Review state
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Existing payment details if already submitted
  const existingPayment = order?.payment || {};
  const isAwaitingApproval = order?.orderStatus === 'PROCESSING' || existingPayment.paymentStatus === 'PROCESSING';
  const isPaid = order?.orderStatus === 'PAID' || existingPayment.paymentStatus === 'SUCCESSFUL';

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry Date (MM/YY)
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setExpiry(raw);
  };

  // Buyer submits payment via chosen Strategy
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (method === 'CREDIT_CARD') {
        const cleanedCard = cardNumber.replace(/\s+/g, '');
        if (cleanedCard.length < 12) {
          alert('Please enter a valid card number.');
          setIsSubmitting(false);
          return;
        }
        if (!expiry.includes('/')) {
          alert('Please enter a valid expiry date (MM/YY).');
          setIsSubmitting(false);
          return;
        }
        if (cvv.length < 3) {
          alert('Please enter a valid 3 or 4 digit CVV.');
          setIsSubmitting(false);
          return;
        }

        await onProcessPayment(order.orderId, {
          paymentMethod: 'CREDIT_CARD',
          amount: order.winningAmount,
          cardHolderName: cardHolder,
          cardNumber: cleanedCard,
          expiryDate: expiry,
          cvv: cvv
        });
      } else {
        if (!bankName.trim() || !accountNumber.trim()) {
          alert('Please provide your bank name and account number.');
          setIsSubmitting(false);
          return;
        }
        if (!transferRef.trim()) {
          alert('Please enter your bank transfer reference or transaction ID.');
          setIsSubmitting(false);
          return;
        }

        await onProcessPayment(order.orderId, {
          paymentMethod: 'BANK_TRANSFER',
          amount: order.winningAmount,
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountHolderName: accountHolder.trim(),
          transferReference: transferRef.trim()
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-xl relative my-6">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>{isAdmin ? 'Admin Payment Verification' : 'Payment Settlement'}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              Order #{order.orderId}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="my-4 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Auction Vehicle:</span>
            <span className="font-semibold text-slate-900">{order.auctionListing?.itemName || 'Won Vehicle'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Payable Amount:</span>
            <span className="font-bold text-slate-900 text-sm">
              Rs. {Number(order.winningAmount || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Payment Status:</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase border ${
              isPaid
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isAwaitingApproval
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {existingPayment.paymentStatus || order.orderStatus || 'PENDING'}
            </span>
          </div>
        </div>

        {/* VIEW 1: ADMINISTRATOR REVIEW & APPROVAL VIEW */}
        {isAdmin ? (
          <div className="space-y-4 text-xs">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Administrator Verification Desk</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Review the buyer's submitted payment details below. Once accepted, the order will be marked as paid and vehicle delivery preparation will begin.
                </p>
              </div>
            </div>

            {/* Submitted Payment Info Card */}
            <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Strategy / Method:</span>
                <span className="font-semibold text-slate-900">
                  {existingPayment.paymentMethod === 'BANK_TRANSFER' ? 'Direct Bank Transfer' : 'Credit / Debit Card'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Transaction Reference:</span>
                <span className="font-mono font-medium text-slate-800">
                  {existingPayment.transactionReference || order.transactionReference || 'N/A'}
                </span>
              </div>
              {existingPayment.paymentDetails && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Payment Details:</span>
                  <span className="font-medium text-slate-800">
                    {existingPayment.paymentDetails}
                  </span>
                </div>
              )}
              {existingPayment.paymentDate && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Submitted At:</span>
                  <span className="text-slate-700">
                    {new Date(existingPayment.paymentDate).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Administrator Notes</label>
              <textarea
                rows={2}
                placeholder="Optional review notes (e.g., Payment verified in escrow account)..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-500"
              />
            </div>

            {/* Admin Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onAcknowledgePayment(existingPayment.paymentId || order.orderId, false, adminNotes || 'Payment rejected by administrator')}
                className="w-1/2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 font-medium py-2 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Reject Payment
              </button>
              <button
                type="button"
                onClick={() => onAcknowledgePayment(existingPayment.paymentId || order.orderId, true, adminNotes || 'Payment approved by administrator')}
                className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Accept Payment</span>
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 2: BUYER SUBMIT PAYMENT VIEW (STRATEGY PATTERN) */
          <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
            
            {/* Strategy Switcher */}
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('CREDIT_CARD')}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    method === 'CREDIT_CARD'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className={`w-4 h-4 ${method === 'CREDIT_CARD' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="block text-xs">Credit / Debit Card</span>
                    <span className="block text-[10px] text-slate-500 font-normal">Visa, Mastercard</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('BANK_TRANSFER')}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    method === 'BANK_TRANSFER'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Building2 className={`w-4 h-4 ${method === 'BANK_TRANSFER' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="block text-xs">Bank Transfer</span>
                    <span className="block text-[10px] text-slate-500 font-normal">Direct Escrow Deposit</span>
                  </div>
                </button>
              </div>
            </div>

            {/* STRATEGY 1: Credit / Debit Card Form */}
            {method === 'CREDIT_CARD' && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Cardholder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Card Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4532 8901 2345 9812"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Expiry Date (MM/YY) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      CVV / CVC <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STRATEGY 2: Direct Bank Transfer Form */}
            {method === 'BANK_TRANSFER' && (
              <div className="space-y-3 pt-1">
                {/* Beneficiary Details Banner */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1 text-[11px] text-slate-600 font-mono">
                  <div className="font-sans font-semibold text-slate-800 text-xs mb-1">Avtomat Motors Settlement Escrow:</div>
                  <div className="flex justify-between"><span className="text-slate-400 font-sans">Bank:</span> <span>Commercial Bank</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 font-sans">Account No:</span> <span className="font-bold text-slate-900">8004 9218 4491 001</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 font-sans">Beneficiary:</span> <span>Avtomat Motors Ltd</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Your Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Commercial Bank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Your Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1002938491"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Depositor Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Transfer / Ref Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TXN-89210"
                      value={transferRef}
                      onChange={(e) => setTransferRef(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Note on Admin Review */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-600 flex items-start gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Payment will be routed to the <strong>Administrator</strong> for approval. Vehicle preparation and delivery tracking will begin as soon as accepted.
              </span>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : `Submit Payment (Rs. ${Number(order.winningAmount || 0).toLocaleString()})`}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
