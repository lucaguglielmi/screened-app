import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ForensicIntelligenceBrief } from '../ForensicIntelligenceBrief';
import { ForensicIntelligenceSummary } from '../../../types/investigation';

describe('ForensicIntelligenceBrief Component', () => {
  it('renders the 3-vector forensic triad cards', () => {
    render(<ForensicIntelligenceBrief festivalName="Pinco Pallino" />);

    expect(screen.getByText('Forensic Intelligence Brief (Key Scam Realities)')).toBeInTheDocument();
    expect(screen.getByText('Scam Patterns & Shell Network')).toBeInTheDocument();
    expect(screen.getByText('Jury Conflict & Nepotism')).toBeInTheDocument();
    expect(screen.getByText('Curated Cinema vs. 4-Wall Rental')).toBeInTheDocument();
  });

  it('allows expanding cards to inspect educational context and forensic signals', () => {
    render(<ForensicIntelligenceBrief festivalName="Pinco Pallino" />);

    // Initially summary is shown
    expect(screen.getByText(/Operating company Pallino Media Lab Ltd was dissolved/i)).toBeInTheDocument();

    // Click to expand the Scam Patterns card
    const expandButtons = screen.getAllByRole('button', { name: /View Signals & Context/i });
    fireEvent.click(expandButtons[0]);

    // Educational context is revealed
    expect(screen.getByText(/Shell Entity Scheme:/i)).toBeInTheDocument();
    expect(screen.getByText(/71-75 Shelton Street shared with >2,000 corporate mailboxes/i)).toBeInTheDocument();
  });

  it('renders custom forensic data with custom badges', () => {
    const customSummary: ForensicIntelligenceSummary = {
      scamPattern: {
        status: 'RED_FLAG',
        headline: 'Phantom LLC Detected',
        summary: 'Entity does not exist in national registrar.',
        educationalContext: 'Common fraud indicator.',
        signals: ['No registration number'],
      },
      juryConflict: {
        status: 'AMBER_WARNING',
        headline: 'Potential Conflict of Interest',
        summary: 'Juror previously worked with festival founder.',
        educationalContext: 'Jury neutrality concern.',
        signals: ['Co-credited short in 2021'],
      },
      venueReality: {
        status: 'VERIFIED_AUTHENTIC',
        headline: 'Authentic Curated Cinema',
        summary: 'Festival has verified contract with venue.',
        educationalContext: 'Genuine cinema curation.',
        signals: ['Venue ticketing live'],
      },
    };

    render(<ForensicIntelligenceBrief summary={customSummary} festivalName="CustomFest" />);

    expect(screen.getByText('Phantom LLC Detected')).toBeInTheDocument();
    expect(screen.getByText('Potential Conflict of Interest')).toBeInTheDocument();
    expect(screen.getByText('Authentic Curated Cinema')).toBeInTheDocument();
  });
});
