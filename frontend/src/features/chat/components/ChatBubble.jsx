import React from 'react';
import { format } from 'date-fns';
import { CheckCheck } from 'lucide-react';

const ChatBubble = ({ message, isMe }) => {
  const time = format(new Date(message.createdAt), 'p');

  return (
    <div className={`flex flex-col ${isMe ? 'items-end ml-auto' : 'items-start'} max-w-[85%] space-y-1`}>
      <div 
        className={`px-5 py-3.5 rounded-[1.5rem] shadow-sm leading-relaxed text-[15px] ${
          isMe 
            ? 'bg-brand-primary text-white rounded-br-none' 
            : 'bg-white text-brand-primary rounded-bl-none border border-border-light/30'
        }`}
      >
        {message.text}
      </div>
      <div className={`flex items-center gap-1.5 px-2 ${isMe ? 'flex-row-reverse' : ''}`}>
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{time}</span>
        {isMe && <CheckCheck size={12} className="text-brand-secondary" />}
      </div>
    </div>
  );
};

export default ChatBubble;
