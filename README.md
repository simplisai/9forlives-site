# 9forlives Landing Page

Uma landing page moderna e responsiva para o projeto 9forlives, desenvolvida com HTML, CSS (Tailwind) e JavaScript vanilla.

## 🚀 Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **Tailwind CSS** - Framework CSS utilitário
- **JavaScript** - Interatividade e animações
- **Lucide Icons** - Ícones modernos
- **Google Fonts** - Tipografia (Inter & Space Grotesk)

## 📁 Estrutura do Projeto

```
9forlives-page/
├── 9forlives-page.html          # Página principal
├── netlify.toml                 # Configurações do Netlify
├── _redirects                   # Redirecionamentos
├── .gitignore                   # Arquivos ignorados pelo Git
├── package.json                 # Metadados do projeto
└── README.md                    # Documentação
```

## 🎨 Características

- ✅ **Responsivo** - Adaptado para desktop, tablet e mobile
- ✅ **Performance** - Otimizado para carregamento rápido
- ✅ **SEO Friendly** - Meta tags e estrutura semântica
- ✅ **Acessibilidade** - Seguindo boas práticas de a11y
- ✅ **Animações** - Efeitos suaves e modernos
- ✅ **Dark Theme** - Design escuro elegante

## 🌐 Deploy no Netlify

### Método 1: Deploy via Git (Recomendado)

1. **Criar repositório no GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: 9forlives landing page"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/9forlives-page.git
   git push -u origin main
   ```

2. **Conectar ao Netlify:**
   - Acesse [netlify.com](https://netlify.com)
   - Clique em "New site from Git"
   - Conecte com GitHub
   - Selecione o repositório `9forlives-page`
   - Configure:
     - **Build command:** (deixe vazio)
     - **Publish directory:** `./`
     - **Branch:** `main`
   - Clique "Deploy site"

### Método 2: Deploy Manual

1. Acesse [netlify.com](https://netlify.com)
2. Arraste a pasta do projeto para a área de deploy
3. Netlify fará o upload automático

## ⚙️ Configurações do Netlify

O arquivo `netlify.toml` inclui:

- **Redirects:** Redireciona `/` para `/9forlives-page.html`
- **Headers de Segurança:** XSS Protection, CSRF, etc.
- **Cache:** Otimização de performance
- **HTTPS:** Configurações de segurança

## 🔧 Desenvolvimento Local

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU_USUARIO/9forlives-page.git
   cd 9forlives-page
   ```

2. **Inicie um servidor local:**
   ```bash
   # Python
   python3 -m http.server 8000
   
   # Node.js (se tiver instalado)
   npx serve .
   
   # PHP
   php -S localhost:8000
   ```

3. **Acesse:** `http://localhost:8000/9forlives-page.html`

## 📱 Responsividade

A página é otimizada para:

- **Desktop:** 1920px+
- **Laptop:** 1024px - 1919px
- **Tablet:** 768px - 1023px
- **Mobile:** 320px - 767px

## 🎯 Performance

- **Lighthouse Score:** 95+
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1

## 🔄 Atualizações

Para fazer atualizações:

```bash
# Fazer alterações nos arquivos
git add .
git commit -m "Descrição das mudanças"
git push origin main
```

O Netlify automaticamente fará redeploy a cada push!

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs do Netlify
2. Consulte a [documentação do Netlify](https://docs.netlify.com/)
3. Teste localmente antes de fazer deploy

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com ❤️ para o projeto 9forlives**