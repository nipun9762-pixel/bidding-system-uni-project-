import React, { useState, useEffect } from 'react';
import { Heart, Clock, StopCircle, Trophy } from 'lucide-react';
import { isOrderForBuyer } from '../utils/orderOwnership';

export default function AuctionCard({ 
  auction, 
  onOpenBidModal, 
  onToggleWatchlist, 
  isWatchlisted, 
  currentRole, 
  currentUser, 
  onEditAuction, 
  onDeleteAuction,
  onEndAuction,
  onViewOrders
}) {
  const image = (auction.itemImages && auction.itemImages.length > 0 ? auction.itemImages[0].imagePath : null)
    || auction.imagePath 
    || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80';

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
    <div className={`bg-white border rounded-xl p-4 transition-all duration-150 hover:shadow-sm flex flex-col xl:flex-row gap-5 items-stretch relative overflow-hidden group ${
      isPendingApproval 
        ? 'border-amber-300 bg-amber-50/20' 
        : isOwner 
        ? 'border-slate-300' 
        : 'border-slate-200 hover:border-slate-300'
    }`}>
      
      {/* Left Column: Vehicle Image & Badges */}
      <div className="w-full xl:w-72 h-48 xl:h-auto shrink-0 rounded-lg overflow-hidden relative bg-slate-100">
        <img
          src={image}
          alt={auction.itemName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        
        {/* Watchlist Heart Icon */}
        <button
          onClick={() => onToggleWatchlist(auction.auctionId)}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full border transition-colors shadow-sm ${
            isWatchlisted
              ? 'bg-red-50 border-red-200 text-red-600'
              : 'bg-white/95 border-slate-200 text-slate-600 hover:text-red-500'
          }`}
          title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-red-500' : ''}`} />
        </button>

        {/* Primary Status Badge - Top Left */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 text-xs font-medium">
          {(() => {
            const isWinningBuyer = Boolean(
              isClosed && 
              (currentRole === 'BUYER' || !currentUser) && 
              (isOrderForBuyer({ buyer: auction.highestBidder }, currentUser) || isOrderForBuyer({ buyer: auction.winner }, currentUser))
            );

            if (isWinningBuyer) {
              return (
                <span className="bg-emerald-600 text-white font-semibold px-2.5 py-0.5 rounded-md shadow-sm flex items-center gap-1 text-[11px]">
                  <Trophy className="w-3 h-3" /> Won By You
                </span>
              );
            }

            if (isPendingApproval) {
              return (
                <span className="bg-amber-600 text-white px-2.5 py-0.5 rounded-md shadow-sm text-[11px] font-medium">
                  Pending Review
                </span>
              );
            }

            if (isClosed) {
              return (
                <span className="bg-slate-800 text-white px-2.5 py-0.5 rounded-md shadow-sm text-[11px] font-medium">
                  Closed
                </span>
              );
            }

            return (
              <span className="bg-slate-900/90 text-white px-2.5 py-0.5 rounded-md shadow-sm text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{timeLeftStr}</span>
              </span>
            );
          })()}
        </div>

        {/* Owner Tag - Bottom Left */}
        {isOwner && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-slate-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded">
              Your Listing
            </span>
          </div>
        )}
      </div>

      {/* Middle Column: Vehicle Title, Specs, & Seller Details */}
      <div className="flex-1 flex flex-col justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
            {auction.itemName}
          </h3>

          {/* Specs Grid */}
          <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 border border-slate-100 rounded-md p-2">
              <span className="text-slate-600 block text-[10px] uppercase font-semibold">Mileage</span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {(auction.mileageKm || 18400).toLocaleString()} KM
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-md p-2">
              <span className="text-slate-600 block text-[10px] uppercase font-semibold">Transmission</span>
              <span className="font-semibold text-slate-800 truncate block">
                {auction.transmission || 'Automatic'}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-md p-2">
              <span className="text-slate-600 block text-[10px] uppercase font-semibold">Color</span>
              <span className="font-semibold text-slate-800">
                {auction.color || 'Standard'}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-md p-2">
              <span className="text-slate-600 block text-[10px] uppercase font-semibold">VIN</span>
              <span className="font-mono text-slate-800 text-[11px] truncate block">
                {auction.vinNumber || 'WPOAB2A99MS'}
              </span>
            </div>
          </div>
        </div>

        {/* Seller Info & Action Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-[10px]">
              {auction.seller?.firstName ? auction.seller.firstName.charAt(0) : 'D'}
            </div>
            <div className="leading-tight">
              <div className="text-slate-800 font-medium text-xs">
                {auction.seller?.firstName ? `${auction.seller.firstName} ${auction.seller.lastName}` : 'Verified Dealer'}
              </div>
              <div className="text-[10px] text-slate-600 font-medium">
                Verified Seller
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {!isClosed && !isPendingApproval && onEndAuction && (
                  <button
                    type="button"
                    onClick={() => onEndAuction(auction.auctionId)}
                    className="text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 font-medium px-2.5 py-1 rounded-md transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    title="End bidding now and evaluate winner"
                  >
                    <Clock className="w-3 h-3 text-amber-700" />
                    End Auction
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onEditAuction(auction)}
                  className="text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 font-medium px-2.5 py-1 rounded-md transition-colors text-xs"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteAuction(auction.auctionId)}
                  className="text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 font-medium px-2.5 py-1 rounded-md transition-colors text-xs"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Pricing & Bid Action Box */}
      <div className="w-full xl:w-60 bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between gap-3 shrink-0">
        
        {/* Pricing Info */}
        <div className="space-y-1 text-xs">
          <div className="flex items-baseline justify-between text-slate-600">
            <span className="text-[11px]">Est. Value</span>
            <span className="font-semibold text-slate-700 tabular-nums">
              Rs. {(auction.estMarketValue || 128000).toLocaleString()}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider block">
              {isClosed ? 'Winning Bid' : 'Current Bid'}
            </span>
            <span className="text-lg font-bold text-slate-900 tabular-nums block mt-0.5">
              Rs. {(auction.currentHighestBid || auction.startingBid).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {isPendingApproval ? (
          <div className="text-center py-2 px-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-medium">
            Pending Approval
          </div>
        ) : Boolean(isClosed && (currentRole === 'BUYER' || !currentUser) && (isOrderForBuyer({ buyer: auction.highestBidder }, currentUser) || isOrderForBuyer({ buyer: auction.winner }, currentUser))) ? (
          <div className="space-y-1.5">
            <div className="text-center py-1.5 px-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-emerald-600" />
              <span>You Won!</span>
            </div>
            <button
              type="button"
              onClick={() => onViewOrders && onViewOrders()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View Order &rarr;</span>
            </button>
          </div>
        ) : isClosed ? (
          <div className="text-center py-2 px-3 bg-slate-200/80 rounded-lg text-slate-600 text-xs font-medium">
            Auction Closed
          </div>
        ) : isOwner ? (
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => onEndAuction && onEndAuction(auction.auctionId)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              title="Manually end this auction now"
            >
              <Clock className="w-3.5 h-3.5" />
              End Auction
            </button>
            {currentRole === 'ADMINISTRATOR' && (
              <button
                type="button"
                onClick={() => onOpenBidModal(auction)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Place Bid (Admin)
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpenBidModal(auction)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
          >
            Place Bid
          </button>
        )}

      </div>
    </div>
  );
}
