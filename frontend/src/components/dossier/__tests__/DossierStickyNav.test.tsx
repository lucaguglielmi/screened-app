import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DossierStickyNav } from '../DossierStickyNav';
import { DossierReport } from '../../../types/investigation';

describe('DossierStickyNav Component', () => {
  const mockDossier: DossierReport = {
    executiveSummary: 'Executive summary for Pinco Pallino Film Festival.',
    festivalOverview: 'Independent film festival located in London.',
    organizerProfile: 'Organized by Pinco Pallino Film CIC.',
    participantFeedback: 'Positive reception from indie filmmakers.',
    filmmakerChecklist: ['Check non-profit status'],
    unresolvedQuestions: ['Who runs the jury?'],
  };

  it('renders entity identifier, Actions menu in first row, and DetailDial in second row', () => {
    const onDensityChange = vi.fn();

    render(
      <DossierStickyNav
        dossier={mockDossier}
        entityName="Pinco Pallino Film Festival"
        officialDomain="pincopallinofilmfestival.com"
        density="FULL_EVIDENCE"
        onDensityChange={onDensityChange}
      />
    );

    // Row 1: Entity name and Actions button
    expect(screen.getByText('Pinco Pallino Film Festival')).toBeInTheDocument();
    expect(screen.getByText('pincopallinofilmfestival.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Actions/i })).toBeInTheDocument();

    // Row 2: DetailDial tabs
    expect(screen.getByRole('button', { name: /Summary/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Full/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Agent/i })).toBeInTheDocument();
  });

  it('opens Actions dropdown when Actions button is clicked', () => {
    const onDensityChange = vi.fn();

    render(
      <DossierStickyNav
        dossier={mockDossier}
        entityName="Pinco Pallino Film Festival"
        density="FULL_EVIDENCE"
        onDensityChange={onDensityChange}
      />
    );

    const actionsButton = screen.getByRole('button', { name: /Actions/i });
    fireEvent.click(actionsButton);

    expect(screen.getByText('Copy Summary')).toBeInTheDocument();
    expect(screen.getByText('Copy Shareable Link')).toBeInTheDocument();
    expect(screen.getByText('Print / Save as PDF')).toBeInTheDocument();
    expect(screen.getByText(/Copy Gemini Agent Prompt/i)).toBeInTheDocument();
    expect(screen.getByText(/Copy AI Graph/i)).toBeInTheDocument();
  });

  it('invokes onDensityChange when switching tabs in row 2', () => {
    const onDensityChange = vi.fn();

    render(
      <DossierStickyNav
        dossier={mockDossier}
        entityName="Pinco Pallino Film Festival"
        density="FULL_EVIDENCE"
        onDensityChange={onDensityChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Summary/i }));
    expect(onDensityChange).toHaveBeenCalledWith('SIMPLIFIED');
  });

  it('renders authenticity score pill and section jump anchors in FULL_EVIDENCE mode', () => {
    render(
      <DossierStickyNav
        dossier={mockDossier}
        entityName="Pinco Pallino Film Festival"
        density="FULL_EVIDENCE"
        onDensityChange={vi.fn()}
        authenticityScore={68}
      />
    );

    expect(screen.getByText('Score: 68/100')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Radar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fees & Premiere' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '7-Vectors' })).toBeInTheDocument();
  });
});
