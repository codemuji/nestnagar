import React, { useState } from 'react';
import { MapPin, Heart, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const ListingCard = ({ listing }) => {
  const {
    _id, title, price, locality, type, photos,
    posterRole,
  } = listing;

  const displayPrice = new Intl.NumberFormat('en-IN').format(price);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fallbackImage = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop';
  const imageSrc = (photos?.[0] && !imageError) ? photos[0] : fallbackImage;

  return (
    <Link
      to={`/listings/${_id}`}
      className="group block bg-white rounded-2xl overflow-hidden transition-all duration-300 shadow-card hover:shadow-hover border border-border-light/50 active:scale-[0.98]"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        {!imageLoaded && (
          <div
            className="absolute inset-0 w-full h-full object-cover blur-[20px] scale-110 bg-brand-background"
            style={{ backgroundImage: `url(${imageSrc})` }}
            aria-hidden="true"
          />
        )}
        <img
          src={imageSrc}
          alt={title}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-700 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            if (!imageError) setImageError(true);
            setImageLoaded(true);
          }}
        />

        {posterRole === 'owner' && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-brand-secondary text-white text-[8px] font-bold uppercase tracking-widest rounded-full shadow-md flex items-center gap-1">
            <ShieldCheck size={9} />
            Owner
          </span>
        )}

        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-md rounded-full text-text-muted hover:text-brand-cta transition-all"
          aria-label="Save"
        >
          <Heart size={14} />
        </button>
      </div>

      <div className="p-3 space-y-1.5">
        <div className="flex justify-between items-baseline gap-2">
          <p className="text-brand-cta font-headings text-base font-bold leading-none truncate">
            ₹{displayPrice}<span className="text-[10px] font-normal text-text-muted ml-0.5">/mo</span>
          </p>
          <span className="text-[9px] font-bold text-brand-secondary uppercase tracking-wider truncate">
            {type.replace('-', ' ')}
          </span>
        </div>

        <h3 className="text-brand-primary font-bold text-sm leading-tight line-clamp-1">
          {title}
        </h3>

        <div className="flex items-center gap-1 text-text-secondary text-xs">
          <MapPin size={11} className="text-brand-secondary shrink-0" />
          <span className="truncate">{locality}</span>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
