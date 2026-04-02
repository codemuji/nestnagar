import React from 'react';
import { MapPin, MessageSquare, Heart, ShieldCheck, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../../components/Button';

const ListingCard = ({ listing, onChat }) => {
  const { 
    _id, title, price, locality, type, photos, 
    posterRole, amenities, genderAllowed 
  } = listing;

  const displayPrice = new Intl.NumberFormat('en-IN').format(price);

  return (
    <div className="group bg-white rounded-[1.5rem] overflow-hidden transition-all duration-300 shadow-card hover:shadow-hover border border-border-light/50">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img 
          src={photos[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop'} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {posterRole === 'owner' ? (
            <span className="px-3 py-1 bg-brand-secondary text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1">
              <ShieldCheck size={12} />
              Direct Owner
            </span>
          ) : (
            <span className="px-3 py-1 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
              Broker
            </span>
          )}
        </div>
        <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all">
          <Heart size={20} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-brand-cta font-headings text-2xl font-bold">
              ₹{displayPrice}<span className="text-xs font-normal text-text-muted ml-1">/mo</span>
            </p>
            <h3 className="text-brand-primary font-bold text-lg leading-tight line-clamp-1">{title}</h3>
            <div className="flex items-center gap-1 text-text-secondary text-sm">
              <MapPin size={14} className="text-brand-secondary" />
              <span>{locality}</span>
            </div>
          </div>
          <div className="bg-brand-background px-3 py-1.5 rounded-lg border border-border-default/50">
            <p className="text-[9px] text-text-muted uppercase font-bold tracking-tighter">Type</p>
            <p className="text-xs font-bold text-brand-secondary capitalize">{type.replace('-', ' ')}</p>
          </div>
        </div>

        {/* Amenities Preview */}
        <div className="flex items-center gap-4 text-text-muted py-1 border-y border-border-light/30">
          {amenities.slice(0, 3).map((amt, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium">{amt}</span>
            </div>
          ))}
          {amenities.length > 3 && (
            <span className="text-[10px] font-medium text-brand-secondary">+{amenities.length - 3} more</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link to={`/listings/${_id}`}>
            <Button variant="outline" className="w-full h-11 text-xs">
              View Details
            </Button>
          </Link>
          <Button 
            onClick={() => onChat(_id)}
            variant="primary" 
            className="w-full h-11 text-xs bg-brand-primary hover:bg-brand-primary/90"
          >
            <MessageSquare size={16} />
            Chat Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
