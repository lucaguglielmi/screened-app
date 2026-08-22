import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  MapPin, 
  CheckSquare, 
  Square, 
  UserCheck, 
  Mail, 
  Phone, 
  AlertCircle, 
  ArrowRight, 
  Globe
} from 'lucide-react';
import { DueDiligenceArgs } from '../../../types/chat';
import { soundEffects } from '../../../utils/audio';

interface FestivalIntakeCardProps {
  args: DueDiligenceArgs;
  onLaunch: (festivalName: string, optionalUrl?: string) => void;
}

const COMMON_LOCATIONS = [
  'London, United Kingdom',
  'Edinburgh, United Kingdom',
  'Leeds, United Kingdom',
  'Manchester, United Kingdom',
  'York, United Kingdom',
  'Sheffield, United Kingdom',
  'Cannes, France',
  'Paris, France',
  'Berlin, Germany',
  'Venice, Italy',
  'Rome, Italy',
  'Toronto, Canada',
  'Park City, Utah, USA',
  'New York, USA',
  'Austin, Texas, USA',
  'Los Angeles, USA',
  'Amsterdam, Netherlands',
  'Rotterdam, Netherlands',
  'Tokyo, Japan',
  'Melbourne, Australia',
];

export const FestivalIntakeCard: React.FC<FestivalIntakeCardProps> = ({
  args,
  onLaunch,
}) => {
  const [step, setStep] = useState<'REQUIREMENTS' | 'REVIEW'>('REQUIREMENTS');
  const [festivalName, setFestivalName] = useState(args.festival_name || '');
  const [cityCountry, setCityCountry] = useState(args.city_country || '');
  const [websiteUrl, setWebsiteUrl] = useState(args.optional_url || '');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Checkbox interactions
  const [talkedToSomeone, setTalkedToSomeone] = useState(false);
  const [wasInvited, setWasInvited] = useState(false);
  const [receivedEmail, setReceivedEmail] = useState(false);
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [advertisedCinemaVenue, setAdvertisedCinemaVenue] = useState(false);
  const [waiverOffered, setWaiverOffered] = useState(false);

  // Follow-up dynamic inputs
  const [contactName, setContactName] = useState('');
  const [emailSnippet, setEmailSnippet] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const hasFollowUpRequirement = talkedToSomeone || wasInvited || receivedEmail;

  const handleProceedToReview = () => {
    if (!festivalName.trim()) return;
    soundEffects.playClick();
    setStep('REVIEW');
  };

  const handleLaunch = () => {
    soundEffects.playSuccess();
    onLaunch(festivalName.trim() || 'Festival Target', websiteUrl.trim() || undefined);
  };

  const filteredLocations = COMMON_LOCATIONS.filter((loc) =>
    loc.toLowerCase().includes(cityCountry.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl bg-card border border-emerald-500/30 rounded-2xl p-5 shadow-xl shadow-black/40 space-y-4 my-2 text-zinc-100"
    >
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase">
                Due Diligence Intake
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Active Probe
              </span>
            </div>
            <h3 className="text-base font-bold text-white font-serif">{festivalName || 'Target Film Festival'}</h3>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-[11px] text-zinc-400 font-mono">3-Domain Search</span>
        </div>
      </div>

      {/* STAGE 1: REQUIREMENTS GATHERING UI */}
      {step === 'REQUIREMENTS' && (
        <div className="space-y-4">
          {/* Target Details Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Festival Name */}
            <div>
              <label className="block text-zinc-400 font-mono mb-1">Festival Entity Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={festivalName}
                  onChange={(e) => setFestivalName(e.target.value)}
                  placeholder="e.g. Raindance Film Festival"
                  className="w-full bg-midnight border border-zinc-700/70 rounded-lg px-3 py-2 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* City / Country Autocomplete */}
            <div className="relative">
              <label className="block text-zinc-400 font-mono mb-1 flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>City & Country (Optional)</span>
              </label>
              <input
                type="text"
                value={cityCountry}
                onChange={(e) => {
                  setCityCountry(e.target.value);
                  setShowLocationSuggestions(true);
                }}
                onFocus={() => setShowLocationSuggestions(true)}
                placeholder="e.g. London, United Kingdom"
                className="w-full bg-midnight border border-zinc-700/70 rounded-lg px-3 py-2 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
              />

              {/* Location Suggestions Dropdown */}
              {showLocationSuggestions && cityCountry && filteredLocations.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-zinc-700 rounded-lg shadow-xl z-20 max-h-36 overflow-y-auto">
                  {filteredLocations.slice(0, 5).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setCityCountry(loc);
                        setShowLocationSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-emerald-500/20 hover:text-emerald-300 text-zinc-300 text-xs transition-colors flex items-center space-x-1.5"
                    >
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{loc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Website URL */}
          <div className="text-xs">
            <label className="block text-zinc-400 font-mono mb-1 flex items-center space-x-1">
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>Official Festival Website / Listing URL (Optional)</span>
            </label>
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://festival-official-site.org"
              className="w-full bg-midnight border border-zinc-700/70 rounded-lg px-3 py-2 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Interactive Checkbox Matrix */}
          <div className="space-y-2 text-xs">
            <label className="block text-zinc-400 font-mono">Check if any apply to your inquiry:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTalkedToSomeone(!talkedToSomeone)}
                className={`flex items-center space-x-2 p-2 rounded-lg border text-left transition-all ${
                  talkedToSomeone
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                    : 'bg-midnight/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                {talkedToSomeone ? <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-zinc-500 shrink-0" />}
                <span>I talked to a festival organizer / team member</span>
              </button>

              <button
                type="button"
                onClick={() => setWasInvited(!wasInvited)}
                className={`flex items-center space-x-2 p-2 rounded-lg border text-left transition-all ${
                  wasInvited
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                    : 'bg-midnight/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                {wasInvited ? <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-zinc-500 shrink-0" />}
                <span>I was invited to submit directly</span>
              </button>

              <button
                type="button"
                onClick={() => setReceivedEmail(!receivedEmail)}
                className={`flex items-center space-x-2 p-2 rounded-lg border text-left transition-all ${
                  receivedEmail
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                    : 'bg-midnight/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                {receivedEmail ? <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-zinc-500 shrink-0" />}
                <span>I received an email solicitation</span>
              </button>

              <button
                type="button"
                onClick={() => setWaiverOffered(!waiverOffered)}
                className={`flex items-center space-x-2 p-2 rounded-lg border text-left transition-all ${
                  waiverOffered
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                    : 'bg-midnight/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                {waiverOffered ? <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-zinc-500 shrink-0" />}
                <span>Offered discount / entry fee waiver</span>
              </button>

              <button
                type="button"
                onClick={() => setAlreadyPaid(!alreadyPaid)}
                className={`flex items-center space-x-2 p-2 rounded-lg border text-left transition-all ${
                  alreadyPaid
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                    : 'bg-midnight/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                {alreadyPaid ? <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-zinc-500 shrink-0" />}
                <span>I already paid submission / trophy fee</span>
              </button>

              <button
                type="button"
                onClick={() => setAdvertisedCinemaVenue(!advertisedCinemaVenue)}
                className={`flex items-center space-x-2 p-2 rounded-lg border text-left transition-all ${
                  advertisedCinemaVenue
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                    : 'bg-midnight/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                {advertisedCinemaVenue ? <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-zinc-500 shrink-0" />}
                <span>Advertised physical cinema theater</span>
              </button>
            </div>
          </div>

          {/* Dynamic Follow-Up Questions Section */}
          <AnimatePresence>
            {hasFollowUpRequirement && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 rounded-xl bg-midnight/90 border border-emerald-500/20 space-y-2.5 overflow-hidden text-xs"
              >
                <div className="flex items-center space-x-2 text-emerald-400 font-mono text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Follow-Up Probe: Interaction Intelligence</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-zinc-400 mb-1 flex items-center space-x-1">
                      <UserCheck className="w-3 h-3 text-emerald-400" />
                      <span>Who did you talk to? (Person / Title)</span>
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Program Director Alex Mercer"
                      className="w-full bg-void border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>Phone Number / WhatsApp (Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+44 7700 900077"
                      className="w-full bg-void border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 flex items-center space-x-1">
                    <Mail className="w-3 h-3 text-emerald-400" />
                    <span>Paste Email Text / Invitation Snippet (Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={emailSnippet}
                    onChange={(e) => setEmailSnippet(e.target.value)}
                    placeholder="Paste the invitation message or waiver code..."
                    className="w-full bg-void border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stage 1 Action Trigger */}
          <div className="pt-2">
            <button
              onClick={handleProceedToReview}
              disabled={!festivalName.trim()}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs font-mono shadow-lg shadow-emerald-950/50 hover:shadow-emerald-600/30 transition-all group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Review Investigation Plan (Stage 2)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: REVIEW & LAUNCH CONFIRMATION UI (Redirects to Due Diligence Workspace) */}
      {step === 'REVIEW' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
              <span className="font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Stage 2: Investigation Parameters Ready
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                Redirect to Due Diligence
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300">
              <div>
                <span className="text-zinc-500 font-mono block">Target Entity:</span>
                <strong className="text-white text-sm">{festivalName}</strong>
              </div>
              <div>
                <span className="text-zinc-500 font-mono block">Jurisdiction:</span>
                <span className="text-zinc-200">{cityCountry || 'Global / UK Priority'}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-mono block">Domain Source:</span>
                <span className="text-zinc-200 truncate">{websiteUrl || 'Autonomous Discovery'}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-mono block">Target Page:</span>
                <span className="text-emerald-400 font-mono">Due Diligence Workspace</span>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-500/20">
              <span className="text-zinc-400 font-mono block mb-1">Autonomous Inspection Directives:</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded bg-midnight border border-zinc-700 text-zinc-200 text-[11px]">
                  ✓ Municipal Theater Leases
                </span>
                <span className="px-2 py-0.5 rounded bg-midnight border border-zinc-700 text-zinc-200 text-[11px]">
                  ✓ UK Companies House Registry
                </span>
                <span className="px-2 py-0.5 rounded bg-midnight border border-zinc-700 text-zinc-200 text-[11px]">
                  ✓ Historical Fee Escalation
                </span>
                {hasFollowUpRequirement && (
                  <span className="px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-[11px]">
                    ✓ Outreach Forensics ({contactName || 'Staff'})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setStep('REQUIREMENTS');
              }}
              className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-midnight hover:bg-surface text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              ‹ Edit Requirements
            </button>
            <button
              type="button"
              onClick={handleLaunch}
              className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs font-mono shadow-lg shadow-emerald-950/50 hover:shadow-emerald-600/30 transition-all group cursor-pointer"
            >
              <span>Launch Due Diligence & Open Workspace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
