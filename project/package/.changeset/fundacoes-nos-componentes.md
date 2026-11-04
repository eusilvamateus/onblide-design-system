---
"@onblide/ui": minor
---

Os componentes passam a usar os tokens de movimento, raio, camada, opacidade e foco, sem números soltos. Um teste automático (`smoke-fundacoes`) recusa valores fora das escalas.

- **Movimento:** novos `--ob-ease-in-out`, `--ob-dur-spin` (800ms, uma volta de spinner) e `--ob-dur-loop` (1400ms, pulsos de carregamento). Durações soltas (100, 140, 150, 160, 220, 250ms) passam para `--ob-dur-fast` (120ms) ou `--ob-dur-base` (200ms). Com `prefers-reduced-motion: reduce`, `--ob-dur-fast`, `--ob-dur-base` e `--ob-dur-slow` valem 0ms, então todo componente respeita a preferência; o `Modal` e o `ScrollArea` deixam de ter regras próprias para isso.
- **Raios:** novos `--ob-r-2xs` (2px, para sublinhados e indicadores) e `--ob-r-circle` (50%). `999` vira `--ob-r-pill`. O `Checkbox` passa de 6px para `--ob-r-xs` (4px) e o raio padrão do `Skeleton` passa de 6px para `--ob-r-xs`.
- **Camadas:** novo `--ob-z-drag` (600) para a prévia de arrastar do `TreeView`, que usava 1000.
- **Opacidade:** todo estado desabilitado usa `--ob-opacity-disabled` (0.45); antes variava entre 0.45, 0.5 e 0.6. Novo `--ob-opacity-muted` (0.4) para itens inativos (dias fora do mês, ícone de ordenação inativo, etapa pendente).
- **Foco:** novo `--ob-focus-ring-width` (3px). Todo anel e contorno de foco usa essa largura e a cor `--ob-focus-ring`; antes variavam entre 2, 3 e 4px, e o `Accordion`, o `Calendar` e o `FileUpload` usavam um contorno azul sólido.
