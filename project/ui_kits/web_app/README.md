# Onblide · Web App UI kit

A click-through, hi-fi recreation of the Onblide web app dashboard. All visuals come from the design tokens in `colors_and_type.css`.

## Files

- `index.html` — ponto de entrada; carrega React/ReactDOM (UMD), o Babel standalone e o bundle
  `../../package/dist/onblide-ui.browser.js` do `@onblide/ui`, que registra os componentes
  (`Button`, `Card`, `Icons`, `Logo`, `Modal`, ...) como globais. O `dist/` é gerado: rode
  `cd project/package && npm install && npm run build` antes de abrir, senão a página fica em branco.
- `Chrome.jsx` — `Sidebar`, `Topbar`
- `Screens.jsx` — `HomeScreen`, `TasksScreen`, `MetricsScreen`, `SettingsScreen`, `IntegrationsScreen`
- `tweaks-panel.jsx` — painel de ajustes do modo de edição (tema, modo de cor, densidade)

## Screens

1. **Início (Home)** — greeting, 4 metric tiles, today's tasks, agenda
2. **Tarefas (Tasks)** — 4-column kanban board with cards, tags, avatars
3. **Métricas (Metrics)** — KPI cards with sparklines + bar chart
4. **Ajustes (Settings)** — tabbed settings; profile editor + preference toggles
5. **Integrações (Integrations)** — conexões com serviços externos (marcas, modal de consentimento)

## Conventions

- All copy in **Portuguese (pt-BR)**, conversational tone (você, contractions)
- Phosphor-style icons, 1.6 stroke, 18–20px in nav, 16px inline
- Cards: 12px radius, 1px hairline border or shadow-md (never both)
- Primary CTA: solid blue with optional blue glow on hover
- Cream (#f2f0e8) used sparingly — kanban column backgrounds, inline code, subtle warmth
