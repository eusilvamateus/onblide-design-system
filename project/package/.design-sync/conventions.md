# Convenções do @onblide/ui

Leia isto antes de montar qualquer tela. Tudo vem de `window.OnblideUI` (o bundle já está carregado); não reimplemente componentes.

## Uso
- Importe do pacote: `const { Button, Input, Card, Icons } = OnblideUI` (ou `import { Button } from '@onblide/ui'`). React 18.
- Os tokens (`--ob-*`) e as fontes vêm de `styles.css`. Cores, raios, sombras e espaçamentos sempre por token, nunca por valor solto.
- Tema: `data-theme="light"` ou `"dark"` em qualquer elemento troca os tokens `--ob-*` só naquela região; o padrão é o claro. A aparência global da aplicação (claro, escuro, sistema, persistência) é do `themeManager`/`useTheme()` do pacote.

## Marca e visual
- Azul `#0a4ee4` é a voz da marca (CTA primário, links, foco). Verde só para sucesso, laranja para aviso/acento, tinta `#545454` no texto, creme `#f2f0e8` só como sobreposição (a página é branca).
- Poppins para UI, Playfair Display (itálico) só como acento editorial, JetBrains Mono para código e rótulos pequenos.
- Raios de 8–12px (12px é o padrão); pílulas (999px) só em badges e switches. Sem gradientes no chrome, sem emoji.
- Cartão com borda OU com sombra, nunca os dois.

## Ícones
- Só Phosphor, nos seis pesos, cada um com seu papel: `regular` padrão; `fill` estado ligado (em par com regular); `bold` até 14px ou sobre fundo sólido; `light` 32–48px; `thin` editorial 64px+; `duotone` só destaque ilustrativo. Um peso por região. Sempre pelo registro `Icons` (ex.: `<Icons.plus size={16} />`, `<Icons.star weight="fill" />`) ou `<Ph n="…" weight="…" />`. Nunca outra biblioteca nem SVG desenhado à mão. 16px inline, 18–20px na navegação.

## Copy
- Português do Brasil, tom conversacional, frases curtas, sentence case ("Nova tarefa", não "Nova Tarefa").
- Números no formato BR: `R$ 38,4k`, `4,8%`, `2.847`.

## Vocabulário das props visuais
Cada palavra tem um significado só, igual em todos os componentes. Nunca use uma palavra com outro sentido nem invente sinônimo.
- `tone` = **a cor**: `neutral` (cinza do texto), `muted` (cinza esmaecido), `primary` (azul da marca), `info` (azul, só em `Alert` e `Toast`), `success` (verde), `warning` (laranja), `danger` (vermelho). Não existem `blue`, `green`, `red`, `grey`, `default` nem `accent`.
- `appearance` = **a pintura**: `solid` (cheio na cor forte), `soft` (fundo clarinho, sem borda), `outline` (com borda), `ghost` (sem borda e sem fundo em repouso). `soft` e `ghost` não têm borda; só o `soft` tem fundo.
- `variant` = **a forma** (`line`/`pill` nas `Tabs`, `label`/`numeric` no `Badge`, `text`/`image` no `Tooltip`). Nunca é cor nem pintura.
- Cada componente aceita um recorte: `Badge` `appearance` soft | solid | outline; `Chip` outline | soft (selecionado é sempre cheio); `ToggleButton` e `Kbd` outline | ghost; `Tooltip` solid | outline; `Tabs` soft | solid (aba ativa na pílula) e `dot` para o ponto do tom; `Link` `tone` primary | neutral | muted.

## Layout responsivo
- Breakpoints mobile-first: `sm` 768px, `md` 1024px, `lg` 1280px, `xl` 1440px; abaixo de `sm` é a faixa `base` (celular). Escreva o layout do celular primeiro e acrescente mudanças com `@media (min-width: 768px)` (e os outros valores da escala). Nunca `max-width` nem número inventado.
- Em React, `useBreakpoint()` devolve `current` (`base`, `sm`, `md`, `lg`, `xl`) e `atLeast('md')`; `BREAKPOINTS` e `mediaQuery('md')` dão os valores.
- Grade: `--ob-grid-cols` (4), `--ob-grid-cols-sm` (8), `--ob-grid-cols-md` (12), com `--ob-grid-gutter*` e `--ob-grid-margin*` nos mesmos sufixos. Largura máxima da página: `--ob-container-page` (1280px).
- `Modal` ocupa a tela inteira abaixo de `sm` (menos `size="sm"`); `ToastStack` centraliza abaixo de `sm`.

## Composição
- Botões: `kind` é a hierarquia da ação, não a pintura: primary | secondary | ghost | cream | danger | neutral | quiet (no `quiet`, `tone` escolhe a cor do hover); `size` = sm | md | lg. Um primário por região.
- Campos (`Input`, `Select`, `SearchInput`, `Datepicker`, `CodeInput`) compartilham a superfície `FieldShell`; erro entra pela prop `error`.
- `Modal`, `Drawer` e `Tooltip` são overlays: renderize-os dentro de um contêiner com altura definida.
- `ToastStack` fica uma vez na raiz do app; toasts disparam pelo evento `ob-toast`.
- `Table`, `Tabs`, `Pagination`, `SideNav` recebem dados por props; use conteúdo realista, nunca "foo/test".

## Como propor mudanças (importante)
- **Não edite** `components/`, `tokens/`, `fonts/`, `_preview/`, `styles.css` nem `_ds_bundle.*`: são gerados do código e o próximo sync sobrescreve qualquer alteração.
- Para **propor um componente novo ou uma mudança** num existente, crie os arquivos em `proposals/<Nome>/` (um `index.html` ou `.jsx` de protótipo e um `NOTAS.md` com o que muda e por quê). Use só tokens `--ob-*` e os componentes existentes; não invente cores, raios ou espaçamentos.
- Telas e protótipos que apenas **usam** os componentes existentes podem ficar em qualquer outra pasta.
- Uma proposta só entra no design system depois de ser portada para o código (`@onblide/ui`) e sincronizada de volta.

