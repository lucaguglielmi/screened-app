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

  it('renders callout headline, prompt preview, and copy button', () => {
    render(<DossierGeminiAgentCallout entity={mockEntity} claimsCount={14} />);

    expect(
      screen.getByText('Search this dossier with your Gemini Agent')
    ).toBeInTheDocument();
    expect(screen.getByText(/Gemini & Antigravity Agent Ready/i)).toBeInTheDocument();
    expect(screen.getByText(/14 Atomic Claims Indexed/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy prompt to clipboard/i })).toBeInTheDocument();
  });

  it('copies prompt to clipboard when copy button is clicked', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<DossierGeminiAgentCallout entity={mockEntity} claimsCount={14} />);

    const copyBtn = screen.getByRole('button', { name: /Copy prompt to clipboard/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith(
      expect.stringContaining('Audit the Pinco Pallino Film Festival dossier')
    );
    expect(screen.getByText('Copied Prompt!')).toBeInTheDocument();
  });

  it('expands details when details toggle button is clicked', () => {
    render(<DossierGeminiAgentCallout entity={mockEntity} claimsCount={14} />);

    expect(screen.queryByText(/screened_ask_dossier/i)).not.toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /Toggle agent instructions/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByText(/screened_ask_dossier/i)).toBeInTheDocument();
    expect(screen.getByText(/screened_inspect_claim/i)).toBeInTheDocument();
    expect(screen.getByText(/rules\/AGENTS.md/i)).toBeInTheDocument();
  });
});
