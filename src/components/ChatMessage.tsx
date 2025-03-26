
import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

  // Format the content to enhance readability
  const formatContent = (content: string) => {
    // Check if content is a list of incidents
    if (content.includes('Found') && content.includes('open incidents') && content.includes('INC')) {
      const lines = content.split('\n');
      const titleLine = lines[0];
      
      // Extract incident information
      const incidents = lines.slice(1).filter(line => line.trim().startsWith('-')).map(line => {
        const match = line.trim().replace('- ', '').match(/^(INC\d+): (.*) \((.*)\)$/);
        if (match) {
          return {
            id: match[1],
            description: match[2],
            status: match[3]
          };
        }
        return null;
      }).filter(Boolean);
      
      if (incidents.length > 0) {
        return (
          <div>
            <p className="mb-2">{titleLine}</p>
            <div className="border rounded overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Incident ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((incident, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{incident.id}</TableCell>
                      <TableCell>{incident.description}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          incident.status === "New" && "bg-blue-100 text-blue-800",
                          incident.status === "In Progress" && "bg-amber-100 text-amber-800",
                          incident.status === "Resolved" && "bg-green-100 text-green-800",
                          incident.status === "Critical" && "bg-red-100 text-red-800"
                        )}>
                          {incident.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      }
    }
    
    // Format incidents with CI health (new format)
    if (content.includes('Found') && content.includes('open incidents') && content.includes('Incident') && content.includes('CI Health')) {
      const lines = content.split('\n\n');
      const titleLine = lines[0];
      
      // Parse incident details
      const incidents = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim().startsWith('- Incident')) {
          const incidentLines = lines[i].split('\n');
          const incidentIdMatch = incidentLines[0].match(/- Incident (INC\d+) \(CI: (.*)\)/);
          
          if (incidentIdMatch) {
            const incidentId = incidentIdMatch[1];
            const ciName = incidentIdMatch[2];
            const status = incidentLines[1].replace('  - Status: ', '');
            const ciHealth = incidentLines[2].replace('  - CI Health: ', '');
            const details = incidentLines[3].replace('  - Details: ', '');
            
            incidents.push({
              incidentId,
              ciName,
              status,
              ciHealth,
              details
            });
          }
        }
      }
      
      if (incidents.length > 0) {
        return (
          <div>
            <p className="mb-2">{titleLine}</p>
            <div className="border rounded overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Incident ID</TableHead>
                    <TableHead>CI Name</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[120px]">CI Health</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((incident, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{incident.incidentId}</TableCell>
                      <TableCell>{incident.ciName}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          incident.status === "New" && "bg-blue-100 text-blue-800",
                          incident.status === "In Progress" && "bg-amber-100 text-amber-800",
                          incident.status === "Resolved" && "bg-green-100 text-green-800",
                          incident.status === "Critical" && "bg-red-100 text-red-800"
                        )}>
                          {incident.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          incident.ciHealth === "Healthy" && "bg-green-100 text-green-800",
                          incident.ciHealth === "Degraded" && "bg-amber-100 text-amber-800",
                          incident.ciHealth === "Warning" && "bg-amber-100 text-amber-800",
                          incident.ciHealth === "Critical" && "bg-red-100 text-red-800"
                        )}>
                          {incident.ciHealth}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-3">
              <details className="text-sm">
                <summary className="cursor-pointer font-medium text-gray-700">Show Details</summary>
                <div className="mt-2 pl-3 border-l-2 border-gray-200">
                  {incidents.map((incident, index) => (
                    <div key={index} className="mb-3">
                      <h4 className="font-medium">{incident.incidentId} - {incident.ciName}</h4>
                      <p className="text-gray-600">{incident.details}</p>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        );
      }
    }
    
    // Format CI details with dependencies
    if (content.includes('Affected CI') || content.includes('Dependencies for')) {
      const sections = content.split('\n\n');
      
      return (
        <div>
          {sections.map((section, idx) => {
            if (section.includes('Dependencies for') && (section.includes('Upstream') || section.includes('Downstream'))) {
              const [title, ...dependencies] = section.split('\n');
              return (
                <div key={idx} className="mt-3">
                  <h4 className="font-medium mb-2">{title}</h4>
                  <div className="border rounded overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead colSpan={2}>Dependencies</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dependencies.map((dep, index) => {
                          // Skip empty lines
                          if (!dep.trim()) return null;
                          
                          const isTitle = dep.trim().startsWith('- ') && !dep.includes('None');
                          const isItem = dep.trim().startsWith('  - ');
                          
                          if (isTitle) {
                            return (
                              <TableRow key={`title-${index}`}>
                                <TableCell colSpan={2} className="font-medium bg-gray-50 dark:bg-gray-800">
                                  {dep.trim().replace('- ', '')}
                                </TableCell>
                              </TableRow>
                            );
                          } else if (isItem) {
                            const parts = dep.trim().replace('  - ', '').split(' (');
                            const ci = parts[0];
                            const details = parts.length > 1 ? parts[1].replace(')', '') : '';
                            
                            return (
                              <TableRow key={`item-${index}`}>
                                <TableCell>{ci}</TableCell>
                                <TableCell>{details}</TableCell>
                              </TableRow>
                            );
                          } else {
                            return (
                              <TableRow key={`line-${index}`}>
                                <TableCell colSpan={2}>{dep}</TableCell>
                              </TableRow>
                            );
                          }
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            } else {
              return <p key={idx} className="mb-2">{section}</p>;
            }
          })}
        </div>
      );
    }
    
    // Direct rendering of JSON format for List Open Incidents with CI Health
    try {
      const jsonData = JSON.parse(content);
      if (jsonData.incidents && Array.isArray(jsonData.incidents)) {
        return (
          <div>
            <p className="mb-2">{jsonData.message || 'Incidents with CI Health'}</p>
            <div className="border rounded overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Incident ID</TableHead>
                    <TableHead>CI Name</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[100px]">CI Health</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jsonData.incidents.map((incident, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{incident.incident_id}</TableCell>
                      <TableCell>{incident.ci}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          incident.status === "New" && "bg-blue-100 text-blue-800",
                          incident.status === "In Progress" && "bg-amber-100 text-amber-800",
                          incident.status === "Resolved" && "bg-green-100 text-green-800",
                          incident.status === "Critical" && "bg-red-100 text-red-800"
                        )}>
                          {incident.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          incident.ci_health === "Healthy" && "bg-green-100 text-green-800",
                          incident.ci_health === "Degraded" && "bg-amber-100 text-amber-800",
                          incident.ci_health === "Warning" && "bg-amber-100 text-amber-800",
                          incident.ci_health === "Critical" && "bg-red-100 text-red-800"
                        )}>
                          {incident.ci_health}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-3">
              <details className="text-sm">
                <summary className="cursor-pointer font-medium text-gray-700">Show Details</summary>
                <div className="mt-2 pl-3 border-l-2 border-gray-200">
                  {jsonData.incidents.map((incident, index) => (
                    <div key={index} className="mb-3">
                      <h4 className="font-medium">{incident.incident_id} - {incident.ci}</h4>
                      <p className="text-gray-600">{incident.details}</p>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        );
      }
    } catch (e) {
      // Not valid JSON, continue with other format checks
    }
    
    // Default formatting - split by line breaks for better readability
    return (
      <div>
        {content.split('\n').map((line, index) => (
          <div key={index}>
            {line}
            {index < content.split('\n').length - 1 && <br />}
          </div>
        ))}
      </div>
    );
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
      <div className="text-sm md:text-base overflow-x-auto">{formatContent(message.content)}</div>
      <div className="text-xs mt-1 opacity-70">
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};

export default ChatMessage;
