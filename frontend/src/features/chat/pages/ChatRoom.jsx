import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  Send, 
  PlusCircle, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video,
  Loader2,
  MapPin,
  Calendar,
  Users
} from 'lucide-react';
import { getMessages, getConversations, markRead } from '../services/chatService';
import { initSocket, getSocket } from '../socket';
import ChatBubble from '../components/ChatBubble';

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  
  const scrollRef = useRef();
  const socketRef = useRef();

  useEffect(() => {
    // 1. Fetch conversation details & messages
    const fetchData = async () => {
      try {
        const [convs, msgs] = await Promise.all([
          getConversations(),
          getMessages(id)
        ]);
        const currentConv = convs.find(c => c._id === id);
        setConversation(currentConv);
        setMessages(msgs);
        
        // Mark as read in DB
        await markRead(id);
      } catch (err) {
        console.error('Failed to load chat:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 2. Initialize Socket
    socketRef.current = initSocket(token);
    socketRef.current.emit('join-conversation', id);
    socketRef.current.emit('read-conversation', { conversationId: id });

    // 3. Listen for new messages
    socketRef.current.on('new-message', (message) => {
      if (message.conversationId === id) {
        setMessages((prev) => [...prev, message]);
        
        // If incoming message, mark read
        const myId = user?.id || user?._id;
        if (message.senderId !== myId) {
          markRead(id).catch(console.error);
          socketRef.current.emit('read-conversation', { conversationId: id });
        }
      }
    });

    // 4. Listen for read notifications
    socketRef.current.on('conversation-read', ({ conversationId, userId }) => {
      if (conversationId === id) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.senderId !== userId && !msg.readBy.includes(userId)) {
              return { ...msg, readBy: [...msg.readBy, userId] };
            }
            return msg;
          })
        );
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('new-message');
        socketRef.current.off('conversation-read');
      }
    };
  }, [id, token, user]);

  useEffect(() => {
    // Auto-scroll to bottom
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socketRef.current.emit('send-message', {
      conversationId: id,
      text: newMessage
    });

    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-background flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-brand-secondary mb-4" size={48} />
        <p className="font-headings font-medium italic text-text-muted">Entering room...</p>
      </div>
    );
  }

  const otherParticipant = conversation?.participants.find(p => p._id !== user.id && p._id !== user._id);

  return (
    <div className="min-h-screen bg-brand-background flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 bg-brand-background/80 backdrop-blur-md z-50 border-b border-border-light/30 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/chat')}
            className="p-2 -ml-2 text-brand-primary active:opacity-80 active:scale-95 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-accent/20 bg-white">
              <img 
                src={otherParticipant?.profilePhoto || `https://ui-avatars.com/api/?name=${otherParticipant?.name}`} 
                alt="avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-headings font-bold text-brand-primary leading-tight text-sm">{otherParticipant?.name}</h1>
              <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest">Active Recently</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-text-muted">
          <Video size={20} className="cursor-pointer hover:text-brand-secondary" />
          <Phone size={18} className="cursor-pointer hover:text-brand-secondary" />
          <MoreVertical size={20} className="cursor-pointer hover:text-brand-secondary" />
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 pt-24 pb-24 px-6 overflow-y-auto space-y-6 no-scrollbar max-w-4xl mx-auto w-full">
        {/* Listing Context (Mini) */}
        {conversation?.contextType === 'listing' && (
          <div className="flex gap-4 bg-white p-4 rounded-3xl border border-border-light shadow-card animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-brand-background rounded-2xl overflow-hidden shrink-0 border border-border-light/50">
              <img 
                src={conversation?.contextId?.photos?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=200"} 
                alt="listing" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex flex-col justify-center space-y-1">
              <span className="text-[9px] font-bold text-brand-cta uppercase tracking-[0.2em]">Property Lead</span>
              <h3 className="font-bold text-brand-primary text-sm line-clamp-1">
                {conversation?.contextId?.title || "Inquiry for Property"}
              </h3>
              <div className="flex items-center gap-3 text-[10px] text-text-secondary font-medium">
                <span className="flex items-center gap-1">
                  <MapPin size={10} /> 
                  {conversation?.contextId?.locality || "Itanagar"}
                </span>
                {conversation?.contextId?.price && (
                  <span className="flex items-center gap-1 text-brand-secondary">
                    ₹{new Intl.NumberFormat('en-IN').format(conversation.contextId.price)}/mo
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Partner Card Context (Mini) */}
        {conversation?.contextType === 'partnerCard' && (
          <div className="flex gap-4 bg-white p-4 rounded-3xl border border-border-light shadow-card animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-brand-background rounded-2xl overflow-hidden shrink-0 border border-border-light/50 flex items-center justify-center text-brand-secondary">
              <Users size={32} />
            </div>
            <div className="flex flex-col justify-center space-y-1">
              <span className="text-[9px] font-bold text-brand-secondary uppercase tracking-[0.2em]">Partner Request</span>
              <h3 className="font-bold text-brand-primary text-sm line-clamp-1">
                Looking for Roommate ({conversation?.contextId?.purpose === 'student' ? 'Student' : 'Professional'})
              </h3>
              <div className="flex items-center gap-3 text-[10px] text-text-secondary font-medium">
                <span className="flex items-center gap-1">
                  <MapPin size={10} /> 
                  {conversation?.contextId?.preferredLocality || "Itanagar"}
                </span>
                {conversation?.contextId?.budget && (
                  <span className="flex items-center gap-1 text-brand-cta">
                    Max: ₹{new Intl.NumberFormat('en-IN').format(conversation.contextId.budget)}/mo
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center my-4">
          <span className="px-4 py-1 rounded-full bg-border-light/30 text-text-muted text-[10px] font-bold uppercase tracking-[0.2em]">Today</span>
        </div>

        {messages.map((msg, index) => (
          <ChatBubble 
            key={msg._id || index} 
            message={msg} 
            isMe={msg.senderId === user.id || msg.senderId === user._id} 
          />
        ))}
        <div ref={scrollRef} />
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 left-0 w-full bg-brand-background/90 backdrop-blur-md px-6 py-4 pb-safe-bottom z-50 border-t border-border-light/30">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          <button className="mb-2 p-2 text-text-muted hover:text-brand-secondary transition-colors">
            <PlusCircle size={24} />
          </button>
          
          <div className="flex-grow relative group">
            <textarea 
              className="w-full bg-white border-none focus:ring-4 focus:ring-brand-secondary/5 rounded-2xl py-3 px-5 pr-12 text-brand-primary placeholder:text-text-muted/50 resize-none min-h-[48px] max-h-32 transition-all shadow-sm"
              placeholder="Type a message..."
              rows="1"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            ></textarea>
            <button className="absolute right-3 bottom-3 text-text-muted hover:text-brand-secondary transition-colors">
              <Smile size={20} />
            </button>
          </div>

          <button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="mb-1 w-12 h-12 flex items-center justify-center rounded-xl bg-brand-cta text-white shadow-xl shadow-brand-cta/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            <Send size={20} fill="currentColor" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatRoom;
