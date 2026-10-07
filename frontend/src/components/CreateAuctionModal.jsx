import React, { useState } from 'react';
import { X, PlusCircle, PencilLine, Trash2, Clock, Shield, AlertCircle, Upload } from 'lucide-react';

export default function CreateAuctionModal({ onClose, onCreateListing, onUpdateListing, auctionToEdit, currentUser, onDeleteListing }) {
  const emptyForm = {
    itemName: '',
    brand: '',
    model: '',
    vehicleType: 'Coupe',
    transmission: 'Automatic',
    yearManufactured: '2023',
    mileageKm: '18000',
    color: 'Metallic Blue',
    vinNumber: 'WBA33AY08NP123456',
    startingBid: '',
    bidIncrement: '1000',
    estMarketValue: '',
    durationHours: '24',
    endDateTime: '',
    imagePath: '',
    description: ''
  };

  const defaultForm = auctionToEdit
    ? {
        itemName: auctionToEdit.itemName || '',
        brand: auctionToEdit.brand || '',
        model: auctionToEdit.model || '',
        vehicleType: auctionToEdit.vehicleType || 'Coupe',
        transmission: auctionToEdit.transmission || 'Automatic',
        yearManufactured: String(auctionToEdit.yearManufactured || '2022'),
        mileageKm: String(auctionToEdit.mileageKm || '24000'),
        color: auctionToEdit.color || 'Dark Grey',
        vinNumber: auctionToEdit.vinNumber || 'WBA33AY08NP123456',
        startingBid: String(auctionToEdit.startingBid || ''),
        bidIncrement: String(auctionToEdit.bidIncrement || '1000'),
        estMarketValue: String(auctionToEdit.estMarketValue || ''),
        durationHours: String(auctionToEdit.durationHours || '24'),
        endDateTime: auctionToEdit.endDateTime ? auctionToEdit.endDateTime.slice(0, 16) : '',
        imagePath: auctionToEdit.itemImages?.[0]?.imagePath || '',
        description: auctionToEdit.description || ''
      }
    : emptyForm;

  const [formData, setFormData] = useState(defaultForm);
  const [errorMsg, setErrorMsg] = useState('');
  const [imageFileName, setImageFileName] = useState('');

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, imagePath: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const startingBid = Number(formData.startingBid);
    const bidIncrement = Number(formData.bidIncrement);
    const estMarketValue = Number(formData.estMarketValue || formData.startingBid);
    const mileageKm = Number(formData.mileageKm);
    const yearManufactured = Number(formData.yearManufactured);

    if (isNaN(startingBid) || startingBid <= 0) {
      setErrorMsg('Validation Error: Starting bid must be greater than zero. Negative or zero values are not allowed.');
      return;
    }

    if (isNaN(bidIncrement) || bidIncrement <= 0) {
      setErrorMsg('Validation Error: Bid increment must be greater than zero. Negative or zero values are not allowed.');
      return;
    }

    if (isNaN(estMarketValue) || estMarketValue <= 0) {
      setErrorMsg('Validation Error: Estimated market value must be greater than zero. Negative or zero values are not allowed.');
      return;
    }

    if (isNaN(mileageKm) || mileageKm < 0) {
      setErrorMsg('Validation Error: Mileage cannot be negative.');
      return;
    }

    if (isNaN(yearManufactured) || yearManufactured <= 0) {
      setErrorMsg('Validation Error: Year manufactured must be a positive valid year.');
      return;
    }

    const currentUserId = currentUser?.userId || currentUser?.id || 2;
    const payload = {
      sellerId: currentUserId,
      userId: currentUserId,
      categoryId: 1,
      ...formData,
      startingBid,
      bidIncrement,
      estMarketValue,
      mileageKm,
      yearManufactured
    };

    if (auctionToEdit) {
      onUpdateListing(auctionToEdit.auctionId, payload);
    } else {
      onCreateListing(payload);
    }
  };

  // Strict Role Restriction: Only Sellers (or Admins) can access creation/editing modal
  if (currentUser?.role === 'BUYER') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl relative text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Access Restricted</h3>
          <p className="text-xs text-slate-500 mt-2">
            Only registered vehicle sellers are authorized to create or manage auction listings. Buyers cannot create listings.
          </p>
          <button
            onClick={onClose}
            className="mt-5 bg-slate-900 text-white font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-slate-500 font-medium text-xs">
          Seller Vehicle Listing
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-0.5 font-['Outfit']">
          {auctionToEdit ? 'Edit Vehicle Auction' : 'Create Vehicle Auction'}
        </h2>

        {/* Admin Approval Advisory Banner */}
        {!auctionToEdit && (
          <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
            <span className="font-semibold">Notice: </span>
            Newly submitted auctions will be reviewed and approved by an Administrator before appearing on the live bidding dashboard.
          </div>
        )}

        {/* Validation Error Banner */}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Vehicle Listing Title *</label>
            <input
              type="text"
              required
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              placeholder="e.g. BMW M4 Competition Coupe (2023)"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand *</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. BMW"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Model *</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g. M4 Competition"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vehicle Type</label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="Coupe">Coupe</option>
                <option value="Sedan">Sedan</option>
                <option value="Hypercar">Hypercar</option>
                <option value="SUV">SUV</option>
                <option value="Convertible">Convertible</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Transmission</label>
              <select
                value={formData.transmission}
                onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="Automatic">Automatic</option>
                <option value="Rear-Wheel Drive">Rear-Wheel Drive</option>
                <option value="Dual-Clutch">Dual-Clutch</option>
                <option value="AWD">AWD</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Year</label>
              <input
                type="number"
                min="1900"
                value={formData.yearManufactured}
                onChange={(e) => {
                  setFormData({ ...formData, yearManufactured: e.target.value });
                  if (Number(e.target.value) < 0) {
                    setErrorMsg('Year cannot be negative.');
                  } else {
                    setErrorMsg('');
                  }
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vehicle Image</label>
              {formData.imagePath ? (
                <div className="flex items-center gap-2 border border-slate-300 rounded-lg p-1.5 bg-slate-50 min-h-[38px]">
                  <img
                    src={formData.imagePath}
                    alt="Vehicle preview"
                    className="w-7 h-7 object-cover rounded border border-slate-200 shrink-0"
                  />
                  <span className="text-[11px] text-slate-700 truncate flex-1 font-medium">
                    {imageFileName || 'Selected local image'}
                  </span>
                  <label className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors shrink-0">
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, imagePath: '' }));
                      setImageFileName('');
                    }}
                    className="text-slate-400 hover:text-red-600 p-0.5 rounded transition-colors shrink-0"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-1.5 border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 rounded-lg px-3 py-2 cursor-pointer text-slate-600 hover:text-blue-600 transition-all min-h-[38px]">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-medium">Upload from local files</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mileage (KM)</label>
              <input
                type="number"
                min="0"
                value={formData.mileageKm}
                onChange={(e) => {
                  setFormData({ ...formData, mileageKm: e.target.value });
                  if (Number(e.target.value) < 0) {
                    setErrorMsg('Mileage cannot be negative.');
                  } else {
                    setErrorMsg('');
                  }
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">VIN Number</label>
              <input
                type="text"
                value={formData.vinNumber}
                onChange={(e) => setFormData({ ...formData, vinNumber: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Starting Bid (Rs.) *</label>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={formData.startingBid}
                onChange={(e) => {
                  setFormData({ ...formData, startingBid: e.target.value });
                  if (Number(e.target.value) < 0) {
                    setErrorMsg('Starting bid cannot be negative.');
                  } else {
                    setErrorMsg('');
                  }
                }}
                placeholder="45000"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min Increment (Rs.) *</label>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={formData.bidIncrement}
                onChange={(e) => {
                  setFormData({ ...formData, bidIncrement: e.target.value });
                  if (Number(e.target.value) < 0) {
                    setErrorMsg('Bid increment cannot be negative.');
                  } else {
                    setErrorMsg('');
                  }
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Est Market Value (Rs.) *</label>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={formData.estMarketValue}
                onChange={(e) => {
                  setFormData({ ...formData, estMarketValue: e.target.value });
                  if (Number(e.target.value) < 0) {
                    setErrorMsg('Estimated market value cannot be negative.');
                  } else {
                    setErrorMsg('');
                  }
                }}
                placeholder="55000"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Time Limit & Duration Selection (Feature 01) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Auction Time Limit *</span>
              </label>
              <select
                value={formData.durationHours}
                onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
              >
                <option value="1">1 Hour (Quick Test / Rapid Bid)</option>
                <option value="6">6 Hours</option>
                <option value="12">12 Hours</option>
                <option value="24">24 Hours (1 Day)</option>
                <option value="72">3 Days (72 Hours)</option>
                <option value="120">5 Days (Default)</option>
                <option value="168">7 Days (1 Week)</option>
                <option value="custom">Custom Date & Time</option>
              </select>
            </div>

            {formData.durationHours === 'custom' ? (
              <div>
                <label className="block font-semibold text-slate-800 mb-1">End Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endDateTime}
                  onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Winner Determination</label>
                <div className="text-[11px] text-slate-600 bg-white border border-slate-200 rounded-lg p-2 leading-relaxed">
                  Highest bidder when this time expires automatically wins the vehicle.
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Vehicle Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Vehicle history, condition, warranty, features..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
            {auctionToEdit && onDeleteListing && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDeleteListing(auctionToEdit.auctionId);
                }}
                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                title="Delete this listing"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-colors"
            >
              {auctionToEdit ? 'Save Listing Changes' : 'Submit for Admin Approval'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
