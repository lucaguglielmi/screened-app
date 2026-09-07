import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeeEscalationVisualizer } from '../FeeEscalationVisualizer';
import { FeeEscalationModel } from '../../../types/investigation';

describe('FeeEscalationVisualizer Component', () => {
  it('renders default fee escalation data with spike alert', () => {
    render(<FeeEscalationVisualizer festivalName="Pinco Pallino" />);

    expect(screen.getByText('Fee Escalation Visualizer')).toBeInTheDocument();
    expect(screen.getByText(/Tracks submission fee trajectory for Pinco Pallino/i)).toBeInTheDocument();
    expect(screen.getByText(/Aggressive 203% fee surge/i)).toBeInTheDocument();
  });

  it('renders custom fee tiers with surge calculations', () => {
    const customModel: FeeEscalationModel = {
      currency: '£',
      tiers: [
        { tierName: 'Super Early', amount: 20, currency: '£', deadlineDate: '1 Jan', surgePercentage: 0 },
        { tierName: 'Late Window', amount: 80, currency: '£', deadlineDate: '1 Aug', surgePercentage: 300 },
      ],
      spikeAlert: 'Predatory 300% markup detected',
      averageMarketFee: '£25 benchmark for shorts',
      percentile: 95,
    };

    render(<FeeEscalationVisualizer model={customModel} festivalName="CustomFest" />);

    expect(screen.getByText('Super Early')).toBeInTheDocument();
    expect(screen.getByText('Late Window')).toBeInTheDocument();
    expect(screen.getByText('£20')).toBeInTheDocument();
    expect(screen.getByText('£80')).toBeInTheDocument();
    expect(screen.getByText(/Predatory 300% markup detected/i)).toBeInTheDocument();
    expect(screen.getByText(/95th percentile/i)).toBeInTheDocument();
  });

  it('renders summary mode with +250% fee inflation badge and responds to click', () => {
    let navigated = false;
    render(
      <FeeEscalationVisualizer
        festivalName="Pinco Pallino"
        isSummary={true}
        onNavigateToFull={() => { navigated = true; }}
      />
    );

    expect(screen.getByText('Fee Escalation')).toBeInTheDocument();
    expect(screen.getByText('+250% Fee Inflation')).toBeInTheDocument();
    expect(screen.getByText(/View complete fee tier schedule in Full Dossier/i)).toBeInTheDocument();
    // Verification that full tier timeline grid is hidden in summary mode
    expect(screen.queryByText('Tier History & Surge Trajectory')).not.toBeInTheDocument();

    screen.getByText(/View complete fee tier schedule in Full Dossier/i).click();
    expect(navigated).toBe(true);
  });
});


