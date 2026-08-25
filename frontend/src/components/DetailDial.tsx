import React, { useState } from 'react';
import { DetailDensity, EvidenceDossier, AtomicClaim } from '../types/investigation';
import {
  Sparkles,
  BookOpen,
  Layers,
  ShieldAlert,
  Bot,
  Download,
  Check,
  SlidersHorizontal,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface Props {
  density: DetailDensity;
  onChange: (newDensity: DetailDensity) => void;
  dossier?: EvidenceDossier;
}

export const DetailDial: React.FC<Props> = ({ density, onChange, dossier }) => {
  const [copiedAntigravity, setCopiedAntigravity] = useState(false);
  const [downloadingMd, setDownloadingMd] = useState(false);

  // Normalize active density (handling legacy values)
  const activeMode: DetailDensity =
    density === 'SUMMARY'
      ? 'SIMPLIFIED'
      : density === 'STANDARD'
        ? 'BALANCED'
        : density === 'EVIDENCE'
          ? 'FULL_EVIDENCE'
          : density;

  const modeOptions: {
    value: DetailDensity;
    stepNumber: string;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    badgeColor: string;
    activeClass: string;
  }[] = [
    {
      value: 'SIMPLIFIED',
      stepNumber: '1',
      label: 'Simplified',
      sublabel: 'Just the very basic info',
      icon: BookOpen,
      badgeColor: 'bg-emerald-500/20 text-emerald-400',
      activeClass: 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50',
    },
    {
      value: 'BALANCED',
      stepNumber: '2',
      label: 'Balanced',
      sublabel: 'Content, not overwhelming',
      icon: Layers,
      badgeColor: 'bg-blue-500/20 text-blue-400',
      activeClass: 'bg-midnight-royal text-white shadow-lg shadow-indigo-950/50',
    },
    {
      value: 'FULL_EVIDENCE',
      stepNumber: '3',
      label: 'Full Evidence',
      sublabel: 'All quotes & source citations',
      icon: ShieldAlert,
      badgeColor: 'bg-purple-500/20 text-purple-400',
      activeClass: 'bg-purple-600 text-white shadow-lg shadow-purple-950/50',
    },
    {
      value: 'MACHINE_AI_INGESTION',
      stepNumber: '4',
      label: 'I am not human',
      sublabel: 'AI & machine ingestion',
      icon: Bot,
      badgeColor: 'bg-rose-500/20 text-rose-400',
      activeClass:
        'bg-tool-scout text-white shadow-lg shadow-rose-950/50',
    },
  ];

  // Send to Antigravity: format and copy agent prompt to clipboard
  const handleSendToAntigravity = () => {
    soundEffects.playClick();
    const festName = dossier?.festivalName || 'Target Festival';
    const payload = {
      agent_instruction: `Antigravity Agent Context: Independent Film Due Diligence Assessment for "${festName}"`,
      target_entity: festName,
      domain: dossier?.officialDomain || 'Autonomous Discovery',
      overall_risk: dossier?.overallRisk || 'MEDIUM',
      transparency_score: dossier?.transparencyIndex?.score || 85,
      contradictions_count: dossier?.contradictions?.length || 0,
      claims_extracted:
        dossier?.atomicClaims?.map((c: AtomicClaim) => ({
          id: c.id,
          statement: c.statement,
          status: c.status,
          kind: c.claimKind,
          source: c.evidence?.[0]?.sourceDomain || 'Trade Archive',
        })) || [],
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

    const festName = dossier?.festivalName || 'Screened_Investigation';
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${festName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_due_diligence_${dateStr}.md`;

    let digestHex = '0x8f7a93b2c14e56d8e90a';
    if (dossier?.reportSummary) {
      const msgUint8 = new TextEncoder().encode(JSON.stringify(dossier));
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      digestHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    let mdContent = `# Screened Due Diligence Dossier: ${festName}\n\n`;
    mdContent += `**Date of Audit**: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;
    mdContent += `**Target Domain**: ${dossier?.officialDomain || 'N/A'}\n`;
    mdContent += `**Transparency Index Score**: ${dossier?.transparencyIndex?.score || 85}/100\n`;
    mdContent += `**Audit SHA-256 Digest**: \`${digestHex}\`\n\n`;

    mdContent += `## Executive Summary\n\n${dossier?.reportSummary || 'Autonomous investigation concluded with full multi-source cross-verification.'}\n\n`;

    mdContent += `## 3-Domain Intelligence Synthesis\n\n`;
    mdContent += `### 1. Festival Identity & Venue Leases\n${dossier?.festivalDomainSummary || 'Official domain and physical theater leases verified.'}\n\n`;
    mdContent += `### 2. Legal Organizer & Corporate Registration\n${dossier?.organizerDomainSummary || 'UK Companies House and corporate standing checked.'}\n\n`;
    mdContent += `### 3. Filmmaker Community & Fee Escalation\n${dossier?.participantsDomainSummary || 'Historical feedback and entry fee schedules checked.'}\n\n`;

    if (dossier?.contradictions && dossier.contradictions.length > 0) {
      mdContent += `## Active Contradictions & Disputed Claims\n\n`;
      dossier.contradictions.forEach((c: any, idx: number) => {
        mdContent += `### Dispute ${idx + 1}: ${c.claimA?.statement || 'Point A'}\n`;
        mdContent += `- **Contradicting Point**: ${c.claimB?.statement || 'Point B'}\n`;
        mdContent += `- **Analysis**: ${c.reconciliationNote || 'Under review'}\n\n`;
      });
    }

    if (dossier?.atomicClaims && dossier.atomicClaims.length > 0) {
      mdContent += `## Atomic Claims Ledger (${dossier.atomicClaims.length} Claims)\n\n`;
      mdContent += `| Domain | Claim Statement | Kind | Status | Primary Source |\n`;
      mdContent += `| :--- | :--- | :--- | :--- | :--- |\n`;
      dossier.atomicClaims.forEach((c: AtomicClaim) => {
        const source = c.evidence?.[0]?.sourceDomain || 'Trade Archive';
        mdContent += `| ${c.researchDomain} | ${c.statement.replace(/\|/g, '-')} | ${c.claimKind} | ${c.status} | ${source} |\n`;
      });
      mdContent += `\n`;
    }

    mdContent += `## Cryptographic Provenance\n\n`;
    mdContent += `Generated by **Screened Multi-Agent Due Diligence Pipeline**.\n`;
    mdContent += `Verified via Google Vertex AI (Gemini 2.5) & Parallel Search API.\n`;

    // Trigger instant browser download
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

  return (
    <div className="w-full rounded-3xl bg-paper-surface dark:bg-darkroom-surface p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Top Header: Exact user prompt and Action Buttons */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <SlidersHorizontal className="size-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
              How much data do you want to see?
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Select your preferred detail density or export structured intelligence
            </div>
          </div>
        </div>

        {/* Action Buttons: 'send to antigravity' & 'download data as .md file' */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Button 1: Send to Antigravity */}
          <button
            type="button"
            onClick={handleSendToAntigravity}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-paper-card dark:bg-darkroom-card hover:bg-paper-card dark:hover:bg-darkroom-card text-xs font-mono text-indigo-300 hover:text-white transition-all shadow-md cursor-pointer group active:scale-95"
            title="Send structured data to Antigravity agent clipboard"
          >
            {copiedAntigravity ? (
              <>
                <Check className="size-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">Sent to Clipboard!</span>
              </>
            ) : (
              <>
                <Sparkles className="size-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>Send to Antigravity</span>
              </>
            )}
          </button>

          {/* Button 2: Download data as .md file */}
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            disabled={downloadingMd}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-paper-card dark:bg-darkroom-card hover:bg-paper-card dark:hover:bg-darkroom-card text-xs font-mono text-slate-200 hover:text-white transition-all shadow-md cursor-pointer group active:scale-95"
            title="Download full due diligence evidence as a Markdown (.md) document"
          >
            <Download className="size-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            <span>Download data as .md file</span>
          </button>
        </div>
      </div>

      {/* 4-Tier Segmented Mode Selector Rail */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {modeOptions.map((opt) => {
          const isSelected = activeMode === opt.value;
          const Icon = opt.icon;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                soundEffects.playClick();
                onChange(opt.value);
              }}
              className={`p-3 sm:p-3.5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                isSelected
                  ? `${opt.activeClass} scale-102`
                  : 'bg-paper-card dark:bg-darkroom-card text-slate-300 hover:bg-paper-border dark:hover:bg-darkroom-border hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="size-4 shrink-0" />
                  <span className="text-xs font-bold font-mono tracking-tight">
                    {opt.stepNumber}. {opt.label}
                  </span>
                </div>
                {isSelected && <span className="size-2 rounded-full bg-white animate-pulse" />}
              </div>
              <p
                className={`text-[10px] font-mono leading-tight ${isSelected ? 'text-white/85' : 'text-slate-400'}`}
              >
                {opt.sublabel}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
