import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';

const ImageGallery = ({ photos, title }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    dragFree: false,
    containScroll: 'trimSnaps',
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const [loadedImages, setLoadedImages] = useState({});

  const fallbackImage = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop';
  const displayPhotos = photos?.length > 0 ? photos : [fallbackImage];

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', () => {
      setScrollSnaps(emblaApi.scrollSnapList());
      onSelect();
    });
    onSelect();
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index) => emblaApi?.scrollTo(index), [emblaApi]);

  const handleImageLoad = (idx) => {
    setLoadedImages(prev => ({ ...prev, [idx]: true }));
  };

  if (displayPhotos.length === 0) {
    return (
      <div className="w-[85vw] max-w-md aspect-[4/5] mx-auto rounded-3xl bg-brand-background flex items-center justify-center">
        <ImageIcon size={48} className="text-text-muted/30" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Carousel */}
      <div className="relative">
        <div className="overflow-hidden rounded-3xl shadow-card" ref={emblaRef}>
          <div className="flex">
            {displayPhotos.map((photo, idx) => (
              <div
                key={idx}
                className="flex-[0_0_100%] min-w-0 aspect-[4/5] relative"
              >
                {!loadedImages[idx] && (
                  <div className="absolute inset-0 bg-brand-background animate-pulse" />
                )}
                <img
                  src={photo}
                  alt={`${title} ${idx + 1}`}
                  className={`w-full h-full object-cover transition-opacity duration-700 ${
                    loadedImages[idx] ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => handleImageLoad(idx)}
                  onError={(e) => {
                    e.target.src = fallbackImage;
                    handleImageLoad(idx);
                  }}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Counter Badge */}
        {displayPhotos.length > 1 && (
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-full">
            {selectedIndex + 1} / {displayPhotos.length}
          </div>
        )}

        {/* Navigation Buttons (larger touch targets) */}
        {displayPhotos.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              disabled={selectedIndex === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-lg text-brand-primary disabled:opacity-30 disabled:pointer-events-none hover:bg-white transition-all active:scale-95"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollNext}
              disabled={selectedIndex === displayPhotos.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-lg text-brand-primary disabled:opacity-30 disabled:pointer-events-none hover:bg-white transition-all active:scale-95"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip + Dots */}
      {displayPhotos.length > 1 && (
        <div className="px-4">
          {displayPhotos.length <= 5 ? (
            // Show thumbnails when there are few images
            <div className="flex gap-2 justify-center">
              {displayPhotos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollTo(idx)}
                  className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedIndex === idx
                      ? 'border-brand-secondary scale-105 opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                >
                  <img
                    src={photo}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : (
            // Show dots when there are many images
            <div className="flex justify-center gap-1.5">
              {scrollSnaps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollTo(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    selectedIndex === idx
                      ? 'w-6 bg-brand-secondary'
                      : 'w-1.5 bg-border-default hover:bg-brand-secondary/50'
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;