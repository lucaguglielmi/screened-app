import re

with open('frontend/src/components/EvidenceDossier.tsx', 'r') as f:
    content = f.read()

# 1. Add state for the new menu
state_injection = """  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isNewSearchMenuOpen, setIsNewSearchMenuOpen] = useState(false);
  const newSearchMenuRef = useRef<HTMLDivElement>(null);"""
content = re.sub(r"  const \[isActionsMenuOpen, setIsActionsMenuOpen\] = useState\(false\);", state_injection, content)

# 2. Add effect for click outside
effect_injection = """  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setIsActionsMenuOpen(false);
      }
      if (newSearchMenuRef.current && !newSearchMenuRef.current.contains(event.target as Node)) {
        setIsNewSearchMenuOpen(false);
      }
    };
    if (isActionsMenuOpen || isNewSearchMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActionsMenuOpen, isNewSearchMenuOpen]);"""
content = re.sub(
    r"  useEffect\(\(\) => \{\n    const handleClickOutside.*?  \}, \[isActionsMenuOpen\]\);",
    effect_injection,
    content,
    flags=re.DOTALL
)

# 3. Replace the button UI
btn_pattern = r"      \{\/\* Absolute \"New Screen\" button placed outside the card \*\/.*?      </div>"

new_btn = """      {/* Absolute "New Screen" button placed outside the card */}
      <div className="flex justify-end mb-2 relative" ref={newSearchMenuRef}>
        <button
          onClick={() => {
            soundEffects.playClick();
            setIsNewSearchMenuOpen(!isNewSearchMenuOpen);
          }}
          className={`p-2 rounded-full transition-colors cursor-pointer shadow-sm active:scale-95 border ${isNewSearchMenuOpen ? 'bg-darkroom-surface text-white border-darkroom-border' : 'hover:bg-darkroom-surface text-slate-400 hover:text-white border-transparent hover:border-darkroom-border'}`}
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
      </div>"""

content = re.sub(btn_pattern, new_btn, content, flags=re.DOTALL)

with open('frontend/src/components/EvidenceDossier.tsx', 'w') as f:
    f.write(content)

print("Updated successfully.")
