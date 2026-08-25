export interface SpanTrace {
  id: string;
  name: string;
  service: string;
  durationMs: number;
  tokens?: number;
  status: 'OK' | 'VERIFIED' | 'STALLED_RECOVERED' | string;
  detail: string;
}

interface RawSpan {
  context?: { span_id?: string };
  name?: string;
  attributes?: Record<string, unknown>;
  start_time?: number;
  end_time?: number;
}

export const fetchRecentTraces = async (): Promise<SpanTrace[]> => {
  try {
    const res = await fetch('/api/traces/recent');
    if (!res.ok) {
      throw new Error(`Failed to fetch traces: ${res.statusText}`);
    }
    const data: RawSpan[] = await res.json();
    if (data && data.length > 0) {
      return data.map((t: RawSpan) => ({
        id: t.context?.span_id || Math.random().toString(),
        name: t.name || 'Unknown Span',
        service: String(t.attributes?.['service.name'] || 'Orchestrator'),
        durationMs:
          t.start_time && t.end_time ? Math.round((t.end_time - t.start_time) / 1000000) : 0,
        status: String(t.attributes?.status || 'OK'),
        detail: String(t.attributes?.detail || 'No detail provided.'),
        tokens: typeof t.attributes?.['gen_ai.usage.total_tokens'] === 'number'
          ? t.attributes['gen_ai.usage.total_tokens']
          : undefined,
      }));
    }
    return [];
  } catch (e) {
    console.warn('Observability API unavailable, returning empty traces.', e);
    return [];
  }
};
