
import { Message } from '@/components/ChatMessage';

// Example responses - these would typically come from an actual AI backend
const RESPONSES = [
  "Hello! How can I assist you today?",
  "That's an interesting question. Let me think about that for a moment.",
  "I understand what you're asking. Here's what I know about that topic.",
  "Thanks for sharing that with me. Is there anything specific you'd like to know?",
  "I'm designed to be helpful, harmless, and honest in my responses.",
  "That's a great point. I hadn't considered that perspective before.",
  "Let me provide some more details that might be helpful.",
  "I appreciate your patience as I process that request.",
  "Is there anything else you'd like to discuss?",
  "That's all the information I have on this topic at the moment."
];

// Simulating a response delay as a real AI would have
export const generateResponse = (
  userMessage: string, 
  onTypingStart: () => void, 
  onResponseReady: (response: string) => void
) => {
  onTypingStart();
  
  // Simulate thinking time
  setTimeout(() => {
    // In a real implementation, this would call your AI service
    const randomIndex = Math.floor(Math.random() * RESPONSES.length);
    const response = RESPONSES[randomIndex];
    
    // Simulate typing time based on response length
    const typingDelay = Math.min(1500, response.length * 30);
    
    setTimeout(() => {
      onResponseReady(response);
    }, typingDelay);
  }, 1000);
};

// Generate a unique ID for messages
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Create a new message object
export const createMessage = (content: string, role: 'user' | 'bot'): Message => {
  return {
    id: generateId(),
    content,
    role,
    timestamp: new Date()
  };
};
