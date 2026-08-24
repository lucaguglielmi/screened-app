import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Pattern: match optional prefix (hover:|etc), then (bg|text|border)-darkroom-([a-z-]+)
    # Use negative lookbehind to ensure it's not preceded by dark: or dark:hover: etc.
    # Actually, simpler: match \b(dark:)?((?:hover:|focus:|group-hover:|active:)?)(bg|text|border)-darkroom-([a-z-]+)\b
    
    def repl(m):
        is_dark = m.group(1)
        pseudo = m.group(2)
        prop = m.group(3)
        val = m.group(4)
        
        if is_dark:
            return m.group(0) # Already has dark:, leave it alone
            
        return f"{pseudo}{prop}-paper-{val} dark:{pseudo}{prop}-darkroom-{val}"

    pattern = re.compile(r'\b(dark:)?((?:hover:|focus:|group-hover:|active:)?)(bg|text|border)-darkroom-([a-z-]+)\b')
    new_content = pattern.sub(repl, content)

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

