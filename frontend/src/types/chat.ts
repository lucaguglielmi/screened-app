/**
 * Producer Desk Conversational Agent Types.
 * Backend tools and analysis payloads are generated via scripts/generate_contracts.py.
 */

import type {
  ToolCallType,
  DueDiligenceArgs,
  OpportunityScoutArgs,
  CompareFestivalsArgs,
  GrantScoutArgs,
  InvitationEmailArgs,
  ChatToolCall,
  DocumentAnalysisResult,
  FollowUpOption,
  InteractiveFollowUpProbe,
  ChatMessage,
  AttachedFileMeta,
} from './generated/contracts';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatStreamEvent {
  type: 'TOKEN' | 'THINKING' | 'TOOL_CALL' | 'FOLLOW_UP_PROBE' | 'DONE' | 'ERROR';
  token?: string;
  message?: string;
  toolCall?: ChatToolCall;
  followUpProbe?: InteractiveFollowUpProbe;
  error?: string;
}

// Re-export canonical Pydantic contracts and tool payloads from generated contracts
export type {
  ToolCallType,
  DueDiligenceArgs,
  OpportunityScoutArgs,
  CompareFestivalsArgs,
  GrantScoutArgs,
  InvitationEmailArgs,
  ChatToolCall,
  DocumentAnalysisResult,
  FollowUpOption,
  InteractiveFollowUpProbe,
  ChatMessage,
  AttachedFileMeta,
};

