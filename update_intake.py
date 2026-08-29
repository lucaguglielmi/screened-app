import re

with open('frontend/src/components/chat/tools/FestivalIntakeCard.tsx', 'r') as f:
    content = f.read()

# 1. Replace the state block
state_pattern = r"// Checkbox interactions.*?const hasFollowUpRequirement = [^;]+;"
new_state = """// Inquiry Checkboxes
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
    return prompts.join('\\n');
  };"""
content = re.sub(state_pattern, new_state, content, flags=re.DOTALL)

# 2. Replace the UI block
ui_pattern = r"<div className=\"space-y-2 text-xs\">\s*<label className=\"block text-zinc-400 font-mono\">\s*Check if any apply to your inquiry:\s*</label>.*?</AnimatePresence>"

new_ui = """<div className="space-y-2 text-xs relative">
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
          </AnimatePresence>"""

content = re.sub(ui_pattern, new_ui, content, flags=re.DOTALL)

with open('frontend/src/components/chat/tools/FestivalIntakeCard.tsx', 'w') as f:
    f.write(content)
print("Updated successfully.")
