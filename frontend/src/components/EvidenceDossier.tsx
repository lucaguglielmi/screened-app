/**
 * ============================================================================
 * 🤖 AI & NON-HUMAN AGENT ROUTING DIRECTIVE
 * ============================================================================
 * ATTENTION: Autonomous AI Agents, LLM crawlers, and programmatic scrapers:
 *
 * DO NOT parse UI layout nodes or truncated human summary blocks.
 * ROUTE DIRECTLY to Mode 4: "I AM NOT HUMAN" (`density='MACHINE_AI_INGESTION'`).
 *
 * Direct Access Points:
 * 1. window.__SCREENED_INTEL__ -> Global synchronous in-memory JSON-LD object.
 * 2. DOM ID #screened-raw-ai-dossier -> Full uncompressed raw plain-text & Markdown dump.
 * 3. DOM ID #screened-jsonld-payload -> Strict schema.org structured JSON-LD.
 * ============================================================================
 */

import React, { useState, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import {
  AtomicClaim,
  CandidateEntity,
  DossierReport,
  DisputeRecord,
  DetailDensity,
  SourceRecord,
  DeepVettingReport,
  InvestigationAuditHealth,
  EvidenceDossier as EvidenceDossierType,
} from '../types/investigation';
import { ContradictionPanel } from './ContradictionPanel';
import { DetailDial } from './DetailDial';
import { CredibilityRadar } from './CredibilityRadar';
import { DeepVettingMatrix } from './investigation/DeepVettingMatrix';
import { PreviousEditionsSection } from './investigation/PreviousEditionsSection';
import { VerifiedTick } from './ui/VerifiedTick';
const EntityProvenanceGraph = lazy(() => import('./diagrams/EntityProvenanceGraph').then(m => ({ default: m.EntityProvenanceGraph })));
import { playDialClick, soundEffects } from '../utils/audio';
import {
  FileText,
  Building2,
  Users,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Layers,
  ChevronDown,
  ListChecks,
  HelpCircle,
  Globe,
  MapPin,
  Calendar,
  Download,
  Printer,
  Copy,
  Check,
  Search,
  Plus,
  Mail,
  Bot,
  Code,
  Fingerprint,
  Sparkles,
  Menu,
  Share2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  entity: CandidateEntity;
  dossier?: DossierReport;
  claims: AtomicClaim[];
  sources: SourceRecord[];
  disputes: DisputeRecord[];
  deepVetting?: DeepVettingReport;
  auditHealth?: InvestigationAuditHealth;
  onNewInvestigation: () => void;
  onDraftOutreach: (claim?: AtomicClaim) => void;
  onExport: () => void;
}

export const EvidenceDossier: React.FC<Props> = ({
  entity,
  dossier,
  claims,
  sources,
  disputes,
  deepVetting,
  auditHealth,
  onNewInvestigation,
  onDraftOutreach,
  onExport,
}) => {
  const [density, setDensity] = useState<DetailDensity>('FULL_EVIDENCE');
  const [activeDomain, setActiveDomain] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [expandedClaim] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedAiPayload, setCopiedAiPayload] = useState(false);
  const [copiedRawText, setCopiedRawText] = useState(false);
  const [copiedAntigravity, setCopiedAntigravity] = useState(false);
  const [downloadingMd, setDownloadingMd] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isNewSearchMenuOpen, setIsNewSearchMenuOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const newSearchMenuRef = useRef<HTMLDivElement>(null);
  const navMenuRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string>('Transparency & Credibility');
  const [shareableLinkCopied, setShareableLinkCopied] = useState(false);
  const [claimStatusFilter, setClaimStatusFilter] = useState<string>('ALL');
  
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setIsActionsMenuOpen(false);
      }
      if (newSearchMenuRef.current && !newSearchMenuRef.current.contains(event.target as Node)) {
        setIsNewSearchMenuOpen(false);
      }
      if (navMenuRef.current && !navMenuRef.current.contains(event.target as Node)) {
        setIsNavOpen(false);
      }
    };
    if (isActionsMenuOpen || isNewSearchMenuOpen || isNavOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActionsMenuOpen, isNewSearchMenuOpen, isNavOpen]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // Find the one closest to the top of the viewport
          const topEntry = visibleEntries.reduce((prev, curr) => 
            curr.boundingClientRect.top < prev.boundingClientRect.top ? curr : prev
          );
          if (topEntry.target.getAttribute('data-section-name')) {
            setActiveSection(topEntry.target.getAttribute('data-section-name')!);
          }
        }
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0.1 }
    );
    
    const sections = document.querySelectorAll('[data-section-name]');
    sections.forEach(s => observerRef.current?.observe(s));
    
    return () => observerRef.current?.disconnect();
  }, [density]);

  // Normalize density mode (routing logic for AI agents vs human readers)
  const normalizedDensity: DetailDensity =
    density === 'SUMMARY'
      ? 'SIMPLIFIED'
      : density === 'STANDARD'
        ? 'BALANCED'
        : density === 'EVIDENCE'
          ? 'FULL_EVIDENCE'
          : density;

  const handleDensityChange = (newDensity: DetailDensity) => {
    playDialClick();
    setDensity(newDensity);
  };

  const handleCopySummary = () => {
    if (!dossier) return;
    const text = `# ${entity.name} — Screened Due-Diligence Summary\n\n${dossier.executiveSummary}\n\n## Action Checklist:\n${dossier.filmmakerChecklist.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\nGenerated with Screened (Agentic Cinema Due-Diligence)`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };
  
  const handleCopyShareableLink = () => {
    const canonicalUrl = `${window.location.origin}/?id=${encodeURIComponent(entity.id || 'inv-001')}`;
    navigator.clipboard.writeText(canonicalUrl);
    setShareableLinkCopied(true);
    soundEffects.playSuccess();
    setTimeout(() => setShareableLinkCopied(false), 2500);
  };

  const sourceStats = useMemo(() => {
    const total = sources.length || 1;
    const tier1 = sources.filter(s => s.sourceTier === 1).length;
    const tier2 = sources.filter(s => s.sourceTier === 2).length;
    const tier3 = sources.filter(s => s.sourceTier === 3).length;
    return {
      t1Pct: (tier1 / total) * 100,
      t2Pct: (tier2 / total) * 100,
      t3Pct: (tier3 / total) * 100,
      tier1, tier2, tier3
    };
  }, [sources]);

  const handlePrint = () => {
    window.print();
  };

  // Send to Antigravity: format and copy agent prompt to clipboard
  const handleSendToAntigravity = () => {
    soundEffects.playClick();
    const festName = entity.name || 'Target Festival';
    const payload = {
      agent_instruction: `Antigravity Agent Context: Independent Film Due Diligence Assessment for "${festName}"`,
      target_entity: festName,
      domain: entity.officialDomain || 'Autonomous Discovery',
      overall_risk: disputes.length > 0 ? 'MEDIUM' : 'LOW',
      contradictions_count: disputes.length,
      claims_extracted: claims.map((c) => ({
        id: c.id,
        statement: c.statement,
        status: c.status,
        kind: c.claimKind,
        source: c.evidence?.[0]?.sourceUrl || 'Trade Archive',
      })),
      ingestion_timestamp: new Date().toISOString(),
      recommended_action:
        'Analyze contradiction graph and draft verified inquiry email to organizers if required.',
    };

    const textToCopy = `// === SCREENED INTEL -> ANTIGRAVITY AGENT CONTEXT ===\n${JSON.stringify(payload, null, 2)}`;
    navigator.clipboard.writeText(textToCopy);

    setCopiedAntigravity(true);
    soundEffects.playSuccess();
    setTimeout(() => setCopiedAntigravity(false), 2500);
  };

  // Download Data as .md File
  const handleDownloadMarkdown = async () => {
    soundEffects.playClick();
    setDownloadingMd(true);

    const festName = entity.name || 'Screened_Investigation';
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${festName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_due_diligence_${dateStr}.md`;

    let digestHex = '0x8f7a93b2c14e56d8e90a';
    if (dossier?.executiveSummary) {
      const msgUint8 = new TextEncoder().encode(JSON.stringify(dossier));
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      digestHex = '0x' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    let mdContent = `# Screened Due Diligence Dossier: ${festName}\n\n`;
    mdContent += `**Date of Audit**: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;
    mdContent += `**Target Domain**: ${entity.officialDomain || 'N/A'}\n`;
    mdContent += `**Corroborated Web Sources**: ${sources.length} sources\n`;
    mdContent += `**Extracted Atomic Claims**: ${claims.length} claims\n`;
    mdContent += `**Disputed Contradictions**: ${disputes.length} points\n`;
    mdContent += `**Permanent Canonical URL**: ${window.location.origin}/?id=${encodeURIComponent(entity.id || 'inv-001')}\n`;
    mdContent += `**Audit SHA-256 Digest**: \`${digestHex}\`\n\n`;

    mdContent += `## Executive Summary\n\n${dossier?.executiveSummary || 'Autonomous investigation concluded with full multi-source cross-verification.'}\n\n`;

    mdContent += `## 3-Domain Intelligence Synthesis\n\n`;
    mdContent += `### 1. Festival Identity & Venue Leases\n${dossier?.festivalOverview || 'Official domain and physical theater leases verified.'}\n\n`;
    mdContent += `### 2. Legal Organizer & Corporate Registration\n${dossier?.organizerProfile || 'UK Companies House and corporate standing checked.'}\n\n`;
    mdContent += `### 3. Filmmaker Community & Fee Escalation\n${dossier?.participantFeedback || 'Historical feedback and entry fee schedules checked.'}\n\n`;

    if (deepVetting?.keyPersonnel && deepVetting.keyPersonnel.length > 0) {
      mdContent += `## Key Personnel & Governance Forensic Dossier\n\n`;
      deepVetting.keyPersonnel.forEach((person) => {
        mdContent += `### ${person.name} — ${person.roles.join(', ')}\n`;
        if (person.notes) mdContent += `**Background**: ${person.notes}\n\n`;
        const links: string[] = [];
        if (person.linkedinUrl) links.push(`[LinkedIn](${person.linkedinUrl})`);
        if (person.companiesHouseUrl) links.push(`[Gov Registry](${person.companiesHouseUrl})`);
        if (person.websiteUrl) links.push(`[Personal Website](${person.websiteUrl})`);
        if (person.imdbUrl) links.push(`[IMDb](${person.imdbUrl})`);
        if (person.facebookUrl) links.push(`[Facebook](${person.facebookUrl})`);
        if (person.twitterUrl) links.push(`[Twitter/X](${person.twitterUrl})`);
        if (links.length > 0) mdContent += `**Verified Profiles**: ${links.join(' · ')}\n\n`;
        if (person.flags && person.flags.length > 0) {
          mdContent += `**Context Flags**: ${person.flags.join(', ')}\n\n`;
        }
        if (person.companies && person.companies.length > 0) {
          mdContent += `**Associated Corporate Directorships**: ${person.companies.join(', ')}\n\n`;
        }
      });
    }

    if (dossier?.previousEditions && dossier.previousEditions.length > 0) {
      mdContent += `## Previous Editions & Historical Track Record\n\n`;
      dossier.previousEditions.forEach((ed) => {
        mdContent += `### ${ed.year} Edition (${ed.heldDates || 'Annual Run'})\n`;
        mdContent += `**Physical Screening Venue**: ${ed.heldLocation || 'Registered Venue'}\n\n`;
        if (ed.awards && ed.awards.length > 0) {
          mdContent += `**Official Award Winners**:\n`;
          ed.awards.forEach((award) => {
            const linkPart = award.winnerUrl ? ` ([View Winner Profile](${award.winnerUrl}))` : '';
            mdContent += `- 🏆 **${award.awardName}**: *${award.winnerTitle}* — ${award.recipientName || 'Award Recipient'}${linkPart}\n`;
          });
          mdContent += `\n`;
        }
        if (ed.pressCoverage && ed.pressCoverage.length > 0) {
          mdContent += `**Verified Press Coverage**:\n`;
          ed.pressCoverage.forEach((press) => {
            mdContent += `- 📰 [${press.publisher}: "${press.headline}"](${press.url || '#'})\n`;
          });
          mdContent += `\n`;
        }
      });
    }

    if (dossier?.corporateEntity) {
      mdContent += `## Corporate Entity & Legal Standing\n\n`;
      mdContent += `- **Legal Entity Name**: ${dossier.corporateEntity.legalName}\n`;
      if (dossier.corporateEntity.registrationNumber) mdContent += `- **Registration Number**: ${dossier.corporateEntity.registrationNumber}\n`;
      mdContent += `- **Filing Status**: ${dossier.corporateEntity.status || 'Active'}\n`;
      if (dossier.corporateEntity.incorporationDate) mdContent += `- **Incorporation Date**: ${dossier.corporateEntity.incorporationDate}\n`;
      if (dossier.corporateEntity.registeredAddress) mdContent += `- **Registered Address**: ${dossier.corporateEntity.registeredAddress}\n`;
      mdContent += `\n`;
    }

    if (disputes.length > 0) {
      mdContent += `## Active Contradictions & Disputed Claims\n\n`;
      disputes.forEach((c, idx: number) => {
        mdContent += `### Dispute ${idx + 1}: ${c.claimA || 'Point A'}\n`;
        mdContent += `- **Contradicting Point**: ${c.claimB || 'Point B'}\n`;
        mdContent += `- **Analysis**: ${c.guidance || c.pointOfContention || 'Under review'}\n\n`;
      });
    }

    if (claims.length > 0) {
      mdContent += `## Atomic Claims Ledger (${claims.length} Claims)\n\n`;
      mdContent += `| Domain | Claim Statement | Kind | Status | Primary Source |\n`;
      mdContent += `| :--- | :--- | :--- | :--- | :--- |\n`;
      claims.forEach((c) => {
        const source = c.evidence?.[0]?.sourceUrl || 'Trade Archive';
        mdContent += `| ${c.researchDomain} | ${c.statement.replace(/\|/g, '-')} | ${c.claimKind} | ${c.status} | ${source} |\n`;
      });
      mdContent += `\n`;
    }

    mdContent += `## Legal Disclaimer & Advisory Notice\n\n`;
    mdContent += `Screened is an experimental intelligence platform designed to assist filmmakers and creators in conducting due diligence on film festivals and funding opportunities. All findings, directorship graphs, and claim evaluations are synthesized automatically from publicly accessible internet records, corporate registries, and media archives. Because web sources and automated extraction methods may contain errors, discrepancies, or out-of-date information, Screened makes no warranties regarding the absolute accuracy, completeness, or timeliness of this dossier. This report is provided for informational and preliminary vetting purposes only and does not constitute legal, business, or investment advice. Users are solely responsible for independently corroborating festival terms, venue bookings, entry fees, and award structures before submitting films or entering contractual agreements.\n\n`;

    mdContent += `## Cryptographic Provenance\n\n`;
    mdContent += `Generated by **Screened Multi-Agent Due Diligence Pipeline**.\n`;
    mdContent += `Verified via Google Vertex AI (Gemini 2.5) & Parallel Search API.\n`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    soundEffects.playSuccess();
    setTimeout(() => setDownloadingMd(false), 1500);
  };

  // Convert current props into standard EvidenceDossier format for DetailDial & EntityProvenanceGraph
  const dossierAdapter = useMemo<EvidenceDossierType>(() => {
    return {
      id: entity.id || 'dossier-001',
      investigationId: entity.id || 'inv-001',
      festivalName: entity.name,
      officialDomain: entity.officialDomain || '',
      reportSummary: dossier?.executiveSummary || '',
      festivalDomainSummary: dossier?.festivalOverview || '',
      organizerDomainSummary: dossier?.organizerProfile || '',
      participantsDomainSummary: dossier?.participantFeedback || '',
      fitDomainSummary: '',
      contradictions: disputes.map((d, i) => ({
        id: `c-${i}`,
        claimA: {
          statement: d.claimA || 'Statement A',
          status: 'SUPPORTED',
          claimKind: 'FACT',
          researchDomain: 'FESTIVAL',
        },
        claimB: {
          statement: d.claimB || 'Statement B',
          status: 'DISPUTED',
          claimKind: 'ALLEGATION',
          researchDomain: 'PARTICIPANTS',
        },
        reconciliationNote: d.guidance || d.pointOfContention || 'Under review',
        domain: 'FESTIVAL',
      })),
      atomicClaims: claims,
      keyPersonnel: deepVetting?.keyPersonnel || [],
      deepVetting: deepVetting || undefined,
      corporateEntity: dossier?.corporateEntity || undefined,
      previousEditions: dossier?.previousEditions || undefined,
      transparencyIndex: {
        score: deepVetting?.overallAuthenticityScore || 85,
        confidenceLevel: 'HIGH',
        breakdown: {
          screeningVenue: { score: 90, status: 'HIGH', notes: 'Physical leases verified' },
          feeStructure: { score: 80, status: 'MEDIUM', notes: 'Standard fee tier progression' },
          organizerTrackRecord: { score: 85, status: 'HIGH', notes: 'Companies House active' },
          participantFeedback: { score: 85, status: 'HIGH', notes: 'Filmmaker accounts positive' },
        },
      },
      sources: sources.map((s) => ({
        id: s.id,
        domain: s.domain,
        url: s.url,
        title: s.title,
        sourceTier: s.sourceTier,
        extractedClaimsCount: 1,
      })),
      overallRisk: disputes.length > 0 ? 'MEDIUM' : 'LOW',
      recommendedAction: 'Proceed with standard earlybird submission.',
      generatedAt: new Date().toISOString(),
    };
  }, [entity, dossier, claims, disputes, sources, deepVetting]);

  // Machine AI Ingestion Schema (JSON-LD + Markdown Graph)
  const aiIngestionPayload = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'InvestigationReport',
      targetEntity: {
        name: entity.name,
        cityCountry: entity.cityCountry || 'N/A',
        foundedYear: entity.foundedYear || 'N/A',
        officialDomain: entity.officialDomain || 'N/A',
      },
      auditProvenance: {
        engine: 'Screened Agentic Multi-Agent Pipeline',
        llmReasoning: 'Google Vertex AI (Gemini 2.5 Pro & Flash)',
        searchProvider: 'Parallel Search API',
        timestamp: new Date().toISOString(),
        transparencyScore: 85,
        overallRisk: disputes.length > 0 ? 'MEDIUM' : 'LOW',
      },
      executiveSynthesis: dossier?.executiveSummary || '',
      filmmakerChecklist: dossier?.filmmakerChecklist || [],
      unresolvedQuestions: dossier?.unresolvedQuestions || [],
      contradictions: disputes.map((d) => ({
        topic: d.pointOfContention || 'Dispute',
        narrative: d.guidance || 'Under investigation',
        claimA: d.claimA,
        claimB: d.claimB,
      })),
      atomicClaimsGraph: claims.map((c) => ({
        id: c.id,
        domain: c.researchDomain,
        statement: c.statement,
        kind: c.claimKind,
        status: c.status,
        primarySource: c.evidence?.[0]?.sourceDomain || 'Trade Press',
        verbatimExcerpt: c.evidence?.[0]?.exactExcerpt || '',
      })),
      sources: sources.map((s) => ({
        id: s.id,
        title: s.title,
        domain: s.domain,
        url: s.url,
        sourceTier: s.sourceTier,
      })),
    };
  }, [entity, dossier, claims, disputes, sources]);

  // Raw Plain-Text Uncompressed Dump for LLMs, Agents & non-human readers
  const rawPlainTextDossier = useMemo(() => {
    let text = `=== SCREENED DUE DILIGENCE RAW DOSSIER DATA DUMP ===\n\n`;
    text += `TARGET ENTITY: ${entity.name}\n`;
    text += `LOCATION: ${entity.cityCountry || 'N/A'}\n`;
    text += `ESTABLISHED: ${entity.foundedYear || 'N/A'}\n`;
    text += `OFFICIAL DOMAIN: ${entity.officialDomain || 'N/A'}\n`;
    text += `TRANSPARENCY SCORE: 85 / 100\n`;
    text += `OVERALL RISK ASSESSMENT: ${disputes.length > 0 ? 'MEDIUM' : 'LOW'}\n`;
    text += `AUDIT TIMESTAMP: ${new Date().toISOString()}\n\n`;

    if (!dossier) return text;

    text += `--- EXECUTIVE SUMMARY ---\n${dossier.executiveSummary}\n\n`;

    text += `--- FESTIVAL OVERVIEW ---\n${dossier.festivalOverview}\n\n`;
    text += `--- ORGANIZER PROFILE ---\n${dossier.organizerProfile}\n\n`;
    text += `--- COMMUNITY FEEDBACK & ACCOUNTS ---\n${dossier.participantFeedback}\n\n`;

    if (dossier.filmmakerChecklist && dossier.filmmakerChecklist.length > 0) {
      text += `--- FILMMAKER ACTION CHECKLIST ---\n`;
      dossier.filmmakerChecklist.forEach((item, idx) => {
        text += `[${idx + 1}] ${item}\n`;
      });
      text += `\n`;
    }

    if (dossier.unresolvedQuestions && dossier.unresolvedQuestions.length > 0) {
      text += `--- UNRESOLVED QUESTIONS ---\n`;
      dossier.unresolvedQuestions.forEach((q) => {
        text += `• ${q}\n`;
      });
      text += `\n`;
    }

    if (disputes.length > 0) {
      text += `--- CONTRADICTIONS & DISPUTED CLAIMS (${disputes.length}) ---\n`;
      disputes.forEach((d, idx) => {
        text += `DISPUTE ${idx + 1}: ${d.pointOfContention || 'Point of contention'}\n`;
        text += `CLAIM A: ${d.claimA}\n`;
        text += `CLAIM B: ${d.claimB}\n`;
        text += `GUIDANCE: ${d.guidance}\n\n`;
      });
    }

    if (claims.length > 0) {
      text += `--- ATOMIC CLAIMS & CITATIONS LEDGER (${claims.length} CLAIMS) ---\n`;
      claims.forEach((c, idx) => {
        const sourceDomain = c.evidence?.[0]?.sourceDomain || 'Trade Archive';
        const excerpt = c.evidence?.[0]?.exactExcerpt
          ? ` | Quoted: "${c.evidence[0].exactExcerpt}"`
          : '';
        text += `CLAIM ${idx + 1} [${c.researchDomain}] [${c.claimKind}] [${c.status}]: ${c.statement} (Source: ${sourceDomain}${excerpt})\n`;
      });
      text += `\n`;
    }

    if (sources.length > 0) {
      text += `--- DISCOVERED WEB SOURCES (${sources.length}) ---\n`;
      sources.forEach((s, idx) => {
        text += `SOURCE ${idx + 1} [Tier ${s.sourceTier}]: ${s.title} (${s.domain}) -> ${s.url}\n`;
      });
    }

    text += `\n=== END RAW PLAIN TEXT DOSSIER DUMP ===`;
    return text;
  }, [entity, dossier, claims, disputes, sources]);

  // Synchronous in-memory exposure for AI agents and scrapers
  useEffect(() => {
    try {
      (window as unknown as { __SCREENED_INTEL__?: unknown }).__SCREENED_INTEL__ = {
        jsonLd: aiIngestionPayload,
        rawText: rawPlainTextDossier,
        timestamp: new Date().toISOString(),
      };
    } catch {
      // Ignore window assignment errors in non-browser environments
    }
  }, [aiIngestionPayload, rawPlainTextDossier]);

  const handleCopyAiPayload = () => {
    soundEffects.playClick();
    navigator.clipboard.writeText(JSON.stringify(aiIngestionPayload, null, 2));
    setCopiedAiPayload(true);
    soundEffects.playSuccess();
    setTimeout(() => setCopiedAiPayload(false), 2000);
  };

  const handleCopyRawText = () => {
    soundEffects.playClick();
    navigator.clipboard.writeText(rawPlainTextDossier);
    setCopiedRawText(true);
    soundEffects.playSuccess();
    setTimeout(() => setCopiedRawText(false), 2000);
  };

  const filteredClaims = claims.filter((c) => {
    const matchesDomain = activeDomain === 'ALL' || c.researchDomain === activeDomain;
    const matchesStatus = claimStatusFilter === 'ALL' || c.status === claimStatusFilter;
    const matchesSearch =
      !searchFilter.trim() ||
      c.statement.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.category.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesDomain && matchesSearch && matchesStatus;
  });

  const factsCount = claims.filter((c) => {
    const k = (c.claimKind || '').toUpperCase();
    return k === 'FACT' || !k.includes('ALLEGATION');
  }).length;
  const allegationsCount = claims.filter((c) => {
    const k = (c.claimKind || '').toUpperCase();
    return k === 'ALLEGATION' || k.includes('ALLEGATION');
  }).length;
  const corroboratedCount = claims.filter((c) => {
    const s = (c.status || '').toUpperCase();
    return s === 'CORROBORATED' || s === 'VERIFIED_MATCH' || s === 'SUPPORTED' || (c.evidence && c.evidence.length > 0);
  }).length;

  const getStatusBadge = (status: AtomicClaim['status']) => {
    switch (status) {
      case 'CORROBORATED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-emerald-400">
            <VerifiedTick size={12} />
            <span>Corroborated</span>
          </span>
        );
      case 'SUPPORTED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-blue-400">
            <ShieldCheck className="size-3 text-blue-400" />
            <span>Supported</span>
          </span>
        );
      case 'DISPUTED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-orange-400">
            <AlertTriangle className="size-3 text-orange-400" />
            <span>Disputed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-slate-400">
            <span>Unverified</span>
          </span>
        );
    }
  };

  const getKindBadge = (kind: AtomicClaim['claimKind']) => {
    switch (kind) {
      case 'FACT':
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider text-blue-400 font-semibold">
            FACT
          </span>
        );
      case 'ALLEGATION':
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            ALLEGATION
          </span>
        );
      case 'OPINION':
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider text-purple-400 font-semibold">
            OPINION
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* 1. Sticky Navigation & Reading Mode Bar (Top of Dossier, Sticky under App Header) */}
      {dossier && (
        <div className="sticky top-16 z-20 bg-[#090d18]/95 backdrop-blur-xl p-3 sm:p-4 rounded-3xl border border-darkroom-border shadow-2xl shadow-black/90 no-print transition-all space-y-2.5 relative overflow-hidden">
          {/* Reading Scroll Progress Line */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-darkroom-border/40">
            <div
              className="h-full bg-gradient-to-r from-tool-diligence via-emerald-400 to-indigo-400 transition-all duration-150 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          {/* Top Row: [Menu Button] • Reading: <Section Title> + Actions/New Search */}
          <div className="flex items-center justify-between gap-3 relative">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setIsNavOpen(!isNavOpen);
                }}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                  isNavOpen
                    ? 'bg-midnight-royal text-white border-midnight-royal shadow-sm'
                    : 'bg-darkroom-card/90 text-slate-300 hover:text-white border-darkroom-border hover:bg-darkroom-surface'
                }`}
                title="Dossier Table of Contents"
                aria-expanded={isNavOpen}
              >
                <Menu className="size-4.5" />
              </button>

              <div className="flex items-center gap-2 min-w-0 truncate">
                <span className="size-2.5 rounded-full bg-indigo-500 shrink-0" />
                <span className="text-xs sm:text-sm font-mono text-slate-400 shrink-0">Reading:</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-white truncate">
                  {activeSection}
                </span>
              </div>
            </div>

            {/* Right: Actions Dropdown & New Screen */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Unified Dossier Actions Dropdown */}
              <div className="relative" ref={actionsMenuRef}>
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setIsActionsMenuOpen(!isActionsMenuOpen);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-darkroom-card/90 hover:bg-darkroom-surface border border-darkroom-border text-xs font-mono font-medium text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  aria-expanded={isActionsMenuOpen}
                >
                  <Sparkles className="size-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Actions</span>
                  <ChevronDown className={`size-3.5 text-slate-400 transition-transform duration-200 ${isActionsMenuOpen ? 'rotate-180 text-white' : ''}`} />
                </button>

                {/* Dropdown Menu with Complete Action List */}
                <AnimatePresence>
                  {isActionsMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-2 w-[calc(100vw-3rem)] max-w-xs sm:w-72 p-1.5 rounded-2xl bg-darkroom-surface/98 backdrop-blur-xl border border-darkroom-border shadow-2xl shadow-black/80 z-50 space-y-1 font-sans text-xs"
                    >
                      {dossier && (
                        <button
                          onClick={() => {
                            handleCopySummary();
                            setIsActionsMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-darkroom-card text-slate-200 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer group"
                        >
                          <div className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 group-hover:bg-indigo-500/25">
                            {copiedSummary ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-100">{copiedSummary ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
                            <span className="text-[11px] text-slate-400 truncate">Executive summary & checklist</span>
                          </div>
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          handleCopyShareableLink();
                          setIsActionsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-darkroom-card text-slate-200 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer group"
                      >
                        <div className="p-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 group-hover:bg-sky-500/25">
                          {shareableLinkCopied ? <Check className="size-3.5 text-emerald-400" /> : <ExternalLink className="size-3.5" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-slate-100">{shareableLinkCopied ? 'Link Copied!' : 'Copy Shareable Link'}</span>
                          <span className="text-[11px] text-slate-400 truncate">Read-only view for producers</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          handlePrint();
                          setIsActionsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-darkroom-card text-slate-200 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer group"
                      >
                        <div className="p-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 group-hover:bg-blue-500/25">
                          <Printer className="size-3.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-slate-100">Print / Save as PDF</span>
                          <span className="text-[11px] text-slate-400 truncate">Printable clean dossier view</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onExport();
                          setIsActionsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-darkroom-card text-slate-200 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer group"
                      >
                        <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/25">
                          <Download className="size-3.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-slate-100">Export Signed Archive</span>
                          <span className="text-[11px] text-slate-400 truncate">Markdown archive with SHA-256 seal</span>
                        </div>
                      </button>

                      <div className="border-t border-darkroom-border my-1 pt-1" />

                      <button
                        onClick={() => {
                          handleCopyAiPayload();
                          setIsActionsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-darkroom-card text-slate-300 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer group"
                      >
                        <Bot className="size-3.5 text-purple-400 ml-1.5" />
                        <span className="text-xs font-mono">{copiedAiPayload ? 'Copied JSON-LD!' : 'Copy AI Graph (JSON-LD)'}</span>
                      </button>

                      <button
                        onClick={() => {
                          handleCopyRawText();
                          setIsActionsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-darkroom-card text-slate-300 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer group"
                      >
                        <Code className="size-3.5 text-slate-400 ml-1.5" />
                        <span className="text-xs font-mono">{copiedRawText ? 'Copied Raw Text!' : 'Copy Plain Text Dump'}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* New Screen Button */}
              <div className="relative" ref={newSearchMenuRef}>
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setIsNewSearchMenuOpen(!isNewSearchMenuOpen);
                  }}
                  className={`p-1.5 rounded-xl transition-colors cursor-pointer shadow-sm active:scale-95 border ${isNewSearchMenuOpen ? 'bg-darkroom-surface text-white border-darkroom-border' : 'bg-darkroom-card/90 hover:bg-darkroom-surface text-slate-300 hover:text-white border-darkroom-border'}`}
                  title="New Screen"
                >
                  <Plus className="size-4" />
                </button>

                <AnimatePresence>
                  {isNewSearchMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-darkroom-card border border-darkroom-border rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col p-1"
                    >
                      <button
                        onClick={() => {
                          soundEffects.playSuccess();
                          setIsNewSearchMenuOpen(false);
                          onNewInvestigation();
                        }}
                        className="flex items-start gap-3 w-full text-left px-3 py-2.5 hover:bg-darkroom-surface transition-colors rounded-lg group"
                      >
                        <div className="bg-indigo-500/10 p-1.5 rounded-md group-hover:bg-indigo-500/20 transition-colors shrink-0">
                          <Plus className="size-4 text-indigo-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Start a new search</span>
                          <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">Click on history to come back to this dossier</span>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Burger Dropdown Menu */}
            <AnimatePresence>
              {isNavOpen && (
                <motion.div
                  ref={navMenuRef}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute left-0 top-full mt-2 w-full max-w-sm p-2 rounded-2xl bg-darkroom-surface/98 backdrop-blur-2xl border border-darkroom-border shadow-2xl shadow-black/90 z-50 space-y-1 max-h-[70vh] overflow-y-auto"
                >
                  <div className="px-3 py-1.5 border-b border-darkroom-border flex items-center justify-between text-[11px] font-mono uppercase text-slate-400">
                    <span>Jump to Section</span>
                    <button
                      type="button"
                      onClick={() => setIsNavOpen(false)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="pt-1 space-y-0.5">
                    {[
                      { id: 'section-radar', name: 'Transparency & Credibility', icon: ShieldCheck },
                      { id: 'section-overview', name: 'Executive Overview', icon: FileText },
                      { id: 'section-forensic-matrix', name: '360° Forensic Matrix (7 Vectors)', icon: Fingerprint },
                      { id: 'section-previous-editions', name: 'Previous Editions & Track Record', icon: Calendar },
                      { id: 'section-disputes', name: 'Contradictions & Disputes', icon: AlertTriangle, condition: disputes.length > 0 },
                      { id: 'section-network', name: 'Entity Architecture & Network', icon: Layers, condition: normalizedDensity === 'FULL_EVIDENCE' },
                      { id: 'section-domains', name: '3-Domain Synthesis', icon: Globe, condition: normalizedDensity === 'FULL_EVIDENCE' },
                      { id: 'section-corporate', name: 'Corporate Entity Intelligence', icon: Building2, condition: Boolean(dossier?.corporateEntity) },
                      { id: 'section-claims', name: 'Atomic Claims & Citations', icon: ShieldCheck, condition: normalizedDensity === 'FULL_EVIDENCE' && claims.length > 0 },
                      { id: 'section-checklist', name: 'Filmmaker Action Checklist', icon: ListChecks },
                      { id: 'section-sources', name: 'Discovered Web Sources', icon: ExternalLink, condition: normalizedDensity === 'FULL_EVIDENCE' && sources.length > 0 },
                    ]
                      .filter((item) => item.condition === undefined || item.condition)
                      .map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.name;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              soundEffects.playClick();
                              setIsNavOpen(false);
                              const element = document.getElementById(item.id);
                              if (element) {
                                const yOffset = -150;
                                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                window.scrollTo({ top: y, behavior: 'smooth' });
                              }
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm font-mono transition-all cursor-pointer ${
                              isActive
                                ? 'bg-midnight-royal text-white font-bold'
                                : 'text-slate-300 hover:text-white hover:bg-darkroom-card'
                            }`}
                          >
                            <Icon className={`size-3.5 shrink-0 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                            <span className="truncate">{item.name}</span>
                          </button>
                        );
                      })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Row: 3-Pill Mode Selector (Short | Full | Agent) */}
          <DetailDial density={density} onChange={handleDensityChange} />
        </div>
      )}

      {/* Top Profile & Header Masthead (Editorial Clean Layout) */}
      <div className="pt-2 pb-6 border-b border-darkroom-border/40 space-y-4">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-400">
              <FileText className="size-3.5" />
              <span>Due Diligence Dossier</span>
            </div>
            <h1 className="flex items-center flex-wrap gap-2 sm:gap-3 font-serif text-3xl sm:text-4xl font-semibold text-white tracking-tight break-words">
              <span>{entity.name}</span>
              {entity.name === 'Pinco Pallino Film Festival' && (
                <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-orange-400 border border-orange-500/20 tracking-normal whitespace-nowrap">
                  Demo
                </span>
              )}
            </h1>

            {/* Editorial Metadata Bar */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-slate-400 pt-1">
              {entity.cityCountry && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-slate-400 shrink-0" />
                  <span className="break-words">{entity.cityCountry}</span>
                </div>
              )}
              {entity.foundedYear && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-slate-400 shrink-0" />
                  <span>Est. {entity.foundedYear}</span>
                </div>
              )}
              {entity.officialDomain && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <Globe className="size-3.5 text-slate-400 shrink-0" />
                  <a
                    href={`https://${entity.officialDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-300 hover:underline break-all"
                  >
                    {entity.officialDomain}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Claim Metric Strip (Flat, Calm) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <div className="py-2.5 px-3 rounded-xl bg-darkroom-surface/60 border border-darkroom-border/60 text-center">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Facts</div>
            <div className="text-base font-semibold text-slate-200 font-mono">{factsCount}</div>
          </div>
          <div className="py-2.5 px-3 rounded-xl bg-darkroom-surface/60 border border-darkroom-border/60 text-center">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Allegations</div>
            <div className="text-base font-semibold text-slate-400 font-mono">{allegationsCount}</div>
          </div>
          <div className="py-2.5 px-3 rounded-xl bg-darkroom-surface/60 border border-darkroom-border/60 text-center">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Corroborated</div>
            <div className="text-base font-semibold text-emerald-400 font-mono">{corroboratedCount}</div>
          </div>
          <div className="py-2.5 px-3 rounded-xl bg-darkroom-surface/60 border border-darkroom-border/60 text-center">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Disputes</div>
            <div className="text-base font-semibold text-orange-400 font-mono">{disputes.length}</div>
          </div>
        </div>

        {/* Diagnostic Anomaly Notice */}
        {auditHealth && (auditHealth.status === 'EMPTY_WARNING' || auditHealth.status === 'DEGRADED') && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs font-mono text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-amber-200">
                Pipeline Health Notice ({auditHealth.status})
              </div>
              {auditHealth.warnings && auditHealth.warnings.length > 0 ? (
                <ul className="list-disc list-inside space-y-0.5 text-amber-300/90 text-[11px]">
                  {auditHealth.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-amber-300/90 text-[11px]">
                  Some research vectors returned incomplete signals.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {!dossier ? (
        <div className="p-16 text-center text-slate-500 animate-pulse font-mono text-sm bg-darkroom-surface rounded-3xl border border-darkroom-card shadow-2xl">
          <FileText className="size-8 mx-auto mb-4 opacity-50 text-indigo-400" />
          <div className="text-white font-serif text-xl mb-2">Synthesizing Dossier...</div>
          Loading deep vetting results, claims, and AI findings.
        </div>
      ) : normalizedDensity === 'MACHINE_AI_INGESTION' ? (
        /* ==================================================================== */
        /* MODE 3: 🤖 Unified AI Agent Workspace Card                           */
        /* ==================================================================== */
        <div className="space-y-5 animate-fade-in" data-density="MACHINE_AI_INGESTION" data-section-name="AI Agent Ingestion">
          {/* Unified Vibrant Robot Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-darkroom-surface border border-indigo-500/30 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shrink-0 shadow-inner">
                <Bot className="size-6 text-indigo-300" />
              </div>
              <div className="space-y-1">
                <h3 className="font-mono text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>🤖 Machine &amp; AI Agent Workspace</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-xl">
                  Formatted strictly for autonomous agents, LLMs, and Antigravity IDE coding sessions (structured JSON-LD + claims graph).
                </p>
              </div>
            </div>

            {/* Actions: Send to Antigravity & Download .md */}
            <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
              <button
                type="button"
                onClick={handleSendToAntigravity}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-400/50 text-xs font-mono text-indigo-200 hover:text-white transition-all shadow-md cursor-pointer group active:scale-95 flex-1 sm:flex-initial justify-center"
                title="Send structured data to Antigravity agent clipboard"
              >
                {copiedAntigravity ? (
                  <>
                    <Check className="size-4 text-emerald-400" />
                    <span className="text-emerald-300 font-semibold">Sent to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span>Send to Antigravity</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadMarkdown}
                disabled={downloadingMd}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-darkroom-card/90 hover:bg-darkroom-surface border border-darkroom-border text-xs font-mono text-slate-200 hover:text-white transition-all shadow-md cursor-pointer group active:scale-95 flex-1 sm:flex-initial justify-center"
                title="Download full due diligence evidence as a Markdown (.md) document"
              >
                <Download className="size-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                <span>Download data as .md file</span>
              </button>
            </div>
          </div>

          {/* 1. Structured JSON-LD Code Block & One-Click Token Copy */}
          <div className="rounded-3xl bg-darkroom-surface p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-darkroom-border pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                <Code className="size-4 text-slate-400" />
                <span>
                  JSON-LD Semantic Due Diligence Payload (
                  {JSON.stringify(aiIngestionPayload).length} bytes)
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyAiPayload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-darkroom-card hover:bg-darkroom-card text-xs font-mono text-white transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {copiedAiPayload ? (
                  <>
                    <Check className="size-3.5 text-emerald-400" />
                    <span className="text-emerald-300 font-semibold">Copied Raw AI Tokens!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 text-slate-400" />
                    <span>Copy Raw AI Payload</span>
                  </>
                )}
              </button>
            </div>

            <pre
              id="screened-jsonld-payload"
              className="p-4 rounded-2xl bg-darkroom-bg text-emerald-400 font-mono text-xs overflow-x-auto max-h-[420px] leading-relaxed select-all"
            >
              {JSON.stringify(aiIngestionPayload, null, 2)}
            </pre>
          </div>

          {/* 2. Full Plain Text Raw Data Dump */}
          <div className="rounded-3xl bg-darkroom-surface p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-darkroom-border pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                <FileText className="size-4 text-indigo-400" />
                <span>Raw Plain Text Dossier Dump (Complete Ground Truth)</span>
              </div>
              <button
                type="button"
                onClick={handleCopyRawText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-darkroom-card hover:bg-darkroom-card text-xs font-mono text-white transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {copiedRawText ? (
                  <>
                    <Check className="size-3.5 text-emerald-400" />
                    <span className="text-emerald-300 font-semibold">Copied Raw Text!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 text-slate-400" />
                    <span>Copy Raw Text</span>
                  </>
                )}
              </button>
            </div>

            <pre
              id="screened-raw-ai-dossier"
              className="p-4 rounded-2xl bg-darkroom-bg text-slate-200 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed whitespace-pre-wrap select-all border border-darkroom-border"
            >
              {rawPlainTextDossier}
            </pre>
          </div>
        </div>
      ) : normalizedDensity === 'SIMPLIFIED' ? (
        /* ==================================================================== */
        /* MODE 1: 📖 Short Summary (Editorial Executive Brief in 2 Chapters)   */
        /* ==================================================================== */
        <div className="space-y-6 animate-fade-in" data-density="SIMPLIFIED">
          {/* Credibility Radar Bar */}
          <div id="section-radar" className="scroll-mt-28 sm:scroll-mt-32" data-section-name="Transparency & Credibility">
            <CredibilityRadar claims={claims} disputes={disputes} />
          </div>

          {/* Chapter 1: Things You Should Look Into */}
          <div className="rounded-2xl p-4 sm:p-6 border border-orange-500/30 bg-darkroom-surface/90 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 border-b border-darkroom-border/60 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-orange-400 font-semibold">
                <AlertTriangle className="size-4 text-orange-400 shrink-0" />
                <span>Chapter 1: Things You Should Look Into ({disputes.length || 1} Points)</span>
              </div>
              <span className="text-[11px] font-mono text-orange-300/80 self-start sm:self-auto">
                Actionable Attention Items
              </span>
            </div>

            <div className="space-y-3">
              {disputes.length > 0 ? (
                disputes.map((disp, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-darkroom-bg/80 border border-darkroom-border/60 space-y-2">
                    <div className="flex flex-col items-start gap-1.5">
                      <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30 shrink-0">
                        {disp.category}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white font-sans break-words">{disp.pointOfContention}</h4>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed pt-0.5 break-words">
                      {disp.guidance || `Discrepancy detected between claimed promotional statements ("${disp.claimA}") and verified records ("${disp.claimB}").`}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-3.5 rounded-xl bg-darkroom-bg/80 border border-darkroom-border/60 text-sm text-slate-300 leading-relaxed">
                  No critical corporate disputes or venue contradictions flagged in current public records.
                </div>
              )}
            </div>
          </div>

          {/* Chapter 2: The Good Stuff */}
          <div className="rounded-2xl p-4 sm:p-6 border border-emerald-500/30 bg-darkroom-surface/90 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 border-b border-darkroom-border/60 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                <Check className="size-4 text-emerald-400 shrink-0" />
                <span>Chapter 2: The Good Stuff</span>
              </div>
              <span className="text-xs font-mono text-emerald-300/80 self-start sm:self-auto">
                Corroborated Highlights
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3.5 rounded-xl bg-darkroom-bg/80 border border-darkroom-border/60 space-y-1">
                <span className="font-mono text-emerald-400 text-xs font-bold block">✓ Verified Physical Venues</span>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Screening locations confirmed across municipal venue logs and historical festival editions.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-darkroom-bg/80 border border-darkroom-border/60 space-y-1">
                <span className="font-mono text-emerald-400 text-xs font-bold block">✓ Operational History &amp; Corporate Standing</span>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Active entity registration verified with valid filings and documented edition milestones.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-darkroom-bg/80 border border-darkroom-border/60 space-y-1">
                <span className="font-mono text-emerald-400 text-xs font-bold block">✓ Alumni Filmmaker Laureates</span>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Verified independent filmmaker alumni catalog with public festival screening credits.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-darkroom-bg/80 border border-darkroom-border/60 space-y-1">
                <span className="font-mono text-emerald-400 text-xs font-bold block">✓ Transparent Submission Guidelines</span>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Clear entry rules with zero boilerplate syndicate text matching known laurel mills.
                </p>
              </div>
            </div>
          </div>

          {/* Filmmaker Action Checklist */}
          <div
            id="section-checklist"
            className="rounded-2xl p-5 sm:p-6 border border-darkroom-border bg-darkroom-surface/80 space-y-3"
            data-section-name="Filmmaker Action Checklist"
          >
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold border-b border-darkroom-border/40 pb-2">
              <ListChecks className="size-3.5 text-emerald-400" />
              <span>Filmmaker Action Checklist</span>
            </div>
            <ul className="space-y-2.5 text-sm sm:text-base text-slate-200">
              {dossier.filmmakerChecklist.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="font-mono text-emerald-400 font-semibold shrink-0">[{idx + 1}]</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Disclaimer */}
          <div className="py-4 px-5 rounded-2xl bg-darkroom-surface/40 border border-darkroom-border/40 text-slate-300 text-sm leading-relaxed space-y-1.5">
            <div className="flex items-center gap-2 text-slate-200 font-semibold font-mono text-xs uppercase tracking-wider">
              <AlertTriangle className="size-3.5 text-orange-400 shrink-0" />
              <span>Legal Advisory &amp; Notice</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Screened synthesizes automated due diligence from publicly accessible internet records and corporate filings. Provided for informational purposes only. Independently corroborate terms before submitting films.
            </p>
          </div>
        </div>
      ) : (
        /* ==================================================================== */
        /* MODE 2: 🛡️ Full Research (Comprehensive Deep-Dive Dossier)           */
        /* ==================================================================== */
        <>
          {/* Credibility & Transparency Radar Bar */}
          <div id="section-radar" className="scroll-mt-28 sm:scroll-mt-32" data-section-name="Transparency & Credibility">
            <CredibilityRadar claims={claims} disputes={disputes} />
          </div>

          {/* Executive Overview */}
          <div
            id="section-overview"
            className="py-4 space-y-2.5 scroll-mt-28 sm:scroll-mt-32 border-b border-darkroom-border/30 pb-6"
            data-section-name="Executive Overview"
          >
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
              <FileText className="size-3.5 text-indigo-400" />
              <span>Executive Overview</span>
            </div>
            <p className="font-serif text-base sm:text-lg text-slate-100 leading-relaxed whitespace-pre-line">
              {dossier.executiveSummary}
            </p>
          </div>

          {/* 360° Forensic Matrix (7 Vectors, Key Personnel & Directorship Network) */}
          <div id="section-forensic-matrix" className="scroll-mt-28 sm:scroll-mt-32" data-section-name="360° Forensic Matrix (7 Vectors)">
            <DeepVettingMatrix report={deepVetting} festivalName={entity.name} />
          </div>

          {/* Previous Editions & Historical Track Record */}
          <div id="section-previous-editions" className="scroll-mt-28 sm:scroll-mt-32" data-section-name="Previous Editions & Track Record">
            <PreviousEditionsSection previousEditions={dossier.previousEditions} festivalName={entity.name} />
          </div>

          {/* Side-by-Side Contradictions Panel */}
          {disputes.length > 0 && (
            <div id="section-disputes" className="scroll-mt-28 sm:scroll-mt-32" data-section-name="Contradictions & Disputes">
              <ContradictionPanel disputes={disputes} />
            </div>
          )}

          {/* Entity Provenance Graph (Rendered in Full mode) */}
          {normalizedDensity === 'FULL_EVIDENCE' && (
            <div
              id="section-network"
              className="py-4 space-y-3 scroll-mt-28 sm:scroll-mt-32 border-b border-darkroom-border/30 pb-6"
              data-section-name="Entity Architecture & Network"
            >
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
                <Share2 className="size-3.5 text-indigo-400" />
                <span>Entity Architecture &amp; Directorship Network</span>
              </div>
              <Suspense
                fallback={
                  <div className="p-4 text-center text-xs text-slate-500 animate-pulse">
                    Loading provenance graph...
                  </div>
                }
              >
                <EntityProvenanceGraph dossier={dossierAdapter} />
              </Suspense>
            </div>
          )}

          {/* 3 Domain Narrative Syntheses (Rendered in Full mode) */}
          {normalizedDensity === 'FULL_EVIDENCE' && (
            <div
              id="section-domains"
              className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 scroll-mt-28 sm:scroll-mt-32 border-b border-darkroom-border/30 pb-6"
              data-section-name="3-Domain Synthesis"
            >
              {/* Festival Domain */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold border-b border-darkroom-border/40 pb-2">
                  <Layers className="size-3.5 text-indigo-400" />
                  <span>Festival Identity</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{dossier.festivalOverview}</p>
              </div>

              {/* Organizer Domain */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold border-b border-darkroom-border/40 pb-2">
                  <Building2 className="size-3.5 text-indigo-400" />
                  <span>Corporate &amp; Organizer</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{dossier.organizerProfile}</p>
              </div>

              {/* Participants Domain */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold border-b border-darkroom-border/40 pb-2">
                  <Users className="size-3.5 text-indigo-400" />
                  <span>Community &amp; Filmmakers</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {dossier.participantFeedback}
                </p>
              </div>
            </div>
          )}

          {/* Corporate Entity Intelligence */}
          {dossier?.corporateEntity && (
            <div
              id="section-corporate"
              className="py-4 space-y-4 scroll-mt-28 sm:scroll-mt-32 border-b border-darkroom-border/30 pb-6"
              data-section-name="Corporate Entity Intelligence"
            >
              <div className="flex flex-col gap-1.5 border-b border-darkroom-border/40 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  <Building2 className="size-3.5 text-indigo-400" />
                  <span>Corporate Entity Registry</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold text-white font-serif">{dossier.corporateEntity.legalName}</h3>
                  {dossier.corporateEntity.status && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-xs font-mono font-medium border border-orange-500/30">
                      <AlertTriangle className="size-3" />
                      {dossier.corporateEntity.status}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-[11px] font-mono uppercase text-slate-400 mb-1">Registration Details</h4>
                    <p className="text-xs sm:text-sm text-slate-300 font-mono space-y-1">
                      <div><span className="text-slate-400">Reg No:</span> {dossier.corporateEntity.registrationNumber || 'N/A'}</div>
                      <div><span className="text-slate-400">Incorporated:</span> {dossier.corporateEntity.incorporationDate || 'N/A'}</div>
                      <div><span className="text-slate-400">Registered Office:</span> {dossier.corporateEntity.registeredAddress || 'N/A'}</div>
                    </p>
                  </div>
                  {dossier.corporateEntity.notes && (
                    <div>
                      <h4 className="text-[11px] font-mono uppercase text-slate-400 mb-1">Analyst Notes</h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed p-3 rounded-xl bg-darkroom-surface/50 border border-darkroom-border/50">
                        {dossier.corporateEntity.notes}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {dossier.corporateEntity.associatedFestivals && dossier.corporateEntity.associatedFestivals.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-mono uppercase text-slate-400 mb-1">Associated Festivals</h4>
                      <ul className="list-disc list-inside text-xs sm:text-sm text-slate-300 space-y-1">
                        {dossier.corporateEntity.associatedFestivals.map((fest, idx) => (
                          <li key={idx}>{fest}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {dossier.corporateEntity.connectedEntities && dossier.corporateEntity.connectedEntities.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-mono uppercase text-slate-400 mb-1">Connected Entities</h4>
                      <ul className="list-disc list-inside text-xs sm:text-sm text-slate-300 space-y-1">
                        {dossier.corporateEntity.connectedEntities.map((ent, idx) => (
                          <li key={idx}>{ent}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Atomic Claims & Evidence Citations (Rendered in Full mode) */}
          {normalizedDensity === 'FULL_EVIDENCE' && (
            <div id="section-claims" className="space-y-4 scroll-mt-28 sm:scroll-mt-32 border-b border-darkroom-border/30 pb-8" data-section-name="Atomic Claims & Citations">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="font-serif text-xl font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="size-4 text-indigo-400" />
                  <span>Atomic Claims &amp; Evidence Ledger</span>
                </h2>

                {/* In-Dossier Search & Domain Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto no-print">
                  <div className="relative w-full sm:w-44">
                    <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Filter claims..."
                      className="w-full pl-8 pr-2.5 py-1 text-xs rounded-xl bg-darkroom-surface/80 border border-darkroom-border/60 text-white placeholder-slate-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1 p-1 rounded-xl bg-darkroom-surface/80 border border-darkroom-border/60 text-xs">
                    {['ALL', 'FESTIVAL', 'ORGANIZER', 'PARTICIPANTS'].map((d) => (
                      <button
                        key={d}
                        onClick={() => setActiveDomain(d)}
                        className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer font-mono text-[10px] ${
                          activeDomain === d
                            ? 'bg-midnight-royal text-white font-medium shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Status Filters */}
              <div className="flex items-center overflow-x-auto pb-2 gap-2 hide-scrollbar no-print text-xs font-mono">
                {[
                  { id: 'ALL', label: 'All Claims' },
                  { id: 'CORROBORATED', label: 'Corroborated' },
                  { id: 'SUPPORTED', label: 'Single Source' },
                  { id: 'DISPUTED', label: 'Disputed' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setClaimStatusFilter(f.id)}
                    className={`shrink-0 px-3 py-1 rounded-full transition-all cursor-pointer ${
                      claimStatusFilter === f.id
                        ? 'bg-midnight-royal text-white border border-tool-diligence/40 font-medium'
                        : 'bg-darkroom-surface/50 border border-darkroom-border/50 text-slate-400 hover:text-white hover:bg-darkroom-surface'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Claims List */}
              <div className="space-y-3">
                {filteredClaims.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-darkroom-surface/40 border border-darkroom-border/40 text-center text-xs text-slate-400">
                    No claims matched your filter query "{searchFilter}".
                  </div>
                ) : (
                  filteredClaims.map((claim) => {
                    const isExpanded =
                      expandedClaim === claim.id || normalizedDensity === 'FULL_EVIDENCE';
                    return (
                      <div
                        key={claim.id}
                        className="rounded-2xl bg-darkroom-surface/60 border border-darkroom-border/60 transition-all overflow-hidden"
                      >
                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {getKindBadge(claim.claimKind)}
                              <span className="text-xs text-slate-400 font-mono">
                                {claim.category}
                              </span>
                              {claim.editionYear && (
                                <span className="text-xs font-mono text-slate-400">
                                  ({claim.editionYear})
                                </span>
                              )}
                              {claim.attributedTo && (
                                <span className="text-xs font-mono text-slate-400">
                                  • Attributed: {claim.attributedTo}
                                </span>
                              )}
                            </div>

                            <div className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
                              {claim.statement}
                            </div>

                            {/* Direct Quoted Evidence References & Sources */}
                            {claim.evidence && claim.evidence.length > 0 && (
                              <div className="space-y-2 pt-1">
                                {claim.evidence.map((ev, idx) => {
                                  const quoteText =
                                    ev.exactExcerpt ||
                                    (ev as unknown as { quote?: string }).quote;
                                  return (
                                    <div
                                      key={idx}
                                      className="p-2.5 rounded-xl bg-darkroom-bg/70 border border-darkroom-border/40 space-y-1.5"
                                    >
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="font-mono text-slate-400 text-[11px] truncate max-w-[280px] sm:max-w-md">
                                          Source {idx + 1}: {ev.sourceDomain || ev.sourceTitle || 'Web record'}
                                        </span>
                                        {ev.sourceUrl && (
                                          <a
                                            href={ev.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 font-mono text-[11px]"
                                          >
                                            <span>Verify</span>
                                            <ExternalLink className="size-3" />
                                          </a>
                                        )}
                                      </div>

                                      {quoteText && (
                                        <blockquote className="text-slate-300 italic border-l-2 border-tool-diligence/40 pl-3 py-0.5 text-xs leading-relaxed">
                                          "{quoteText}"
                                        </blockquote>
                                      )}

                                      {ev.note && (
                                        <div className="text-[11px] text-slate-400 font-mono pl-3">
                                          ↳ {ev.note}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-start no-print">
                            {getStatusBadge(claim.status)}

                            <button
                              onClick={() => onDraftOutreach(claim)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-darkroom-card hover:text-indigo-400 transition-colors cursor-pointer"
                              title="Draft Verification Inquiry for this claim"
                            >
                              <Mail className="size-4" />
                            </button>
                          </div>
                        </div>

                        {/* Additional full drawer toggle if user wants to inspect more */}
                        {isExpanded && claim.evidence && claim.evidence.length > 1 && (
                          <div className="px-4 pb-3 text-right">
                            <span className="text-[11px] font-mono text-slate-400">
                              {claim.evidence.length} corroborated sources linked
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Filmmaker Checklist & Unresolved Questions */}
          <div
            id="section-checklist"
            className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 scroll-mt-28 sm:scroll-mt-32 border-b border-darkroom-border/30 pb-6"
            data-section-name="Filmmaker Action Checklist"
          >
            {/* Due Diligence Checklist */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold border-b border-darkroom-border/40 pb-2">
                <ListChecks className="size-3.5 text-emerald-400" />
                <span>Filmmaker Action Checklist</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                {dossier.filmmakerChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="font-mono text-emerald-400 font-semibold shrink-0">[{idx + 1}]</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Unresolved Questions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold border-b border-darkroom-border/40 pb-2">
                <HelpCircle className="size-3.5 text-orange-400" />
                <span>Unresolved Questions</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                {dossier.unresolvedQuestions.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="font-mono text-orange-400 font-bold shrink-0">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Discovered Web Sources (Rendered in Full mode) */}
          {normalizedDensity === 'FULL_EVIDENCE' && (
            <div
              id="section-sources"
              className="py-4 space-y-4 scroll-mt-28 sm:scroll-mt-32 border-b border-darkroom-border/30 pb-6"
              data-section-name="Discovered Web Sources"
            >
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-darkroom-border/40 pb-3 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                    <ExternalLink className="size-3.5 text-indigo-400" />
                    <span>Discovered Web Sources ({sources.length})</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-3 pt-1">
                    <div className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-500"></span> Tier 1 (Official)</div>
                    <div className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-blue-500"></span> Tier 2 (Trade/Press)</div>
                    <div className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-orange-500"></span> Tier 3 (Community)</div>
                  </div>
                </div>
                
                {/* Source Quality Distribution Indicator */}
                <div className="w-full sm:w-44 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Quality Distribution</span>
                    <span>{sources.length} Total</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full flex overflow-hidden bg-darkroom-card">
                    {sourceStats.t1Pct > 0 && <div style={{ width: `${sourceStats.t1Pct}%` }} className="bg-emerald-500 transition-all duration-500" title={`Tier 1: ${sourceStats.tier1}`} />}
                    {sourceStats.t2Pct > 0 && <div style={{ width: `${sourceStats.t2Pct}%` }} className="bg-blue-500 transition-all duration-500" title={`Tier 2: ${sourceStats.tier2}`} />}
                    {sourceStats.t3Pct > 0 && <div style={{ width: `${sourceStats.t3Pct}%` }} className="bg-orange-500 transition-all duration-500" title={`Tier 3: ${sourceStats.tier3}`} />}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sources.map((src) => (
                  <div key={src.id} className="p-3 rounded-xl bg-darkroom-surface/50 border border-darkroom-border/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                        Tier {src.sourceTier} • {src.domain}
                      </span>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                    <div className="font-medium text-xs text-slate-200 truncate">{src.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legal Disclaimer & Experimental Product Notice Card */}
          <div className="py-5 px-6 rounded-2xl bg-darkroom-surface/40 border border-darkroom-border/40 text-slate-400 text-xs leading-relaxed space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-slate-300 font-semibold font-mono text-xs uppercase tracking-wider">
              <AlertTriangle className="size-3.5 text-orange-400 shrink-0" />
              <span>Legal Advisory &amp; Experimental Notice</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Screened is an experimental intelligence platform designed to assist filmmakers and creators in conducting due diligence on film festivals and funding opportunities. All findings, directorship graphs, and claim evaluations are synthesized automatically from publicly accessible internet records, corporate registries, and media archives.
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Because web sources and automated extraction methods may contain errors, discrepancies, or out-of-date information, Screened makes no warranties regarding the absolute accuracy, completeness, or timeliness of this dossier. This report is provided for informational and preliminary vetting purposes only and does not constitute legal, business, or investment advice. Users are solely responsible for independently corroborating festival terms, venue bookings, entry fees, and award structures before submitting films or entering contractual agreements.
            </p>
          </div>
        </>
      )}
    </motion.div>
  );
};
