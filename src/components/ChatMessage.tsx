
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
    
    // Default formatting - split by line breaks for better readability
    return (
      <div>
        {content.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < content.split('\n').length - 1 && <br />}
          </React.Fragment>
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
