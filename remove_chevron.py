import re

with open('frontend/src/components/EvidenceDossier.tsx', 'r') as f:
    content = f.read()

# 1. Remove the BALANCED chevron button block completely
btn_pattern = r"\s*\{normalizedDensity === 'BALANCED' && \(\n\s*<button\n\s*onClick=\{.*?\}\n\s*className=.*?\n\s*>\n\s*\{isExpanded \? \(\n\s*<ChevronUp className=\"size-4\" \/>\n\s*\) : \(\n\s*<ChevronDown className=\"size-4\" \/>\n\s*\)\}\n\s*</button>\n\s*\)\}"
content = re.sub(btn_pattern, "", content, flags=re.DOTALL)

with open('frontend/src/components/EvidenceDossier.tsx', 'w') as f:
    f.write(content)

print("Removed chevron button")
