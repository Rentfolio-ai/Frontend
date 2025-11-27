// FILE: src/components/chat/MessageBubble.tsx
import React from 'react';
import { cn } from '../../lib/utils';
import type { Message } from '@/types/chat';
import { AgentAvatar, type AgentStatus } from '../common/AgentAvatar';
import { ActionButtons } from './ActionButtons';
import { ToolMessage } from './ToolMessage';
import { PropertyBookmarkCard, PropertyComparisonTableCard, GeneratedReportCard, VisionAnalysisCard } from './tool-cards';
import { useAuth } from '../../contexts/AuthContext';
import type { ComparePropertiesOutput, GenerateReportOutput } from '../../types/backendTools';
import type { VisionAnalysisData } from './tool-cards/VisionAnalysisCard';
import type { InvestmentStrategy } from '../../types/pnl';
import type { BookmarkedProperty } from '../../types/bookmarks';
import type { ScoutedProperty } from '../../types/backendTools';

interface MessageBubbleProps {
  message: Message;
  onAction?: (actionValue: string, actionContext?: any) => void;
  agentStatus?: AgentStatus;
  onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy, purchasePrice?: number, propertyAddress?: string) => void;
  // Property bookmark support
  bookmarks?: BookmarkedProperty[];
  onToggleBookmark?: (property: ScoutedProperty) => void;
  // Navigate to reports tab (reports are auto-saved on backend)
  onNavigateToReports?: () => void;
}
export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  onAction, 
  agentStatus = 'online', 
  onOpenDealAnalyzer,
  bookmarks,
  onToggleBookmark,
  onNavigateToReports,
}) => {
  const isUser = message.role === 'user';
  const { user } = useAuth();
  const userInitials = (user?.name || 'You')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'YOU';
  
  const timestampLabel = typeof message.timestamp === 'string'
    ? message.timestamp
    : new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const messageContent = (
    <>
      <div 
        className={cn(
          'text-[15px] leading-relaxed whitespace-pre-wrap font-medium tracking-wide',
          message.isStreaming && 'inline',
          isUser ? 'text-[#4B2A1A]' : 'text-slate-800'
        )}
      >
        {message.content}
        {message.isStreaming && (
          <span 
            className="inline-block w-2 h-4 ml-1 align-middle bg-teal-500 animate-pulse rounded-sm"
            style={{ animationDuration: '0.8s' }}
          />
        )}
      </div>
      <div className={cn(
        'flex items-center gap-2 text-[10px] font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        isUser ? 'text-[#B7613A]' : 'text-slate-500'
      )}>
        <span>{timestampLabel}</span>
      </div>
      {message.attachment && (
        <div className="mt-2">
          {message.attachment.type.startsWith('image') ? (
            <img
              src={message.attachment.url}
              alt={message.attachment.name}
              className="max-w-md max-h-64 rounded-xl shadow"
            />
          ) : (
            <a
              href={message.attachment.url}
              download={message.attachment.name}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors border',
                isUser
                  ? 'bg-white/80 border-[#F4BC9E] text-[#5C2C1E] hover:bg-white'
                  : 'bg-black/10 hover:bg-black/20 border-transparent'
              )}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M12 16V4M12 16l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="4" y="18" width="16" height="2" rx="1" fill="currentColor" />
              </svg>
              {message.attachment.name}
            </a>
          )}
        </div>
      )}
      {!isUser && message.action && onAction && (
        <ActionButtons action={message.action} onAction={onAction} />
      )}
      {!isUser && message.tools && message.tools.length > 0 && (
        <div className="mt-4 space-y-3">
          {message.tools.map((tool) => {
            // Property comparison renders inline as bookmarks (no card wrapper)
            if (tool.kind === 'property_comparison' && tool.data) {
              return (
                <PropertyBookmarkCard
                  key={tool.id}
                  data={tool.data}
                  bookmarks={bookmarks}
                  onToggleBookmark={onToggleBookmark}
                />
              );
            }
            
            // Property comparison table (compare_properties tool)
            if (tool.kind === 'property_comparison_table' && tool.data) {
              return (
                <PropertyComparisonTableCard
                  key={tool.id}
                  data={tool.data as ComparePropertiesOutput}
                  bookmarks={bookmarks}
                  onToggleBookmark={onToggleBookmark}
                />
              );
            }
            
            // Generated report (generate_report tool) - reports are auto-saved on backend
            if (tool.kind === 'generated_report' && tool.data) {
              const reportData = tool.data as GenerateReportOutput;
              return (
                <GeneratedReportCard
                  key={tool.id}
                  data={reportData}
                  onNavigateToReports={onNavigateToReports}
                />
              );
            }
            
            // Vision/Renovation analysis - render costs directly without wrapper
            if (tool.kind === 'renovation_analysis') {
              // Only render if we have data, otherwise skip
              if (tool.data) {
                return (
                  <VisionAnalysisCard
                    key={tool.id}
                    data={tool.data as VisionAnalysisData}
                  />
                );
              }
              // If no data, skip this tool entirely
              return null;
            }
            
            // Other tools with known kind use ToolMessage (excluding renovation_analysis which is handled above)
            if (tool.kind && tool.kind !== 'generic' && tool.kind !== 'renovation_analysis') {
              return (
                <ToolMessage
                  key={tool.id}
                  tool={tool as any}
                  timestamp={typeof message.timestamp === 'string' ? message.timestamp : message.timestamp.toISOString()}
                  onOpenDealAnalyzer={onOpenDealAnalyzer}
                  bookmarks={bookmarks}
                  onToggleBookmark={onToggleBookmark}
                />
              );
            }
            
            // Fallback for generic tools without kind
            return (
              <div 
                key={tool.id}
                className="p-3 rounded-lg bg-muted/50 border border-border/50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{tool.title}</span>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded',
                    tool.status === 'completed' && 'bg-green-500/20 text-green-700',
                    tool.status === 'running' && 'bg-amber-500/20 text-amber-700',
                    tool.status === 'error' && 'bg-red-500/20 text-red-700'
                  )}>
                    {tool.status}
                  </span>
                </div>
                {tool.description && (
                  <p className="text-xs text-foreground/60 mt-1">{tool.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
  
  // Translucent, breathable design
  return (
    <div className={cn(
      'flex gap-3 animate-slide-in mb-3',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {/* AI Agent Avatar - Left side only */}
      {!isUser && (
        <div className="flex-shrink-0 pt-1">
          <AgentAvatar size="md" status={agentStatus} />
        </div>
      )}
      
      {/* Message Card - Real Estate Copilot Theme */}
      {isUser ? (
        <div className="relative max-w-[75%] group">
          <div className="flex overflow-hidden rounded-[26px] border border-[#F1C2A4]/70 shadow-[0_18px_38px_rgba(171,94,56,0.18)] bg-[#FFE6D4]/90">
            <div className="relative w-14 bg-gradient-to-b from-[#FF7A45] via-[#FF8C5C] to-[#FFAF8C] text-white font-semibold tracking-[0.12em] flex items-center justify-center uppercase">
              <span>{userInitials}</span>
              <div className="absolute inset-0 bg-white/10 mix-blend-soft-light" />
              <div className="absolute inset-y-0 right-0 w-px bg-white/20" />
            </div>
            <div
              className="relative flex-1 bg-[#FFF4EC]/95"
              style={{ clipPath: 'polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 0 100%)' }}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/70 to-transparent pointer-events-none" />
              <div className="relative px-6 py-4">
                {messageContent}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={cn(
          'max-w-[55%] px-6 py-4 rounded-2xl rounded-tl-sm bg-blue-50/90 border border-blue-900/10 shadow-blue-900/5 text-slate-800 backdrop-blur-2xl transition-all duration-200 hover:shadow-lg group'
        )}>
          {messageContent}
        </div>
      )}
      
    </div>
  );
};