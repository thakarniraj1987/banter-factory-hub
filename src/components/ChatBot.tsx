
import React, { useState, useRef, useEffect } from 'react';
import ChatMessage, { Message } from './ChatMessage';
import ChatInput from './ChatInput';
import { generateResponse, createMessage } from '@/lib/chatbot';

interface ChatBotProps {
  initialMessage?: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ initialMessage = "Hello! I'm OpsBuddy, your intelligent incident resolution assistant. How can I help you today?" }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add the initial bot message when component mounts
    const botMessage = createMessage(initialMessage, 'bot', 'info');
    setMessages([botMessage]);
  }, [initialMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (content: string) => {
    const userMessage = createMessage(content, 'user');
    
    setMessages(prev => [...prev, userMessage]);
    
    generateResponse(
      content,
      () => setIsTyping(true),
      (response, severity) => {
        setIsTyping(false);
        const botMessage = createMessage(response, 'bot', severity);
        setMessages(prev => [...prev, botMessage]);
      }
    );
  };

  return (
    <div className="chatbot-container h-[600px] md:h-[70vh]">
      <div className="chatbot-messages flex-1 overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <div className="message-bot opacity-80">
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
    </div>
  );
};

export default ChatBot;
