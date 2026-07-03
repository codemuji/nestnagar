import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Users,
  Mic,
  Image,
  X,
  Clipboard,
  AlertCircle,
  ChevronDown,
  MoreHorizontal,
  ChevronRight
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
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  
  const scrollRef = useRef();
  const messagesEndRef = useRef();
  const messagesContainerRef = useRef();
  const socketRef = useRef();
  const typingTimeoutRef = useRef();
  const textareaRef = useRef();

  // Emoji list
  const EMOJIS = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
    '😦', '😧', '😮', '😲', '😴', '🤤', '😪', '😵', '🤐', '🥴',
    '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿',
    '👹', '👺', '💀', '☠️', '👻', '👽', '👾', '🤖', '💩', '😺',
    '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉',
    '🙊', '💋', '💌', '💘', '💝', '💖', '💗', '💓', '💞', '💕',
    '💟', '❣️', '💔', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎',
    '🖤', '🤍', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
    '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋',
    '🤝', '🙏', '🙌', '👐', '🤲', '🤲', '💪', '🦾', '🦵', '🦿',
    '🦶', '👣', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴',
    '👀', '👁️', '👅', '👄', '💋', '🩸', '🩹', '🩺', '💊', '💉',
  ];

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
    const handleNewMessage = (message) => {
      if (message.conversationId === id) {
        setMessages((prev) => {
          // Reconcile optimistic message using tempId, or skip if real _id already exists
          if (message.tempId) {
            const optimistic = prev.find(m => m.tempId === message.tempId);
            if (optimistic) {
              return prev.map(m =>
                m.tempId === message.tempId ? { ...message.toObject ? message.toObject() : message, status: 'sent' } : m
              );
            }
          }
          if (prev.some(m => m._id === message._id)) return prev;
          const normalized = message.toObject ? message.toObject() : message;
          return [...prev, normalized];
        });

        // If incoming message, mark read
        const myId = user?.id || user?._id;
        if (message.senderId !== myId) {
          markRead(id).catch(console.error);
          socketRef.current.emit('read-conversation', { conversationId: id });
        }
      }
    };
    socketRef.current.on('new-message', handleNewMessage);

    // 4. Listen for read notifications
    socketRef.current.on('conversation-read', ({ conversationId, userId }) => {
      if (conversationId === id) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.senderId !== userId && !msg.readBy?.includes(userId)) {
              return { ...msg, readBy: [...(msg.readBy || []), userId] };
            }
            return msg;
          })
        );
      }
    });

    // 5. Listen for typing indicators
    socketRef.current.on('user-typing', ({ conversationId, userId, userName, isTyping: typing }) => {
      if (conversationId === id) {
        setTypingUsers(prev => {
          if (typing) {
            return [...prev.filter(u => u.id !== userId), { id: userId, name: userName }];
          }
          return prev.filter(u => u.id !== userId);
        });
      }
    });

    // 6. Listen for message reactions
    socketRef.current.on('message-reaction', ({ conversationId, messageId, emoji, userId }) => {
      if (conversationId === id) {
        setMessages(prev => 
          prev.map(msg => {
            if (msg._id === messageId || msg.tempId === messageId) {
              const reactions = { ...msg.reactions };
              if (!reactions[emoji]) reactions[emoji] = [];
              if (!reactions[emoji].includes(userId)) {
                reactions[emoji] = [...reactions[emoji], userId];
              }
              return { ...msg, reactions };
            }
            return msg;
          })
        );
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('new-message', handleNewMessage);
        socketRef.current.off('conversation-read');
        socketRef.current.off('user-typing');
        socketRef.current.off('message-reaction');
      }
    };
  }, [id, token, user]);

  useEffect(() => {
    // Auto-scroll to bottom by targeting the messages container directly.
    // Avoids scrollIntoView timing race on first paint and gives consistent behavior.
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Typing indicator
  const handleTyping = useCallback(() => {
    if (!socketRef.current) return;
    
    socketRef.current.emit('typing', { conversationId: id, isTyping: true });
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('typing', { conversationId: id, isTyping: false });
    }, 2000);
  }, [id]);

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (!newMessage.trim() && !replyingTo) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage = {
      _id: tempId,
      tempId,
      conversationId: id,
      senderId: user?.id || user?._id,
      text: newMessage.trim(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      readBy: [],
      reactions: {},
      replyTo: replyingTo ? {
        _id: replyingTo._id,
        text: replyingTo.text,
        senderId: replyingTo.senderId
      } : null,
      myId: user?.id || user?._id
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setReplyingTo(null);
    handleTyping(); // Stop typing indicator

    // Send via socket
    socketRef.current.emit('send-message', {
      conversationId: id,
      text: optimisticMessage.text,
      replyTo: replyingTo?._id,
      tempId
    });
  }, [newMessage, replyingTo, id, user]);

  const handleReact = useCallback((messageId, emoji) => {
    socketRef.current.emit('react', { conversationId: id, messageId, emoji });
  }, [id]);

  const handleDelete = useCallback((messageId) => {
    // TODO: Implement delete via socket/API
    setMessages(prev => prev.filter(m => m._id !== messageId && m.tempId !== messageId));
  }, []);

  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text);
    // Could show toast here
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    } else {
      handleTyping();
    }
  }, [handleSendMessage, handleTyping]);

  const insertEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  const startReply = (message) => {
    setReplyingTo(message);
    textareaRef.current?.focus();
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
  const myId = user?.id || user?._id;

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
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-accent/20 bg-white">
                <img 
                  src={otherParticipant?.profilePhoto || `https://ui-avatars.com/api/?name=${otherParticipant?.name}`} 
                  alt="avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-brand-background rounded-full" />
            </div>
            <div>
              <h1 className="font-headings font-bold text-brand-primary leading-tight text-sm">{otherParticipant?.name}</h1>
              <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest">
                {typingUsers.length > 0 
                  ? `${typingUsers.map(u => u.name).join(', ')} typing...`
                  : 'Active Recently'}
              </p>
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
      <main ref={messagesContainerRef} className="flex-1 pt-24 pb-24 px-6 overflow-y-auto space-y-6 no-scrollbar max-w-4xl mx-auto w-full">
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

        {/* Date separator */}
        <div className="flex justify-center my-4">
          <span className="px-4 py-1 rounded-full bg-border-light/30 text-text-muted text-[10px] font-bold uppercase tracking-[0.2em]">Today</span>
        </div>

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-24 h-24 rounded-full bg-brand-background/50 flex items-center justify-center mb-4">
              <MessageSquare size={48} className="text-brand-secondary/50" />
            </div>
            <h3 className="text-lg font-headings font-bold text-brand-primary mb-2">
              No messages yet
            </h3>
            <p className="text-text-muted mb-6 max-w-xs">
              Start the conversation! Send a message about the property or introduce yourself.
            </p>
            <button
              onClick={() => {
                const starters = [
                  "Hi! Is this still available?",
                  "Hi, I'm interested in this property. Can we schedule a viewing?",
                  "Hello! What's the earliest move-in date?",
                  "Hi! Are utilities included in the rent?"
                ];
                setNewMessage(starters[Math.floor(Math.random() * starters.length)]);
                textareaRef.current?.focus();
              }}
              className="btn-outline flex items-center gap-2"
            >
              <ChevronRight size={16} />
              Try a conversation starter
            </button>
          </div>
        )}

        {messages.map((msg, index) => (
          <ChatBubble 
            key={msg._id || msg.tempId || index} 
            message={{ ...msg, myId }}
            isMe={msg.senderId === myId} 
            onReply={startReply}
            onReact={handleReact}
            onDelete={handleDelete}
            onCopy={handleCopy}
          />
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 left-0 w-full bg-brand-background/95 backdrop-blur-md px-6 py-3 pb-safe-bottom z-50 border-t border-border-light/30">
        <div className="max-w-4xl mx-auto">
          {/* Reply preview */}
          {replyingTo && (
            <div className="mb-3 p-3 bg-brand-primary/5 rounded-2xl border border-brand-primary/20 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-2 h-8 bg-brand-primary rounded-r-full" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider mb-0.5">Replying to</p>
                  <p className="text-sm text-brand-primary/80 truncate">{replyingTo.text}</p>
                </div>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-1 text-brand-primary/70 hover:text-brand-primary hover:bg-brand-primary/10 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Attachment menu */}
          {showAttachMenu && (
            <div className="mb-3 flex gap-2 animate-in fade-in-20 duration-200">
              {[
                { icon: Image, label: 'Photo', color: 'text-brand-primary' },
                { icon: Mic, label: 'Voice', color: 'text-brand-secondary' },
                { icon: Clipboard, label: 'Location', color: 'text-brand-cta' },
                { icon: Smile, label: 'Emoji', color: 'text-amber-500' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => { setShowAttachMenu(false); /* TODO: handle */ }}
                  className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl bg-white border border-border-light/50 shadow-sm flex-1 transition-all active:scale-95 ${item.color}`}
                >
                  <item.icon size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-3">
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="mb-1 p-2 text-text-muted hover:text-brand-secondary transition-colors rounded-full hover:bg-brand-background"
            >
              <PlusCircle size={24} />
            </button>
            
            <div className="flex-grow relative">
              <textarea
                ref={textareaRef}
                className="w-full bg-white border-none focus:ring-4 focus:ring-brand-secondary/5 rounded-2xl py-3 px-5 pr-12 text-brand-primary placeholder:text-text-muted/50 resize-none min-h-[48px] max-h-40 transition-all shadow-sm"
                placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
                rows="1"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              ></textarea>
              
              <div className="absolute right-3 bottom-3 flex items-center gap-1">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-text-muted hover:text-brand-secondary transition-colors rounded-full hover:bg-brand-background"
                >
                  <Smile size={20} />
                </button>
              </div>
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="mb-1 w-12 h-12 flex items-center justify-center rounded-xl bg-brand-cta text-white shadow-xl shadow-brand-cta/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
            >
              <Send size={20} fill="currentColor" />
            </button>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="mt-2 w-full max-h-48 overflow-y-auto bg-white rounded-2xl border border-border-light/50 shadow-xl p-2 animate-in fade-in-20 duration-200">
              <div className="grid grid-cols-8 gap-1">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="p-2 text-2xl hover:bg-brand-background rounded-xl transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

// Import missing icons
import { MessageSquare } from 'lucide-react';

export default ChatRoom;