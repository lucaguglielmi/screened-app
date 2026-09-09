import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DossierGeminiAgentCallout } from '../DossierGeminiAgentCallout';
import { CandidateEntity } from '../../../types/investigation';

describe('DossierGeminiAgentCallout', () => {
  const mockEntity: CandidateEntity = {
    id: 'demo_pinco_pallino',
    name: 'Pinco Pallino Film Festival',
    entityType: 'FESTIVAL',
    descriptor: 'London Indie Festival',
    sourceIds: ['s1'],
  };

  it('renders callout headline with WebMCP & MCP mention, and copy prompt button', () => {
    render(<DossierGeminiAgentCallout entity={mockEntity} />);

    expect(
      screen.getByText('Search this dossier with your Gemini & MCP Agent')
    ).toBeInTheDocument();
    expect(screen.getByText(/Gemini & WebMCP Agent Ready/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy prompt to clipboard/i })).toBeInTheDocument();
  });

  it('copies prompt to clipboard when copy button is clicked', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<DossierGeminiAgentCallout entity={mockEntity} />);

    const copyBtn = screen.getByRole('button', { name: /Copy prompt to clipboard/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith(
      expect.stringContaining('Audit the Pinco Pallino Film Festival film festival')
    );
    expect(writeTextMock).toHaveBeenCalledWith(
      expect.stringContaining('https://totallyscreened.com/api/mcp/sse')
    );
    expect(screen.getByText('Copied Prompt!')).toBeInTheDocument();
  });
});
