import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle } from 'lucide-react';

export default function BidModal({ auction, onClose, onSubmitBid }) {
  const currentHighest = auction.currentHighestBid || auction.startingBid;
  const increment = auction.bidIncrement || 1000;
  const minRequired = currentHighest + increment;

  const [bidAmount, setBidAmount] = useState(minRequired);
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuickAdd = (extra) => {
    setBidAmount(prev => prev + extra);
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (bidAmount < minRequired) {
      setErrorMsg(`Bid must be at least Rs. ${minRequired.toLocaleString()} (minimum increment of Rs. ${increment.toLocaleString()}).`);
      return;
    }
    onSubmitBid(auction.auctionId, bidAmount);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-slate-500 font-medium text-xs">
          Place Bid
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-0.5 font-['Outfit']">
          {auction.itemName}
        </h2>

        {/* Current State Summary */}
        <div className="my-4 bg-slate-50 border border-slate-200 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-slate-500">Current Highest Bid</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              Rs. {currentHighest.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-slate-500">Minimum Required Bid</div>
            <div className="text-base font-bold text-emerald-700 mt-0.5">
              Rs. {minRequired.toLocaleString()}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-2.5 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Bid Amount (Rs.)
            </label>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => {
                setBidAmount(Number(e.target.value));
                setErrorMsg('');
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 font-bold text-lg focus:outline-none focus:border-blue-600"
              step={increment}
            />
          </div>

          {/* Quick Increment Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickAdd(increment)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              +Rs. {increment.toLocaleString()}
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(increment * 2)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              +Rs. {(increment * 2).toLocaleString()}
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(5000)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              +Rs. 5,000
            </button>
          </div>

          <div className="text-[11px] text-slate-500">
            Bid placement is binding and logged in platform records.
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-lg text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-xs shadow-sm transition-colors"
            >
              Confirm Bid: Rs. {bidAmount.toLocaleString()}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
