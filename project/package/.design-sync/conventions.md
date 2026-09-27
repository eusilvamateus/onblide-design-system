# Convenções do @onblide/ui

Leia isto antes de montar qualquer tela. Tudo vem de `window.OnblideUI` (o bundle já está carregado); não reimplemente componentes.

## Uso
- Importe do pacote: `const { Button, Input, Card, Icons } = OnblideUI` (ou `import { Button } from '@onblide/ui'`). React 18.
- Os tokens (`--ob-*`) e as fontes vêm de `styles.css`. Cores, raios, sombras e espaçamentos sempre por token, nunca por valor solto.
- Tema escuro: `document.documentElement.setAttribute('data-theme', 'dark')`. O padrão é o claro.

## Marca e visual
- Azul `#0a4ee4` é a voz da marca (CTA primário, links, foco). Verde só para sucesso, laranja para aviso/acento, tinta `#545454` no texto, creme `#f2f0e8` só como sobreposição (a página é branca).
- Poppins para UI, Playfair Display (itálico) só como acento editorial, JetBrains Mono para código e rótulos pequenos.
- Raios de 8–12px (12px é o padrão); pílulas (999px) só em badges e toggles. Sem gradientes no chrome, sem emoji.
- Cartão com borda OU com sombra, nunca os dois.

## Ícones
- Só Phosphor, nos seis pesos, cada um com seu papel: `regular` padrão; `fill` estado ligado (em par com regular); `bold` até 14px ou sobre fundo sólido; `light` 32–48px; `thin` editorial 64px+; `duotone` só destaque ilustrativo. Um peso por região. Sempre pelo registro `Icons` (ex.: `<Icons.plus size={16} />`, `<Icons.star weight="fill" />`) ou `<Ph n="…" weight="…" />`. Nunca outra biblioteca nem SVG desenhado à mão. 16px inline, 18–20px na navegação.

## Copy
- Português do Brasil, tom conversacional, frases curtas, sentence case ("Nova tarefa", não "Nova Tarefa").
- Números no formato BR: `R$ 38,4k`, `4,8%`, `2.847`.

## Composição
- Botões: `kind` = primary | secondary | ghost | cream | danger; `size` = sm | md | lg. Um primário por região.
- Campos (`Input`, `Select`, `SearchInput`, `Datepicker`, `CodeInput`) compartilham a superfície `FieldShell`; erro entra pela prop `error`.
- `Modal`, `Drawer`, `Dropdown` e `Tooltip` são overlays: renderize-os dentro de um contêiner com altura definida.
- `ToastStack` fica uma vez na raiz do app; toasts disparam pelo evento `ob-toast`.
- `Table`, `Tabs`, `Pagination`, `SideNav` recebem dados por props; use conteúdo realista, nunca "foo/test".

## Como propor mudanças (importante)
- **Não edite** `components/`, `tokens/`, `fonts/`, `_preview/`, `styles.css` nem `_ds_bundle.*`: são gerados do código e o próximo sync sobrescreve qualquer alteração.
- Para **propor um componente novo ou uma mudança** num existente, crie os arquivos em `proposals/<Nome>/` (um `index.html` ou `.jsx` de protótipo e um `NOTAS.md` com o que muda e por quê). Use só tokens `--ob-*` e os componentes existentes; não invente cores, raios ou espaçamentos.
- Telas e protótipos que apenas **usam** os componentes existentes podem ficar em qualquer outra pasta.
- Uma proposta só entra no design system depois de ser portada para o código (`@onblide/ui`) e sincronizada de volta.

