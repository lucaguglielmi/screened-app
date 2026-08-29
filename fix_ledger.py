import re

with open('frontend/src/components/EvidenceDossier.tsx', 'r') as f:
    content = f.read()

# The pattern is:
# {/* Atomic Claims & Evidence Citations (Rendered in Balanced & Full Evidence) */}
# {normalizedDensity !== 'SIMPLIFIED' && (
#   <div className="space-y-4" data-section-name="Atomic Ledger">

content = re.sub(
    r"\{\/\* Atomic Claims & Evidence Citations \(Rendered in Balanced & Full Evidence\) \*\/\}\n\s*\{normalizedDensity !== 'SIMPLIFIED' && \(",
    "{/* Atomic Claims & Evidence Citations (Rendered ONLY in Full Evidence mode) */}\n          {normalizedDensity === 'FULL_EVIDENCE' && (",
    content
)

with open('frontend/src/components/EvidenceDossier.tsx', 'w') as f:
    f.write(content)

print("Updated EvidenceDossier.tsx")
