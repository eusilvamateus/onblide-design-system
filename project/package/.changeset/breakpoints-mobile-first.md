---
"@onblide/ui": minor
---

**Quebra de compatibilidade.** Os breakpoints viram uma escala única, mobile-first, usada de verdade pelo pacote (veja a página "Breakpoints" na documentação).

- Escala: `sm` 768px, `md` 1024px, `lg` 1280px, `xl` 1440px; abaixo de `sm` é a faixa `base`. O `--ob-bp-xs` (480px) foi removido.
- Novos exports: `BREAKPOINTS` (os valores em px), `BREAKPOINT_ORDER`, `mediaQuery(nome)` (devolve `(min-width: 1024px)` para `md`), o hook `useBreakpoint()` (devolve `current` e `atLeast(nome)`; no servidor a faixa é `base`) e os tipos `Breakpoint` e `BreakpointName`.
- Tokens de grade renomeados para os nomes da escala: `--ob-grid-cols-mobile|tablet|desktop` viram `--ob-grid-cols`, `--ob-grid-cols-sm`, `--ob-grid-cols-md`; o mesmo vale para `--ob-grid-gutter-*` e `--ob-grid-margin-*`.
- `--ob-max-w-*` vira `--ob-container-*`, e cada nome vale o mesmo que o breakpoint de mesmo nome: `sm` 768px, `md` 1024px, `lg` 1280px, `xl` 1440px. `--ob-max-w-page` vira `--ob-container-page` (1280px). Saíram `--ob-max-w-sm` (640px) e `--ob-max-w-2xl`; o antigo `--ob-max-w-md` (768px) corresponde a `--ob-container-sm`, e `--ob-max-w-lg` (1024px) a `--ob-container-md`.
- `Modal`: abaixo de `sm`, os tamanhos `md`, `lg` e `full` ocupam a tela inteira; o `sm` (e o `AlertDialog`) continua um cartão centralizado. A partir de `sm`, nada muda.
- `ToastStack`: o modo celular (centralizado, quase na largura da tela) passa a valer abaixo de `sm` (768px), não mais abaixo de 600px. O posicionamento sai do estilo inline e vai para CSS mobile-first, sem `!important`.
