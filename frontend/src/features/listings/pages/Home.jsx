import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Bell, Sparkles, Loader2 } from 'lucide-react';
import ListingCard from '../components/ListingCard';
import BottomNav from '../../../components/BottomNav';
import { getPersonalisedListings } from '../services/listingService';
import { startConversation } from '../../chat/services/chatService';

const Home = ({ unread, setUnread }) => {
  const [listings, setListings] = useState([]);
  const [feedMessage, setFeedMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchLocality, setSearchLocality] = useState('');
  
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = {};
        if (searchLocality) params.locality = searchLocality;
        if (activeCategory !== 'All') {
          // Map UI categories to backend types
          const categoryMap = {
            'Rooms': 'single-room',
            'PGs': 'pg',
            'Full Flats': 'flat'
          };
          params.type = categoryMap[activeCategory] || activeCategory.toLowerCase();
        }

        const data = await getPersonalisedListings(params);
        setListings(data.listings);
        setFeedMessage(data.feedMessage);
      } catch (err) {
        console.error('Failed to fetch listings:', err);
        if (err.response?.status === 400) {
          navigate('/onboarding');
        }
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchListings();
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [navigate, activeCategory, searchLocality]);

  const handleChat = async (listingId) => {
    try {
      const conversation = await startConversation('listing', listingId, "Hi, I'm interested in this property.");
      navigate(`/chat/${conversation._id}`);
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  const categories = ['All', 'Rooms', 'PGs', 'Full Flats'];

  return (
    <div className="min-h-screen bg-brand-background pb-32">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 bg-brand-background/80 backdrop-blur-md z-50 border-b border-border-light/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-primary flex items-center justify-center rounded-lg text-white">
            <Sparkles size={18} />
          </div>
          <h1 className="text-xl font-bold text-brand-primary tracking-tighter uppercase">NestNagar</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setUnread(false);
              navigate('/chat');
            }}
            className="relative p-2 text-text-secondary hover:bg-white rounded-full transition-all"
          >
            <Bell size={22} />
            {unread && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-cta rounded-full border-2 border-brand-background animate-pulse"></span>
            )}
          </button>
          <div className="w-10 h-10 rounded-full bg-brand-accent/20 border-2 border-brand-accent overflow-hidden">
            <img src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.name}`} alt="profile" />
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto space-y-8">
        {/* Editorial Welcome */}
        <section className="space-y-2">
          <h2 className="text-4xl font-headings font-bold text-brand-primary leading-tight tracking-tight">
            Find your next <br />
            <span className="text-brand-secondary italic">sanctuary.</span>
          </h2>
          {feedMessage && !searchLocality && activeCategory === 'All' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-secondary/10 text-brand-secondary rounded-full text-xs font-bold uppercase tracking-widest">
              <Sparkles size={14} />
              {feedMessage}
            </div>
          )}
        </section>

        {/* Search & Filter */}
        <section className="sticky top-20 z-40 py-2">
          <div className="flex items-center gap-3">
            <div className="relative flex-grow group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-secondary transition-colors" size={20} />
              <input 
                className="input-field pl-12 h-14 bg-white border-none shadow-sm group-focus-within:shadow-md transition-all"
                placeholder="Search by locality..."
                type="text"
                value={searchLocality}
                onChange={(e) => setSearchLocality(e.target.value)}
              />
            </div>
            <button className="p-4 bg-brand-primary text-white rounded-2xl shadow-lg active:scale-95 transition-transform">
              <SlidersHorizontal size={22} />
            </button>
          </div>
        </section>

        {/* Categories */}
        <section className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6 py-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
                activeCategory === cat 
                  ? 'bg-brand-secondary text-white shadow-md' 
                  : 'bg-white text-text-muted border border-border-default/50 hover:border-brand-secondary'
              }`}
            >
              {cat}
            </button>
          ))}
        </section>

        {/* Listings Feed */}
        <section className="space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-muted">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="font-headings font-medium italic">Curating your feed...</p>
            </div>
          ) : listings.length > 0 ? (
            listings.map((item) => (
              <ListingCard key={item._id} listing={item} onChat={handleChat} />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-border-light">
              <p className="text-text-muted">No homes found in this sanctuary yet.</p>
            </div>
          )}
        </section>

        {/* Bento Promotion */}
        <section className="bg-brand-primary text-white rounded-[2.5rem] p-10 space-y-6 overflow-hidden relative group">
          <div className="relative z-10 space-y-4">
            <h3 className="text-3xl font-headings font-bold leading-tight">Join NestNagar <br/>Partner Program</h3>
            <p className="text-white/70 text-sm max-w-[200px]">List your property with us and get verified within 24 hours.</p>
            <button className="bg-brand-cta text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-brand-cta/20">
              Learn More
              <Sparkles size={16} />
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-brand-secondary/20 rounded-full blur-3xl group-hover:bg-brand-secondary/40 transition-all duration-700"></div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
