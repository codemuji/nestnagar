import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  MapPin, 
  ShieldCheck, 
  MessageSquare, 
  Heart, 
  Wifi, 
  Wind, 
  Utensils, 
  Car,
  ChevronRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import Button from '../../../components/Button';
import { getListingById } from '../services/listingService';
import { startConversation } from '../../chat/services/chatService';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-background flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-brand-secondary mb-4" size={48} />
        <p className="font-headings font-medium italic text-text-muted">Loading sanctuary details...</p>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-brand-background pb-32">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 bg-brand-background/80 backdrop-blur-md z-50 border-b border-border-light/30">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-brand-primary active:scale-95 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-brand-primary tracking-tighter uppercase">NestNagar</h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-brand-primary active:scale-95 transition-all">
          <Share2 size={20} />
        </button>
      </header>

      <main>
        {/* Image Gallery */}
        <section className="pt-20 px-4">
          <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory">
            {listing.photos.map((photo, idx) => (
              <div 
                key={idx}
                className="flex-none w-[85%] aspect-[4/5] snap-center rounded-3xl overflow-hidden shadow-card"
              >
                <img src={photo} alt={`${listing.title} ${idx}`} className="w-full h-full object-cover" />
              </div>
            ))}
            {listing.photos.length === 0 && (
              <div className="flex-none w-[85%] aspect-[4/5] snap-center rounded-3xl overflow-hidden bg-border-light flex items-center justify-center">
                <p className="text-text-muted">No photos available</p>
              </div>
            )}
          </div>
          <div className="flex justify-center mt-6 gap-1.5">
            {listing.photos.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeImage === idx ? 'w-6 bg-brand-secondary' : 'w-1.5 bg-border-default'
                }`}
              ></div>
            ))}
          </div>
        </section>

        {/* Content */}
        <section className="mt-8 px-6 space-y-8">
          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <p className="text-4xl font-headings font-bold text-brand-cta tracking-tight">
                ₹{displayPrice}<span className="text-sm font-normal text-text-muted ml-1">/mo</span>
              </p>
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

          {/* Owner Info Card */}
          <div className="p-5 bg-white rounded-3xl shadow-card border border-border-light/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-brand-background shadow-inner">
                <img 
                  src={listing.postedBy?.profilePhoto || `https://ui-avatars.com/api/?name=${listing.postedBy?.name}`} 
                  alt="owner" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-brand-primary">{listing.postedBy?.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="px-2 py-0.5 bg-brand-accent/10 text-brand-accent text-[10px] font-bold rounded-full uppercase border border-brand-accent/20 flex items-center gap-1">
                    <ShieldCheck size={10} />
                    {listing.posterRole === 'owner' ? 'Direct Owner' : 'Verified Broker'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Last active</p>
              <p className="text-xs font-bold text-brand-primary">Recently</p>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-brand-primary uppercase tracking-[0.2em]">Key Amenities</h3>
            <div className="grid grid-cols-4 gap-4">
              {listing.amenities.map((amt, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-border-light/30">
                  <div className="text-brand-secondary">
                    {amenityIcons[amt] || <Sparkles size={20} />}
                  </div>
                  <span className="text-[10px] font-bold text-text-secondary uppercase">{amt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-brand-primary uppercase tracking-[0.2em]">About this nest</h3>
            <p className={`text-sm leading-relaxed text-text-secondary ${!showFullDescription && 'line-clamp-3'}`}>
              {listing.description}
            </p>
            <button 
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-sm font-bold text-brand-secondary flex items-center gap-1 uppercase tracking-tight hover:underline"
            >
              {showFullDescription ? 'Show Less' : 'Read More'} 
              <ChevronRight size={16} className={showFullDescription ? '-rotate-90 transition-transform' : 'rotate-90 transition-transform'} />
            </button>
          </div>

          {/* Location Map Preview */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-brand-primary uppercase tracking-[0.2em]">Location</h3>
            <div className="relative w-full h-56 rounded-[2rem] overflow-hidden shadow-card group cursor-pointer border border-border-light/50">
              <img 
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2066&auto=format&fit=crop" 
                alt="map" 
                className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-brand-secondary/5"></div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl flex justify-between items-center shadow-lg">
                <div className="flex gap-3 items-center">
                  <div className="p-2 bg-brand-secondary text-white rounded-lg">
                    <MapPin size={18} />
                  </div>
                  <span className="text-xs font-bold text-brand-primary">View on interactive map</span>
                </div>
                <ChevronRight size={20} className="text-text-muted" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Fixed Bottom CTA */}
      <footer className="fixed bottom-0 left-0 w-full p-6 bg-white/80 backdrop-blur-xl border-t border-border-light/30 flex items-center gap-4 z-[60]">
        <button className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white border border-border-default text-brand-primary shadow-sm active:scale-90 transition-all hover:bg-brand-background">
          <Heart size={24} />
        </button>
        <Button 
          onClick={handleChat}
          className="flex-1 h-14 bg-brand-cta text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-brand-cta/20 active:scale-[0.98] transition-all"
        >
          <MessageSquare size={22} />
          Start Chat
        </Button>
      </footer>
    </div>
  );
};

export default ListingDetail;
