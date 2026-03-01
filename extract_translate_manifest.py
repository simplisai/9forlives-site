import bs4
import json
import os

# Caminhos absolutos dos arquivos
INPUT_HTML_PATH = "/Users/antonioserafim/TRAE-REPOSITORIOS/9forlives-page/pages/manifesto-pt.html"
PLACEHOLDER_HTML_PATH = "/Users/antonioserafim/TRAE-REPOSITORIOS/9forlives-page/pages/manifest-placeholder.html"
TRANSLATION_MAPPING_PATH = "/Users/antonioserafim/TRAE-REPOSITORIOS/9forlives-page/manifest_translation_mapping.json"

def extract_text_with_placeholders():
    # Ler conteúdo completo do arquivo fonte
    with open(INPUT_HTML_PATH, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Parsear HTML sem modificar estrutura técnica
    soup = bs4.BeautifulSoup(html_content, 'html.parser')

    # Excluir tags de script e style da extração
    for tag in soup(['script', 'style']):
        tag.extract()

    placeholder_counter = 1
    translation_mapping = {}

    # Percorrer todos os nós de texto visível
    for text_node in soup.find_all(text=True):
        stripped_text = text_node.strip()
        if stripped_text and not stripped_text.isspace():
            # Criar placeholder único
            placeholder = f"{{MANIFEST_PLACEHOLDER_{placeholder_counter}}}"
            translation_mapping[placeholder] = stripped_text

            # Substituir texto original pelo placeholder
            text_node.replace_with(placeholder)
            placeholder_counter += 1

    # Salvar HTML com placeholders e mapeamento de tradução
    with open(PLACEHOLDER_HTML_PATH, 'w', encoding='utf-8') as f:
        f.write(str(soup.prettify(formatter='html')))

    with open(TRANSLATION_MAPPING_PATH, 'w', encoding='utf-8') as f:
        json.dump(translation_mapping, f, indent=2, ensure_ascii=False)

    print(f"Extração concluída: {placeholder_counter - 1} textos mapeados")
    print(f"HTML com placeholders: {PLACEHOLDER_HTML_PATH}")
    print(f"Mapeamento de tradução: {TRANSLATION_MAPPING_PATH}")

if __name__ == "__main__":
    # Instrução para instalação de dependências se necessário
    print("Caso BeautifulSoup não esteja instalado, execute: pip install beautifulsoup4")
    extract_text_with_placeholders()
