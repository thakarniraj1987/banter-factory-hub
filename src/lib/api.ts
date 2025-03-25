
// API service for communicating with the backend
import { toast } from 'sonner';

interface QueryResponse {
  intent: string;
  sub_intent: string;
  response: any;
}

const API_BASE_URL = 'http://localhost:5000'; // Update this to your actual backend URL in production

export const sendQuery = async (query: string): Promise<QueryResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get a response from the backend');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending query to API:', error);
    toast.error('Failed to connect to the backend service. Using fallback mode.');
    
    // Return a fallback response
    return {
      intent: 'Error',
      sub_intent: 'None',
      response: {
        message: 'I couldn\'t connect to the backend service. Please check if the server is running and try again. In the meantime, you can still use OpenAI-powered features if you\'ve provided your API key.'
      }
    };
  }
};

// Helper function to format the response for display
export const formatApiResponse = (apiResponse: QueryResponse): { content: string; severity: 'info' | 'warning' | 'critical' | 'resolved' } => {
  const { intent, response } = apiResponse;
  let content = '';
  let severity: 'info' | 'warning' | 'critical' | 'resolved' = 'info';

  // Simple message response
  if (response.message) {
    content = response.message;
  }

  // Incident status inquiry
  if (intent === 'Incident Status Inquiry' && response.incident_id) {
    severity = response.status === 'Resolved' ? 'resolved' : 
               response.status === 'Critical' ? 'critical' : 
               response.status === 'In Progress' || response.status === 'Open' ? 'warning' : 'info';
    
    content = `Incident ${response.incident_id}\n`;
    content += `Impacted CI: ${response.impacted_ci}\n`;
    content += `Status: ${response.status}\n`;
    content += `Description: ${response.description}\n`;
    content += `Dashboard: ${response.dashboard}\n\n`;
    
    if (response.dependencies) {
      content += `Dependencies for ${response.impacted_ci}:\n`;
      
      if (response.dependencies.upstream && response.dependencies.upstream.length > 0) {
        content += `- Upstream:\n`;
        response.dependencies.upstream.forEach((dep: any) => {
          content += `  - ${dep.ci} (${dep.type}, ${dep.relationship})\n`;
        });
      } else {
        content += `- Upstream: None\n`;
      }
      
      if (response.dependencies.downstream && response.dependencies.downstream.length > 0) {
        content += `- Downstream:\n`;
        response.dependencies.downstream.forEach((dep: any) => {
          content += `  - ${dep.ci} (${dep.type}, ${dep.relationship})\n`;
        });
      } else {
        content += `- Downstream: None\n`;
      }
    }
  }

  // List of incidents
  if (intent === 'Incident Status Inquiry' && response.incidents) {
    content = response.message + '\n\n';
    response.incidents.forEach((inc: any) => {
      content += `- ${inc.id}: ${inc.short_description} (${inc.status})\n`;
    });
  }

  // CI Health Check
  if (intent === 'CI Health Check' && response.ci) {
    severity = response.health_status === 'Healthy' ? 'resolved' : 
               response.health_status === 'Critical' ? 'critical' : 
               response.health_status === 'Warning' ? 'warning' : 'info';
    
    content = `${response.prefix}: ${response.ci}\n`;
    content += `- Health Status: ${response.health_status}\n`;
    content += `- Details: ${response.details}\n`;
    content += `- Recent Updates: ${response.recent_updates}\n`;
    content += `- Dashboard: ${response.dashboard}\n\n`;
    
    if (response.dependencies) {
      content += `Dependencies for ${response.ci}:\n`;
      // ... formatting similar to incident dependencies
      if (response.dependencies.upstream && response.dependencies.upstream.length > 0) {
        content += `- Upstream:\n`;
        response.dependencies.upstream.forEach((dep: any) => {
          content += `  - ${dep.ci} (${dep.type}, ${dep.relationship})\n`;
        });
      } else {
        content += `- Upstream: None\n`;
      }
      
      if (response.dependencies.downstream && response.dependencies.downstream.length > 0) {
        content += `- Downstream:\n`;
        response.dependencies.downstream.forEach((dep: any) => {
          content += `  - ${dep.ci} (${dep.type}, ${dep.relationship})\n`;
        });
      } else {
        content += `- Downstream: None\n`;
      }
    }
  }

  // List Open Incidents with CI Health
  if (intent === 'List Open Incidents with CI Health' && response.incidents) {
    content = response.message + '\n\n';
    response.incidents.forEach((inc: any) => {
      content += `- Incident ${inc.incident_id} (CI: ${inc.ci})\n`;
      content += `  - Status: ${inc.status}\n`;
      content += `  - CI Health: ${inc.ci_health}\n`;
      content += `  - Details: ${inc.details}\n\n`;
    });
    
    if (response.incidents.some((inc: any) => inc.ci_health === 'Critical')) {
      severity = 'critical';
    } else if (response.incidents.some((inc: any) => inc.ci_health === 'Warning')) {
      severity = 'warning';
    }
  }

  // Dependency Impact Analysis
  if (intent === 'Dependency Impact Analysis' && response.ci) {
    content = `Dependency Impact Analysis for ${response.ci}:\n\n`;
    
    if (response.dependencies) {
      if (response.dependencies.upstream && response.dependencies.upstream.length > 0) {
        content += `- Upstream:\n`;
        response.dependencies.upstream.forEach((dep: any) => {
          content += `  - ${dep.ci} (${dep.type}, ${dep.relationship})\n`;
        });
      } else {
        content += `- Upstream: None\n`;
      }
      
      if (response.dependencies.downstream && response.dependencies.downstream.length > 0) {
        content += `- Downstream:\n`;
        response.dependencies.downstream.forEach((dep: any) => {
          content += `  - ${dep.ci} (${dep.type}, ${dep.relationship})\n`;
        });
      } else {
        content += `- Downstream: None\n`;
      }
    }
  }

  // If we couldn't format the response, just convert it to a string
  if (!content) {
    content = typeof response === 'object' ? JSON.stringify(response, null, 2) : String(response);
  }

  return { content, severity };
};
