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
  Globe,
} from 'lucide-react';
import { DueDiligenceArgs } from '../../../types/chat';
import { soundEffects } from '../../../utils/audio';
import { AnimatedFocusWrapper } from '../../animations/AnimatedFocusWrapper';

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

export const FestivalIntakeCard: React.FC<FestivalIntakeCardProps> = ({ args, onLaunch }) => {
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


  const handleLaunch = () => {
    soundEffects.playSuccess();
    onLaunch(festivalName.trim() || 'Festival Target', websiteUrl.trim() || undefined);
  };

  const filteredLocations = COMMON_LOCATIONS.filter((loc) =>
    loc.toLowerCase().includes(cityCountry.toLowerCase()),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl bg-darkroom-surface rounded-2xl p-6 shadow-2xl space-y-4 my-2 text-zinc-100"
    >
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase">
                Due Diligence Intake
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-mono font-semibold">
                Active Probe
              </span>
            </div>
            <h3 className="text-base font-bold text-white font-serif">
              {festivalName || 'Target Film Festival'}
            </h3>
          </div>
        </div>
        <div className="text-right hidden sm:block">
        </div>
      </div>

      {/* REQUIREMENTS GATHERING UI */}
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
                  className="w-full bg-darkroom-card rounded-xl px-3.5 py-2.5 text-white text-base placeholder:text-zinc-500 focus:outline-none focus:bg-paper-border focus:bg-darkroom-border"
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
                className="w-full bg-darkroom-card rounded-xl px-3.5 py-2.5 text-white text-base placeholder:text-zinc-500 focus:outline-none focus:bg-paper-border focus:bg-darkroom-border"
              />

              {/* Location Suggestions Dropdown */}
              {showLocationSuggestions && cityCountry && filteredLocations.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-darkroom-surface rounded-xl shadow-2xl z-20 max-h-36 overflow-y-auto p-1">
                  {filteredLocations.slice(0, 5).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setCityCountry(loc);
                        setShowLocationSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-darkroom-card hover:text-emerald-300 text-zinc-300 text-xs rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
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
              className="w-full bg-darkroom-card rounded-xl px-3.5 py-2.5 text-white text-base placeholder:text-zinc-500 focus:outline-none focus:bg-paper-border focus:bg-darkroom-border"
            />
          </div>

          {/* Interactive Checkbox Matrix */}
          <div className="space-y-2 text-xs">
            <label className="block text-zinc-400 font-mono">
              Check if any apply to your inquiry:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTalkedToSomeone(!talkedToSomeone)}
                className={`flex items-center space-x-2.5 py-1.5 text-left transition-all cursor-pointer ${
                  talkedToSomeone
                    ? 'text-emerald-300 font-semibold'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {talkedToSomeone ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-zinc-500 shrink-0" />
                )}
                <span>I talked to a festival organizer / team member</span>
              </button>

              <button
                type="button"
                onClick={() => setWasInvited(!wasInvited)}
                className={`flex items-center space-x-2.5 py-1.5 text-left transition-all cursor-pointer ${
                  wasInvited
                    ? 'text-emerald-300 font-semibold'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {wasInvited ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-zinc-500 shrink-0" />
                )}
                <span>I was invited to submit directly</span>
              </button>

              <button
                type="button"
                onClick={() => setReceivedEmail(!receivedEmail)}
                className={`flex items-center space-x-2.5 py-1.5 text-left transition-all cursor-pointer ${
                  receivedEmail
                    ? 'text-emerald-300 font-semibold'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {receivedEmail ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-zinc-500 shrink-0" />
                )}
                <span>I received an email solicitation</span>
              </button>

              <button
                type="button"
                onClick={() => setWaiverOffered(!waiverOffered)}
                className={`flex items-center space-x-2.5 py-1.5 text-left transition-all cursor-pointer ${
                  waiverOffered
                    ? 'text-emerald-300 font-semibold'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {waiverOffered ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-zinc-500 shrink-0" />
                )}
                <span>Offered discount / entry fee waiver</span>
              </button>

              <button
                type="button"
                onClick={() => setAlreadyPaid(!alreadyPaid)}
                className={`flex items-center space-x-2.5 py-1.5 text-left transition-all cursor-pointer ${
                  alreadyPaid
                    ? 'text-emerald-300 font-semibold'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {alreadyPaid ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-zinc-500 shrink-0" />
                )}
                <span>I already paid submission / trophy fee</span>
              </button>

              <button
                type="button"
                onClick={() => setAdvertisedCinemaVenue(!advertisedCinemaVenue)}
                className={`flex items-center space-x-2.5 py-1.5 text-left transition-all cursor-pointer ${
                  advertisedCinemaVenue
                    ? 'text-emerald-300 font-semibold'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {advertisedCinemaVenue ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-zinc-500 shrink-0" />
                )}
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
                className="p-4 rounded-2xl bg-darkroom-card space-y-3 overflow-hidden text-xs"
              >
                <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>Follow-Up Probe: Interaction Intelligence</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      className="w-full bg-darkroom-surface rounded-xl px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none text-base"
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
                      className="w-full bg-darkroom-surface rounded-xl px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 flex items-center space-x-1">
                    <Mail className="w-3 h-3 text-emerald-400" />
                    <span>Paste Email Text / Invitation Snippet (Optional)</span>
                  </label>
                  <AnimatedFocusWrapper borderRadius={12}>
                    <textarea
                      rows={2}
                      value={emailSnippet}
                      onChange={(e) => setEmailSnippet(e.target.value)}
                      placeholder="Paste the invitation message or waiver code..."
                      className="w-full bg-darkroom-surface rounded-xl px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none text-base font-mono"
                    />
                  </AnimatedFocusWrapper>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Trigger */}
          <div className="pt-2">
            <button
              onClick={handleLaunch}
              disabled={!festivalName.trim()}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs font-mono shadow-lg shadow-emerald-950/50 hover:shadow-emerald-600/30 transition-all group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Start Investigation</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>


    </motion.div>
  );
};
