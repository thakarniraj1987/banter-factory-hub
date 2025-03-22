
import React from 'react';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'bot';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  isAnimated?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isAnimated = true }) => {
  const isUser = message.role === 'user';
  
  return (
    <div 
      className={cn(
        isUser ? 'message-user' : 'message-bot',
        isAnimated ? 'opacity-0' : 'opacity-100',
        'transition-all duration-300'
      )}
      style={{ 
        animationDelay: isAnimated ? '100ms' : '0ms',
      }}
    >
      <div className="text-sm md:text-base">{message.content}</div>
      <div className="text-xs mt-1 opacity-70">
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};

export default ChatMessage;
