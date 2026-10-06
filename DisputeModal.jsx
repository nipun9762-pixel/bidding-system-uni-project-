import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';

export default function DisputeModal({ order, onClose, onSubmitDispute }) {
  const [disputeReason, setDisputeReason] = useState('Condition Mismatch / Undisclosed Damage');
  const [description, setDescription] = useState('');
  const [evidenceReference, setEvidenceReference] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    await onSubmitDispute({
      orderId: order.orderId,
      disputeReason,
      description: description.trim(),
      evidenceReference: evidenceReference.trim()
    });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4" />
          Buyer Protection • Open Dispute Ticket
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-1 font-['Outfit']">
          Report Issue for Order #{order?.orderId}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit your complaint to the platform administrator. Escrow payment settlement can be put on hold until resolved.
        </p>

        {/* Order Brief Summary */}
        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-slate-800">{order?.auctionListing?.itemName || 'Vehicle Auction'}</div>
            <div className="text-slate-500 text-[11px]">
              Seller: {order?.auctionListing?.seller?.firstName || 'Dealer'} {order?.auctionListing?.seller?.lastName || ''}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase">Winning Bid</div>
            <div className="font-bold text-emerald-700 font-mono">
              ${(order?.winningAmount || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Dispute Category / Issue Reason *
            </label>
            <select
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-red-500 font-medium"
            >
              <option value="Condition Mismatch / Undisclosed Damage">Vehicle Condition Mismatch / Undisclosed Damage</option>
              <option value="Mechanical / Undisclosed Defects">Mechanical / Engine / Electrical Defect</option>
              <option value="Delivery Delay / Non-Receipt">Delivery Delay / Vehicle Not Received</option>
              <option value="Title & Documentation Issue">Title, Registration, or VIN Discrepancy</option>
              <option value="Mileage Discrepancy">Odometer / Mileage Incorrect</option>
              <option value="Other Serious Concern">Other Platform Concern</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Detailed Issue Description *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the discrepancy or fault found upon delivery or inspection..."
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Supporting Evidence / Photo / Document URL (Optional)
            </label>
            <input
              type="text"
              value={evidenceReference}
              onChange={(e) => setEvidenceReference(e.target.value)}
              placeholder="e.g. https://images.unsplash.com/... or Inspection Report link"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-red-600/20 transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting Ticket...' : 'File Official Dispute Ticket'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
