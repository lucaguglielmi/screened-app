export type ChatRole = 'user' | 'assistant' | 'system';

export type ToolCallType =
  | 'configure_due_diligence'
  | 'configure_opportunity_scout'
  | 'compare_festivals_arena';

export interface DueDiligenceArgs {
  festival_name: string;
  optional_url?: string;
  suspected_concerns?: string[];
  preflight_summary: string;
}

export interface OpportunityScoutArgs {
  film_title: string;
  format: 'SHORT' | 'FEATURE' | 'DOCUMENTARY' | 'ANIMATION' | 'EPISODIC';
  genre: string;
  runtime_minutes: number;
  premiere_goal: 'WORLD_PREMIERE' | 'INTERNATIONAL_PREMIERE' | 'NATIONAL_PREMIERE' | 'NO_PREFERENCE';
  budget_tier: string;
  target_regions: string[];
  strategy_rationale: string;
}

export interface CompareFestivalsArgs {
  festival_a: string;
  festival_b: string;
  key_comparison_vectors: string[];
  verdict_summary: string;
}

export interface ChatToolCall {
  id: string;
  toolName: ToolCallType;
  args: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  toolCall?: ChatToolCall;
  timestamp: string;
}

export interface ChatStreamEvent {
  type: 'TOKEN' | 'THINKING' | 'TOOL_CALL' | 'DONE' | 'ERROR';
  token?: string;
  message?: string;
  toolCall?: ChatToolCall;
  error?: string;
}
