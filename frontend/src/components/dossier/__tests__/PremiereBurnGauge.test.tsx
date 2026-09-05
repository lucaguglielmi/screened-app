import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PremiereBurnGauge } from '../PremiereBurnGauge';
import { PremiereRiskAssessment } from '../../../types/investigation';

describe('PremiereBurnGauge Component', () => {
  it('renders with default high risk assessment', () => {
    render(<PremiereBurnGauge festivalName="Pinco Pallino" />);

    expect(screen.getByText('Premiere Value vs. Burn Risk')).toBeInTheDocument();
    expect(screen.getByText(/Quantifies whether surrendering premiere rights to Pinco Pallino/i)).toBeInTheDocument();
    expect(screen.getByText(/Critical Burn \(100\)/i)).toBeInTheDocument();
  });

  it('renders custom high burn risk data accurately', () => {
    const assessment: PremiereRiskAssessment = {
      riskScore: 82,
      riskLevel: 'HIGH_BURN_RISK',
      premiereDemand: 'World Premiere Mandatory',
      accreditationStatus: 'Unaccredited (Non-BAFTA)',
      buyerPressFootprint: 'Zero verified acquisitions',
      verdictRationale: 'Demands premiere exclusivity with zero industry leverage.',
      recommendation: 'Do not burn your World Premiere here.',
    };

    render(<PremiereBurnGauge assessment={assessment} festivalName="ScamFest" />);

    expect(screen.getByText(/82 \/ 100/)).toBeInTheDocument();
    expect(screen.getByText('World Premiere Mandatory')).toBeInTheDocument();
    expect(screen.getByText('Unaccredited (Non-BAFTA)')).toBeInTheDocument();
    expect(screen.getByText('Do not burn your World Premiere here.')).toBeInTheDocument();
    expect(screen.getByText(/High Burn Risk/i)).toBeInTheDocument();
  });

  it('renders low risk assessment correctly', () => {
    const lowRisk: PremiereRiskAssessment = {
      riskScore: 20,
      riskLevel: 'LOW_RISK',
      premiereDemand: 'No Premiere Required',
      accreditationStatus: 'BAFTA Qualifying (A-List)',
      buyerPressFootprint: 'Major international buyers in attendance',
      verdictRationale: 'Safe submission with strong industry prestige.',
      recommendation: 'Ideal candidate for premiere run.',
    };

    render(<PremiereBurnGauge assessment={lowRisk} festivalName="MajorFest" />);

    expect(screen.getByText(/20 \/ 100/)).toBeInTheDocument();
    expect(screen.getByText(/Protected Leverage/i)).toBeInTheDocument();
    expect(screen.getByText('BAFTA Qualifying (A-List)')).toBeInTheDocument();
  });
});
