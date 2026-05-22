import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Users, SlidersHorizontal, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import PartnerCardItem from '../components/PartnerCardItem';
import BottomNav from '../../../components/BottomNav';
import { getPartnerCards } from '../services/partnerService';
import { startConversation } from '../../chat/services/chatService';

const PartnersFeed = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePurpose, setActivePurpose] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [maxBudget, setMaxBudget] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPartners = async () => {
      setLoading(true);
      try {
        const params = {};
        if (activePurpose !== 'All') {
          params.purpose = activePurpose.toLowerCase(); // 'student' or 'working'
        }
        if (genderFilter !== 'All') {
          params.genderPreference = genderFilter.toLowerCase();
        }
        if (maxBudget) {
          params.maxBudget = Number(maxBudget);
        }

        const data = await getPartnerCards(params);
        setCards(data);
      } catch (err) {
        console.error('Failed to fetch partner cards:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchPartners();
    }, 300);

    return () => clearTimeout(timer);
  }, [activePurpose, genderFilter, maxBudget]);

  const handleChat = async (partnerCardId) => {
    try {
      const conversation = await startConversation('partnerCard', partnerCardId, "Hi, I saw your roommate card on NestNagar. Let's connect!");
      navigate(`/chat/${conversation._id}`);
    } catch (err) {
      console.error('Failed to start chat:', err);
      alert('Could not start chat. You cannot start a conversation with yourself.');
    }
  };

  const purposes = ['All', 'Student', 'Working'];
  const genders = ['All', 'Any', 'Male', 'Female'];

  return (
    <div className="min-h-screen bg-brand-background pb-32">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 bg-brand-background/80 backdrop-blur-md z-50 border-b border-border-light/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-secondary flex items-center justify-center rounded-lg text-white">
            <Users size={18} />
          </div>
          <h1 className="text-xl font-bold text-brand-primary tracking-tighter uppercase">Rent Partners</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/partners/create">
            <button className="flex items-center gap-1 bg-brand-secondary text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-lg active:scale-95 transition-all">
              <Plus size={16} />
              Post Card
            </button>
          </Link>
          <div className="w-10 h-10 rounded-full bg-brand-accent/20 border-2 border-brand-accent overflow-hidden">
            <img src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.name}`} alt="profile" />
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto space-y-8">
        {/* Editorial Welcome */}
        <section className="space-y-2">
          <h2 className="text-4xl font-headings font-bold text-brand-primary leading-tight tracking-tight">
            Find your ideal <br />
            <span className="text-brand-secondary italic">roommate.</span>
          </h2>
          <p className="text-text-secondary text-sm">Connect with local students and professionals looking to share rent in Itanagar.</p>
        </section>

        {/* Filters Toggle and Main Slider */}
        <section className="bg-white rounded-3xl p-5 border border-border-light/50 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {purposes.map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePurpose(p)}
                  className={`px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-wider transition-all ${
                    activePurpose === p
                      ? 'bg-brand-secondary text-white'
                      : 'bg-brand-background text-text-muted hover:bg-border-light/50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-all ${
                showFilters ? 'bg-brand-primary text-white border-brand-primary' : 'bg-brand-background text-text-muted border-border-light/50'
              }`}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {showFilters && (
            <div className="pt-3 border-t border-border-light/30 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest">Gender Preference</label>
                <div className="flex flex-wrap gap-1.5">
                  {genders.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenderFilter(g)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                        genderFilter === g
                          ? 'bg-brand-primary text-white'
                          : 'bg-brand-background text-text-muted border border-border-light/20 hover:border-brand-primary/50'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest">Max Budget (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="input-field h-10 px-4 text-xs font-semibold"
                />
              </div>
            </div>
          )}
        </section>

        {/* Partners Cards Feed */}
        <section className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-muted">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="font-headings font-medium italic">Finding compatible roommates...</p>
            </div>
          ) : cards.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {cards.map((cardItem) => (
                <PartnerCardItem
                  key={cardItem._id}
                  card={cardItem}
                  onChat={handleChat}
                  currentUserId={user?._id || user?.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-border-light p-6">
              <div className="w-16 h-16 bg-brand-background rounded-full flex items-center justify-center mx-auto mb-4 text-brand-secondary">
                <Users size={32} />
              </div>
              <p className="text-text-muted font-medium italic">No roommate requests found matching your filters.</p>
              <Link to="/partners/create">
                <button className="mt-4 text-brand-secondary font-bold text-xs uppercase tracking-widest hover:underline">
                  Create Your Card
                </button>
              </Link>
            </div>
          )}
        </section>

        {/* Bento Promotion */}
        <section className="bg-brand-primary text-white rounded-[2.5rem] p-10 space-y-6 overflow-hidden relative group">
          <div className="relative z-10 space-y-4">
            <h3 className="text-3xl font-headings font-bold leading-tight">Create your <br/>roommate card</h3>
            <p className="text-white/70 text-sm max-w-[240px]">List your habits and budget to let people find and match with you directly.</p>
            <Link to="/partners/create">
              <button className="bg-brand-cta text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-brand-cta/20">
                Post Card Now
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-brand-secondary/20 rounded-full blur-3xl group-hover:bg-brand-secondary/40 transition-all duration-700"></div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default PartnersFeed;
