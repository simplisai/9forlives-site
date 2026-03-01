
import json
import os
import re

PT_MANIFESTO_PATH = "/Users/antonioserafim/TRAE-REPOSITORIOS/9forlives-page/pages/manifesto-pt.html"
PT_TO_PLACEHOLDER_PATH = "/Users/antonioserafim/TRAE-REPOSITORIOS/9forlives-page/manifest_translation_mapping.json"
PLACEHOLDER_TO_EN_PATH = "/Users/antonioserafim/TRAE-REPOSITORIOS/9forlives-page/manifest_translated_mapping.json"
OUTPUT_EN_MANIFESTO_PATH = "/Users/antonioserafim/TRAE-REPOSITORIOS/9forlives-page/pages/manifest-en.html"

def generate_english_manifesto():
    # 1. Load mappings
    with open(PT_TO_PLACEHOLDER_PATH, 'r', encoding='utf-8') as f:
        pt_to_placeholder = json.load(f)
    
    with open(PLACEHOLDER_TO_EN_PATH, 'r', encoding='utf-8') as f:
        placeholder_to_en = json.load(f)
    
    # 2. Create direct PT -> EN mapping
    # Note: pt_to_placeholder has {placeholder: pt_text}
    # We want {pt_text: en_text}
    pt_to_en = {}
    for placeholder, pt_text in pt_to_placeholder.items():
        if placeholder in placeholder_to_en:
            en_text = placeholder_to_en[placeholder]
            # Clean up the text to avoid issues with extra whitespace or newlines if any
            # but keep it as close as possible to the source
            pt_to_en[pt_text] = en_text

    # 3. Read PT Manifesto
    with open(PT_MANIFESTO_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # 4. Protect scripts and styles (already done, but let's be more precise)
    protected_blocks = []
    def protect(match):
        placeholder = f"__PROTECTED_BLOCK_{len(protected_blocks)}__"
        protected_blocks.append(match.group(0))
        return placeholder

    content = re.sub(r'<(script|style).*?>.*?</\1>', protect, content, flags=re.DOTALL)

    # 5. Split by tags to only replace content outside of tags
    parts = re.split(r'(<[^>]+>)', content)
    
    # Sort keys by length descending
    sorted_pt_texts = sorted(pt_to_en.keys(), key=len, reverse=True)
    
    # Create a single regex to match all PT texts
    # Escape special characters in the PT texts
    escaped_pt_texts = [re.escape(text) for text in sorted_pt_texts if text]
    pt_regex = re.compile('|'.join(escaped_pt_texts))
    
    def replace_match(match):
        return pt_to_en[match.group(0)]

    total_replaced = 0
    new_parts = []
    
    for part in parts:
        if part.startswith('<') and part.endswith('>'):
            if 'lang="pt-BR"' in part:
                part = part.replace('lang="pt-BR"', 'lang="en-US"')
            new_parts.append(part)
        else:
            # This is text content between tags
            # We use re.sub with a function to ensure each piece of text is replaced only once
            translated_part, count = pt_regex.subn(replace_match, part)
            total_replaced += count
            new_parts.append(translated_part)

    content = "".join(new_parts)

    # 6. Restore protected blocks
    for i, block in enumerate(protected_blocks):
        # Translate city names in the globe script if it's the script block
        if "createGlobe" in block:
            city_translations = {
                "'São Paulo'": "'Sao Paulo'",
                "'Brasília'": "'Brasilia'",
                "'Vitória'": "'Vitoria'",
                "'Florianópolis'": "'Florianopolis'",
                "'Goiânia'": "'Goiania'",
                "'Cidade do México'": "'Mexico City'",
                "'Tóquio'": "'Tokyo'",
                "'Londres'": "'London'",
                "'Pequim'": "'Beijing'",
                "'Nova Delhi'": "'New Delhi'",
                "'Nova York'": "'New York'",
                "'Cidade do Cabo'": "'Cape Town'",
                "'Berlim'": "'Berlin'",
                "'Roma'": "'Rome'",
                "'Lisboa'": "'Lisbon'",
                "'Pequim'": "'Beijing'",
                "'Nova Delhi'": "'New Delhi'",
                "'Nairóbi'": "'Nairobi'",
                "'Joanesburgo'": "'Johannesburg'",
                "'Seul'": "'Seoul'",
                "'Singapura'": "'Singapore'"
            }
            for pt_city, en_city in city_translations.items():
                block = block.replace(pt_city, en_city)
        
        content = content.replace(f"__PROTECTED_BLOCK_{i}__", block)
    
    # 7. Save English version
    with open(OUTPUT_EN_MANIFESTO_PATH, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"English manifesto generated successfully at: {OUTPUT_EN_MANIFESTO_PATH}")
    print(f"Total text segments replaced: {total_replaced}")

if __name__ == "__main__":
    generate_english_manifesto()
