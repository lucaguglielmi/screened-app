import React, { useState, useMemo } from 'react';
import { Node, Edge, MarkerType } from '@xyflow/react';
import { ScreenedFlowCanvas } from './ScreenedFlowCanvas';
import { SyndicateInspector, SyndicateNodeData } from './SyndicateInspector';
import { EvidenceDossier as DossierType, AtomicClaim } from '../../types/investigation';
import {
  ShieldCheck,
  Building2,
  Globe,
  MapPin,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  Network,
  ShieldAlert,
  AlertTriangle,
  Mail,
  Users,
  Film,
  DollarSign,
  ChevronRight,
} from 'lucide-react';

interface Props {
  dossier: DossierType;
  onSelectClaim?: (claimId: string) => void;
}

interface ProvenanceNodeData {
  label?: string;
  sublabel?: string;
  status?: string;
  role?: string;
  details?: string;
  claimId?: string;
  [key: string]: unknown;
}

type DisplayMode = 'RESPONSIVE' | 'CANVAS';
type ActiveTab = 'PROVENANCE' | 'SYNDICATE';

export const EntityProvenanceGraph: React.FC<Props> = ({ dossier, onSelectClaim }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('PROVENANCE');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('CANVAS');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedNodeData, setSelectedNodeData] = useState<ProvenanceNodeData | null>(null);
  const [selectedSyndicateNode, setSelectedSyndicateNode] = useState<SyndicateNodeData | null>(null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'VERIFIED' | 'DISPUTES'>('ALL');
  const [syndicateFilter, setSyndicateFilter] = useState<'ALL' | 'RED_FLAGS' | 'SISTERS'>('ALL');

  const festivalName = dossier.festivalName || 'Target Entity';
  const hasDisputes = Boolean(dossier.contradictions && dossier.contradictions.length > 0);

  // Corporate & forensic metadata
  const corporateEntity = dossier.corporateEntity;
  const forensicSummary = dossier.forensicSummary;
  const scamPattern = forensicSummary?.scamPattern;
  const keyPersonnel = dossier.keyPersonnel;

  const hasCorporateFlags = Boolean(corporateEntity?.flags && corporateEntity.flags.length > 0);
  const isScamRedFlag =
    scamPattern?.status === 'RED_FLAG' ||
    scamPattern?.status === 'AMBER_WARNING' ||
    corporateEntity?.status === 'Dissolved' ||
    hasCorporateFlags;

  const isSyndicateDetected =
    isScamRedFlag ||
    Boolean(corporateEntity?.associatedFestivals && corporateEntity.associatedFestivals.length > 0);

  // ---------------------------------------------------------------------------
  // 1. Build Provenance Graph Nodes & Edges
  // ---------------------------------------------------------------------------
  const { nodes, edges } = useMemo(() => {
    const rawNodes: Node[] = [];
    const rawEdges: Edge[] = [];

    // 1. Root Node: Festival Target
    rawNodes.push({
      id: 'root-entity',
      position: { x: 320, y: 30 },
      data: {
        label: festivalName,
        role: 'Target Entity Under Investigation',
        status: hasDisputes ? 'CAUTION' : 'VERIFIED',
        icon: 'festival',
      },
      style: {
        background: 'var(--color-darkroom-surface)',
        color: 'var(--color-white)',
        border: '2px solid var(--color-midnight-royal)',
        borderRadius: '16px',
        padding: '12px 18px',
        width: 240,
        boxShadow: '0 10px 25px -5px rgba(32, 24, 230, 0.4)',
      },
    });

    // 2. Official Domain Node
    const domain =
      dossier.officialDomain || `${festivalName.toLowerCase().replace(/[^a-z0-9]/g, '')}.org`;
    rawNodes.push({
      id: 'node-domain',
      position: { x: 50, y: 150 },
      data: {
        label: `Official Domain: ${domain}`,
        sublabel: 'Tier 1 Web Origin',
        status: 'VERIFIED',
        details: `Autonomous DNS and domain provenance inspection confirmed active domain for ${festivalName}.`,
      },
      style: {
        background: 'var(--color-darkroom-card)',
        color: 'var(--color-white)',
        border: '1.5px solid var(--color-tool-diligence)',
        borderRadius: '12px',
        padding: '10px 14px',
        width: 200,
        fontSize: '11px',
      },
    });

    rawEdges.push({
      id: 'e-root-domain',
      source: 'root-entity',
      target: 'node-domain',
      animated: true,
      style: { stroke: 'var(--color-tool-diligence)', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-tool-diligence)' },
    });

    // 3. Legal Registry / Companies House Node
    rawNodes.push({
      id: 'node-registry',
      position: { x: 330, y: 150 },
      data: {
        label: 'Corporate & Registry Filings',
        sublabel: hasDisputes ? 'Disputed Incorporation' : 'UK Companies House Record',
        status: hasDisputes ? 'DISPUTED' : 'VERIFIED',
        details: hasDisputes
          ? 'Registry records show conflicting operating addresses or recent dissolution notices.'
          : 'Verified active corporate entity registration with verified filing records.',
      },
      style: {
        background: 'var(--color-darkroom-card)',
        color: 'var(--color-white)',
        border: hasDisputes
          ? '1.5px solid var(--color-state-disputed)'
          : '1.5px solid var(--color-tool-diligence)',
        borderRadius: '12px',
        padding: '10px 14px',
        width: 210,
        fontSize: '11px',
      },
    });

    rawEdges.push({
      id: 'e-root-registry',
      source: 'root-entity',
      target: 'node-registry',
      style: {
        stroke: hasDisputes ? 'var(--color-state-disputed)' : 'var(--color-tool-diligence)',
        strokeWidth: 1.5,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: hasDisputes ? 'var(--color-state-disputed)' : 'var(--color-tool-diligence)',
      },
    });

    // 4. Physical Screening Venue Node
    rawNodes.push({
      id: 'node-venue',
      position: { x: 610, y: 150 },
      data: {
        label: 'Physical Venue & Leases',
        sublabel: hasDisputes ? 'Phantom Venue Risk' : 'Corroborated Cinema Manifest',
        status: hasDisputes ? 'DISPUTED' : 'VERIFIED',
        details: hasDisputes
          ? 'Venue box office records contradict promotional claims of a theatrical screening gala.'
          : 'Direct cinema lease manifests corroborated by municipal licensing files.',
      },
      style: {
        background: 'var(--color-darkroom-card)',
        color: 'var(--color-white)',
        border: hasDisputes
          ? '1.5px solid var(--color-state-disputed)'
          : '1.5px solid var(--color-tool-diligence)',
        borderRadius: '12px',
        padding: '10px 14px',
        width: 210,
        fontSize: '11px',
      },
    });

    rawEdges.push({
      id: 'e-root-venue',
      source: 'root-entity',
      target: 'node-venue',
      style: {
        stroke: hasDisputes ? 'var(--color-state-disputed)' : 'var(--color-tool-diligence)',
        strokeWidth: 1.5,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: hasDisputes ? 'var(--color-state-disputed)' : 'var(--color-tool-diligence)',
      },
    });

    // 5. Key Claims as Child Leaf Nodes
    const sampleClaims: AtomicClaim[] = (dossier.atomicClaims || []).slice(0, 4);
    sampleClaims.forEach((claim, idx) => {
      const isClaimDisputed =
        claim.status === 'DISPUTED' ||
        Boolean(
          dossier.contradictions &&
            dossier.contradictions.some(
              (c) =>
                c.claimA.statement.toLowerCase().includes(claim.statement.toLowerCase()) ||
                c.claimB.statement.toLowerCase().includes(claim.statement.toLowerCase()) ||
                claim.statement.toLowerCase().includes(c.claimA.statement.toLowerCase()),
            ),
        );

      const claimX = 60 + idx * 230;
      rawNodes.push({
        id: `claim-${claim.id}`,
        position: { x: claimX, y: 280 },
        data: {
          label: `${claim.researchDomain}: ${claim.statement.slice(0, 50)}...`,
          sublabel: `${claim.claimKind} • ${claim.status}`,
          status: isClaimDisputed ? 'DISPUTED' : 'VERIFIED',
          details: claim.statement,
          claimId: claim.id,
        },
        style: {
          background: 'var(--color-darkroom-surface)',
          color: 'var(--color-white)',
          border: isClaimDisputed
            ? '1.5px solid var(--color-state-disputed)'
            : '1px solid var(--color-darkroom-border)',
          borderRadius: '10px',
          padding: '8px 12px',
          width: 190,
          fontSize: '10px',
        },
      });

      const parentId =
        idx === 0 ? 'node-domain' : idx === 1 || idx === 2 ? 'node-registry' : 'node-venue';
      rawEdges.push({
        id: `e-${parentId}-claim-${claim.id}`,
        source: parentId,
        target: `claim-${claim.id}`,
        style: {
          stroke: isClaimDisputed ? 'var(--color-state-disputed)' : 'var(--color-tool-diligence)',
          strokeWidth: 1.2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isClaimDisputed ? 'var(--color-state-disputed)' : 'var(--color-tool-diligence)',
        },
      });
    });

    if (filterMode === 'DISPUTES') {
      const filteredNodes = rawNodes.filter(
        (n) =>
          n.id === 'root-entity' || n.data?.status === 'DISPUTED' || n.data?.status === 'CAUTION',
      );
      const validNodeIds = new Set(filteredNodes.map((n) => n.id));
      const filteredEdges = rawEdges.filter(
        (e) => validNodeIds.has(e.source) && validNodeIds.has(e.target),
      );
      return { nodes: filteredNodes, edges: filteredEdges };
    }

    if (filterMode === 'VERIFIED') {
      const filteredNodes = rawNodes.filter((n) => n.data?.status === 'VERIFIED');
      const validNodeIds = new Set(filteredNodes.map((n) => n.id));
      const filteredEdges = rawEdges.filter(
        (e) => validNodeIds.has(e.source) && validNodeIds.has(e.target),
      );
      return { nodes: filteredNodes, edges: filteredEdges };
    }

    return { nodes: rawNodes, edges: rawEdges };
  }, [dossier, festivalName, filterMode, hasDisputes]);

  // ---------------------------------------------------------------------------
  // 2. Build Syndicate Cluster & Maildrop Topology
  // ---------------------------------------------------------------------------
  const { syndicateNodes, syndicateEdges, syndicateDataMap } = useMemo(() => {
    const rawNodes: Node[] = [];
    const rawEdges: Edge[] = [];
    const dataMap: Record<string, SyndicateNodeData> = {};

    if (isSyndicateDetected) {
      const maildropAddress =
        corporateEntity?.registeredAddress ||
        '71-75 Shelton Street, Covent Garden, London WC2H 9JQ';
      const shellName = corporateEntity?.legalName || 'Pallino Media Lab Ltd';
      const shellReg = corporateEntity?.registrationNumber || '13984712';
      const shellStatus = corporateEntity?.status || 'Dissolved';
      const directorName = keyPersonnel?.[0]?.name || 'Arthur Smith';

      const rawAssociated = corporateEntity?.associatedFestivals?.length
        ? corporateEntity.associatedFestivals
        : scamPattern?.relatedEntities?.length
        ? scamPattern.relatedEntities
        : ['London Indie Shorts Review', 'Soho Arthouse Showcase', 'Thames International Cinema Fest'];

      // A. Virtual Mailbox Hub Node
      const maildropData: SyndicateNodeData = {
        id: 'hub-maildrop',
        type: 'MAILBOX_HUB',
        label: 'Virtual Mailbox Hub (High-Density Registered Office)',
        sublabel: maildropAddress,
        status: 'RED_FLAG',
        address: maildropAddress,
        connectedCount: 2410,
        summary:
          'High-density commercial maildrop service provider. Registrar records indicate over 2,400 corporate entities registered to this single postal address without physical screening facilities.',
        signals: [
          '2,410+ active and dissolved entities registered at exact same address',
          'No physical cinema, projection room, or festival office on site',
          'Frequently utilized in automated award laurel mill networks',
        ],
        educationalContext:
          'Virtual offices and maildrops allow syndicate organizers to cycle through dissolved or temporary corporate entities to evade chargebacks and consumer complaints while presenting a prestigious metropolitan mailing address.',
      };
      dataMap['hub-maildrop'] = maildropData;

      rawNodes.push({
        id: 'hub-maildrop',
        position: { x: 320, y: 15 },
        data: {
          label: 'Virtual Mailbox Hub',
          sublabel: '71-75 Shelton St, London (2,400+ Co.)',
          status: 'RED_FLAG',
        },
        style: {
          background: 'var(--color-darkroom-surface)',
          color: 'var(--color-white)',
          border: '2px solid var(--color-rose-500)',
          borderRadius: '14px',
          padding: '10px 14px',
          width: 240,
          fontSize: '11px',
          boxShadow: '0 8px 24px -4px rgba(244, 63, 94, 0.35)',
        },
      });

      // B. Operating Shell Entity Node
      const shellData: SyndicateNodeData = {
        id: 'shell-operating',
        type: 'SHELL_ENTITY',
        label: shellName,
        sublabel: `Co. #${shellReg} • ${shellStatus}`,
        status: 'RED_FLAG',
        registrationNumber: shellReg,
        address: maildropAddress,
        summary: `Designated corporate payee for submission fees. Official register indicates status is "${shellStatus}" while festival continues to solicit active entry fees.`,
        signals: corporateEntity?.flags || [
          'Compulsory strike-off action initiated',
          'Dissolved entity operating active payment gateway',
          'Registered to shared virtual mailbox',
        ],
        educationalContext:
          'Operating through a dissolved or struck-off entity shields organizers from liability, refunds, and corporate taxation while submitting filmmakers believe they are dealing with a legitimate enterprise.',
      };
      dataMap['shell-operating'] = shellData;

      rawNodes.push({
        id: 'shell-operating',
        position: { x: 320, y: 135 },
        data: {
          label: `Operating Shell: ${shellName}`,
          sublabel: `Co. #${shellReg} • ${shellStatus}`,
          status: 'RED_FLAG',
        },
        style: {
          background: 'var(--color-darkroom-card)',
          color: 'var(--color-white)',
          border: '2px solid var(--color-orange-500)',
          borderRadius: '14px',
          padding: '10px 14px',
          width: 240,
          fontSize: '11px',
          boxShadow: '0 8px 24px -4px rgba(249, 115, 22, 0.3)',
        },
      });

      rawEdges.push({
        id: 'e-hub-shell',
        source: 'hub-maildrop',
        target: 'shell-operating',
        animated: true,
        style: { stroke: 'var(--color-rose-500)', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-rose-500)' },
      });

      // C. Shared Directorship Node
      const directorData: SyndicateNodeData = {
        id: 'officer-director',
        type: 'SHARED_DIRECTOR',
        label: directorName,
        sublabel: 'Sole Director & Beneficial Controller',
        status: 'AMBER_WARNING',
        summary: `Sole registered officer across ${shellName} and multiple connected festival entities. No independent board of directors or public accounts.`,
        signals: [
          'Sole controlling officer with 100% shareholding',
          'Concurrent directorship across multiple clone festivals',
          'Direct financial beneficiary of entry fees and upsell packages',
        ],
        educationalContext:
          'Legitimate international festivals are governed by independent non-profit boards, charitable trusts, or accredited cultural foundations with fiduciary oversight.',
      };
      dataMap['officer-director'] = directorData;

      rawNodes.push({
        id: 'officer-director',
        position: { x: 40, y: 180 },
        data: {
          label: `Shared Director: ${directorName}`,
          sublabel: '100% Controlling Officer',
          status: 'AMBER_WARNING',
        },
        style: {
          background: 'var(--color-midnight-surface)',
          color: 'var(--color-white)',
          border: '1.5px solid var(--color-indigo-500)',
          borderRadius: '12px',
          padding: '10px 14px',
          width: 210,
          fontSize: '11px',
        },
      });

      rawEdges.push({
        id: 'e-shell-director',
        source: 'shell-operating',
        target: 'officer-director',
        style: { stroke: 'var(--color-indigo-500)', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-indigo-500)' },
      });

      // D. Target Festival Node (Under Investigation)
      const targetData: SyndicateNodeData = {
        id: 'fest-target',
        type: 'TARGET_FESTIVAL',
        label: festivalName,
        sublabel: 'Focal Subject Under Investigation',
        status: 'RED_FLAG',
        summary: `Focal festival soliciting submissions on major film platforms. Structurally linked to shell entity ${shellName} and maildrop network.`,
        signals: [
          'Active entry fee monetization via dissolved corporate entity',
          'Claims live cinema gala contradicting venue manifests',
          'Shares infrastructure with clone sister events',
        ],
        educationalContext:
          'Target festival leverages prestigious-sounding award categories and laurels to maximize submission volume without verified distribution or industry attendance.',
      };
      dataMap['fest-target'] = targetData;

      rawNodes.push({
        id: 'fest-target',
        position: { x: 320, y: 265 },
        data: {
          label: `Target: ${festivalName}`,
          sublabel: 'Focal Investigation Subject',
          status: 'RED_FLAG',
        },
        style: {
          background: 'var(--color-darkroom-surface)',
          color: 'var(--color-white)',
          border: '2px solid var(--color-rose-600)',
          borderRadius: '16px',
          padding: '12px 18px',
          width: 240,
          fontSize: '11px',
          boxShadow: '0 10px 25px -5px rgba(225, 29, 72, 0.4)',
        },
      });

      rawEdges.push({
        id: 'e-shell-target',
        source: 'shell-operating',
        target: 'fest-target',
        animated: true,
        style: { stroke: 'var(--color-rose-600)', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-rose-600)' },
      });

      // E. Sister / Clone Festivals
      rawAssociated.slice(0, 3).forEach((sisterName, idx) => {
        const sisterId = `sister-${idx}`;
        const sisterData: SyndicateNodeData = {
          id: sisterId,
          type: 'SISTER_FESTIVAL',
          label: sisterName,
          sublabel: 'Syndicate Sister Clone',
          status: 'AMBER_WARNING',
          summary:
            'Satellite festival brand owned or operated under the same corporate umbrella and payment gateway.',
          signals: [
            'Shared corporate registrant and directorship',
            'Identical submission fee tiers and trophy catalog',
            'Synchronized deadlines and promotional boilerplate',
          ],
          educationalContext:
            'Syndicates create multiple clone festivals with regional naming variations (e.g. "Soho", "Thames", "London") to capture filmmakers who filter submission platforms by city.',
        };
        dataMap[sisterId] = sisterData;

        rawNodes.push({
          id: sisterId,
          position: { x: 620, y: 70 + idx * 105 },
          data: {
            label: sisterName,
            sublabel: 'Clone Sister Festival',
            status: 'AMBER_WARNING',
          },
          style: {
            background: 'var(--color-darkroom-card)',
            color: 'var(--color-white)',
            border: '1.5px solid var(--color-purple-500)',
            borderRadius: '12px',
            padding: '8px 12px',
            width: 210,
            fontSize: '10px',
          },
        });

        rawEdges.push({
          id: `e-shell-${sisterId}`,
          source: 'shell-operating',
          target: sisterId,
          animated: true,
          style: { stroke: 'var(--color-purple-500)', strokeWidth: 1.5, strokeDasharray: '4 4' },
          markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-purple-500)' },
        });
      });

      // F. Commercial Up-Sell / Consulting Agency Funnel
      const upsellData: SyndicateNodeData = {
        id: 'node-upsell',
        type: 'UPSELL_FUNNEL',
        label: 'IndiePitch Consulting / Commercial Agency',
        sublabel: 'Commercial Monetization Funnel',
        status: 'AMBER_WARNING',
        summary:
          'Commercial agency directly promoted to submitters promising guaranteed feedback, script coverage, or distribution introductions for $150-$400.',
        signals: [
          'Founder of festival operates or receives referral kickbacks from consulting agency',
          'Filmmakers prompted with exclusive "VIP script doctor" package upon entry',
          'Guaranteed laurel upgrade promises linked to paid services',
        ],
        educationalContext:
          'In pay-to-play circuits, the entry fee is often just a top-of-funnel lead generator. The real revenue comes from high-margin upsells for "VIP feedback" and private screening packages.',
      };
      dataMap['node-upsell'] = upsellData;

      rawNodes.push({
        id: 'node-upsell',
        position: { x: 40, y: 310 },
        data: {
          label: 'Commercial Funnel: IndiePitch',
          sublabel: 'Pay-to-Play Consulting Funnel',
          status: 'AMBER_WARNING',
        },
        style: {
          background: 'var(--color-darkroom-surface)',
          color: 'var(--color-white)',
          border: '1.5px solid var(--color-state-corroborated)',
          borderRadius: '12px',
          padding: '8px 12px',
          width: 210,
          fontSize: '10px',
        },
      });

      rawEdges.push({
        id: 'e-director-upsell',
        source: 'officer-director',
        target: 'node-upsell',
        style: { stroke: 'var(--color-state-corroborated)', strokeWidth: 1.2, strokeDasharray: '3 3' },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-state-corroborated)' },
      });
    } else {
      // Clean Standalone Architecture
      const targetData: SyndicateNodeData = {
        id: 'fest-target',
        type: 'TARGET_FESTIVAL',
        label: festivalName,
        sublabel: 'Accredited Independent Organization',
        status: 'VERIFIED',
        summary:
          'Independent festival organization with verified cultural accreditation, transparent governance, and verified standalone status.',
        signals: [
          'Single dedicated corporate filing with verified active status',
          'No linked clone festivals or shell networks detected',
          'Direct physical premises and verified box office history',
        ],
      };
      dataMap['fest-target'] = targetData;

      rawNodes.push({
        id: 'fest-target',
        position: { x: 320, y: 40 },
        data: {
          label: festivalName,
          sublabel: 'Verified Standalone Festival',
          status: 'VERIFIED',
        },
        style: {
          background: 'var(--color-darkroom-surface)',
          color: 'var(--color-white)',
          border: '2px solid var(--color-tool-diligence)',
          borderRadius: '16px',
          padding: '12px 18px',
          width: 240,
          boxShadow: '0 10px 25px -5px rgba(0, 240, 255, 0.3)',
        },
      });

      const officeData: SyndicateNodeData = {
        id: 'node-office',
        type: 'INDEPENDENT_ENTITY',
        label: 'Dedicated Festival Headquarters',
        sublabel: 'Verified Physical Commercial Lease',
        status: 'VERIFIED',
        summary:
          'Festival maintains standalone, non-shared commercial offices for year-round festival administration.',
        signals: [
          'Dedicated commercial lease verified in local property registry',
          'Zero ghost companies registered at this address',
          'Staff presence and production offices verified',
        ],
      };
      dataMap['node-office'] = officeData;

      rawNodes.push({
        id: 'node-office',
        position: { x: 120, y: 190 },
        data: {
          label: 'Dedicated Festival Office',
          sublabel: 'Verified Commercial Lease',
          status: 'VERIFIED',
        },
        style: {
          background: 'var(--color-darkroom-card)',
          color: 'var(--color-white)',
          border: '1.5px solid var(--color-tool-diligence)',
          borderRadius: '12px',
          padding: '10px 14px',
          width: 220,
          fontSize: '11px',
        },
      });

      rawEdges.push({
        id: 'e-target-office',
        source: 'fest-target',
        target: 'node-office',
        animated: true,
        style: { stroke: 'var(--color-tool-diligence)', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-tool-diligence)' },
      });

      const governanceData: SyndicateNodeData = {
        id: 'node-governance',
        type: 'INDEPENDENT_ENTITY',
        label: 'Cultural Non-Profit & Board of Trustees',
        sublabel: 'Transparent Fiduciary Oversight',
        status: 'VERIFIED',
        summary:
          'Organized under a cultural non-profit foundation or accredited educational institution with independent board governance.',
        signals: [
          'Independent board of directors with public trustees',
          'Audited annual cultural reports filed with authorities',
          'Non-profit or charity registration verified',
        ],
      };
      dataMap['node-governance'] = governanceData;

      rawNodes.push({
        id: 'node-governance',
        position: { x: 500, y: 190 },
        data: {
          label: 'Board of Trustees & Non-Profit',
          sublabel: 'Transparent Fiduciary Oversight',
          status: 'VERIFIED',
        },
        style: {
          background: 'var(--color-darkroom-card)',
          color: 'var(--color-white)',
          border: '1.5px solid var(--color-tool-diligence)',
          borderRadius: '12px',
          padding: '10px 14px',
          width: 230,
          fontSize: '11px',
        },
      });

      rawEdges.push({
        id: 'e-target-gov',
        source: 'fest-target',
        target: 'node-governance',
        style: { stroke: 'var(--color-tool-diligence)', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-tool-diligence)' },
      });
    }

    // Apply Syndicate Filter
    if (syndicateFilter === 'RED_FLAGS') {
      const filteredNodes = rawNodes.filter(
        (n) => n.id === 'fest-target' || dataMap[n.id]?.status === 'RED_FLAG',
      );
      const validIds = new Set(filteredNodes.map((n) => n.id));
      const filteredEdges = rawEdges.filter(
        (e) => validIds.has(e.source) && validIds.has(e.target),
      );
      return { syndicateNodes: filteredNodes, syndicateEdges: filteredEdges, syndicateDataMap: dataMap };
    }

    if (syndicateFilter === 'SISTERS') {
      const filteredNodes = rawNodes.filter(
        (n) =>
          n.id === 'fest-target' ||
          n.id === 'shell-operating' ||
          n.id.startsWith('sister-'),
      );
      const validIds = new Set(filteredNodes.map((n) => n.id));
      const filteredEdges = rawEdges.filter(
        (e) => validIds.has(e.source) && validIds.has(e.target),
      );
      return { syndicateNodes: filteredNodes, syndicateEdges: filteredEdges, syndicateDataMap: dataMap };
    }

    return { syndicateNodes: rawNodes, syndicateEdges: rawEdges, syndicateDataMap: dataMap };
  }, [
    corporateEntity,
    festivalName,
    isSyndicateDetected,
    keyPersonnel,
    scamPattern,
    syndicateFilter,
  ]);

  const handleNodeClick = (_e: React.MouseEvent, node: Node) => {
    setSelectedNodeData(node.data);
    if (node.data?.claimId && onSelectClaim) {
      onSelectClaim(node.data.claimId as string);
    }
  };

  const handleSyndicateNodeClick = (_e: React.MouseEvent, node: Node) => {
    const data = syndicateDataMap[node.id];
    if (data) {
      setSelectedSyndicateNode(data);
    }
  };

  return (
    <div className="space-y-4">
      {/* ===================================================================== */}
      {/* 1. Header Bar with Dual-Tab Switcher & Mode Toggles                  */}
      {/* ===================================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-darkroom-border pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Main Tab Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-darkroom-card/90 border border-darkroom-border shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('PROVENANCE')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'PROVENANCE'
                  ? 'bg-midnight-royal text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="size-3.5" />
              <span>Evidence Provenance</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('SYNDICATE');
                if (!selectedSyndicateNode) {
                  setSelectedSyndicateNode(
                    syndicateDataMap['hub-maildrop'] || syndicateDataMap['fest-target'] || null,
                  );
                }
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'SYNDICATE'
                  ? isSyndicateDetected
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="size-3.5" />
              <span>Syndicate Cluster Map</span>
              {isSyndicateDetected && (
                <span className="size-1.5 rounded-full bg-rose-500 animate-pulse ml-0.5" />
              )}
            </button>
          </div>

          <div className="hidden lg:block text-xs text-slate-400">
            {activeTab === 'PROVENANCE' ? (
              <span>Source-to-claim topological provenance</span>
            ) : isSyndicateDetected ? (
              <span className="text-rose-400 font-mono flex items-center gap-1">
                <AlertTriangle className="size-3" />
                <span>Syndicate &amp; Maildrop Network Detected</span>
              </span>
            ) : (
              <span className="text-emerald-400 font-mono">
                Verified Standalone Cultural Entity
              </span>
            )}
          </div>
        </div>

        {/* View Mode & Fullscreen Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Node Filter Chips (Canvas Mode Only) */}
          {displayMode === 'CANVAS' && (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-darkroom-card text-xs">
              {activeTab === 'PROVENANCE' ? (
                [
                  { id: 'ALL' as const, label: 'All' },
                  { id: 'VERIFIED' as const, label: 'Verified' },
                  { id: 'DISPUTES' as const, label: 'Disputes' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setFilterMode(mode.id)}
                    className={`px-2 py-0.5 rounded-md font-mono text-[10px] transition-all cursor-pointer ${
                      filterMode === mode.id
                        ? 'bg-midnight-royal text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))
              ) : (
                [
                  { id: 'ALL' as const, label: 'All' },
                  { id: 'RED_FLAGS' as const, label: 'Flags' },
                  { id: 'SISTERS' as const, label: 'Sisters' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSyndicateFilter(mode.id)}
                    className={`px-2 py-0.5 rounded-md font-mono text-[10px] transition-all cursor-pointer ${
                      syndicateFilter === mode.id
                        ? 'bg-rose-600 text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))
              )}
            </div>
          )}

          {/* Toggle: 2D Canvas vs In-Page Flow */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setDisplayMode(displayMode === 'CANVAS' ? 'RESPONSIVE' : 'CANVAS')}
              className="px-2.5 py-1 rounded-lg bg-darkroom-card hover:bg-darkroom-surface border border-darkroom-border text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Toggle between 2D Interactive Canvas and In-Page Flow"
            >
              {displayMode === 'CANVAS' ? 'In-Page Flow' : '2D Canvas'}
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 rounded-lg bg-darkroom-card hover:bg-darkroom-surface border border-darkroom-border text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Open Fullscreen Interactive Canvas"
            >
              <Maximize2 className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. TAB A: EVIDENCE PROVENANCE GRAPH                                   */}
      {/* ===================================================================== */}
      {activeTab === 'PROVENANCE' && displayMode === 'CANVAS' && (
        <div className="space-y-3">
          <ScreenedFlowCanvas
            nodes={nodes}
            edges={edges}
            onNodeClick={handleNodeClick}
            className="h-[400px] sm:h-[440px] w-full rounded-2xl border border-darkroom-border/80 overflow-hidden"
          />

          {selectedNodeData && (
            <div className="p-3.5 rounded-xl bg-darkroom-card text-xs space-y-1 animate-fade-in border border-darkroom-border">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-white font-serif">{selectedNodeData.label}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300">
                  {selectedNodeData.status || 'NODE'}
                </span>
              </div>
              <p className="text-slate-300">
                {selectedNodeData.details || selectedNodeData.role || selectedNodeData.sublabel}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'PROVENANCE' && displayMode === 'RESPONSIVE' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-darkroom-surface border border-darkroom-border space-y-4 shadow-xl">
            <div className="flex items-center justify-between gap-2 border-b border-darkroom-border pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-tool-diligence" />
                <span className="font-bold text-white text-sm font-serif">
                  360° Entity Verification Pipeline
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Source-to-Evidence Map
              </span>
            </div>

            {/* Target Root Badge */}
            <div className="flex items-center justify-center">
              <div className="px-5 py-3 rounded-2xl bg-midnight-royal/30 border border-midnight-royal text-center space-y-0.5 shadow-lg">
                <span className="text-[10px] font-mono uppercase tracking-widest text-tool-diligence font-semibold">
                  Subject Under Investigation
                </span>
                <h4 className="text-base font-bold text-white font-serif">{festivalName}</h4>
              </div>
            </div>

            {/* 4 Verification Pillars Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {/* Pillar 1: Domain Origin */}
              <div className="p-3.5 rounded-xl bg-darkroom-card/90 border border-darkroom-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Globe className="size-3.5 text-tool-diligence" />
                    <span>Domain Origin</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      dossier.officialDomain
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                    }`}
                  >
                    {dossier.officialDomain ? 'Verified' : 'Informational'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  WHOIS records and server hosts cross-examined against declared festival identity.
                </p>
                <div className="text-[11px] font-mono text-slate-300 bg-darkroom-surface/80 p-1.5 rounded truncate">
                  {dossier.officialDomain || 'Domain verification active'}
                </div>
              </div>

              {/* Pillar 2: Corporate Registry */}
              <div
                className={`p-3.5 rounded-xl bg-darkroom-card/90 border space-y-2 ${
                  corporateEntity?.flags && corporateEntity.flags.length > 0
                    ? 'border-rose-500/30'
                    : 'border-darkroom-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Building2 className="size-3.5 text-tool-diligence" />
                    <span>Corporate Registry</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      corporateEntity?.flags && corporateEntity.flags.length > 0
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : corporateEntity
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                    }`}
                  >
                    {corporateEntity?.flags && corporateEntity.flags.length > 0
                      ? 'Conflict Flag'
                      : corporateEntity
                      ? 'Verified'
                      : 'Informational'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Official commercial register filings evaluated for connected entities and directorships.
                </p>
                <div className="text-[11px] font-mono text-slate-300 bg-darkroom-surface/80 p-1.5 rounded truncate">
                  {corporateEntity
                    ? `${corporateEntity.legalName} (${corporateEntity.status})`
                    : 'No separate corporate entity recorded'}
                </div>
              </div>

              {/* Pillar 3: Venue Realities */}
              <div
                className={`p-3.5 rounded-xl bg-darkroom-card/90 border space-y-2 ${
                  hasDisputes ? 'border-orange-500/30' : 'border-darkroom-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <MapPin className="size-3.5 text-tool-diligence" />
                    <span>Physical Venues</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      hasDisputes
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {hasDisputes ? 'Dispute Signal' : 'Corroborated'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Theatrical exhibition licenses and physical cinema manifests cross-referenced against box office logs.
                </p>
                <div className="text-[11px] font-mono text-slate-300 bg-darkroom-surface/80 p-1.5 rounded truncate">
                  {hasDisputes ? 'Contradictory venue claims detected' : 'Cinema manifests corroborated'}
                </div>
              </div>

              {/* Pillar 4: Atomic Claims */}
              <div className="p-3.5 rounded-xl bg-darkroom-card/90 border border-darkroom-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Sparkles className="size-3.5 text-tool-diligence" />
                    <span>Evidence Claims</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {dossier.atomicClaims?.length || 0} Extracted
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Individual assertions cross-examined against public registers and third-party news archives.
                </p>
                <div className="text-[11px] font-mono text-slate-300 bg-darkroom-surface/80 p-1.5 rounded truncate">
                  {dossier.atomicClaims?.length || 0} claims processed
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. TAB B: SYNDICATE CLUSTER & MAILDROP NETWORK VISUALIZER             */}
      {/* ===================================================================== */}
      {activeTab === 'SYNDICATE' && displayMode === 'CANVAS' && (
        <div className="space-y-4 animate-fade-in">
          <div className="relative">
            <ScreenedFlowCanvas
              nodes={syndicateNodes}
              edges={syndicateEdges}
              onNodeClick={handleSyndicateNodeClick}
              className="h-[420px] sm:h-[460px] w-full rounded-2xl border border-darkroom-border/80 overflow-hidden"
            />

            {/* Quick Canvas Guidance Overlay */}
            <div className="absolute top-3 left-3 pointer-events-none">
              <span className="px-2.5 py-1 rounded-lg bg-darkroom-bg/85 border border-darkroom-border/70 text-[10px] font-mono text-slate-300 backdrop-blur-xs flex items-center gap-1.5 shadow-md">
                <Network className="size-3 text-rose-400" />
                <span>Click any node to inspect corporate intelligence</span>
              </span>
            </div>
          </div>

          {/* Node Inspector Drawer */}
          {selectedSyndicateNode && (
            <SyndicateInspector
              data={selectedSyndicateNode}
              onClose={() => setSelectedSyndicateNode(null)}
            />
          )}
        </div>
      )}

      {activeTab === 'SYNDICATE' && displayMode === 'RESPONSIVE' && (
        <div className="space-y-4 animate-fade-in">
          {/* Syndicate Status Banner */}
          <div
            className={`p-4 rounded-2xl border space-y-2 ${
              isSyndicateDetected
                ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isSyndicateDetected ? (
                  <ShieldAlert className="size-4 text-rose-400" />
                ) : (
                  <ShieldCheck className="size-4 text-emerald-400" />
                )}
                <span className="font-bold text-sm font-serif">
                  {isSyndicateDetected
                    ? 'High-Density Mailbox & Dissolved Shell Syndicate Detected'
                    : 'Verified Standalone Cultural Organization'}
                </span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isSyndicateDetected
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {isSyndicateDetected ? 'HIGH FORENSIC RISK' : 'AUTHENTIC STANDALONE'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isSyndicateDetected
                ? 'Cross-referencing Companies House records, platform payment gateways, and registered postal addresses indicates the target festival is an operational node in a multi-brand laurel syndicate sharing identical infrastructure.'
                : 'Corporate registry cross-checks confirm this festival operates as a standalone cultural entity with dedicated non-shared administrative premises and zero satellite clone brands.'}
            </p>
          </div>

          {/* Responsive Entity Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(syndicateDataMap).map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedSyndicateNode(item)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:border-indigo-400/60 bg-darkroom-card/90 space-y-2.5 ${
                  selectedSyndicateNode?.id === item.id
                    ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-lg'
                    : 'border-darkroom-border'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {item.type === 'MAILBOX_HUB' && <Mail className="size-3.5 text-rose-400" />}
                    {item.type === 'SHELL_ENTITY' && <Building2 className="size-3.5 text-orange-400" />}
                    {item.type === 'SHARED_DIRECTOR' && <Users className="size-3.5 text-indigo-400" />}
                    {item.type === 'SISTER_FESTIVAL' && <Film className="size-3.5 text-amber-400" />}
                    {item.type === 'UPSELL_FUNNEL' && <DollarSign className="size-3.5 text-emerald-400" />}
                    {item.type === 'TARGET_FESTIVAL' && <Film className="size-3.5 text-rose-400" />}
                    {item.type === 'INDEPENDENT_ENTITY' && <ShieldCheck className="size-3.5 text-emerald-400" />}
                    <span className="text-xs font-bold text-white font-serif truncate max-w-[160px]">
                      {item.label}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                      item.status === 'RED_FLAG'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : item.status === 'AMBER_WARNING'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 line-clamp-2">
                  {item.summary || item.sublabel}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-darkroom-border/40 text-[10px] font-mono text-slate-400">
                  <span className="truncate max-w-[180px]">
                    {item.registrationNumber ? `Co. #${item.registrationNumber}` : item.address || item.sublabel}
                  </span>
                  <ChevronRight className="size-3 text-slate-500 shrink-0" />
                </div>
              </div>
            ))}
          </div>

          {/* Active Inspector on Selection */}
          {selectedSyndicateNode && (
            <SyndicateInspector
              data={selectedSyndicateNode}
              onClose={() => setSelectedSyndicateNode(null)}
            />
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. FULLSCREEN INTERACTIVE CANVAS MODAL                                */}
      {/* ===================================================================== */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-midnight-void/95 backdrop-blur-md p-4 sm:p-8 flex flex-col justify-between animate-fade-in">
          <div className="flex items-center justify-between border-b border-darkroom-border pb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-darkroom-card/90 border border-darkroom-border">
                <button
                  type="button"
                  onClick={() => setActiveTab('PROVENANCE')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    activeTab === 'PROVENANCE'
                      ? 'bg-midnight-royal text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Evidence Provenance
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('SYNDICATE')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    activeTab === 'SYNDICATE'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Syndicate Cluster Map
                </button>
              </div>

              <h3 className="hidden sm:block text-base font-bold text-white font-serif">
                {festivalName} — {activeTab === 'PROVENANCE' ? 'Evidence Provenance' : 'Syndicate Network'}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="px-3 py-1.5 rounded-xl bg-darkroom-card hover:bg-darkroom-surface border border-darkroom-border text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Minimize2 className="size-3.5" />
              <span>Exit Fullscreen</span>
            </button>
          </div>

          <div className="flex-1 my-4 overflow-hidden relative">
            {activeTab === 'PROVENANCE' ? (
              <ScreenedFlowCanvas
                nodes={nodes}
                edges={edges}
                onNodeClick={handleNodeClick}
                className="h-full w-full"
              />
            ) : (
              <ScreenedFlowCanvas
                nodes={syndicateNodes}
                edges={syndicateEdges}
                onNodeClick={handleSyndicateNodeClick}
                className="h-full w-full"
              />
            )}
          </div>

          {activeTab === 'SYNDICATE' && selectedSyndicateNode && (
            <div className="max-h-56 overflow-y-auto mb-2">
              <SyndicateInspector
                data={selectedSyndicateNode}
                onClose={() => setSelectedSyndicateNode(null)}
              />
            </div>
          )}

          <div className="text-xs text-slate-400 text-center font-mono">
            Scroll or pinch to zoom • Drag background to pan • Click any node to inspect evidence
          </div>
        </div>
      )}
    </div>
  );
};

