import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    
    pairs = [
        (r'bg-paper-bg\s+dark:bg-darkroom-bg', 'bg-darkroom-bg'),
        (r'bg-paper-surface\s+dark:bg-darkroom-surface', 'bg-darkroom-surface'),
        (r'bg-paper-card\s+dark:bg-darkroom-card', 'bg-darkroom-card'),
        (r'border-paper-border\s+dark:border-darkroom-border', 'border-darkroom-border'),
        (r'text-paper-text\s+dark:text-darkroom-text', 'text-darkroom-text'),
        (r'text-paper-muted\s+dark:text-darkroom-muted', 'text-darkroom-muted'),
        
        (r'hover:bg-paper-surface\s+dark:hover:bg-darkroom-surface', 'hover:bg-darkroom-surface'),
        (r'hover:bg-paper-card\s+dark:hover:bg-darkroom-card', 'hover:bg-darkroom-card'),
        (r'hover:border-paper-border\s+dark:hover:border-darkroom-border', 'hover:border-darkroom-border'),
        
        (r'bg-paper-bg\s+dark:bg-moving-dark-gradient', 'bg-moving-dark-gradient'),
        (r'bg-paper-surface/80\s+dark:bg-darkroom-surface/80', 'bg-darkroom-surface/80'),
    ]
    
    for pattern, replacement in pairs:
        content = re.sub(pattern, replacement, content)

    # Remove the generic `dark:` tailwind prefix
    content = re.sub(r'\bdark:([a-zA-Z0-9_\-\/\[\]\:]+)', r'\1', content)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts') or file.endswith('.css'):
            process_file(os.path.join(root, file))
