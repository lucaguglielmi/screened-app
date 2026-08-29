with open('frontend/src/components/chat/tools/FestivalIntakeCard.tsx', 'r') as f:
    content = f.read()

content = content.replace("return prompts.join('\\n\\n');", "return prompts.join('\\n');")
content = content.replace("return prompts.join('\\n\n');", "return prompts.join('\\n');")
content = content.replace("return prompts.join('\n\n');", "return prompts.join('\\n');")
content = content.replace("return prompts.join('\n');", "return prompts.join('\\n');")

with open('frontend/src/components/chat/tools/FestivalIntakeCard.tsx', 'w') as f:
    f.write(content)
