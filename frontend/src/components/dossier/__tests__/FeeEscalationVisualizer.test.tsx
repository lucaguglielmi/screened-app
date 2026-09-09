import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeeEscalationVisualizer } from '../FeeEscalationVisualizer';
import { FeeEscalationModel } from '../../../types/investigation';

const sampleModel: FeeEscalationModel = {
  currency: '£',
  tiers: [
    { tierName: 'Super Early', amount: 28, currency: '£', deadlineDate: '15 Jan', surgePercentage: 0 },
    { tierName: 'Early Bird', amount: 38, currency: '£', deadlineDate: '1 Mar', surgePercentage: 35 },
    { tierName: 'Regular', amount: 55, currency: '£', deadlineDate: '15 May', surgePercentage: 96 },
    { tierName: 'Late Window', amount: 85, currency: '£', deadlineDate: '1 Aug', surgePercentage: 203 },
    { tierName: 'Extended Late', amount: 98, currency: '£', deadlineDate: '15 Sep', surgePercentage: 250 },
  ],
  spikeAlert: 'Significant 203% fee increase detected between early and late deadlines (£28 -> £85).',
  averageMarketFee: '£32 average for UK indie short film entries',
  percentile: 92,
};

describe('FeeEscalationVisualizer Component', () => {
  it('renders zero-state message when no model or tiers provided', () => {
    render(<FeeEscalationVisualizer festivalName="Pinco Pallino" />);

    expect(screen.getByText(/No tiered fee schedule detected in public archives/i)).toBeInTheDocument();
  });

  it('renders flat fee message for single tier', () => {
    const flatModel: FeeEscalationModel = {
      currency: '£',
      tiers: [{ tierName: 'Flat Entry', amount: 30, currency: '£', deadlineDate: '1 June', surgePercentage: 0 }],
      averageMarketFee: '£30',
    };
    render(<FeeEscalationVisualizer model={flatModel} festivalName="Pinco Pallino" />);

    expect(screen.getByText(/Flat submission fee of £30/i)).toBeInTheDocument();
  });

  it('renders fee escalation data with spike alert', () => {
    render(<FeeEscalationVisualizer model={sampleModel} festivalName="Pinco Pallino" />);

    expect(screen.getByText('Fee Escalation Visualizer')).toBeInTheDocument();
    expect(screen.getByText(/Tracks submission fees for Pinco Pallino/i)).toBeInTheDocument();
    expect(screen.getByText(/Significant 203% fee increase/i)).toBeInTheDocument();
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

  it('renders summary mode with fee inflation badge and responds to click', () => {
    let navigated = false;
    render(
      <FeeEscalationVisualizer
        model={sampleModel}
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


