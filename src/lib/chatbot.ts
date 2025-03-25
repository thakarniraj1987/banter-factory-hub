
import { Message } from '@/components/ChatMessage';
import OpenAI from 'openai';
import { sendQuery, formatApiResponse } from './api';

// Initialize OpenAI client - in production, use environment variables for the API key
let openai: OpenAI | null = null;

const initializeOpenAI = (apiKey: string) => {
  openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Note: In production, API calls should be made from a backend
  });
};

// Generate AI-powered incident analysis using OpenAI
const generateAIAnalysis = async (context: string): Promise<{ content: string; severity: 'info' | 'warning' | 'critical' | 'resolved' }> => {
  // Default response in case API call fails
  let content = "I'm sorry, I couldn't analyze this incident at the moment. Please try again later.";
  let severity: 'info' | 'warning' | 'critical' | 'resolved' = 'info';
  
  try {
    if (!openai) {
      // If OpenAI client is not initialized, return a message asking for API key
      return {
        content: "To enable AI-powered analysis, please provide your OpenAI API key. This is only stored in your browser session.",
        severity: 'info'
      };
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using the modern model, can be changed to other models as needed
      messages: [
        {
          role: "system",
          content: `You are OpsBuddy, an intelligent IT incident resolution assistant. 
          Analyze the incident information provided and respond with detailed technical analysis and recommendations.
          For each incident, determine its severity level (info, warning, critical, or resolved).
          Format your response as a structured analysis with clear sections for findings, root cause, and recommended actions.
          Use technical but clear language appropriate for IT operations professionals.`
        },
        {
          role: "user",
          content: context
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });
    
    // Extract the AI-generated content
    content = response.choices[0]?.message?.content || content;
    
    // Determine severity based on content
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('critical') || 
        lowerContent.includes('urgent') || 
        lowerContent.includes('outage') || 
        lowerContent.includes('down') ||
        lowerContent.includes('failure')) {
      severity = 'critical';
    } else if (lowerContent.includes('warning') || 
               lowerContent.includes('degraded') || 
               lowerContent.includes('slow') ||
               lowerContent.includes('error')) {
      severity = 'warning';
    } else if (lowerContent.includes('resolved') || 
               lowerContent.includes('fixed') || 
               lowerContent.includes('completed')) {
      severity = 'resolved';
    }
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    content = "I encountered an error while analyzing this incident. Please check your API key or try again later.";
  }
  
  return {
    content,
    severity
  };
};

// Process user query through backend API
const processQueryWithBackend = async (userMessage: string) => {
  try {
    const apiResponse = await sendQuery(userMessage);
    return formatApiResponse(apiResponse);
  } catch (error) {
    console.error('Error processing query with backend:', error);
    return {
      content: "I'm sorry, I couldn't connect to the backend service. Please try again later or try using the OpenAI-powered analysis instead.",
      severity: 'warning' as 'info' | 'warning' | 'critical' | 'resolved'
    };
  }
};

// Generate a response to the user's message
export const generateResponse = async (
  userMessage: string, 
  onTypingStart: () => void, 
  onResponseReady: (response: string, severity?: 'info' | 'warning' | 'critical' | 'resolved') => void
) => {
  onTypingStart();
  
  // Check for API key setup command
  if (userMessage.toLowerCase().includes('api key') && userMessage.includes('sk-')) {
    const apiKey = userMessage.match(/sk-[a-zA-Z0-9]{48}/)?.[0];
    if (apiKey) {
      try {
        initializeOpenAI(apiKey);
        setTimeout(() => {
          onResponseReady(
            "Thank you! Your OpenAI API key has been securely stored in your browser session. I'm now ready to provide AI-powered incident analysis.",
            'info'
          );
        }, 1000);
        return;
      } catch (error) {
        setTimeout(() => {
          onResponseReady("I couldn't initialize the OpenAI client with the provided API key. Please check if it's valid.", 'warning');
        }, 1000);
        return;
      }
    }
  }
  
  // Simulate thinking time
  setTimeout(async () => {
    try {
      // First try to process the query with the backend
      const backendResponse = await processQueryWithBackend(userMessage);
      
      // Simulate thinking/typing time
      setTimeout(() => {
        onResponseReady(backendResponse.content, backendResponse.severity);
      }, 1500);
    } catch (error) {
      console.error('Error in backend processing, falling back to OpenAI:', error);
      
      try {
        // If backend fails, fallback to OpenAI
        const aiAnalysis = await generateAIAnalysis(userMessage);
        
        setTimeout(() => {
          onResponseReady(aiAnalysis.content, aiAnalysis.severity);
        }, 1500);
      } catch (aiError) {
        console.error('Error in AI fallback:', aiError);
        setTimeout(() => {
          onResponseReady("I'm sorry, I encountered an error while processing your request. Please try again later.", 'warning');
        }, 1000);
      }
    }
  }, 1000);
};

// Generate a unique ID for messages
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Create a new message object
export const createMessage = (
  content: string, 
  role: 'user' | 'bot',
  severity?: 'info' | 'warning' | 'critical' | 'resolved'
): Message => {
  return {
    id: generateId(),
    content,
    role,
    timestamp: new Date(),
    severity
  };
};
