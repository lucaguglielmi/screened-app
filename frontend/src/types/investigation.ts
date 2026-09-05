/**
 * Canonical Screened Investigation and UI Data Contracts.
 * Core domain models, enums, and request/response payloads are automatically
 * synchronized from backend Pydantic models via scripts/generate_contracts.py.
 */

import type React from 'react';

// Re-export all backend-generated Pydantic contracts, enums, and companion const arrays
export * from './generated/contracts';

// ============================================================================
// UI-SPECIFIC TYPES (Client Navigation & React Layouts)
// ============================================================================

export type ActiveTool =
  | 'CONVERSATIONAL_DESK'
  | 'DUE_DILIGENCE'
  | 'GRANT_SCOUT'
  | 'OPPORTUNITY_SCOUT'
  | 'DESIGN_PLAYGROUND'
  | 'WHY_SCREENED'
  | 'FESTIVAL_PROTECTION_GUIDE'
  | 'HOW_TO_USE';

export interface DiagramGraphPayload {
  nodes: Array<{
    id: string;
    type: string;
    data: Record<string, unknown>;
    position: { x: number; y: number };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    animated?: boolean;
    style?: React.CSSProperties;
  }>;
}
