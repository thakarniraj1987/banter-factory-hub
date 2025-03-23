import { Message } from '@/components/ChatMessage';
import incidentData from '@/data/incidents.json';
import OpenAI from 'openai';

// Search incidents by various criteria
export const searchIncidents = (query: string) => {
  const normalizedQuery = query.toLowerCase();
  
  return incidentData.filter(incident => 
    incident.id.toLowerCase().includes(normalizedQuery) ||
    incident.short_description.toLowerCase().includes(normalizedQuery) ||
    incident.description.toLowerCase().includes(normalizedQuery) ||
    incident.status.toLowerCase().includes(normalizedQuery) ||
    incident.priority.toLowerCase().includes(normalizedQuery) ||
    incident.category.toLowerCase().includes(normalizedQuery) ||
    incident.subcategory.toLowerCase().includes(normalizedQuery) ||
    incident.affected_service.toLowerCase().includes(normalizedQuery) ||
    (incident.assigned_individual && incident.assigned_individual.toLowerCase().includes(normalizedQuery))
  );
};

// Get incident details by ID
export const getIncidentById = (id: string) => {
  return incidentData.find(incident => incident.id === id);
};

// Format incident details as a readable message
export const formatIncidentDetails = (incident: any): { content: string; severity: 'info' | 'warning' | 'critical' | 'resolved' } => {
  if (!incident) return { 
    content: "Incident not found.",
    severity: "info"
  };
  
  const formattedTimestamp = new Date(incident.created_at).toLocaleString();
  const updatedTimestamp = new Date(incident.updated_at).toLocaleString();
  
  let severityLevel: 'info' | 'warning' | 'critical' | 'resolved' = 'info';
  
  if (incident.status === 'Resolved') {
    severityLevel = 'resolved';
  } else if (incident.priority === '1-Critical') {
    severityLevel = 'critical';
  } else if (incident.priority === '2-High') {
    severityLevel = 'warning';
  }
  
  return {
    content: `
Incident ${incident.id}
Description: ${incident.short_description}
Status: ${incident.status}
Priority: ${incident.priority}
Category: ${incident.category} / ${incident.subcategory}
Affected Service: ${incident.affected_service}
Created: ${formattedTimestamp}
Updated: ${updatedTimestamp}
${incident.assigned_individual ? `Assigned to: ${incident.assigned_individual}` : 'Unassigned'}

${incident.description}

${incident.resolution_notes ? `Resolution: ${incident.resolution_notes}` : ''}
    `.trim(),
    severity: severityLevel
  };
};

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

// Simulating a response delay
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
  
  // Check for incident related queries
  const lowerCaseMessage = userMessage.toLowerCase();
  
  // Simulate thinking time
  setTimeout(async () => {
    // Handle incident ID lookup
    if (lowerCaseMessage.includes('incident') && /inc\d+/i.test(userMessage)) {
      const incidentId = userMessage.match(/inc\d+/i)?.[0].toUpperCase();
      if (incidentId) {
        const incident = getIncidentById(incidentId);
        if (incident) {
          const formattedIncident = formatIncidentDetails(incident);
          const typingDelay = Math.min(1500, formattedIncident.content.length * 10);
          
          setTimeout(() => {
            onResponseReady(formattedIncident.content, formattedIncident.severity);
          }, typingDelay);
          return;
        }
      }
    }
    
    // Handle incident search
    if (
      lowerCaseMessage.includes('find incident') || 
      lowerCaseMessage.includes('search incident') || 
      lowerCaseMessage.includes('show incident') ||
      lowerCaseMessage.includes('incidents with') ||
      lowerCaseMessage.includes('incidents related')
    ) {
      const searchTerm = userMessage.replace(/find|search|show|incidents with|incidents related|incident|incidents/gi, '').trim();
      if (searchTerm.length > 2) {
        const results = searchIncidents(searchTerm);
        
        if (results.length > 0) {
          const response = `I found ${results.length} incidents matching "${searchTerm}":\n\n` + 
            results.map(inc => `- ${inc.id}: ${inc.short_description} (${inc.status})`).join('\n');
          
          setTimeout(() => {
            onResponseReady(response, 'info');
          }, 1500);
          return;
        } else {
          setTimeout(() => {
            onResponseReady(`I couldn't find any incidents matching "${searchTerm}".`, 'info');
          }, 1000);
          return;
        }
      }
    }
    
    // Handle general status request
    if (
      lowerCaseMessage.includes('incident status') || 
      lowerCaseMessage.includes('open incidents') ||
      lowerCaseMessage.includes('critical incidents')
    ) {
      const openIncidents = incidentData.filter(inc => inc.status !== 'Resolved');
      const criticalIncidents = incidentData.filter(inc => inc.priority === '1-Critical');
      
      let response = `Current Incident Status:\n`;
      response += `- Total incidents: ${incidentData.length}\n`;
      response += `- Open incidents: ${openIncidents.length}\n`;
      response += `- Critical incidents: ${criticalIncidents.length}\n\n`;
      
      if (criticalIncidents.length > 0) {
        response += `Critical incidents:\n`;
        criticalIncidents.forEach(inc => {
          response += `- ${inc.id}: ${inc.short_description}\n`;
        });
        
        setTimeout(() => {
          onResponseReady(response, 'warning');
        }, 1500);
        return;
      } else {
        response += `No critical incidents at this time.`;
        
        setTimeout(() => {
          onResponseReady(response, 'info');
        }, 1500);
        return;
      }
    }
    
    try {
      // Generate AI analysis for the user message
      const aiAnalysis = await generateAIAnalysis(userMessage);
      
      // Simulate thinking/typing time based on response length
      const typingDelay = Math.min(2000, aiAnalysis.content.length * 5);
      
      setTimeout(() => {
        onResponseReady(aiAnalysis.content, aiAnalysis.severity);
      }, typingDelay);
    } catch (error) {
      console.error('Error in generateResponse:', error);
      setTimeout(() => {
        onResponseReady("I'm sorry, I encountered an error while processing your request. Please try again later.", 'warning');
      }, 1000);
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
