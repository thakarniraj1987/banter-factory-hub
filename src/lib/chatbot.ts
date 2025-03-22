
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

// Generate AI-powered incident analysis and recommendations
const generateAIAnalysis = (context: string): { content: string; severity: 'info' | 'warning' | 'critical' | 'resolved' } => {
  // In a real system, this would call an LLM API
  // For now, we'll simulate intelligence with pattern matching
  
  const lowerContext = context.toLowerCase();
  
  // Determine appropriate severity based on context
  let severity: 'info' | 'warning' | 'critical' | 'resolved' = 'info';
  
  if (lowerContext.includes('critical') || 
      lowerContext.includes('urgent') || 
      lowerContext.includes('outage') || 
      lowerContext.includes('down') ||
      lowerContext.includes('failure')) {
    severity = 'critical';
  } else if (lowerContext.includes('warning') || 
             lowerContext.includes('degraded') || 
             lowerContext.includes('slow') ||
             lowerContext.includes('error')) {
    severity = 'warning';
  } else if (lowerContext.includes('resolved') || 
             lowerContext.includes('fixed') || 
             lowerContext.includes('completed')) {
    severity = 'resolved';
  }
  
  // Generate a tailored response based on the context
  let content = '';
  
  // Database related issues
  if (lowerContext.includes('database') || lowerContext.includes('db') || lowerContext.includes('sql')) {
    if (lowerContext.includes('connect') || lowerContext.includes('connectivity')) {
      content = `I've analyzed the database connectivity issues and found:

1. The primary database instance is showing increased latency (250ms vs normal 15ms)
2. Connection pool utilization has spiked to 95% (normally below 60%)
3. Several application servers are reporting connection timeouts

Based on log analysis and historical patterns, this appears similar to an incident from last month (INC0000987) which was caused by network saturation between the application and database tiers.

Recommended actions:
1. Verify network link utilization between app-server-cluster and db-primary
2. Check for any recent changes to connection pool settings
3. Consider temporarily increasing the maximum connection pool size
4. If urgent resolution is needed, I can initiate a database failover to the secondary instance`;
      
      if (severity !== 'resolved') severity = 'critical';
    } else if (lowerContext.includes('slow') || lowerContext.includes('performance')) {
      content = `I've investigated the database performance issues and identified:

1. Three long-running queries consuming significant resources:
   - Query #1: Full table scan on TRANSACTIONS (no index used)
   - Query #2: Joining USERS and ORDERS without proper indexing
   - Query #3: Excessive use of OR conditions making index usage ineffective

2. Database statistics haven't been updated in 14 days

3. Disk I/O metrics show high wait times, suggesting possible storage bottleneck

Recommended actions:
1. Kill the identified problematic queries (I can do this for you)
2. Update database statistics immediately
3. Implement the missing indexes on USERS.customer_id and ORDERS.order_date
4. Schedule database maintenance window to optimize tables

Would you like me to proceed with any of these recommendations?`;
      
      if (severity !== 'resolved') severity = 'warning';
    }
  }
  
  // Network related issues
  else if (lowerContext.includes('network') || lowerContext.includes('connectivity') || lowerContext.includes('latency')) {
    content = `I've analyzed the network issues and found:

1. Latency between us-east and eu-west has increased from 85ms to 210ms
2. Packet loss rate has spiked to 2.3% on the primary transit link
3. BGP route changes detected at our edge routers at 14:32 UTC

This appears to be caused by an issue with our transit provider, as confirmed by multiple external monitoring points.

Recommended actions:
1. Initiate failover to backup transit provider
2. Adjust timeout settings on critical services to accommodate higher latency
3. Contact NOC at transit provider (reference case #45298)
4. Enable the backup transit link for all critical traffic

I can prepare a communications message to affected customers based on estimated resolution time.`;
    
    if (severity !== 'resolved') severity = 'warning';
  }
  
  // Application/Service related issues
  else if (lowerContext.includes('application') || 
           lowerContext.includes('service') || 
           lowerContext.includes('api') || 
           lowerContext.includes('website') ||
           lowerContext.includes('app')) {
    content = `Based on my analysis of the application issues:

1. The error rate for the ${lowerContext.includes('payment') ? 'payment' : 'authentication'} service has increased to 4.2%
2. Backend service response times have doubled in the last hour
3. Log analysis shows frequent timeout exceptions when calling dependent services
4. Recent deployment at ${new Date().toLocaleTimeString()} may be related

Root cause appears to be a configuration change that reduced connection pool size, causing resource exhaustion.

Recommended actions:
1. Increase connection pool size from 50 to 150
2. Implement circuit breaker for downstream service calls
3. Roll back recent deployment if immediate resolution is needed
4. Add additional capacity to the service cluster

Would you like me to implement any of these changes?`;
    
    if (severity !== 'resolved') severity = 'warning';
  }
  
  // Infrastructure related issues
  else if (lowerContext.includes('server') || 
           lowerContext.includes('infrastructure') || 
           lowerContext.includes('cluster') ||
           lowerContext.includes('kubernetes') ||
           lowerContext.includes('k8s')) {
    content = `I've completed analysis of the infrastructure issues:

1. Resource utilization:
   - CPU: 92% (vs 45% baseline)
   - Memory: 87% (vs 60% baseline)
   - Disk I/O: Heavy write operations on /var/log

2. System logs indicate OOM (Out of Memory) killer activated at 15:20 UTC
3. Several pods were evicted due to resource constraints
4. Node auto-scaling failed to trigger properly

Root cause: Recent deployment increased resource requirements but scaling policies weren't updated accordingly.

Recommended actions:
1. Increase cluster capacity by adding 3 nodes immediately
2. Update Kubernetes resource limits to match actual usage
3. Fix auto-scaling configuration to respond faster to demand
4. Implement resource quotas to prevent single tenant from consuming all resources

I can apply these changes immediately with your approval.`;
    
    if (severity !== 'resolved') severity = 'critical';
  }
  
  // Security related issues
  else if (lowerContext.includes('security') || 
           lowerContext.includes('vulnerability') || 
           lowerContext.includes('breach') ||
           lowerContext.includes('attack')) {
    content = `Security Analysis Report:

1. Identified suspicious activity:
   - Multiple failed login attempts from unusual locations
   - Scanning activity detected on public-facing endpoints
   - Unusual API access patterns from authenticated users

2. Vulnerability scan results:
   - CVE-2023-1456 detected in container image web-frontend:v3.2
   - 3 high-severity vulnerabilities in third-party dependencies
   - SSL/TLS configuration using outdated cipher suites

3. Affected systems:
   - Authentication service
   - API gateway
   - Customer data storage

Recommended security actions:
1. Block suspicious IP ranges immediately (153.xx.xx.0/24)
2. Patch vulnerable container images with security updates
3. Rotate compromised access credentials
4. Enable additional WAF rules to protect vulnerable endpoints

Would you like me to implement any of these security measures?`;
    
    if (severity !== 'resolved') severity = 'critical';
  }
  
  // Generic analysis for other scenarios
  if (!content) {
    const symptoms = [
      'intermittent service disruptions',
      'increased error rates',
      'degraded performance metrics',
      'unusual resource utilization patterns'
    ];
    
    const potentialCauses = [
      'recent code deployment',
      'infrastructure changes',
      'unexpected traffic patterns',
      'resource constraints',
      'third-party service dependencies',
      'configuration drifts'
    ];
    
    const randomSymptom = symptoms[Math.floor(Math.random() * symptoms.length)];
    const randomCause = potentialCauses[Math.floor(Math.random() * potentialCauses.length)];
    
    content = `Based on my analysis of the current situation, I've identified ${randomSymptom} that appear to be related to ${randomCause}.

I've analyzed historical patterns and similar incidents, and I've identified several potential actions that could resolve the issue:

1. Investigate recent changes to affected systems
2. Check for correlated events in monitoring systems
3. Analyze logs for error patterns and exceptions
4. Verify system resource utilization and scaling status

Would you like me to proceed with a deeper investigation into any of these areas?`;
  }
  
  return {
    content,
    severity
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
    
    // Generate AI analysis for the user message
    const aiAnalysis = generateAIAnalysis(userMessage);
    
    // Simulate thinking/typing time based on response length
    const typingDelay = Math.min(2000, aiAnalysis.content.length * 5);
    
    setTimeout(() => {
      onResponseReady(aiAnalysis.content, aiAnalysis.severity);
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
