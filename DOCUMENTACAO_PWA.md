# 📱 Documentação — Pixel Line Pro (PWA)

## Visão Geral

O **Pixel Line Pro** é uma aplicação web progressiva (PWA) que funciona como um contador de dias visual, representando o tempo através de pixels coloridos. O app pode ser acessado via navegador (Desktop/Mobile) ou instalado como PWA para uma experiência nativa no celular.

---

## 🖥️ Telas da Aplicação

### 1. Splash Screen (Tela de Inicialização)

**Exibida apenas na versão PWA instalada.**

Ao abrir o app instalado, uma tela de carregamento é exibida com:
- Logo oficial do app (logo.png) centralizada com bordas arredondadas
- Anéis animados orbitais ao redor da logo
- Nome "PIXEL LINE" em destaque
- Barra de progresso segmentada em 12 blocos com efeito glow
- Textos de carregamento imersivos ("Kernel Initializing...", "Mapping Pixel Coords...", etc.)
- Duração de ~3 segundos com transição de fade-out suave

### 2. Header (Cabeçalho)

Presente em todas as versões. Contém:
- **Logo do app** (imagem real logo.png) com efeito hover
- **Nome "PIXEL LINE"** com subtítulo "Pixel Journey"
- **Avatar do usuário** (letra inicial) com nome — clicável para abrir o perfil
- **Botão de tema** (claro/escuro) com animação de troca sol/lua

### 3. Painel Principal — Objetivo / Evento Ativo

Card central que exibe:
- Nome do objetivo ou evento ativo selecionado
- Data alvo formatada
- **Barra de progresso** com percentual de conclusão (apenas objetivo principal)
- **Cards de estatísticas**: Dias restantes, Dias úteis, Semanas restantes

### 4. Lista de Eventos

Seção colapsável com:
- Lista de eventos com nome, data e contagem regressiva
- Suporte a **drag & drop** para reordenar
- Indicador visual do evento ativo (destaque violeta)
- Botão de exclusão por evento
- Minimizar/expandir seção

### 5. Jornada Pixelada (Grid de Pixels)

A visualização principal do app:
- Grid de pixels representando cada dia do período configurado
- Cores diferenciadas para: passado, futuro, hoje, fim de semana, alvo, evento, observação
- **Configurações visuais** (popup flutuante):
  - Escala dos pixels (8px a 24px)
  - Mostrar/ocultar números dos dias
  - Alternar entre Modo Fluxo e Modo Calendário
- **Legenda Cromática** com seletor de cores personalizado para cada tipo de pixel

### 6. Modal — Alterar Período (Settings)

Permite configurar:
- Data de início da jornada
- Data alvo (objetivo)
- Abertura automática na primeira execução do app

### 7. Modal — Novo Evento

Formulário para adicionar um novo evento:
- Nome do evento
- Data do evento
- Salvamento e fechamento automático

### 8. Modal — Detalhe do Dia

Ao clicar em um pixel do grid:
- Visualizar/editar anotação do dia
- Adicionar/remover imagens do dia
- Limpar dados do dia

### 9. Modal — Perfil do Usuário

Editar informações pessoais:
- Nome
- E-mail
- Bio

### 10. Modal — Color Picker

Seletor de cores customizado:
- Paleta visual para escolher cores dos pixels
- Preview em tempo real
- Aplicação global na legenda

### 11. Rodapé (Footer)

Texto simples: "Pixel line • Pixel Tracker"

---

## 📲 Diferenças: Versão Desktop (Site) vs Versão PWA (Mobile)

| Aspecto | Desktop (Site no Navegador) | PWA (App Instalado no Mobile) |
|---|---|---|
| **Splash Screen** | ❌ Não exibida | ✅ Exibida na abertura com logo e animação |
| **Navegação** | Botões inline no topo do conteúdo ("Alterar Período" + "Novo Evento") | Bottom tab bar fixa com 3-4 botões (Início, Período, Novo, Instalar) |
| **Barra de navegação do browser** | ✅ Visível (URL, voltar, avançar) | ❌ Oculta — modo standalone, tela cheia |
| **Pull-to-refresh** | ✅ Possível (comportamento padrão do browser) | ❌ Bloqueado via CSS + JavaScript |
| **Ícone na home screen** | ❌ Apenas um bookmark | ✅ Ícone adaptado para mobile (múltiplos tamanhos, maskable) |
| **Barra de status** | Padrão do navegador | Fundo escuro translúcido integrado ao app |
| **Feedback tátil (vibração)** | ❌ Não disponível | ✅ Vibração curta nos botões da tab bar |
| **Tab ativa (indicador)** | N/A (não tem tabs) | ✅ Barra luminosa inferior indicando tab selecionada |
| **Orientação** | Livre (horizontal e vertical) | 📱 Fixa em retrato (portrait) |
| **Seleção de texto** | ✅ Livre em todo o conteúdo | ❌ Bloqueada em UI, permitida apenas em inputs |
| **Context menu (long press)** | ✅ Menu do navegador aparece | ❌ Bloqueado em imagens e links |
| **Safe area (notch)** | N/A | ✅ Padding automático respeitando notch e barra home |
| **Tema (claro/escuro)** | Idêntico em ambas versões | Idêntico em ambas versões |
| **Cache offline** | Básico (depende do browser) | ✅ Service Worker aprimorado com Network-First |
| **Atualizações** | Imediatas via reload | Automáticas via Service Worker (skipWaiting) |

---

## 🔧 Arquivos Técnicos Importantes

| Arquivo | Função |
|---|---|
| `manifest.json` | Configuração PWA: nome, ícones, orientação, tema |
| `sw.js` | Service Worker: cache offline, estratégias de fetch |
| `index.html` | Meta tags iOS/Android, CSS anti-refresh, viewport |
| `App.tsx` | Componente principal: lógica de splash, navegação, detecção PWA |
| `SplashScreen.tsx` | Tela de inicialização do PWA com logo real |

---

## 📋 Resumo das Melhorias PWA

1. **Tela de Splash** real com logo.png ao abrir o PWA instalado
2. **Ícones múltiplos tamanhos** (48x48 a 512x512) + maskable separado
3. **Service Worker aprimorado** com limpeza automática de cache antigo
4. **Pull-to-refresh bloqueado** via CSS (overscroll-behavior) + JavaScript (touchmove)
5. **Seleção de texto bloqueada** em elementos de UI, permitida em inputs
6. **Context menu bloqueado** em long press (imagens e links)
7. **Feedback tátil** (vibração) nos botões da bottom tab bar
8. **Indicador de tab ativa** com barra luminosa no bottom navigation
9. **Safe area support** para dispositivos com notch
10. **Meta tags iOS** para experiência standalone no Safari/iOS
