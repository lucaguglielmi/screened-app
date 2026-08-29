import re

with open('frontend/src/components/investigation/DeepVettingMatrix.tsx', 'r') as f:
    content = f.read()

# Change RED_FLAG style to be the same as the "good" ones (which is CORROBORATED).
# Wait, let's see what CORROBORATED is:
# case 'CORROBORATED':
#   return <span className="... bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">

content = re.sub(
    r"bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse\">\n            <ShieldAlert className=\"w-3\.5 h-3\.5\" />\n            Red Flag Alert",
    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30\">\n            <ShieldAlert className=\"w-3.5 h-3.5\" />\n            Review Recommended",
    content
)

# Total flags count color
content = re.sub(
    r"activeReport\.totalFlags === 0 \? 'text-zinc-400' : 'text-rose-400'",
    "activeReport.totalFlags === 0 ? 'text-zinc-400' : 'text-zinc-400'",
    content
)

# Filter button color
content = re.sub(
    r"filter === 'ALERTS'\n                  \? 'bg-rose-600 text-white font-bold'",
    "filter === 'ALERTS'\n                  ? 'bg-emerald-600 text-white font-bold'",
    content
)

with open('frontend/src/components/investigation/DeepVettingMatrix.tsx', 'w') as f:
    f.write(content)

print("Updated DeepVettingMatrix.")
