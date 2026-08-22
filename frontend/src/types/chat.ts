export type ChatRole = 'user' | 'assistant' | 'system';

export type ToolCallType =
  | 'configure_due_diligence'
  | 'configure_opportunity_scout'
  | 'compare_festivals_arena'
  | 'configure_grant_scout'
  | 'analyze_invitation_email';

export interface DueDiligenceArgs {
  festival_name: string;
  optional_url?: string;
  city_country?: string;
  suspected_concerns?: string[];
  user_context?: string[];
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

export interface GrantScoutArgs {
  project_title: string;
  grant_category: string;
  target_amount: string;
  production_stage: string;
  filmmaker_region: string;
  recommended_grants?: string[];
  grant_strategy_summary: string;
}

export interface InvitationEmailArgs {
  festival_claimed: string;
  sender_domain: string;
  fee_waiver_offered?: boolean;
  upfront_payment_requested?: string;
  red_flag_signals?: string[];
  initial_verdict: string;
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
