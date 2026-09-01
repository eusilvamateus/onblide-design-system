# Onblide · Web App UI kit

A click-through, hi-fi recreation of the Onblide web app dashboard. All visuals come from the design tokens in `colors_and_type.css`.

## Files

- `index.html` — entry point; sidebar nav switches between screens
- `Primitives.jsx` — `Logo`, `Icons`, `Button`, `Input`, `Badge`, `StatusDot`, `Card`, `Avatar`
- `Chrome.jsx` — `Sidebar`, `Topbar`
- `Screens.jsx` — `HomeScreen`, `TasksScreen`, `MetricsScreen`, `SettingsScreen`

## Screens

1. **Início (Home)** — greeting, 4 metric tiles, today's tasks, agenda
2. **Tarefas (Tasks)** — 4-column kanban board with cards, tags, avatars
3. **Métricas (Metrics)** — KPI cards with sparklines + bar chart
4. **Ajustes (Settings)** — tabbed settings; profile editor + preference toggles

## Conventions

- All copy in **Portuguese (pt-BR)**, conversational tone (você, contractions)
- Phosphor-style icons, 1.6 stroke, 18–20px in nav, 16px inline
- Cards: 12px radius, 1px hairline border or shadow-md (never both)
- Primary CTA: solid blue with optional blue glow on hover
- Cream (#f2f0e8) used sparingly — kanban column backgrounds, inline code, subtle warmth
