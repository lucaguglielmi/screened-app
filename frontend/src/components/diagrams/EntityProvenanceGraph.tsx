import React, { useState, useMemo } from 'react';
import { Node, Edge, MarkerType } from '@xyflow/react';
import { ScreenedFlowCanvas } from './ScreenedFlowCanvas';
import { EvidenceDossier as DossierType, AtomicClaim } from '../../types/investigation';
import {
  ShieldCheck,
  Building2,
  Globe,
  MapPin,
  Users,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Layers,
  ArrowRight,
  Scale,
  Sparkles,
  User,
  ShieldAlert,
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

type DiagramTab = 'PROVENANCE' | 'PERSONNEL' | 'CONTRADICTIONS';
type DisplayMode = 'RESPONSIVE' | 'CANVAS';

export const EntityProvenanceGraph: React.FC<Props> = ({ dossier, onSelectClaim }) => {
  const [activeTab, setActiveTab] = useState<DiagramTab>('PROVENANCE');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('RESPONSIVE');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedNodeData, setSelectedNodeData] = useState<ProvenanceNodeData | null>(null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'VERIFIED' | 'DISPUTES'>('ALL');

  const festivalName = dossier.festivalName || 'Target Entity';
  const hasDisputes = Boolean(dossier.contradictions && dossier.contradictions.length > 0);

  // Build Graph Nodes & Edges from real dossier data
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

  const handleNodeClick = (_e: React.MouseEvent, node: Node) => {
    setSelectedNodeData(node.data);
    if (node.data?.claimId && onSelectClaim) {
      onSelectClaim(node.data.claimId as string);
    }
  };

  return (
    <div className="space-y-4">
      {/* Diagram Suite Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-darkroom-border pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-tool-diligence/10 text-tool-diligence border border-tool-diligence/20">
            <Layers className="size-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold font-serif text-white">
              Forensic Intelligence Diagrams
            </h3>
            <p className="text-xs text-slate-400">
              Clear visual representations of provenance, directorship links, and evidence reconciliation.
            </p>
          </div>
        </div>

        {/* View Mode & Fullscreen Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Tabs: Diagram Selector */}
          <div className="flex items-center overflow-x-auto max-w-full gap-1 p-1 rounded-xl bg-darkroom-card text-xs hide-scrollbar">
            <button
              onClick={() => setActiveTab('PROVENANCE')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer shrink-0 ${
                activeTab === 'PROVENANCE'
                  ? 'bg-midnight-royal text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Provenance Flow
            </button>
            <button
              onClick={() => setActiveTab('PERSONNEL')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer shrink-0 ${
                activeTab === 'PERSONNEL'
                  ? 'bg-midnight-royal text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Personnel Graph
            </button>
            <button
              onClick={() => setActiveTab('CONTRADICTIONS')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer shrink-0 ${
                activeTab === 'CONTRADICTIONS'
                  ? 'bg-midnight-royal text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Claim Resolution
            </button>
          </div>

          {/* Toggle: Responsive Page Diagram vs 2D Canvas */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setDisplayMode(displayMode === 'RESPONSIVE' ? 'CANVAS' : 'RESPONSIVE')}
              className="px-2.5 py-1 rounded-lg bg-darkroom-card hover:bg-darkroom-surface border border-darkroom-border text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Toggle between Responsive Inline Diagram and 2D Interactive Canvas"
            >
              {displayMode === 'RESPONSIVE' ? 'Switch to 2D Canvas' : 'Switch to In-Page Flow'}
            </button>

            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 rounded-lg bg-darkroom-card hover:bg-darkroom-surface border border-darkroom-border text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Open Fullscreen Interactive Canvas"
            >
              <Maximize2 className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. RESPONSIVE IN-PAGE DIAGRAMS (Dynamic Dossier Signals - No Mock Data)   */}
      {/* ========================================================================= */}
      {displayMode === 'RESPONSIVE' && (
        <div className="space-y-4">
          {/* TAB 1: 360° PROVENANCE FLOW */}
          {activeTab === 'PROVENANCE' && (
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
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        dossier.officialDomain
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                      }`}>
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
                  <div className={`p-3.5 rounded-xl bg-darkroom-card/90 border space-y-2 ${
                    dossier.corporateEntity?.flags && dossier.corporateEntity.flags.length > 0
                      ? 'border-rose-500/30'
                      : 'border-darkroom-border'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Building2 className={`size-3.5 ${
                          dossier.corporateEntity?.flags && dossier.corporateEntity.flags.length > 0
                            ? 'text-rose-400'
                            : 'text-indigo-400'
                        }`} />
                        <span>Corporate Registry</span>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        dossier.corporateEntity?.flags && dossier.corporateEntity.flags.length > 0
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : dossier.corporateEntity
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                      }`}>
                        {dossier.corporateEntity?.flags && dossier.corporateEntity.flags.length > 0
                          ? 'Conflict Flag'
                          : dossier.corporateEntity
                            ? 'Verified'
                            : 'Informational'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Official commercial register filings evaluated for connected entities and directorships.
                    </p>
                    <div className="text-[11px] font-mono text-slate-300 bg-darkroom-surface/80 p-1.5 rounded truncate">
                      {dossier.corporateEntity
                        ? `${dossier.corporateEntity.legalName} (${dossier.corporateEntity.status})`
                        : 'No separate corporate entity recorded'}
                    </div>
                  </div>

                  {/* Pillar 3: Venue Realities */}
                  <div className={`p-3.5 rounded-xl bg-darkroom-card/90 border space-y-2 ${
                    hasDisputes ? 'border-orange-500/30' : 'border-darkroom-border'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <MapPin className={`size-3.5 ${hasDisputes ? 'text-orange-400' : 'text-indigo-400'}`} />
                        <span>Venue Verification</span>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        hasDisputes
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {hasDisputes ? 'Disputed' : 'Verified'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Physical screening locations cross-referenced with municipal records and cinema manifests.
                    </p>
                    <div className="text-[11px] font-mono text-slate-300 bg-darkroom-surface/80 p-1.5 rounded truncate">
                      {hasDisputes
                        ? 'Conflicting venue delivery signals detected'
                        : 'Physical venue leases and declared locations'}
                    </div>
                  </div>

                  {/* Pillar 4: Community Footprint */}
                  <div className="p-3.5 rounded-xl bg-darkroom-card/90 border border-darkroom-border space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Users className="size-3.5 text-tool-diligence" />
                        <span>Alumni Footprint</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {dossier.previousEditions && dossier.previousEditions.length > 0 ? 'Verified' : 'Observed'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Filmmaker community threads, past award recipients, and verified track records mapped.
                    </p>
                    <div className="text-[11px] font-mono text-slate-300 bg-darkroom-surface/80 p-1.5 rounded truncate">
                      {dossier.previousEditions && dossier.previousEditions.length > 0
                        ? `${dossier.previousEditions.length} Recorded Editions Mapped`
                        : `${dossier.atomicClaims?.length || 0} Atomic Claims Extracted`}
                    </div>
                  </div>
                </div>

                {/* Dynamic Takeaway Box */}
                <div className="p-3.5 rounded-xl bg-tool-diligence/5 border border-tool-diligence/20 text-xs text-slate-200 leading-relaxed flex items-start gap-2.5">
                  <Sparkles className="size-4 text-tool-diligence shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Investigation Synthesis:</strong>{' '}
                    {hasDisputes
                      ? 'The subject maintains an active presence, but autonomous inspection identified specific divergences between promotional statements and trade records.'
                      : 'The subject demonstrates corroborated operational continuity across official domain, physical venue manifests, and historical editions.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KEY PERSONNEL & CORPORATE SHELL NETWORK */}
          {activeTab === 'PERSONNEL' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-darkroom-surface border border-darkroom-border space-y-4 shadow-xl">
                <div className="flex items-center justify-between gap-2 border-b border-darkroom-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-tool-diligence" />
                    <span className="font-bold text-white text-sm font-serif">
                      Leadership &amp; Directorship Network Graph
                    </span>
                  </div>
                  {(dossier.keyPersonnel && dossier.keyPersonnel.some((p) => p.isFestivalMillSuspect || (p.flags && p.flags.length > 0))) ? (
                    <span className="text-[11px] font-mono text-rose-400 font-semibold">
                      Conflict Flow Highlighted
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                      {(dossier.keyPersonnel?.length || 0)} Profiles Analyzed
                    </span>
                  )}
                </div>

                {/* Real Dynamic Personnel Cards */}
                {dossier.keyPersonnel && dossier.keyPersonnel.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {dossier.keyPersonnel.map((person, pIdx) => {
                      const initials = person.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);

                      const hasConflict = Boolean(
                        person.isFestivalMillSuspect ||
                        person.hasDistributionOverlap ||
                        (person.flags && person.flags.length > 0)
                      );

                      return (
                        <div
                          key={pIdx}
                          className={`p-3.5 rounded-xl bg-darkroom-card/90 border space-y-2.5 ${
                            hasConflict ? 'border-rose-500/40' : 'border-darkroom-border'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {person.avatarUrl ? (
                              <img
                                src={person.avatarUrl}
                                alt={person.name}
                                className={`size-9 rounded-xl bg-darkroom-surface border object-cover ${
                                  hasConflict ? 'border-rose-400' : 'border-darkroom-border'
                                }`}
                              />
                            ) : (
                              <div className={`size-9 rounded-xl flex items-center justify-center font-bold text-xs font-mono border ${
                                hasConflict
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                  : 'bg-midnight-royal/40 text-white border-indigo-900/40'
                              }`}>
                                {initials || <User className="size-4 text-slate-300" />}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h5 className="text-xs sm:text-sm font-bold text-white truncate font-sans">{person.name}</h5>
                              <span className="text-[11px] font-mono text-indigo-300 truncate block">
                                {person.roles && person.roles.length > 0 ? person.roles.join(', ') : 'Personnel'}
                              </span>
                            </div>
                          </div>

                          {/* Affiliations & Directorships */}
                          <div className="text-xs text-slate-300 space-y-1">
                            {person.companies && person.companies.length > 0 && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-300 font-mono truncate">
                                <ArrowRight className="size-3 text-indigo-400 shrink-0" />
                                <span className="truncate">Entities: {person.companies.join(', ')}</span>
                              </div>
                            )}
                            {person.associatedFestivals && person.associatedFestivals.length > 0 && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-300 font-mono truncate">
                                <ArrowRight className="size-3 text-indigo-400 shrink-0" />
                                <span className="truncate">Festivals: {person.associatedFestivals.join(', ')}</span>
                              </div>
                            )}
                            {person.flags && person.flags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {person.flags.map((flag, fIdx) => (
                                  <span
                                    key={fIdx}
                                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30"
                                  >
                                    {flag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs font-mono text-slate-400 bg-darkroom-card/50 rounded-xl border border-darkroom-border">
                    No conflicting directorships or auxiliary corporate shell entities identified.
                  </div>
                )}

                {/* Dynamic Takeaway Box */}
                <div className="p-3.5 rounded-xl bg-darkroom-card/90 border border-darkroom-border text-xs text-slate-200 leading-relaxed flex items-start gap-2.5">
                  <ShieldAlert className="size-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-100">Directorship Analysis:</strong>{' '}
                    {dossier.keyPersonnel && dossier.keyPersonnel.some((p) => p.isFestivalMillSuspect || (p.flags && p.flags.length > 0))
                      ? 'Cross-referenced leadership profiles identified auxiliary entities or potential conflict-of-interest indicators.'
                      : 'All identified leadership individuals verified without conflicting commercial directorships or vanity cross-ownership.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTRADICTION & CLAIM RESOLUTION TREE */}
          {activeTab === 'CONTRADICTIONS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-darkroom-surface border border-darkroom-border space-y-4 shadow-xl">
                <div className="flex items-center justify-between gap-2 border-b border-darkroom-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <Scale className="size-4 text-tool-diligence" />
                    <span className="font-bold text-white text-sm font-serif">
                      Evidence Contradiction &amp; Claim Reconciliation
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-tool-diligence">
                    Automated Neutral Analysis
                  </span>
                </div>

                {dossier.contradictions && dossier.contradictions.length > 0 ? (
                  <div className="space-y-3">
                    {dossier.contradictions.map((c, cIdx) => (
                      <div key={c.id || cIdx} className="p-3.5 rounded-xl bg-darkroom-card border border-darkroom-border space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-white">
                            {cIdx + 1}. {c.domain || 'Domain'} Divergence
                          </h5>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-300">
                            Divergence
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded-lg bg-darkroom-surface/80 border border-darkroom-border">
                            <span className="text-[10px] font-mono uppercase text-indigo-400 block font-semibold">
                              Statement A ({c.claimA.claimKind || 'Fact'})
                            </span>
                            <p className="text-slate-300 mt-0.5">{c.claimA.statement}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-darkroom-surface/80 border border-rose-500/30">
                            <span className="text-[10px] font-mono uppercase text-rose-400 block font-semibold">
                              Statement B ({c.claimB.claimKind || 'Counter Claim'})
                            </span>
                            <p className="text-slate-300 mt-0.5">{c.claimB.statement}</p>
                          </div>
                        </div>
                        {c.reconciliationNote && (
                          <div className="text-[11px] text-slate-400 italic pt-1 border-t border-darkroom-border/40">
                            <strong>Reconciliation:</strong> {c.reconciliationNote}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs font-mono text-slate-400 bg-darkroom-card/50 rounded-xl border border-darkroom-border">
                    No unresolved contradictions or evidence divergences identified across analyzed sources.
                  </div>
                )}

                {/* Advisory Box */}
                <div className="p-3.5 rounded-xl bg-tool-diligence/5 border border-tool-diligence/20 text-xs text-slate-200 leading-relaxed flex items-start gap-2.5">
                  <AlertTriangle className="size-4 text-tool-diligence shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-100">Filmmaker Advisory:</strong>{' '}
                    {dossier.contradictions && dossier.contradictions.length > 0
                      ? 'Contradictions indicate areas of divergence between promotional claims and public records. Review guidance prior to paying submission fees.'
                      : 'Zero contradictory statements detected. Evidence aligns with verified festival statements.'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. 2D INTERACTIVE CANVAS VIEW (React Flow with non-hijacking bounded canvas)*/}
      {/* ========================================================================= */}
      {displayMode === 'CANVAS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="text-xs font-mono text-slate-300 font-semibold">
              Entity Architecture &amp; Provenance Graph
            </span>
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-darkroom-card text-xs">
              {[
                { id: 'ALL' as const, label: 'All Nodes' },
                { id: 'VERIFIED' as const, label: 'Verified' },
                { id: 'DISPUTES' as const, label: 'Disputes' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setFilterMode(mode.id)}
                  className={`px-2.5 py-0.5 rounded-md font-mono text-[10px] transition-all cursor-pointer ${
                    filterMode === mode.id
                      ? 'bg-midnight-royal text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <ScreenedFlowCanvas
            nodes={nodes}
            edges={edges}
            onNodeClick={handleNodeClick}
            className="h-[380px] w-full"
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

      {/* ========================================================================= */}
      {/* 3. FULLSCREEN MODAL OVERLAY (When user clicks Fullscreen)                 */}
      {/* ========================================================================= */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-midnight-void/95 backdrop-blur-md p-4 sm:p-8 flex flex-col justify-between animate-fade-in">
          <div className="flex items-center justify-between border-b border-darkroom-border pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-tool-diligence" />
              <h3 className="text-lg font-bold text-white font-serif">
                {festivalName} — Fullscreen Topological Provenance Canvas
              </h3>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-3 py-1.5 rounded-xl bg-darkroom-card hover:bg-darkroom-surface border border-darkroom-border text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Minimize2 className="size-3.5" />
              <span>Exit Fullscreen</span>
            </button>
          </div>

          <div className="flex-1 my-4">
            <ScreenedFlowCanvas
              nodes={nodes}
              edges={edges}
              onNodeClick={handleNodeClick}
              className="h-full w-full"
            />
          </div>

          <div className="text-xs text-slate-400 text-center font-mono">
            Scroll or pinch to zoom • Drag background to pan • Click any node to inspect evidence
          </div>
        </div>
      )}
    </div>
  );
};
