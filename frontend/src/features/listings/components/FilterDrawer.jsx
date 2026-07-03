import React, { useEffect, useRef } from 'react';
import { X, ChevronDown, ChevronUp, SlidersHorizontal, Filter as FilterIcon, Check, X as XIcon } from 'lucide-react';

const AMENITIES = [
  'WiFi', 'AC', 'Parking', 'Kitchen', 'Laundry', 'Gym',
  'Security', 'Power Backup', 'Water Supply', 'Balcony',
  'Furnished', 'Lift', 'CCTV', 'Maintenance'
];

const PROPERTY_TYPES = [
  { value: 'pg', label: 'PG' },
  { value: 'single-room', label: 'Single Room' },
  { value: 'flat', label: 'Full Flat' },
];

const GENDER_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: 'male', label: 'Male Only' },
  { value: 'female', label: 'Female Only' },
];

const FilterDrawer = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange,
  onApply,
  resultsCount 
}) => {
  const drawerRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleTouchStart = (e) => {
    if (e.target.closest('[data-slider]')) return;
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    currentY.current = e.touches[0].clientY;
    const delta = currentY.current - startY.current;
    if (delta > 0) {
      drawerRef.current.style.transform = `translateY(${delta}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const delta = currentY.current - startY.current;
    if (delta > 100) {
      onClose();
    }
    drawerRef.current.style.transform = '';
  };

  const handlePriceChange = (type, value) => {
    onFiltersChange(prev => ({
      ...prev,
      price: { ...prev.price, [type]: value }
    }));
  };

  const handleTypeToggle = (type) => {
    onFiltersChange(prev => {
      const types = prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type];
      return { ...prev, types };
    });
  };

  const handleAmenityToggle = (amenity) => {
    onFiltersChange(prev => {
      const amenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities };
    });
  };

  const handleGenderChange = (gender) => {
    onFiltersChange(prev => ({ ...prev, genderAllowed: gender }));
  };

  const handleVerifiedToggle = () => {
    onFiltersChange(prev => ({ ...prev, verifiedOnly: !prev.verifiedOnly }));
  };

  const handleClearAll = () => {
    onFiltersChange({
      price: { min: 0, max: 50000 },
      types: [],
      amenities: [],
      genderAllowed: 'any',
      verifiedOnly: false,
    });
  };

  const hasActiveFilters = filters.price.min > 0 || 
    filters.price.max < 50000 ||
    filters.types.length > 0 ||
    filters.amenities.length > 0 ||
    filters.genderAllowed !== 'any' ||
    filters.verifiedOnly;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" role="dialog" aria-modal="true" aria-labelledby="filter-title">
      {/* Backdrop - absolute to parent, not fixed */}
      <div 
        className="absolute inset-0 bg-black/50 animate-in fade-in-20 duration-200" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer - relative with z-10 to sit above backdrop */}
      <div
        ref={drawerRef}
        className="relative z-10 flex-1 bg-white rounded-t-[1.5rem] shadow-xl animate-in slide-in-from-bottom-full duration-300 flex flex-col max-h-[90vh]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle & Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-light/50 sticky top-0 bg-white z-10 rounded-t-[1.5rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-1 rounded-full bg-border-light mx-auto" />
          </div>
          <h2 id="filter-title" className="font-headings font-bold text-xl text-brand-primary flex-1 text-center">
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-brand-secondary/10 text-brand-secondary text-xs font-bold rounded-full">
                {resultsCount > 0 ? `${resultsCount} results` : 'Active'}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-brand-primary hover:bg-brand-background rounded-full transition-colors"
            aria-label="Close filters"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filter Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
          {/* Price Range */}
          <section data-section="price">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headings font-semibold text-brand-primary">Price Range</h3>
              <span className="text-sm font-bold text-brand-secondary">
                ₹{filters.price.min.toLocaleString()} - ₹{filters.price.max.toLocaleString()}
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <label htmlFor="min-price" className="text-xs text-text-muted mb-1 block">Min Price</label>
                <input
                  id="min-price"
                  type="range"
                  min="0"
                  max="50000"
                  step="500"
                  value={filters.price.min}
                  onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                  className="w-full h-2 bg-brand-background rounded-lg appearance-none accent-brand-primary"
                  data-slider
                />
              </div>
              <div>
                <label htmlFor="max-price" className="text-xs text-text-muted mb-1 block">Max Price</label>
                <input
                  id="max-price"
                  type="range"
                  min="0"
                  max="50000"
                  step="500"
                  value={filters.price.max}
                  onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                  className="w-full h-2 bg-brand-background rounded-lg appearance-none accent-brand-secondary"
                  data-slider
                />
              </div>
            </div>
          </section>

          {/* Property Types */}
          <section data-section="types">
            <h3 className="font-headings font-semibold text-brand-primary mb-3">Property Type</h3>
            <div className="flex gap-2 flex-wrap">
              {PROPERTY_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleTypeToggle(value)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    filters.types.includes(value)
                      ? 'bg-brand-primary text-white shadow-md'
                      : 'bg-white text-text-muted border border-border-default/50 hover:border-brand-secondary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* Gender Allowed */}
          <section data-section="gender">
            <h3 className="font-headings font-semibold text-brand-primary mb-3">Gender Preference</h3>
            <div className="flex gap-2 flex-wrap">
              {GENDER_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleGenderChange(value)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    filters.genderAllowed === value
                      ? 'bg-brand-secondary text-white shadow-md'
                      : 'bg-white text-text-muted border border-border-default/50 hover:border-brand-secondary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* Amenities */}
          <section data-section="amenities">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headings font-semibold text-brand-primary">Amenities</h3>
              {filters.amenities.length > 0 && (
                <button
                  onClick={() => onFiltersChange(prev => ({ ...prev, amenities: [] }))}
                  className="text-xs font-bold text-brand-secondary hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITIES.map((amenity) => (
                <label
                  key={amenity}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                    filters.amenities.includes(amenity)
                      ? 'bg-brand-secondary/10 border-brand-secondary/50 text-brand-secondary'
                      : 'bg-white border-border-default/50 text-text-secondary hover:border-brand-secondary/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="w-4 h-4 text-brand-secondary border-border-default rounded focus:ring-2 focus:ring-brand-secondary/20 accent-brand-secondary"
                  />
                  <span className="text-sm font-medium">{amenity}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Verified Owner */}
          <section data-section="verified">
            <label className="flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={handleVerifiedToggle}
                className="w-5 h-5 text-brand-secondary border-border-default rounded focus:ring-2 focus:ring-brand-secondary/20 accent-brand-secondary"
              />
              <div>
                <span className="font-bold text-brand-primary">Verified Owner Only</span>
                <p className="text-xs text-text-muted mt-0.5">Show only listings from verified owners</p>
              </div>
            </label>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-light/50 p-4 pb-safe flex gap-3 rounded-b-[1.5rem] shadow-lg shadow-black/5">
          <button
            onClick={handleClearAll}
            disabled={!hasActiveFilters}
            className="flex-1 btn-outline disabled:opacity-50 disabled:pointer-events-none"
          >
            <XIcon size={18} className="mr-2" />
            Clear All
          </button>
          <button
            onClick={onApply}
            className="flex-1 btn-primary"
          >
            <FilterIcon size={18} className="mr-2" />
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterDrawer;