import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, MessageCircle, Loader2 } from 'lucide-react';
import { getConversations } from '../services/chatService';
import ConversationItem from '../components/ConversationItem';
import BottomNav from '../../../components/BottomNav';

const ChatInbox = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        setConversations(data);
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter((conv) => {
    // Find the other participant's name
    const otherParticipant = conv.participants.find(p => p.id !== p._id); // Simple mock check
    // Actually need a better check but for now filtering is fine
    return conv.lastMessage?.text?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-brand-background pb-24">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 bg-brand-background/80 backdrop-blur-md z-50 border-b border-border-light/30 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-primary flex items-center justify-center rounded-lg text-white">
            <MessageCircle size={18} />
          </div>
          <h1 className="text-xl font-bold text-brand-primary tracking-tighter uppercase">Messages</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-text-secondary hover:bg-white rounded-full transition-all">
            <Bell size={22} />
          </button>
        </div>
      </header>

      <main className="pt-24 px-4 max-w-2xl mx-auto">
        {/* Search Bar */}
        <section className="mb-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-secondary transition-colors" size={20} />
            <input 
              className="input-field pl-12 h-14 bg-white border-none shadow-sm focus:shadow-md transition-all"
              placeholder="Search conversations..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* Categories Chips */}
        <section className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          <button className="bg-brand-primary text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">All Messages</button>
          <button className="bg-white text-text-muted px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-border-default/50 hover:border-brand-secondary transition-all">Unread</button>
          <button className="bg-white text-text-muted px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-border-default/50 hover:border-brand-secondary transition-all">Leads</button>
        </section>

        {/* Conversations List */}
        <section className="space-y-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-muted">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="font-headings font-medium italic">Opening your inbox...</p>
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <ConversationItem 
                key={conv._id} 
                conversation={conv} 
                onClick={(id) => navigate(`/chat/${id}`)}
              />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-border-light shadow-inner">
              <div className="w-16 h-16 bg-brand-background rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
                <MessageCircle size={32} />
              </div>
              <p className="text-text-muted font-medium italic">No conversations yet.</p>
              <button onClick={() => navigate('/')} className="mt-4 text-brand-secondary font-bold text-sm uppercase tracking-widest hover:underline">
                Explore Sanctuaries
              </button>
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default ChatInbox;
