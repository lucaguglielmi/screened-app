import re

with open('frontend/src/components/CredibilityRadar.tsx', 'r') as f:
    content = f.read()

# 1. Overall Index
content = re.sub(
    r"\? 'bg-emerald-500/10 text-emerald-600 text-emerald-400 border border-emerald-500/20'\n                : overallTransparency >= 50\n                  \? 'bg-amber-500/10 text-amber-600 text-amber-400 border border-amber-500/20'\n                  : 'bg-rose-500/10 text-rose-600 text-rose-400 border border-rose-500/20'",
    "? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'\n                : overallTransparency >= 50\n                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'\n                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'",
    content
)

# 2. Progress Bar
content = re.sub(
    r"\? 'bg-emerald-500'\n                      : dim.score >= 50\n                        \? 'bg-amber-500'\n                        : 'bg-rose-500'",
    "? 'bg-emerald-500'\n                      : dim.score >= 50\n                        ? 'bg-emerald-500'\n                        : 'bg-emerald-500'",
    content
)

# 3. Item text and icon styles
# We want: text-darkroom-muted for text, regardless of isRisk. 
# And AlertTriangle shouldn't use red.
content = re.sub(
    r"<\? \(\n                    <AlertTriangle className=\"size-3 shrink-0\" />",
    "? (\n                    <AlertTriangle className=\"size-3 shrink-0 text-slate-400\" />",
    content
)
content = re.sub(
    r"dim\.isRisk\n                      \? 'text-rose-600 text-rose-400'\n                      : 'text-darkroom-muted'",
    "'text-darkroom-muted'",
    content
)


with open('frontend/src/components/CredibilityRadar.tsx', 'w') as f:
    f.write(content)

print("Updated CredibilityRadar.")
