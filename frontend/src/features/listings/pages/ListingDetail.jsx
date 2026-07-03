import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  MapPin,
  ShieldCheck,
  MessageSquare,
  Heart,
  Phone,
  Wifi,
  Wind,
  Utensils,
  Car,
  ChevronRight,
  Eye,
  Calendar,
  Users,
  CheckCircle2,
  ExternalLink,
  Copy,
  X,
} from 'lucide-react';
import Button from '../../../components/Button';
import ImageGallery from '../components/ImageGallery';
import SimilarListings from '../components/SimilarListings';
import ListingDetailSkeleton from '../components/ListingDetailSkeleton';
import { getListingById } from '../services/listingService';
import { startConversation } from '../../chat/services/chatService';
import { useSavedListings } from '../../../hooks/useSavedListings';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const { toggleSave, isSaved } = useSavedListings();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await getListingById(id);
        setListing(data);
      } catch (err) {
        console.error('Failed to fetch listing:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleChat = async () => {
    try {
      const conversation = await startConversation('listing', id, "Hi, I'm interested in this property.");
      navigate(`/chat/${conversation._id}`);
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  const handleCall = () => {
    if (listing?.postedBy?.phone) {
      window.location.href = `tel:${listing.postedBy.phone}`;
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: listing?.title || 'Check out this property',
      text: `Check out this ${listing?.type || 'property'} in ${listing?.locality || 'your area'} on NestNagar`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink(shareUrl);
        }
      }
    } else {
      handleCopyLink(shareUrl);
    }
  };

  const handleCopyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    } catch (err) {
      console.warn('Failed to copy link:', err);
    }
  };

  const handleDirections = () => {
    const query = listing?.coordinates?.lat && listing?.coordinates?.lng
      ? `${listing.coordinates.lat},${listing.coordinates.lng}`
      : encodeURIComponent(`${listing?.locality}, Itanagar, Arunachal Pradesh`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return <ListingDetailSkeleton />;
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-brand-background flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-headings font-bold mb-4">Sanctuary not found</h2>
        <Button onClick={() => navigate('/')}>Back to Feed</Button>
      </div>
    );
  }

  const amenityIcons = {
    'WiFi': <Wifi size={20} />,
    'AC': <Wind size={20} />,
    'Food': <Utensils size={20} />,
    'Parking': <Car size={20} />,
  };

  const displayPrice = new Intl.NumberFormat('en-IN').format(listing.price);
  const deposit = listing.deposit ? new Intl.NumberFormat('en-IN').format(listing.deposit) : null;
  const saved = isSaved(listing._id);

  return (
    <div className="min-h-screen bg-brand-background pb-32">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 bg-brand-background/80 backdrop-blur-md z-50 border-b border-border-light/30">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-brand-primary active:scale-95 transition-all"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-brand-primary tracking-tighter uppercase">NestNagar</h1>
        <button
          onClick={handleShare}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-brand-primary active:scale-95 transition-all"
          aria-label="Share listing"
        >
          <Share2 size={20} />
        </button>
      </header>

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-full shadow-lg flex items-center gap-2 animate-in fade-in-50 slide-in-from-top-5 duration-300">
          <CheckCircle2 size={16} />
          Link copied to clipboard!
        </div>
      )}

      <main>
        {/* Image Gallery */}
        <section className="pt-20 px-4">
          <ImageGallery photos={listing.photos || []} title={listing.title} />
        </section>

        {/* Content */}
        <section className="mt-8 px-6 space-y-8">
          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-4xl font-headings font-bold text-brand-cta tracking-tight">
                  ₹{displayPrice}<span className="text-sm font-normal text-text-muted ml-1">/mo</span>
                </p>
                {deposit && (
                  <p className="text-xs text-text-muted mt-1">
                    Deposit: <span className="font-semibold text-brand-secondary">₹{deposit}</span>
                  </p>
                )}
              </div>
              <span className="px-4 py-1.5 bg-brand-secondary/10 text-brand-secondary text-xs font-bold rounded-full uppercase tracking-widest border border-brand-secondary/20">
                Available Now
              </span>
            </div>
            <h2 className="text-2xl font-headings font-bold text-brand-primary">{listing.title}</h2>
            <div className="flex items-center gap-1.5 text-text-secondary">
              <MapPin size={18} className="text-brand-secondary" />
              <span className="font-medium">{listing.locality}, Itanagar</span>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-2 bg-white rounded-2xl p-4 shadow-sm border border-border-light/30">
            <div className="flex flex-col items-center gap-1 text-center">
              <Eye size={18} className="text-brand-secondary" />
              <p className="text-sm font-bold text-brand-primary">{listing.views || 0}</p>
              <p className="text-[9px] uppercase font-bold tracking-wider text-text-muted">Views</p>
            </div>
            <div className="flex flex-col items-center gap-1 text-center border-x border-border-light/30">
              <Users size={18} className="text-brand-secondary" />
              <p className="text-sm font-bold text-brand-primary capitalize">
                {listing.genderAllowed === 'any' ? 'All' : listing.genderAllowed}
              </p>
              <p className="text-[9px] uppercase font-bold tracking-wider text-text-muted">Allowed</p>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Calendar size={18} className="text-brand-secondary" />
              <p className="text-sm font-bold text-brand-primary">
                {new Date(listing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
              <p className="text-[9px] uppercase font-bold tracking-wider text-text-muted">Posted</p>
            </div>
          </div>

          {/* Owner Info Card */}
          <div className="p-5 bg-white rounded-3xl shadow-card border border-border-light/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-brand-background shadow-inner">
                  <img
                    src={listing.postedBy?.profilePhoto || `https://ui-avatars.com/api/?name=${listing.postedBy?.name}&background=random`}
                    alt="owner"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-brand-primary">{listing.postedBy?.name}</p>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <span className="px-2 py-0.5 bg-brand-accent/10 text-brand-accent text-[10px] font-bold rounded-full uppercase border border-brand-accent/20 flex items-center gap-1">
                      <ShieldCheck size={10} />
                      {listing.posterRole === 'owner' ? 'Direct Owner' : 'Verified Broker'}
                    </span>
                    {listing.postedBy?.isVerified && (
                      <span className="px-2 py-0.5 bg-brand-secondary/10 text-brand-secondary text-[10px] font-bold rounded-full uppercase border border-brand-secondary/20 flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        ID Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Last active</p>
                <p className="text-xs font-bold text-brand-primary">Recently</p>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-brand-primary uppercase tracking-[0.2em]">Key Amenities</h3>
            {listing.amenities?.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {listing.amenities.map((amt, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-border-light/30">
                    <div className="text-brand-secondary">
                      {amenityIcons[amt] || <Wifi size={20} />}
                    </div>
                    <span className="text-[10px] font-bold text-text-secondary uppercase text-center">{amt}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 text-center border border-border-light/30">
                <p className="text-sm text-text-muted">No amenities listed for this property.</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-brand-primary uppercase tracking-[0.2em]">About this nest</h3>
            <p className={`text-sm leading-relaxed text-text-secondary ${!showFullDescription && 'line-clamp-3'}`}>
              {listing.description || 'No description provided for this listing.'}
            </p>
            {listing.description && listing.description.length > 100 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-sm font-bold text-brand-secondary flex items-center gap-1 uppercase tracking-tight hover:underline"
              >
                {showFullDescription ? 'Show Less' : 'Read More'}
                <ChevronRight size={16} className={showFullDescription ? '-rotate-90 transition-transform' : 'rotate-90 transition-transform'} />
              </button>
            )}
          </div>

          {/* Location Map Preview */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand-primary uppercase tracking-[0.2em]">Location</h3>
              <button
                onClick={handleDirections}
                className="text-xs font-bold text-brand-secondary flex items-center gap-1 hover:underline"
              >
                <ExternalLink size={12} />
                Get Directions
              </button>
            </div>
            <div className="w-full h-64 rounded-[2rem] overflow-hidden shadow-card border border-border-light/50 relative">
              <iframe
                title="Sanctuary Location Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={
                  listing.coordinates && listing.coordinates.lat && listing.coordinates.lng
                    ? `https://maps.google.com/maps?q=${listing.coordinates.lat},${listing.coordinates.lng}&z=15&output=embed`
                    : `https://maps.google.com/maps?q=${encodeURIComponent(listing.locality + ', Itanagar, Arunachal Pradesh')}&z=15&output=embed`
                }
              ></iframe>
            </div>
            {listing.coordinates && listing.coordinates.lat && listing.coordinates.lng && (
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider text-center">
                Coordinates: {Number(listing.coordinates.lat).toFixed(4)}, {Number(listing.coordinates.lng).toFixed(4)}
              </p>
            )}
          </div>

          {/* Similar Listings */}
          <SimilarListings currentListing={listing} />
        </section>
      </main>

      {/* Fixed Bottom CTA Bar */}
      <footer className="fixed bottom-0 left-0 w-full p-4 bg-white/95 backdrop-blur-xl border-t border-border-light/30 z-[60]">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {/* Price visible on mobile sticky CTA */}
          <div className="hidden sm:block">
            <p className="text-lg font-headings font-bold text-brand-cta leading-none">
              ₹{displayPrice}
            </p>
            <p className="text-[10px] text-text-muted font-bold uppercase">per month</p>
          </div>

          {/* Call button */}
          <button
            onClick={handleCall}
            disabled={!listing.postedBy?.phone}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-border-default text-brand-primary shadow-sm active:scale-90 transition-all hover:bg-brand-background disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Call owner"
          >
            <Phone size={20} />
          </button>

          {/* Save button */}
          <button
            onClick={() => toggleSave(listing._id)}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl border shadow-sm active:scale-90 transition-all ${
              saved
                ? 'bg-brand-cta border-brand-cta text-white'
                : 'bg-white border-border-default text-brand-primary hover:bg-brand-background'
            }`}
            aria-label={saved ? 'Unsave listing' : 'Save listing'}
          >
            <Heart size={20} fill={saved ? 'currentColor' : 'none'} className={saved ? 'animate-pulse' : ''} />
          </button>

          {/* Chat - Primary CTA */}
          <Button
            onClick={handleChat}
            className="flex-1 h-12 bg-brand-cta text-white rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-brand-cta/20 active:scale-[0.98] transition-all"
          >
            <MessageSquare size={20} />
            Start Chat
          </Button>
        </div>
      </footer>

    </div>
  );
};

export default ListingDetail;