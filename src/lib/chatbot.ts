
import { Message } from '@/components/ChatMessage';
import incidentData from '@/data/incidents.json';

// Sample incident responses
const INCIDENT_RESPONSES = [
  {
    content: "I've detected high CPU usage on web-server-03. This may affect user experience. Would you like me to investigate further?",
    severity: "warning"
  },
  {
    content: "Database connectivity issues detected on the payment processing cluster. Failover mechanism has been triggered. Shall I prepare a detailed report?",
    severity: "critical"
  },
  {
    content: "Memory usage on app-server-cluster has increased by 30% in the last hour. This might be related to the recent deployment. I can roll back if needed.",
    severity: "warning"
  },
  {
    content: "The issue with the authentication service has been resolved. Root cause was identified as an expired certificate. I've updated the monitoring to alert before expiration next time.",
    severity: "resolved"
  },
  {
    content: "Load balancer health checks are failing on 2 of 5 instances. I've isolated the affected nodes and rerouted traffic. Would you like me to restart the services?",
    severity: "warning"
  },
  {
    content: "Based on the logs, I can see that the API gateway is returning 503 errors. This corresponds with the deployment that happened at 14:30. Should I investigate correlation?",
    severity: "info"
  },
  {
    content: "I've identified a potential security vulnerability in one of your container images. CVE-2023-1234 was reported yesterday. Would you like me to prepare a patching plan?",
    severity: "critical"
  },
  {
    content: "The network latency between us-east and eu-west regions has increased to 300ms. This may impact cross-region operations. I can help investigate the cause.",
    severity: "warning"
  },
  {
    content: "Kubernetes pod evictions have increased in the last 30 minutes. Node resources appear constrained. I can help scale the cluster if needed.",
    severity: "info"
  },
  {
    content: "All systems are operating normally now. The previous disk space issue on the logging cluster has been resolved by rotating old logs and compressing archives.",
    severity: "resolved"
  }
];

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
export const formatIncidentDetails = (incident: any) => {
  if (!incident) return "Incident not found.";
  
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

// Simulating a response delay
export const generateResponse = (
  userMessage: string, 
  onTypingStart: () => void, 
  onResponseReady: (response: string, severity?: 'info' | 'warning' | 'critical' | 'resolved') => void
) => {
  onTypingStart();
  
  // Check for incident related queries
  const lowerCaseMessage = userMessage.toLowerCase();
  
  // Simulate thinking time
  setTimeout(() => {
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
    
    // Default to random incident response
    const randomIndex = Math.floor(Math.random() * INCIDENT_RESPONSES.length);
    const response = INCIDENT_RESPONSES[randomIndex];
    
    // Simulate typing time based on response length
    const typingDelay = Math.min(1500, response.content.length * 30);
    
    setTimeout(() => {
      onResponseReady(response.content, response.severity as 'info' | 'warning' | 'critical' | 'resolved');
    }, typingDelay);
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
