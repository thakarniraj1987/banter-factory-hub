
import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'bot';
  timestamp: Date;
  severity?: 'info' | 'warning' | 'critical' | 'resolved';
}

interface ChatMessageProps {
  message: Message;
  isAnimated?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isAnimated = true }) => {
  const isUser = message.role === 'user';
  
  const getSeverityIcon = () => {
    if (isUser) return null;
    
    switch (message.severity) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  return (
    <div 
      className={cn(
        isUser ? 'message-user' : 'message-bot',
        !isUser && message.severity === 'warning' && 'border-l-4 border-amber-500',
        !isUser && message.severity === 'critical' && 'border-l-4 border-red-500',
        !isUser && message.severity === 'resolved' && 'border-l-4 border-green-500',
        !isUser && message.severity === 'info' && 'border-l-4 border-blue-500',
        isAnimated ? 'opacity-0' : 'opacity-100',
        'transition-all duration-300'
      )}
      style={{ 
        animationDelay: isAnimated ? '100ms' : '0ms',
      }}
    >
      {!isUser && (
        <div className="flex items-center gap-2 mb-2">
          {getSeverityIcon()}
          <span className="font-medium">
            {message.severity === 'warning' ? 'Warning' : 
             message.severity === 'critical' ? 'Critical Alert' : 
             message.severity === 'resolved' ? 'Resolved' : 'Info'}
          </span>
        </div>
      )}
      <div className="text-sm md:text-base">{message.content}</div>
      <div className="text-xs mt-1 opacity-70">
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};

export default ChatMessage;
