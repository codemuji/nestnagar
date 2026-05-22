import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, 
  Eye, 
  MessageSquare, 
  Settings, 
  MoreHorizontal, 
  TrendingUp,
  Home,
  Loader2,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Bell
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { getMyListings, deleteListing, getDashboardStats } from '../../listings/services/listingService';
import Button from '../../../components/Button';
import BottomNav from '../../../components/BottomNav';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-border-light/50 space-y-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-3xl font-headings font-bold text-brand-primary">{value}</p>
      <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">{label}</p>
    </div>
  </div>
);

const Dashboard = ({ unread, setUnread }) => {
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState({ totalListings: 0, totalViews: 0, activeChats: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [listingsData, statsData] = await Promise.all([
        getMyListings(),
        getDashboardStats()
      ]);
      setListings(listingsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sanctuary?')) {
      try {
        await deleteListing(id);
        setListings(listings.filter(l => l._id !== id));
        // Refresh stats after deletion
        const statsData = await getDashboardStats();
        setStats(statsData);
      } catch (err) {
        alert('Failed to delete listing');
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-background pb-32">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 bg-brand-background/80 backdrop-blur-md z-50 border-b border-border-light/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-primary flex items-center justify-center rounded-lg text-white">
            <Home size={18} />
          </div>
          <h1 className="text-xl font-bold text-brand-primary tracking-tighter uppercase">Broker Hub</h1>
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
          <button className="p-2 text-text-secondary hover:bg-white rounded-full transition-all">
            <Settings size={22} />
          </button>
          <div className="w-10 h-10 rounded-full bg-brand-accent/20 border-2 border-brand-accent overflow-hidden shadow-inner">
            <img src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.name}`} alt="profile" />
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-4xl mx-auto space-y-8">
        {/* Welcome Header */}
        <section className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-headings font-bold text-brand-primary leading-tight">
              Hello, <span className="text-brand-secondary italic">{user?.name.split(' ')[0]}</span>
            </h2>
            <p className="text-text-secondary text-sm">Here's what's happening with your sanctuaries.</p>
          </div>
          <Link to="/post-listing">
            <Button className="rounded-2xl shadow-xl shadow-brand-primary/20">
              <Plus size={20} />
              <span className="hidden sm:inline">Post Sanctuary</span>
            </Button>
          </Link>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard 
            label="Total Sanctuaries" 
            value={stats.totalListings} 
            icon={Home} 
            color="bg-brand-primary/10 text-brand-primary"
          />
          <StatCard 
            label="Profile Views" 
            value={stats.totalViews} 
            icon={Eye} 
            color="bg-brand-accent/10 text-brand-accent"
          />
          <StatCard 
            label="Active Chats" 
            value={stats.activeChats} 
            icon={MessageSquare} 
            color="bg-brand-cta/10 text-brand-cta"
          />
        </section>

        {/* Managed Listings */}
        <section className="space-y-6">
          <h3 className="text-sm font-bold text-brand-primary uppercase tracking-[0.2em]">Managed Sanctuaries</h3>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-muted">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="font-headings font-medium italic">Syncing your portfolio...</p>
            </div>
          ) : listings.length > 0 ? (
            <div className="space-y-4">
              {listings.map((listing) => (
                <div key={listing._id} className="bg-white p-4 rounded-3xl border border-border-light shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-background shrink-0 border border-border-light/50">
                    <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-brand-primary truncate">{listing.title}</h4>
                    <p className="text-xs text-text-secondary mt-0.5">{listing.locality}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        <Eye size={12} /> {listing.views || 0}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-brand-secondary uppercase tracking-wider">
                        <MessageSquare size={12} /> 4
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        listing.status === 'available' 
                          ? 'bg-brand-accent/10 text-brand-accent border-brand-accent/20' 
                          : 'bg-brand-warning/10 text-brand-cta border-brand-warning/20'
                      }`}>
                        {listing.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => navigate(`/listings/${listing._id}`)}
                      className="p-2 text-text-muted hover:bg-brand-background rounded-full transition-all"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => navigate(`/listings/${listing._id}/edit`)}
                      className="p-2 text-text-muted hover:bg-brand-background rounded-full transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(listing._id)}
                      className="p-2 text-brand-error/60 hover:bg-brand-error/5 rounded-full transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-border-light">
              <div className="w-16 h-16 bg-brand-background rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted/50">
                <Home size={32} />
              </div>
              <p className="text-text-muted font-medium italic">You haven't posted any sanctuaries yet.</p>
              <Link to="/post-listing">
                <button className="mt-4 text-brand-secondary font-bold text-sm uppercase tracking-widest hover:underline">
                  Add Your First Property
                </button>
              </Link>
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
