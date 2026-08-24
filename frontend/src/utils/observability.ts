export interface SpanTrace {
  id: string;
  name: string;
  service: string;
  durationMs: number;
  tokens?: number;
  status: 'OK' | 'VERIFIED' | 'STALLED_RECOVERED' | string;
  detail: string;
}

export const fetchRecentTraces = async (): Promise<SpanTrace[]> => {
  try {
    const res = await fetch('/api/traces/recent');
    if (!res.ok) {
      throw new Error(`Failed to fetch traces: ${res.statusText}`);
    }
    const data = await res.json();
    if (data && data.length > 0) {
      return data.map((t: any) => ({
        id: t.context?.span_id || Math.random().toString(),
        name: t.name || 'Unknown Span',
        service: t.attributes?.['service.name'] || 'Orchestrator',
        durationMs:
          t.start_time && t.end_time ? Math.round((t.end_time - t.start_time) / 1000000) : 0,
        status: t.attributes?.status || 'OK',
        detail: t.attributes?.detail || 'No detail provided.',
        tokens: t.attributes?.['gen_ai.usage.total_tokens'] || undefined,
      }));
    }
    return [];
  } catch (e) {
    console.warn('Observability API unavailable, returning empty traces.', e);
    return [];
  }
};
