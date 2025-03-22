
import { Message } from '@/components/ChatMessage';

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

// Simulating a response delay
export const generateResponse = (
  userMessage: string, 
  onTypingStart: () => void, 
  onResponseReady: (response: string, severity?: 'info' | 'warning' | 'critical' | 'resolved') => void
) => {
  onTypingStart();
  
  // Simulate thinking time
  setTimeout(() => {
    // In a real implementation, this would analyze the user's message and generate an appropriate response
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
