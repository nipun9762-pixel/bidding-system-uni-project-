import React, { useState } from 'react';
import { ChevronDown, RotateCcw, Filter } from 'lucide-react';

export default function FilterSidebar({ filters, setFilters, onResetFilters }) {
  const [openSections, setOpenSections] = useState({
    carType: true,
    brand: true,
    model: true,
    transmission: true,
    year: true
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const brands = ['All Brands', 'Porsche', 'Chevrolet', 'McLaren', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi'];
  const transmissions = ['All Transmissions', 'Rear-Wheel Drive', 'Automatic', 'Dual-Clutch', 'Sequential', 'AWD'];
  const vehicleTypes = ['All Types', 'Sedan', 'Coupe', 'Hypercar', 'SUV', 'Convertible'];

  return (
    <aside className="w-full lg:w-64 bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3.5 text-xs h-fit sticky top-20 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Filters</span>
        </div>
        <button
          onClick={onResetFilters}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors text-[11px] font-medium"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Brand Select */}
      <div className="border-b border-slate-100 pb-3">
        <button
          onClick={() => toggleSection('brand')}
          className="w-full flex items-center justify-between font-medium text-slate-800 py-1 text-left"
        >
          <span>Brand</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openSections.brand ? 'rotate-180' : ''}`} />
        </button>
        {openSections.brand && (
          <div className="mt-2 space-y-1">
            <select
              value={filters.brand}
              onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 transition-colors"
            >
              {brands.map(b => (
                <option key={b} value={b === 'All Brands' ? '' : b}>{b}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Vehicle Type Select */}
      <div className="border-b border-slate-100 pb-3">
        <button
          onClick={() => toggleSection('carType')}
          className="w-full flex items-center justify-between font-medium text-slate-800 py-1 text-left"
        >
          <span>Vehicle Type</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openSections.carType ? 'rotate-180' : ''}`} />
        </button>
        {openSections.carType && (
          <div className="mt-2 space-y-1">
            <select
              value={filters.vehicleType}
              onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 transition-colors"
            >
              {vehicleTypes.map(t => (
                <option key={t} value={t === 'All Types' ? '' : t}>{t}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Transmission Select */}
      <div className="border-b border-slate-100 pb-3">
        <button
          onClick={() => toggleSection('transmission')}
          className="w-full flex items-center justify-between font-medium text-slate-800 py-1 text-left"
        >
          <span>Drivetrain</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openSections.transmission ? 'rotate-180' : ''}`} />
        </button>
        {openSections.transmission && (
          <div className="mt-2 space-y-1">
            <select
              value={filters.transmission}
              onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 transition-colors"
            >
              {transmissions.map(tr => (
                <option key={tr} value={tr === 'All Transmissions' ? '' : tr}>{tr}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Year Range */}
      <div className="pb-1">
        <button
          onClick={() => toggleSection('year')}
          className="w-full flex items-center justify-between font-medium text-slate-800 py-1 text-left"
        >
          <span>Year Range</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openSections.year ? 'rotate-180' : ''}`} />
        </button>
        {openSections.year && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              value={filters.minYear}
              onChange={(e) => setFilters({ ...filters, minYear: e.target.value })}
              className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-center text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
              placeholder="2020"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              value={filters.maxYear}
              onChange={(e) => setFilters({ ...filters, maxYear: e.target.value })}
              className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-center text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
              placeholder="2026"
            />
          </div>
        )}
      </div>

    </aside>
  );
}
