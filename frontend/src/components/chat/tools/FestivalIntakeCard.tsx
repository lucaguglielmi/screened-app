import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  MapPin,
  CheckSquare,
  Square,
  
  
  
  AlertCircle,
  ArrowRight,
  Globe, ChevronDown,
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

  // Inquiry Checkboxes
  const [selectedInquiries, setSelectedInquiries] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [clarificationText, setClarificationText] = useState('');

  const INQUIRY_OPTIONS = [
    'Talked to organizer / team member',
    'Received email invitation',
    'Offered discount / fee waiver',
    'Already paid submission fee'
  ];

  const toggleInquiry = (opt: string) => {
    if (selectedInquiries.includes(opt)) {
      setSelectedInquiries(selectedInquiries.filter(o => o !== opt));
    } else {
      setSelectedInquiries([...selectedInquiries, opt]);
    }
  };

  const hasFollowUpRequirement = selectedInquiries.length > 0;

  const getClarificationPlaceholder = () => {
    const prompts = [];
    if (selectedInquiries.includes('Talked to organizer / team member')) prompts.push('Who did you talk to (name, title) and what did they say?');
    if (selectedInquiries.includes('Received email invitation')) prompts.push('Please paste the email snippet or invitation text.');
    if (selectedInquiries.includes('Offered discount / fee waiver')) prompts.push('What was the waiver code or discount amount?');
    if (selectedInquiries.includes('Already paid submission fee')) prompts.push('How much did you pay and what was it for?');
    return prompts.join('\n');
  };


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
          <div className="space-y-2 text-xs relative">
            <label className="block text-zinc-400 font-mono">
              Check if any apply to your inquiry:
            </label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between bg-darkroom-surface border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-300 hover:text-white hover:border-zinc-600 transition-all focus:outline-none"
            >
              <span>{selectedInquiries.length > 0 ? `${selectedInquiries.length} selected` : 'Select criteria...'}</span>
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            </button>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute z-10 w-full mt-2 py-2 bg-darkroom-card border border-darkroom-border rounded-xl shadow-2xl space-y-1"
                >
                  {INQUIRY_OPTIONS.map(opt => {
                    const isSelected = selectedInquiries.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleInquiry(opt)}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-left transition-colors ${
                          isSelected ? 'text-emerald-300 bg-emerald-500/10' : 'text-zinc-300 hover:bg-darkroom-surface hover:text-white'
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-500 shrink-0" />
                        )}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dynamic Follow-Up Questions Section */}
          <AnimatePresence>
            {hasFollowUpRequirement && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl bg-darkroom-card space-y-3 overflow-hidden text-xs mt-4"
              >
                <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Follow-Up Probe: Clarification Required</span>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-2 flex items-center space-x-1">
                    <span>Please provide more details based on your selection(s):</span>
                  </label>
                  <AnimatedFocusWrapper borderRadius={12}>
                    <textarea
                      rows={4}
                      value={clarificationText}
                      onChange={(e) => setClarificationText(e.target.value)}
                      placeholder={getClarificationPlaceholder()}
                      className="w-full bg-darkroom-surface rounded-xl px-3 py-2 text-white placeholder:text-zinc-500/70 focus:outline-none text-sm font-sans resize-none"
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
