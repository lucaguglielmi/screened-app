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

export const track = <T extends AnalyticsEvent['event']>(
  eventName: T,
  params: Extract<AnalyticsEvent, { event: T }>['params']
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  } else {
    // Fallback for development/testing
    console.debug(`[Analytics Event] ${eventName}`, params);
  }
};
