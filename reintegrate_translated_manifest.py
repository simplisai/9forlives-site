import json
import os
import re
from bs4 import BeautifulSoup

# Caminhos absolutos dos arquivos
PLACEHOLDER_HTML_PATH = "/Users/antonioserafim/TRAE-REPOSITORIOS/9forlives-page/pages/manifest-placeholder.html"
TRANSLATED_MAPPING_PATH = "/Users/antonioserafim/TRAE-REPOSITORIOS/9forlives-page/manifest_translated_mapping.json"
OUTPUT_HTML_PATH = "/Users/antonioserafim/TRAE-REPOSITORIOS/9forlives-page/pages/manifest-en.html"

def reintegrate_translations():
    # Carregar o HTML com placeholders
    with open(PLACEHOLDER_HTML_PATH, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Carregar o mapeamento de tradução completo
    with open(TRANSLATED_MAPPING_PATH, 'r', encoding='utf-8') as f:
        translated_mapping = json.load(f)

    # Substituir placeholders no HTML
    for placeholder, translated_text in translated_mapping.items():
        html_content = html_content.replace(placeholder, translated_text)

    # Pequenos ajustes manuais necessários após substituição (lang tag)
    html_content = html_content.replace('<html lang="pt-BR">', '<html lang="en-US">')

    # Escrever o HTML final traduzido sem BeautifulSoup para manter scripts intactos
    with open(OUTPUT_HTML_PATH, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"HTML traduzido reintegrado (modo texto puro) e salvo em: {OUTPUT_HTML_PATH}")

if __name__ == "__main__":
    reintegrate_translations()
