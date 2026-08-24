import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # We need to ignore cases where it's already "bg-paper-X dark:bg-darkroom-X"
    # Wait, the regex `(?<!dark:)(bg|text|border)-darkroom-([a-z-]+)` will match `bg-darkroom-X` that is NOT preceded by `dark:`.
    # But wait, what if it's `hover:bg-darkroom-surface`?
    # It would become `hover:bg-paper-surface hover:dark:bg-darkroom-surface` - wait, Tailwind is `dark:hover:bg-darkroom-surface`.
    # Let's see how many hover:bg-darkroom there are.
