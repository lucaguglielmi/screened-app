export type AnalyticsEvent =
  | {
      event: 'investigation_started';
      params: {
        entry_point: 'search_form' | 'starter_chip' | 'command_palette';
        query_length: number;
        has_optional_url: boolean;
      };
    }
  | {
      event: 'deep_screen_launched';
      params: {
        source_tool: 'chat' | 'scout' | 'command_palette';
        query_length: number;
        target_provided: boolean;
      };
    }
  | {
      event: 'dossier_exported';
      params: {
        investigation_id: string;
        export_format: 'markdown';
        claim_count: number;
      };
    };

interface GtagWindow extends Window {
  gtag?: (command: string, eventName: string, params: Record<string, unknown>) => void;
}

export const track = <T extends AnalyticsEvent['event']>(
  eventName: T,
  params: Extract<AnalyticsEvent, { event: T }>['params']
) => {
  const win = typeof window !== 'undefined' ? (window as unknown as GtagWindow) : null;
  if (win?.gtag) {
    win.gtag('event', eventName, params as Record<string, unknown>);
  } else {
    // Fallback for development/testing
    console.debug(`[Analytics Event] ${eventName}`, params);
  }
};
