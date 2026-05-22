import React from 'react';
import { MapPin, MessageSquare, Calendar, User, Heart, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../../../components/Button';

const PartnerCardItem = ({ card, onChat, currentUserId }) => {
  const {
    _id,
    postedBy,
    purpose,
    budget,
    preferredLocality,
    moveInDate,
    genderPreference,
    habits = [],
    bio,
  } = card;

  const displayBudget = new Intl.NumberFormat('en-IN').format(budget);
  const formattedDate = moveInDate ? format(new Date(moveInDate), 'MMM yyyy') : 'Soon';
  const isOwnCard = postedBy?._id === currentUserId || postedBy?.id === currentUserId;

  return (
    <div className="group bg-white rounded-[1.5rem] p-6 transition-all duration-300 shadow-card hover:shadow-hover border border-border-light/50 space-y-4">
      {/* Profile Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-accent/20 bg-brand-background shrink-0">
            <img
              src={postedBy?.profilePhoto || `https://ui-avatars.com/api/?name=${postedBy?.name || 'User'}&background=628141&color=fff`}
              alt={postedBy?.name || 'Roommate'}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-headings font-bold text-brand-primary text-base leading-tight flex items-center gap-1.5">
              {postedBy?.name}
              {isOwnCard && (
                <span className="text-[9px] bg-border-light text-text-muted px-1.5 py-0.5 rounded-full font-bold uppercase">
                  You
                </span>
              )}
            </h3>
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest mt-0.5">
              {purpose === 'student' ? 'Student' : 'Professional'}
            </p>
          </div>
        </div>
        <div className="bg-brand-background px-3 py-1.5 rounded-lg border border-border-default/50 text-right shrink-0">
          <p className="text-[8px] text-text-muted uppercase font-bold tracking-widest">Max Rent</p>
          <p className="text-sm font-bold text-brand-cta">₹{displayBudget}<span className="text-[10px] font-normal text-text-muted font-sans">/mo</span></p>
        </div>
      </div>

      {/* Bio / Description */}
      <p className="text-sm text-text-secondary line-clamp-3 italic leading-relaxed">
        "{bio}"
      </p>

      {/* Details List */}
      <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-border-light/30 py-3">
        <div className="flex items-center gap-2 text-text-secondary">
          <MapPin size={14} className="text-brand-secondary" />
          <span className="truncate">Pref: <strong>{preferredLocality}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <Calendar size={14} className="text-brand-secondary" />
          <span>Move: <strong>{formattedDate}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary col-span-2">
          <User size={14} className="text-brand-secondary" />
          <span className="capitalize">Gender Preference: <strong>{genderPreference}</strong></span>
        </div>
      </div>

      {/* Habit Badges */}
      {habits.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {habits.map((habit, index) => (
            <span
              key={index}
              className="text-[10px] bg-brand-background/60 border border-border-default/30 text-text-secondary px-2.5 py-1 rounded-full font-medium"
            >
              {habit}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="pt-2">
        {isOwnCard ? (
          <Button
            variant="outline"
            disabled
            className="w-full h-11 text-xs"
          >
            My Roommate Request
          </Button>
        ) : (
          <Button
            onClick={() => onChat(_id)}
            variant="primary"
            className="w-full h-11 text-xs bg-brand-primary hover:bg-brand-primary/90"
          >
            <MessageSquare size={16} />
            Chat Now
          </Button>
        )}
      </div>
    </div>
  );
};

export default PartnerCardItem;
