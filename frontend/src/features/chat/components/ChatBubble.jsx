import React, { useState, useRef, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Check, 
  CheckCheck, 
  Reply, 
  Copy, 
  Trash2, 
  Smile,
  ChevronDown,
  MoreHorizontal,
  Loader2,
  XCircle
} from 'lucide-react';

const ChatBubble = ({ 
  message, 
  isMe, 
  onReply, 
  onReact, 
  onDelete, 
  onCopy,
  showTime = false 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showFullTime, setShowFullTime] = useState(false);
  const menuRef = useRef(null);
  const pressTimer = useRef(null);

  const onMouseDown = () => {
    pressTimer.current = setTimeout(() => {
      setShowFullTime(true);
      setShowMenu(true);
    }, 500);
  };

  const onMouseUp = () => clearTimeout(pressTimer.current);
  const onMouseLeave = () => clearTimeout(pressTimer.current);
  const onTouchStart = () => { pressTimer.current = setTimeout(() => { setShowFullTime(true); setShowMenu(true); }, 500); };
  const onTouchEnd = () => clearTimeout(pressTimer.current);

  useEffect(() => {
    const handleClickOutside = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) { setShowMenu(false); setShowReactions(false); } };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

  const time = format(new Date(message.createdAt), 'p');
  const fullTime = format(new Date(message.createdAt), 'PPpp');

  const getStatusIcon = () => {
    if (!isMe) return null;
    if (message.status === 'pending') return <Loader2 size={12} className="text-text-muted animate-spin" />;
    if (message.status === 'failed') return <XCircle size={12} className="text-brand-cta" />;
    if (message.readBy && message.readBy.length > 0) return <CheckCheck size={12} className="text-brand-secondary" />;
    return <Check size={12} className="text-text-muted" />;
  };

  const reactions = message.reactions || {};

  return (
    <>
      <div 
        className={`flex flex-col ${isMe ? 'items-end ml-auto' : 'items-start'} max-w-[80%] space-y-1`}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onContextMenu={(e) => { e.preventDefault(); setShowMenu(true); setShowFullTime(true); }}
      >
        {message.replyTo && (
          <div className={`px-4 py-2 rounded-xl border-l-2 ${isMe ? 'bg-brand-primary/10 text-white/80 border-brand-primary' : 'bg-brand-background text-text-secondary border-brand-secondary'}`}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1">Replying to</p>
            <p className="text-sm line-clamp-1">{message.replyTo.text}</p>
          </div>
        )}

        <div className={`relative px-5 py-3.5 rounded-[1.5rem] shadow-sm leading-relaxed text-[15px] ${isMe ? 'bg-brand-primary text-white rounded-br-none' : 'bg-white text-brand-primary rounded-bl-none border border-border-light/30'}`}>
          <div className="select-text">{message.text}</div>
        </div>

        <div className={`flex items-center gap-1.5 px-2 ${isMe ? 'flex-row-reverse' : ''}`}>
          {showFullTime && !isMe && <span className="text-[9px] text-text-muted bg-brand-background px-1.5 py-0.5 rounded">{fullTime}</span>}
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{showFullTime ? fullTime : time}</span>
          {isMe && getStatusIcon()}
          
          <div className="relative" ref={menuRef}>
            <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className="p-1 text-text-muted hover:text-brand-secondary transition-colors rounded" aria-label="Message options"><MoreHorizontal size={14} /></button>
            {showMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-44 bg-white rounded-xl shadow-xl border border-border-light/30 overflow-hidden z-50 animate-in fade-in-20 duration-200">
                <button onClick={() => { onReply?.(message); setShowMenu(false); }} className="w-full px-4 py-2 flex items-center gap-2 text-sm text-text-primary hover:bg-brand-background"><Reply size={16} /> Reply</button>
                {!isMe && <button onClick={() => { onCopy?.(message.text); setShowMenu(false); }} className="w-full px-4 py-2 flex items-center gap-2 text-sm text-text-primary hover:bg-brand-background"><Copy size={16} /> Copy</button>}
                {isMe && <button onClick={() => { onDelete?.(message._id); setShowMenu(false); }} className="w-full px-4 py-2 flex items-center gap-2 text-sm text-brand-cta hover:bg-brand-cta/10"><Trash2 size={16} /> Delete</button>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBubble;