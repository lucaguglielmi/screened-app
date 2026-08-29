import re

with open('frontend/src/components/DetailDial.tsx', 'r') as f:
    content = f.read()

# 1. Update SIMPLIFIED labels
content = re.sub(
    r"label: 'Simplified',\n      sublabel: 'Basic overview',",
    "label: 'Controversial',\n      sublabel: 'Red flags & disputes',",
    content
)

# 2. Update BALANCED labels
content = re.sub(
    r"label: 'Balanced',\n      sublabel: 'Content, not overwhelming',",
    "label: 'Overview',\n      sublabel: 'Quick summary & map',",
    content
)

# 3. Update FULL_EVIDENCE labels
content = re.sub(
    r"label: 'Full Evidence',\n      sublabel: 'All quotes & source citations',",
    "label: 'All Data',\n      sublabel: 'Full evidence & ledger',",
    content
)

with open('frontend/src/components/DetailDial.tsx', 'w') as f:
    f.write(content)

print("Updated DetailDial.tsx")
