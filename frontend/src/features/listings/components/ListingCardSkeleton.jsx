import React from 'react';

const ListingCardSkeleton = ({ compact = false }) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-card border border-border-light/50 animate-pulse">
    <div className={`relative w-full overflow-hidden bg-brand-background ${compact ? 'aspect-square' : 'aspect-[4/3]'}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-brand-background via-border-light to-brand-background bg-[length:200%_100%] animate-shimmer" />
    </div>
    <div className={`${compact ? 'p-3 space-y-2' : 'p-5 space-y-4'}`}>
      <div className="flex justify-between items-baseline">
        <div className="h-5 w-16 bg-brand-background rounded" />
        <div className="h-3 w-12 bg-brand-background rounded" />
      </div>
      <div className="h-4 w-3/4 bg-brand-background rounded" />
      <div className="h-3 w-1/2 bg-brand-background rounded" />
    </div>
  </div>
);

export default ListingCardSkeleton;
