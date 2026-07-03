import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Loader2, ChevronRight } from 'lucide-react';
import { getAllListings } from '../services/listingService';

const SimilarListings = ({ currentListing }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      if (!currentListing) return;
      setLoading(true);
      try {
        // Fetch all listings and filter client-side based on matching type or locality
        const params = { status: 'available' };

        // Try to fetch by same type and locality
        const allListings = await getAllListings(params);

        // Filter: matching locality OR matching type, exclude current
        const filtered = allListings
          .filter(l => l._id !== currentListing._id)
          .filter(l => 
            l.locality?.toLowerCase() === currentListing.locality?.toLowerCase() ||
            l.type === currentListing.type
          )
          .slice(0, 6);

        setListings(filtered);
      } catch (err) {
        console.error('Failed to fetch similar listings:', err);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [currentListing]);

  const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price);

  return (
    <section className="mt-12 -mx-6">
      <div className="px-6 flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-brand-primary uppercase tracking-[0.2em]">
            Similar Sanctuaries
          </h3>
          <p className="text-xs text-text-muted mt-1">
            In {currentListing?.locality || 'this area'}
          </p>
        </div>
        {listings.length > 0 && (
          <Link
            to={`/?locality=${encodeURIComponent(currentListing?.locality || '')}`}
            className="text-xs font-bold text-brand-secondary flex items-center gap-1 hover:underline"
          >
            See all
            <ChevronRight size={14} />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-64 aspect-[4/5] bg-brand-background rounded-3xl animate-pulse"
            />
          ))}
        </div>
      ) : listings.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-2 snap-x snap-mandatory">
          {listings.map((item) => (
            <Link
              key={item._id}
              to={`/listings/${item._id}`}
              className="flex-shrink-0 w-64 snap-start group"
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-hover transition-all border border-border-light/50 h-full">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-background">
                  <img
                    src={item.photos?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=400'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all"
                    aria-label="Save listing"
                  >
                    <Heart size={16} />
                  </button>
                  {item.posterRole === 'owner' && (
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-brand-secondary text-white text-[9px] font-bold uppercase tracking-widest rounded-full">
                      Direct Owner
                    </span>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-brand-cta font-headings text-lg font-bold">
                    ₹{formatPrice(item.price)}
                    <span className="text-[10px] font-normal text-text-muted ml-1">/mo</span>
                  </p>
                  <h4 className="text-brand-primary font-bold text-sm leading-tight line-clamp-1">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1 text-text-secondary text-xs">
                    <MapPin size={12} className="text-brand-secondary flex-shrink-0" />
                    <span className="truncate">{item.locality}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="px-6 py-8 text-center bg-white rounded-3xl border-2 border-dashed border-border-light">
          <p className="text-sm text-text-muted">
            No similar listings found in this locality.
          </p>
        </div>
      )}
    </section>
  );
};

export default SimilarListings;