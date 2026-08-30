import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Globe,
  Film,
  AlertTriangle,
  CreditCard,
  PhoneCall,
  Search,
  Award,
  Sparkles,
  ArrowRight,
  Command as CommandIcon,
} from 'lucide-react';
import { VerifiedTick } from './ui/VerifiedTick';

interface Props {
  onNavigateToDiligence: () => void;
  onNavigateToDesk: () => void;
  onOpenCommandPalette?: () => void;
}

const SCAM_ARCHETYPES = [
  {
    title: 'Phantom Screening Galas',
    icon: Film,
    subtitle: 'Claiming West End & Landmark Cinemas with Zero Live Audience',
    risk: 'EXTREME',
    description:
      'Organizers advertise prestigious theatrical venues (e.g. BFI Southbank, Curzon Soho, TCL Chinese Theater) in entry promotional materials, only to quietly email an unlisted private Vimeo/YouTube link 48 hours prior with zero physical screening.',
    tellSigns: [
      'Venue name appears in promo graphics but has no box office event listing on the theater’s website',
      'No physical theater auditorium or screening schedule published 2 weeks prior to event date',
      'Filmmakers asked to accept "digital streaming laurels" without physical DCP projection',
    ],
  },
  {
    title: 'The Laurel Mill & Vanity Trophy Trap',
    icon: Award,
    subtitle: '95%+ Acceptance Rates Solely to Upsell £150+ Trophies & Certificates',
    risk: 'HIGH',
    description:
      'Festivals that accept virtually every submission within 6 to 24 hours regardless of quality. The business model is not cinema curation, but aggressively upselling custom physical laurel statues (£120–£250), gold certificates, and paid PR interview packages.',
    tellSigns: [
      'Acceptance email arrives within hours of submitting, before review deadlines pass',
      'Email contains prominent payment links for physical laurel statuettes, trophies, and badges',
      'Over 80+ obscure award categories (e.g. "Best 1st-Time Director under 30 in a Drama Short")',
    ],
  },
  {
    title: 'Extractive Fee Escalations & AI Bot Feedback',
    icon: AlertTriangle,
    subtitle: '£80+ Late Fees with Generic Automated Rejection Copy',
    risk: 'HIGH',
    description:
      'Submission fees start modest (£15) and surge 300%+ into late submission windows (£75–£110). Submissions requesting paid "Jury Written Feedback" (£60+) receive generic, copy-pasted AI-generated praise paragraphs with zero scene-specific feedback.',
    tellSigns: [
      'Submission fee tiers surge steeply into closing deadlines',
      'Paid jury feedback consists of generic compliments with zero character or plot citations',
      'Disavowed corporate sponsorships (ARRI, Sony, BAFTA logos displayed without permission)',
    ],
  },
  {
    title: 'Ghost Organizers & Shell Entities',
    icon: Building2,
    subtitle: 'Dissolved Companies with Impunity and Zero Refund Accountability',
    risk: 'CRITICAL',
    description:
      'Operations run by dissolved Companies House entities or anonymous offshore shell corporations with no named directors, shielding operators from refund claims, cancellation liabilities, or legal recourse.',
    tellSigns: [
      'Operating company name is missing or dissolved on national corporate registries',
      'Directors hide behind unmonitored generic web contact forms and ProtonMail addresses',
      'Zero documented public presence or legitimate film industry credits for festival founders',
    ],
  },
];

const DEFENSE_STEPS = [
  {
    step: 1,
    title: 'The Direct Box Office Verification',
    icon: PhoneCall,
    action:
      'Never rely on flyer graphics. Call or email the advertised cinema theater directly and ask their private events coordinator if the festival holds a signed private hire booking manifest for the advertised dates.',
  },
  {
    step: 2,
    title: 'Corporate Officer & Registry Audit',
    icon: Building2,
    action:
      'Look up the operating company on UK Companies House or OpenCorporates. Verify the company is "Active", check for compulsory strike-off notices, and ensure directors are verifiable industry professionals.',
  },
  {
    step: 3,
    title: 'Domain Age & WHOIS Provenance Check',
    icon: Globe,
    action:
      'Inspect domain registration records. Be cautious of festivals claiming "12th Annual International Edition" whose web domain was registered 4 months ago with drop-catch WHOIS privacy guards.',
  },
  {
    step: 4,
    title: 'Alumni Filmography & IMDb Tracing',
    icon: Search,
    action:
      'Trace previous edition award winners. Check if winning short films and directors exist on IMDb with legitimate filmography credits and public premiere photos from physical venues.',
  },
  {
    step: 5,
    title: 'Sponsorship & Accreditation Validation',
    icon: ShieldCheck,
    action:
      'If a festival claims BAFTA-qualifying status or official ARRI/Sony partnerships, cross-examine official accreditation directories (e.g. BAFTA Qualifying Short Film Festivals list) to verify status.',
  },
];

export const FestivalProtectionGuide: React.FC<Props> = ({
  onNavigateToDiligence,
  onNavigateToDesk,
  onOpenCommandPalette,
}) => {
  return (
    <div className="w-full min-h-screen bg-midnight-void text-slate-100 px-4 py-12 sm:py-20 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-20">
        {/* Editorial Header */}
        <section className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-semibold uppercase tracking-widest">
            <ShieldAlert className="size-3.5 text-orange-400" />
            <span>Empirical Filmmaker Self-Defense Guide</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            How to Protect Yourself: Festival Due Diligence Manual
          </h1>
          <p className="text-lg sm:text-xl text-slate-200 leading-relaxed max-w-3xl mx-auto font-normal">
            Independent filmmakers spend thousands in hard-earned budget on submission fees every season.
            This manual provides actionable intelligence to protect your films against{' '}
            <strong className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded">predatory laurel mills</strong>,{' '}
            <strong className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded">phantom venues</strong>, and extractive schemes.
          </p>
        </section>

        {/* 4 Primary Scam Archetypes */}
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <span className="text-slate-400 font-mono uppercase tracking-widest text-xs font-semibold">
              Forensic Pattern Recognition
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              The 4 Major Festival Scam Archetypes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SCAM_ARCHETYPES.map((arch, idx) => {
              const Icon = arch.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl p-6 sm:p-7 border border-darkroom-border bg-darkroom-surface/90 hover:border-zinc-700/80 shadow-xl space-y-5 flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 shrink-0">
                        <Icon className="size-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30 font-semibold">
                        {arch.risk} RISK
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold font-serif text-white">{arch.title}</h3>
                      <p className="text-xs text-indigo-300 font-mono mt-0.5">{arch.subtitle}</p>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{arch.description}</p>
                  </div>

                  <div className="pt-3 border-t border-darkroom-border/60 space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                      Tell-Tale Warning Signs:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {arch.tellSigns.map((sign, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2">
                          <AlertTriangle className="size-3 text-orange-400 shrink-0 mt-0.5" />
                          <span>{sign}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5-Step Self-Defense Protocol */}
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <span className="text-slate-400 font-mono uppercase tracking-widest text-xs font-semibold">
              Actionable Protocol
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              The 5-Step Self-Defense Protocol
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              Run this 5-minute pre-submission checklist before paying fees on FilmFreeway, Festhome, or direct portals.
            </p>
          </div>

          <div className="space-y-4">
            {DEFENSE_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="rounded-2xl p-5 sm:p-6 border border-darkroom-border bg-darkroom-surface/90 hover:border-zinc-700/80 shadow-md flex items-start gap-4 transition-all"
                >
                  <div className="size-10 rounded-xl bg-midnight-royal/40 border border-tool-diligence/30 text-white font-mono font-bold flex items-center justify-center shrink-0">
                    0{step.step}
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-indigo-400 shrink-0" />
                      <h3 className="text-sm sm:text-base font-bold text-white">{step.title}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">{step.action}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Chargeback & Dispute Playbook */}
        <section className="rounded-3xl p-6 sm:p-8 border border-darkroom-border bg-darkroom-surface/95 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-darkroom-border pb-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <CreditCard className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-white">
                Chargeback &amp; Dispute Playbook
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                How to recover submission fees when a festival commits material misrepresentation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase font-bold text-white flex items-center gap-1.5">
                <VerifiedTick size={14} />
                <span>1. Preserve Immutable Evidence Immediately</span>
              </h4>
              <p>
                Take full-page screenshots of the festival’s submission page claiming physical venues and dates before they modify terms. Save confirmation emails and promotional flyers to a dedicated archive.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase font-bold text-white flex items-center gap-1.5">
                <VerifiedTick size={14} />
                <span>2. File Written Platform Dispute</span>
              </h4>
              <p>
                File an official dispute with FilmFreeway or the payment provider citing "Material Failure of Consideration" (the screening format delivered was not the theatrical exhibition promised).
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase font-bold text-white flex items-center gap-1.5">
                <VerifiedTick size={14} />
                <span>3. Credit Card Bank Chargeback (UK Section 75)</span>
              </h4>
              <p>
                If the organizer refuses refunds, contact your card issuer to request a chargeback under "Service Not as Described" or UK Consumer Credit Act Section 75 for misrepresentation.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase font-bold text-white flex items-center gap-1.5">
                <VerifiedTick size={14} />
                <span>4. Report to Film Industry Watchdogs</span>
              </h4>
              <p>
                Submit documentation to Screened, BIFA, and community filmmaker watchdog groups to alert fellow directors and prevent syndicate recurrence.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-indigo-950/80 via-darkroom-surface to-darkroom-card border border-indigo-500/30 text-center space-y-6 shadow-2xl">
          <div className="space-y-2 max-w-xl mx-auto">
            <Sparkles className="size-6 text-indigo-400 mx-auto" />
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Vetting a Festival Right Now?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Run an autonomous multi-vector due diligence audit with Screened. We cross-examine corporate filings, venue manifests, and filmmaker sentiment in seconds.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onNavigateToDiligence}
              className="px-5 py-3 rounded-xl bg-midnight-royal hover:bg-indigo-600 text-white text-xs font-mono font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/25 cursor-pointer active:scale-95"
            >
              <span>Launch Festival Due Diligence</span>
              <ArrowRight className="size-4" />
            </button>

            <button
              type="button"
              onClick={onNavigateToDesk}
              className="px-4 py-3 rounded-xl bg-darkroom-card hover:bg-darkroom-surface border border-darkroom-border text-slate-300 hover:text-white text-xs font-mono flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className="size-3.5 text-indigo-400" />
              <span>Ask Screened AI</span>
            </button>

            {onOpenCommandPalette && (
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="px-4 py-3 rounded-xl bg-darkroom-card hover:bg-darkroom-surface border border-darkroom-border text-slate-300 hover:text-white text-xs font-mono flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <CommandIcon className="size-3.5" />
                <span>Quick Actions (⌘K)</span>
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
