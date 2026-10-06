import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

export default function AuctionCard({ auction, onOpenBidModal, onToggleWatchlist, isWatchlisted, currentRole, currentUser, onEditAuction, onDeleteAuction }) {
  const image = auction.itemImages && auction.itemImages.length > 0 
    ? auction.itemImages[0].imagePath 
    : 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80';

  const currentUserId = currentUser?.userId || currentUser?.id;
  const sellerId = auction.seller?.userId || auction.seller?.id;
  const isOwner = Boolean(
    currentUser && (
      (currentUser.email && auction.seller?.email && currentUser.email.trim().toLowerCase() === auction.seller.email.trim().toLowerCase()) ||
      (currentUserId != null && sellerId != null && String(currentUserId) === String(sellerId)) ||
      currentUser.role === 'ADMINISTRATOR'
    )
  );

  // Time remaining calculation
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!auction.endDateTime) {
        setTimeLeftStr('2d 12h left');
        return;
      }
      const diff = new Date(auction.endDateTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeftStr('Time Expired');
        setIsExpired(true);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        if (days > 0) {
          setTimeLeftStr(`${days}d ${hours}h left`);
        } else if (hours > 0) {
          setTimeLeftStr(`${hours}h ${minutes}m left`);
        } else {
          setTimeLeftStr(`${minutes}m left`);
        }
        setIsExpired(false);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 30000);
    return () => clearInterval(timer);
  }, [auction.endDateTime]);

  const isPendingApproval = auction.status === 'PENDING_APPROVAL';
  const isClosed = auction.status === 'CLOSED' || isExpired;

  return (
    <div className={`bg-white border rounded-2xl p-4 transition-all duration-200 shadow-sm hover:shadow flex flex-col xl:flex-row gap-5 items-stretch relative overflow-hidden group ${
      isPendingApproval 
        ? 'border-amber-300 ring-1 ring-amber-100 bg-amber-50/20' 
        : isOwner 
        ? 'border-blue-300 ring-1 ring-blue-100' 
        : 'border-slate-200 hover:border-slate-300'
    }`}>
      
      {/* Left Column: Vehicle Image & Clean Badges */}
      <div className="w-full xl:w-72 h-48 xl:h-auto shrink-0 rounded-xl overflow-hidden relative bg-slate-100">
        <img
          src={image}
          alt={auction.itemName}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        />
        
        {/* Watchlist Heart Icon */}
        <button
          onClick={() => onToggleWatchlist(auction.auctionId)}
          className={`absolute top-2 right-2 p-2 rounded-full border transition-colors ${
            isWatchlisted
              ? 'bg-red-50 border-red-200 text-red-600'
              : 'bg-white/90 border-slate-200 text-slate-600 hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWatchlisted ? 'fill-red-500' : ''}`} />
        </button>

        {/* Status Badges */}
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1.5 text-xs font-medium">
          {isPendingApproval ? (
            <span className="bg-amber-600 text-white px-2 py-0.5 rounded shadow-sm">
              Pending Approval
            </span>
          ) : isClosed ? (
            <span className="bg-slate-800 text-white px-2 py-0.5 rounded shadow-sm">
              Closed
            </span>
          ) : (
            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded shadow-sm">
              Live
            </span>
          )}

          {isOwner && (
            <span className="bg-slate-700 text-white px-2 py-0.5 rounded shadow-sm">
              My Listing
            </span>
          )}
          
          <span className="bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded shadow-sm">
            {timeLeftStr}
          </span>
        </div>
      </div>

      {/* Middle Column: Vehicle Title, Specs, & Seller Details */}
      <div className="flex-1 flex flex-col justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors font-['Outfit']">
            {auction.itemName}
          </h3>

          {/* Specs Grid */}
          <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600">
            <div>
              <span className="text-slate-400">VIN: </span>
              <span className="font-mono text-slate-800">{auction.vinNumber || 'WPOAB2A99MS'}</span>
            </div>
            <div>
              <span className="text-slate-400">Mileage: </span>
              <span className="font-medium text-slate-800">{(auction.mileageKm || 18400).toLocaleString()} KM</span>
            </div>
            <div>
              <span className="text-slate-400">Color: </span>
              <span className="font-medium text-slate-800">{auction.color || 'Red'}</span>
            </div>
            <div>
              <span className="text-slate-400">Drivetrain: </span>
              <span className="font-medium text-slate-800">{auction.transmission || 'Rear-Wheel Drive'}</span>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-[10px]">
              {auction.seller?.firstName ? auction.seller.firstName.charAt(0) : 'D'}
            </div>
            <div>
              <div className="text-slate-800 font-medium">
                {auction.seller?.firstName ? `${auction.seller.firstName} ${auction.seller.lastName}` : 'Dealer Partner'}
              </div>
              <div className="text-[11px] text-slate-400">
                Seller
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEditAuction(auction)}
                  className="text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 font-medium px-2.5 py-1 rounded-md transition-colors text-xs"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteAuction(auction.auctionId)}
                  className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 font-medium px-2.5 py-1 rounded-md transition-colors text-xs"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Pricing & Bid Action Box */}
      <div className="w-full xl:w-64 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-center gap-3 shrink-0">
        
        {/* Pricing Info */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-baseline justify-between">
            <span className="text-slate-500">Est. Market Value</span>
            <span className="font-semibold text-slate-700">
              Rs. {(auction.estMarketValue || 128000).toLocaleString()}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1 border-t border-slate-200">
            <span className="text-slate-700 font-medium">{isClosed ? 'Winning Bid:' : 'Current Bid:'}</span>
            <span className="text-base font-bold text-slate-900 font-['Outfit']">
              Rs. {(auction.currentHighestBid || auction.startingBid).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {isPendingApproval ? (
          <div className="text-center py-2 px-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-medium">
            Pending Admin Approval
          </div>
        ) : isClosed ? (
          <div className="text-center py-2 px-3 bg-slate-200 border border-slate-300 rounded-lg text-slate-700 text-xs font-medium">
            Auction Closed
          </div>
        ) : (
          <button
            onClick={() => onOpenBidModal(auction)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-xs transition-colors shadow-sm"
          >
            Place Bid
          </button>
        )}

      </div>

    </div>
  );
}
