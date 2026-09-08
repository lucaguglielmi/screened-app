import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBenchmarkPage } from '../SearchBenchmarkPage';

describe('SearchBenchmarkPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/api/config/search-mode')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              current_mode: 'fast',
              available_modes: ['fast', 'basic', 'advanced'],
              cost_table: {
                fast: '$1.00 / 1k queries (~700ms median latency, 80% cost reduction)',
                basic: '$5.00 / 1k queries (~1.8s median latency, standard coverage)',
                advanced: '$5.00 / 1k queries (~3.5s median latency, exhaustive multi-domain deep search)',
              },
            }),
        });
      }
      if (url.includes('/api/playground/benchmark-search')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              target_name: 'Edinburgh International Film Festival',
              timestamp: '2026-09-08T09:00:00Z',
              comparisons: [
                {
                  mode: 'fast',
                  latency_ms: 680,
                  records_found: 8,
                  unique_domains: 6,
                  mean_excerpt_chars: 820,
                  estimated_cost_usd: 0.001,
                  tier1_source_count: 3,
                  top_domains: ['filmfestival.org', 'screendaily.com', 'variety.com'],
                  sample_titles: ['Edinburgh IFF - Official Selection'],
                  simulated_or_live: 'live',
                },
                {
                  mode: 'basic',
                  latency_ms: 1720,
                  records_found: 10,
                  unique_domains: 7,
                  mean_excerpt_chars: 1150,
                  estimated_cost_usd: 0.005,
                  tier1_source_count: 4,
                  top_domains: ['filmfestival.org', 'screendaily.com', 'variety.com', 'bfi.org.uk'],
                  sample_titles: ['Edinburgh IFF Screening Venues'],
                  simulated_or_live: 'live',
                },
                {
                  mode: 'advanced',
                  latency_ms: 3380,
                  records_found: 13,
                  unique_domains: 10,
                  mean_excerpt_chars: 1420,
                  estimated_cost_usd: 0.005,
                  tier1_source_count: 6,
                  top_domains: ['filmfestival.org', 'screendaily.com', 'companieshouse.gov.uk'],
                  sample_titles: ['Edinburgh IFF Limited Registry Records'],
                  simulated_or_live: 'live',
                },
              ],
              key_takeaway:
                'Empirical Benchmark Summary: Fast mode delivers a ~700ms turnaround at $1/1k queries (80% cost reduction).',
            }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch ${url}`));
    });
  });

  it('renders benchmark header, dynamic mode switcher, and festival presets', async () => {
    render(<SearchBenchmarkPage />);

    expect(screen.getByText(/Parallel Search Benchmark Laboratory/i)).toBeInTheDocument();
    expect(screen.getByText(/Dynamic Runtime Search Mode Switcher/i)).toBeInTheDocument();
    expect(screen.getByText(/Fast Mode: 80% Cost Reduction/i)).toBeInTheDocument();

    // European festival presets
    expect(screen.getByText(/Edinburgh International Film Festival/i)).toBeInTheDocument();
    expect(screen.getByText(/International Film Festival Rotterdam/i)).toBeInTheDocument();
    expect(screen.getByText(/Karlovy Vary International Film Festival/i)).toBeInTheDocument();
  });

  it('allows switching search modes dynamically', async () => {
    render(<SearchBenchmarkPage />);

    const basicBtn = screen.getByRole('button', { name: /Basic Mode/i });
    fireEvent.click(basicBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/config/search-mode',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });
  });

  it('runs benchmark across all 3 modes and renders comparative metrics', async () => {
    render(<SearchBenchmarkPage />);

    const runBtn = screen.getByRole('button', { name: /Run Benchmark Across All 3 Modes/i });
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText(/Benchmark Results for "Edinburgh International Film Festival"/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/680/)).toBeInTheDocument();
    expect(screen.getByText(/1720/)).toBeInTheDocument();
    expect(screen.getByText(/3380/)).toBeInTheDocument();
  });
});
