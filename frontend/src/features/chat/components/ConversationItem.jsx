import React from 'react';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';

const ConversationItem = ({ conversation, onClick }) => {
  const { user } = useSelector((state) => state.auth);
  
  // Find the other participant
  const otherParticipant = conversation.participants.find(
    (p) => p._id !== user.id && p._id !== user._id
  );

  const lastMsg = conversation.lastMessage;
  const time = lastMsg?.timestamp ? format(new Date(lastMsg.timestamp), 'p') : '';

  return (
    <div 
      onClick={() => onClick(conversation._id)}
      className="flex items-center p-4 bg-white rounded-2xl hover:bg-brand-background transition-all cursor-pointer group border border-border-light/30 shadow-sm mb-2"
    >
      <div className="relative shrink-0">
        <img 
          alt="Avatar" 
          className="w-14 h-14 rounded-full object-cover border-2 border-brand-background shadow-inner" 
          src={otherParticipant?.profilePhoto || `https://ui-avatars.com/api/?name=${otherParticipant?.name}`} 
        />
        {/* Active status indicator if needed */}
      </div>
      
      <div className="ml-4 flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h3 className="font-bold text-brand-primary truncate">{otherParticipant?.name}</h3>
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{time}</span>
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <p className="text-sm text-text-secondary truncate pr-2">
            {(lastMsg?.senderId === user.id || lastMsg?.senderId === user._id) ? 'You: ' : ''}{lastMsg?.text || 'No messages yet'}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-brand-secondary text-white text-[10px] font-extrabold animate-pulse shrink-0">
              {conversation.unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] bg-brand-background px-2 py-0.5 rounded-full text-brand-secondary font-bold uppercase border border-border-default/50">
            {conversation.contextType === 'listing' ? 'Property Lead' : 'Partner Request'}
          </span>
        </div>
      </div>
      
      {/* Unread count logic could go here */}
    </div>
  );
};

export default ConversationItem;
