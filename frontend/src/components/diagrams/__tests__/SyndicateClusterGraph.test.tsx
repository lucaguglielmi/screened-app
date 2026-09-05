import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EntityProvenanceGraph } from '../EntityProvenanceGraph';
import { SyndicateInspector, SyndicateNodeData } from '../SyndicateInspector';
import { EvidenceDossier } from '../../../types/investigation';

const mockSyndicateDossier: EvidenceDossier = {
  id: 'dossier-syndicate-1',
  investigationId: 'inv-syndicate-1',
  festivalName: 'Pinco Pallino Film Festival',
  reportSummary: 'Forensic evaluation detected high risk syndicate patterns.',
  officialDomain: 'pincopallinofilmfestival.com',
  corporateEntity: {
    legalName: 'Pallino Media Lab Ltd',
    registrationNumber: '13984712',
    status: 'Dissolved',
    registeredAddress: '71-75 Shelton Street, Covent Garden, London WC2H 9JQ',
    associatedFestivals: [
      'London Indie Shorts Review',
      'Soho Arthouse Showcase',
      'Thames International Cinema Fest',
    ],
    connectedEntities: ['IndiePitch Consulting'],
    flags: [
      'Compulsory strike-off active in Companies House',
      'Operating through dissolved corporate shell',
      'Virtual mailbox shared with >2,000 entities',
    ],
  },
  keyPersonnel: [
    {
      name: 'Arthur Smith',
      roles: ['Director & Managing Officer'],
    },
  ],
  forensicSummary: {
    scamPattern: {
      status: 'RED_FLAG',
      headline: 'Dissolved Shell & Maildrop Syndicate Detected',
      summary: 'Corporate entity dissolved while submission fees actively collected.',
      educationalContext: 'Organizers cycle through dissolved shell companies to evade chargebacks.',
      signals: [
        'Registered office is a known high-density mail forwarding service',
        'Same director operates 4 clone festival submission pages',
      ],
      relatedEntities: ['London Indie Shorts Review', 'Soho Arthouse Showcase'],
    },
    juryConflict: {
      status: 'AMBER_WARNING',
      headline: 'Shared Directorship Across Multiple Sister Brands',
      summary: 'Arthur Smith maintains sole directorship without independent jury governance.',
      signals: ['100% controlling interest', 'No published jury constitution'],
    },
    venueReality: {
      status: 'RED_FLAG',
      headline: 'Phantom Venue Risk',
      summary: 'Venue does not corroborate private theatrical hire.',
      signals: ['No box office listing'],
    },
  },
  atomicClaims: [
    {
      id: 'claim-1',
      investigationId: 'inv-syndicate-1',
      category: 'WEBSITE',
      claimKind: 'FACT',
      researchDomain: 'FESTIVAL',
      statement: 'Festival claims official website active since 2018.',
      status: 'CORROBORATED',
      evidence: [],
    },
  ],
};

const mockStandaloneDossier: EvidenceDossier = {
  id: 'dossier-standalone-1',
  investigationId: 'inv-standalone-1',
  festivalName: 'Sundance Film Festival',
  reportSummary: 'Accredited Tier-1 festival with verified standalone governance.',
  officialDomain: 'sundance.org',
  corporateEntity: {
    legalName: 'Sundance Institute',
    registrationNumber: '501c3-87421',
    status: 'Active',
    registeredAddress: 'Park City, Utah, USA',
    associatedFestivals: [],
    connectedEntities: [],
    flags: [],
  },
  atomicClaims: [],
};

describe('SyndicateClusterGraph and Inspector Integration', () => {
  it('renders default Evidence Provenance tab and switches to Syndicate Cluster Map', () => {
    render(<EntityProvenanceGraph dossier={mockSyndicateDossier} />);

    // Check header buttons
    expect(screen.getByRole('button', { name: /Evidence Provenance/i })).toBeInTheDocument();
    const syndicateTabBtn = screen.getByRole('button', { name: /Syndicate Cluster Map/i });
    expect(syndicateTabBtn).toBeInTheDocument();

    // Click Syndicate Cluster Map tab
    fireEvent.click(syndicateTabBtn);

    // Header badge indicates syndicate detected
    expect(screen.getByText(/Syndicate & Maildrop Network Detected/i)).toBeInTheDocument();
  });

  it('renders full Syndicate architecture in Responsive In-Page Flow mode', () => {
    render(<EntityProvenanceGraph dossier={mockSyndicateDossier} />);

    // Switch to Syndicate tab
    fireEvent.click(screen.getByRole('button', { name: /Syndicate Cluster Map/i }));

    // Switch to In-Page Flow mode
    const flowToggleBtn = screen.getByRole('button', { name: /In-Page Flow/i });
    fireEvent.click(flowToggleBtn);

    // Status banner appears
    expect(
      screen.getByText(/High-Density Mailbox & Dissolved Shell Syndicate Detected/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/HIGH FORENSIC RISK/i)).toBeInTheDocument();

    // Grid cards appear
    expect(screen.getAllByText(/Virtual Mailbox Hub/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Pallino Media Lab Ltd/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Arthur Smith/i)).toBeInTheDocument();
    expect(screen.getByText(/London Indie Shorts Review/i)).toBeInTheDocument();
    expect(screen.getByText(/IndiePitch Consulting/i)).toBeInTheDocument();
  });

  it('opens SyndicateInspector when a network card is clicked', () => {
    render(<EntityProvenanceGraph dossier={mockSyndicateDossier} />);

    // Switch to Syndicate tab and In-Page Flow
    fireEvent.click(screen.getByRole('button', { name: /Syndicate Cluster Map/i }));
    fireEvent.click(screen.getByRole('button', { name: /In-Page Flow/i }));

    // Click the Virtual Mailbox Hub card (the first matching element)
    const mailboxCards = screen.getAllByText(/Virtual Mailbox Hub/i);
    fireEvent.click(mailboxCards[0]);

    // Inspector is mounted
    expect(screen.getByTestId('syndicate-inspector')).toBeInTheDocument();
    expect(screen.getByText(/RED FLAG \/ HIGH RISK/i)).toBeInTheDocument();
    expect(
      screen.getByText(/2,410\+ active and dissolved entities registered at exact same address/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Why Festival Syndicates Do This/i)).toBeInTheDocument();

    // Close button dismisses inspector
    const closeBtn = screen.getByRole('button', { name: /^Close$/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId('syndicate-inspector')).not.toBeInTheDocument();
  });

  it('renders verified clean standalone architecture for legitimate festivals', () => {
    render(<EntityProvenanceGraph dossier={mockStandaloneDossier} />);

    // Switch to Syndicate tab
    fireEvent.click(screen.getByRole('button', { name: /Syndicate Cluster Map/i }));

    // Switch to In-Page Flow
    fireEvent.click(screen.getByRole('button', { name: /In-Page Flow/i }));

    // Verified standalone banner appears
    expect(
      screen.getByText(/Verified Standalone Cultural Organization/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/AUTHENTIC STANDALONE/i)).toBeInTheDocument();
  });

  it('renders standalone SyndicateInspector standalone unit', () => {
    const testNodeData: SyndicateNodeData = {
      id: 'test-node',
      type: 'SHELL_ENTITY',
      label: 'Ghost Media Productions',
      sublabel: 'Co. #99887766 • Dissolved',
      status: 'RED_FLAG',
      registrationNumber: '99887766',
      address: '71-75 Shelton Street, London',
      summary: 'Shell entity dissolved 6 months ago.',
      signals: ['Dissolved entity active payment processor', 'No annual returns'],
      educationalContext: 'Protects organizers from chargebacks.',
    };

    render(<SyndicateInspector data={testNodeData} onClose={() => {}} />);

    expect(screen.getByText('Ghost Media Productions')).toBeInTheDocument();
    expect(screen.getByText(/Dissolved entity active payment processor/i)).toBeInTheDocument();
    expect(screen.getByText(/Protects organizers from chargebacks/i)).toBeInTheDocument();
  });
});
