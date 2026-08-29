import re

with open('frontend/src/components/EvidenceDossier.tsx', 'r') as f:
    content = f.read()

# Replace all occurrences of rose- to slate- or emerald- in the Dossier
content = content.replace("text-rose-400 font-semibold\">\n            ALLEGATION", "text-slate-400 font-semibold\">\n            ALLEGATION")
content = content.replace("text-base font-semibold text-rose-400", "text-base font-semibold text-slate-400")
content = content.replace("bg-rose-500/20 text-rose-400", "bg-slate-500/20 text-slate-400")
content = content.replace("bg-rose-500/20 text-rose-300", "bg-slate-500/20 text-slate-300")
content = content.replace("Code className=\"size-4 text-rose-400\"", "Code className=\"size-4 text-slate-400\"")

with open('frontend/src/components/EvidenceDossier.tsx', 'w') as f:
    f.write(content)

print("Updated EvidenceDossier.")
