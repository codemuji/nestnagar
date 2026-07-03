import React from 'react';

const ListingDetailSkeleton = () => (
  <div className="min-h-screen bg-brand-background pb-32 animate-pulse">
    {/* Top Navigation */}
    <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 bg-brand-background/80 backdrop-blur-md z-50 border-b border-border-light/30">
      <div className="w-10 h-10 bg-brand-background rounded-full" />
      <div className="w-24 h-6 bg-brand-background rounded" />
      <div className="w-10 h-10 bg-brand-background rounded-full" />
    </header>

    <main className="pt-20">
      {/* Image Gallery Skeleton */}
      <section className="px-4">
        <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory">
          <div className="flex-none w-[85%] aspect-[4/5] snap-center rounded-3xl bg-brand-background" />
          <div className="flex-none w-[85%] aspect-[4/5] snap-center rounded-3xl bg-brand-background" />
          <div className="flex-none w-[85%] aspect-[4/5] snap-center rounded-3xl bg-brand-background" />
        </div>
        <div className="flex justify-center mt-6 gap-1.5">
          <div className="w-6 h-1.5 bg-brand-background rounded-full" />
          <div className="w-1.5 h-1.5 bg-brand-background rounded-full" />
          <div className="w-1.5 h-1.5 bg-brand-background rounded-full" />
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="mt-8 px-6 space-y-8">
        {/* Header Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div className="w-24 h-10 bg-brand-background rounded" />
            <div className="w-28 h-8 bg-brand-background rounded-full" />
          </div>
          <div className="w-3/4 h-8 bg-brand-background rounded" />
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-brand-background rounded-full" />
            <div className="w-40 h-4 bg-brand-background rounded" />
          </div>
        </div>

        {/* Owner Info Card */}
        <div className="p-5 bg-white rounded-3xl shadow-card border border-border-light/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-background rounded-full" />
            <div>
              <div className="w-28 h-5 bg-brand-background rounded" />
              <div className="w-32 h-5 bg-brand-background rounded-full mt-2" />
            </div>
          </div>
          <div className="text-right">
            <div className="w-16 h-3 bg-brand-background rounded" />
            <div className="w-20 h-4 bg-brand-background rounded mt-1" />
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-4">
          <div className="w-24 h-4 bg-brand-background rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-border-light/30">
                <div className="w-8 h-8 bg-brand-background rounded" />
                <div className="w-12 h-3 bg-brand-background rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <div className="w-20 h-4 bg-brand-background rounded" />
          <div className="h-20 bg-brand-background rounded" />
          <div className="w-28 h-5 bg-brand-background rounded" />
        </div>

        {/* Location Map Preview */}
        <div className="space-y-4 pt-4">
          <div className="w-16 h-4 bg-brand-background rounded" />
          <div className="w-full h-64 bg-brand-background rounded-[2rem]" />
        </div>
      </section>
    </main>

    {/* Fixed Bottom CTA Skeleton */}
    <footer className="fixed bottom-0 left-0 w-full p-6 bg-white/80 backdrop-blur-xl border-t border-border-light/30 flex items-center gap-4 z-[60]">
      <div className="w-14 h-14 bg-brand-background rounded-2xl" />
      <div className="flex-1 h-14 bg-brand-background rounded-2xl" />
    </footer>
  </div>
);

export default ListingDetailSkeleton;