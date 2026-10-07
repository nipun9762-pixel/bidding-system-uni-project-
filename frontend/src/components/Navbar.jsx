import React from 'react';
import { Search, Bell, Shield, LogOut, User, Gavel, Car, PlusCircle, Truck } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  unreadNotifsCount,
  onTriggerScheduler,
  onOpenCreateModal,
  activeDeliveriesCount = 0,
  wonOrdersCount = 0,
  sellerStatusFilter = 'ALL',
  onSelectSellerFilter
}) {
  const currentRole = currentUser?.role || 'BUYER';

  const roleConfig = {
    BUYER: {
      label: 'Buyer',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
      icon: Gavel
    },
    SELLER: {
      label: 'Seller',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: Car
    },
    ADMINISTRATOR: {
      label: 'Administrator',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      icon: Shield
    },
    PAYMENT_PROCESSOR: {
      label: 'Settlement',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      dot: 'bg-purple-500',
      icon: User
    }
  };

  const currentRoleInfo = roleConfig[currentRole] || roleConfig.BUYER;

  const initials = currentUser
    ? `${(currentUser.firstName || '').charAt(0)}${(currentUser.lastName || '').charAt(0)}`.toUpperCase() || 'U'
    : 'U';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 transition-all">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">

        {/* Brand & Main Nav Links */}
        <div className="flex items-center gap-7">
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => setActiveTab('bidding')}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
              AV
            </div>
            <div className="leading-tight">
              <span className="font-bold text-base tracking-tight text-slate-900 block font-display">
                Avtomat
              </span>
              <span className="text-[10px] text-slate-600 block uppercase tracking-wider font-semibold">
                Auto Exchange
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">

            <button
              onClick={() => setActiveTab('bidding')}
              className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'bidding'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              Dealer Bidding
            </button>

            {/* Sold Auctions: HIDDEN from Buyer Dashboard. Only visible to SELLER under their particular seller account */}
            {currentRole === 'SELLER' && (
              <button
                onClick={() => {
                  setActiveTab('my-listings');
                  if (onSelectSellerFilter) onSelectSellerFilter('SOLD');
                }}
                className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'sold' || (activeTab === 'my-listings' && sellerStatusFilter === 'SOLD')
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                Sold Auctions
              </button>
            )}

            {/* Seller Dashboard exclusive to SELLER */}
            {currentRole === 'SELLER' && (
              <button
                onClick={() => {
                  setActiveTab('my-listings');
                  if (onSelectSellerFilter) onSelectSellerFilter('ALL');
                }}
                className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'my-listings' && sellerStatusFilter !== 'SOLD'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                Seller Dashboard
              </button>
            )}

            {currentRole === 'ADMINISTRATOR' && (
              <button
                onClick={() => setActiveTab('my-listings')}
                className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'my-listings'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                All Listings
              </button>
            )}

            {currentRole !== 'ADMINISTRATOR' && (
              <button
                onClick={() => setActiveTab('watchlist')}
                className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'watchlist'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                Watchlist
              </button>
            )}

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${activeTab === 'orders'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <span>Winning Orders</span>
              {wonOrdersCount > 0 && (
                <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                  {wonOrdersCount}
                </span>
              )}
            </button>

            {currentRole !== 'ADMINISTRATOR' && (
              <button
                onClick={() => setActiveTab('tracking')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${activeTab === 'tracking'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                <Truck className="w-4 h-4 text-slate-500" />
                <span>{currentRole === 'SELLER' ? 'Manage Deliveries' : 'Track Delivery'}</span>
                {activeDeliveriesCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active shipments" />
                )}
              </button>
            )}

            {currentRole === 'ADMINISTRATOR' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${activeTab === 'admin'
                    ? 'bg-amber-100 text-amber-900 font-semibold'
                    : 'hover:text-amber-800 hover:bg-amber-50'
                  }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" /> Admin Portal
              </button>
            )}
          </nav>
        </div>

        {/* Right Nav Utilities & Authenticated User Profile */}
        <div className="flex items-center gap-2.5">

          {/* Global Search Bar */}
          <div className="relative hidden md:block w-44 xl:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search vehicles, VIN..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
            />
          </div>

          {/* Seller Exclusive: Create Auction Button */}
          {currentRole === 'SELLER' && (
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3 py-1.5 rounded-lg transition-colors shrink-0 shadow-sm"
              title="Create a new vehicle auction listing"
            >
              + Create Auction
            </button>
          )}

          {/* Notification Icon */}
          <button
            title="Notifications"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Authenticated User Status Profile */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                  {initials}
                </div>
                <div className="text-xs font-medium text-slate-800 hidden sm:block">
                  {currentUser.firstName} {currentUser.lastName}
                </div>
                <span className="text-[10px] font-semibold text-slate-600 uppercase bg-slate-200/70 px-1.5 py-0.5 rounded">
                  {currentRoleInfo.label}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                title="Log Out of System"
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
