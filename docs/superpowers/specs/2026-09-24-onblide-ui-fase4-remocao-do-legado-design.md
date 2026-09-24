# `@onblide/ui` — Fase 4: remoção total do legado e dos resíduos

**Status:** aprovado
**Data:** 2026-09-24

## Contexto

As Fases 1–3 portaram para `@onblide/ui` (`project/package/`, versão `0.5.1`, branch `dev`) todos
os componentes do UI kit antigo em JSX (`project/ui_kits/web_app/Components.jsx` e
`Primitives.jsx`, compilados no navegador pelo Babel standalone e publicados como globais por
`Object.assign(window, …)`), e as 27 páginas de preview de `ds/components/` já carregam o bundle
`project/package/dist/onblide-ui.browser.js`. O UI kit antigo continuou no repositório só porque
o web app (`Chrome.jsx`, `Screens.jsx`) ainda o usava; o `Logo` ficou de fora do porte.

Ordem do usuário para esta fase: **nada legado, nenhum resíduo**. O web app passa a consumir
o pacote, os dois arquivos antigos são apagados, nada no repositório os referencia, e os resíduos
que o próprio pacote carregava por fidelidade ao legado saem junto.

## Regras desta fase

- **Nenhum subagente usa navegador**: nada de Chrome/Edge (nem headless, CDP, `taskkill`/
  `Stop-Process` de navegador), nem `mcp__claude-in-chrome__*`, nem servir páginas para abrir num
  navegador. Uma verificação headless já encerrou o Edge do usuário e destruiu o trabalho manual
  dele. Verificação de subagente = comparação de código, `tsc`, `npm run verify`, smokes Node
  (`react-dom/server`) e `grep`. A conferência visual do web app migrado e das páginas de preview
  é feita pelo **controlador** (quem executa o plano), com a extensão do Chrome numa aba nova, por
  instrução explícita do usuário para esta fase — é a última tarefa antes do release.
- **Mudança de comportamento só as listadas** (ver "Escopo"). O resto fica idêntico e é provado
  por `cmp` do JS emitido ou por smoke.
- Commits: Conventional Commits em português, sem linha de atribuição de IA; `package-lock.json`
  só entra no commit de release, sincronizado com `npm install --package-lock-only`; sem amend de
  commit publicado; subagentes não fazem `git tag` nem `git push`. Edições com a ferramenta `Edit`
  (os arquivos misturam CRLF e LF; dos que esta fase edita, `src/browser.ts`, `Spinner.tsx`,
  `badgeTones.ts` e `tsup.config.ts` estão em CRLF no working tree, os demais em LF).
- Nada de cópia temporária dentro do repositório: os scripts de uso único (congelamento das
  fixtures e cópia mecânica do `Logo`) rodam a partir de um diretório de `mktemp -d`.

## Inventário (levantado no código em 2026-09-23, `HEAD` = `f547600`)

### Quem consome o UI kit antigo

`index.html` carrega, nesta ordem, React/ReactDOM UMD, Babel standalone, `Primitives.jsx`,
`Components.jsx`, `Chrome.jsx`, `Screens.jsx`, `tweaks-panel.jsx` e um script inline (`App`).
Globais do legado usados por cada consumidor (contagem de usos fora do comentário `/* global */`):

| Global | `Chrome.jsx` | `Screens.jsx` | `index.html` (inline) | No pacote? |
|---|---|---|---|---|
| `Logo` | só no `/* global */` | 1 (`<Logo size={24}/>` no modal de conexão de Integrações) | — | **não** → portar |
| `Icons` | só no `/* global */` | 32 | 1 (`Icons.plus`) | sim |
| `Brands`, `BrandTile` | — | 8, 4 | — | sim |
| `Button`, `Card`, `Badge`, `Input`, `Avatar`, `Datepicker` | — | 19, 36, 10, 10, 4, 4 | `Button` 1 | sim |
| `Radio`, `RadioGroup`, `Toggle`, `Checkbox`, `Link`, `Skeleton`, `Pagination` | — | 2, 4, 8, 10, 11, 8, 4 | — | sim |
| `Dropdown`, `Modal`, `Tooltip`, `Alert`, `ProgressBar`, `CodeInput`, `Tabs`, `Table` | `Dropdown` 1 | 12, 16, 16, 7, 4, 2, 3, 3 | — | sim |
| `SideNav`, `SearchInput` | 1, 1 | — | — | sim |
| `ToastStack` | — | — | 1 | sim |
| `window.obToast` | — | 6 (`window.obToast?.(…)`) | — | sim (definido no import de `ToastStack`) |
| `OB_TONES`, `Ph`, `FloatingPanel`, `FieldShell`, `Slider`, `Spinner`, `ProgressCircle`, `DeadlineCalendar`, `StatusDot`, `Drawer`, `Toast`, `Select`, `Chip` | — | — | — | não usados pelo app |

`tweaks-panel.jsx` não usa nenhum global do legado. Nenhuma página de `ds/` (foundations, docs,
components), `slides/` ou outro diretório carrega `Components.jsx`/`Primitives.jsx`. Não há
colisão de nomes: os globais próprios do app (`Sidebar`, `Topbar`, `HomeScreen`…, `useTweaks`,
`Tweak*`) não coincidem com nenhum export do pacote.

Decisões: o único global usado e não exportado é o **`Logo`**, que é portado. `OB_TONES` continua
tabela interna do pacote (nenhum consumidor; o tipo público é `OBTone`); as páginas de doc que
citam `OB_TONES` como conceito continuam corretas, porque a tabela interna tem esse nome.
`window.obToast` já vem do bundle.

### Carregamento do pacote pelo web app

O bundle IIFE usa `window.React`/`window.ReactDOM` (plugin do `tsup.config.ts`) e roda síncrono;
os scripts `text/babel` rodam depois, em ordem. Então basta trocar as duas tags do legado por
`<script src="../../package/dist/onblide-ui.browser.js"></script>` logo após o Babel, como nas
páginas de preview. `Chrome.jsx`, `Screens.jsx` e `tweaks-panel.jsx` continuam sendo JSX do
próprio app, compilado pelo Babel standalone (não são legado: são as telas do app). O `dist/` é
gerado; o web app passa a depender de `cd project/package && npm install && npm run build`, o que
vai para o `CLAUDE.md` e o `README` do web app.

Prova sem navegador: um smoke novo, `scripts/smoke-web-app.mjs`, executa em Node o bundle IIFE e
os scripts do `index.html` (JSX transformado pelo `esbuild`, que já é dependência do `tsup`),
confere que toda tag JSX com inicial maiúscula usada pelo app existe como global ou é declarada no
próprio arquivo (cobre o `Logo`, que só aparece com o modal aberto), que `window.obToast` existe, e
renderiza as cinco telas, a `Sidebar` e a `Topbar` com `react-dom/server`. Protótipo testado numa
cópia fora do repositório: com o legado removido e sem o `Logo` no pacote, falha com
`Screens.jsx: <Logo>`; com o `Logo` portado, passa.

### Smokes e fixtures do pacote que dependiam do legado

`grep -rn "Primitives.jsx\|Components.jsx\|ui_kits/web_app" project/package`:

| Arquivo | Dependência | Destino |
|---|---|---|
| `scripts/smoke-brands.mjs` | **lê** `../../ui_kits/web_app/Primitives.jsx` em tempo de execução (name/hex/cat/desc) | fixture `scripts/fixtures/brands.json` (dados + marcação de `mark(24)`/`mark(40)` renderizada do original) |
| `scripts/smoke-icons.mjs` | tabela copiada do legado; comentário cita `Primitives.jsx:33-60` | tabela fica; conferida mecanicamente contra o original antes da remoção; comentário limpo |
| `scripts/smoke-pagination.mjs` | função `legado()` (algoritmo antigo) e comentário cita `Components.jsx` | função vira `ate040()` (referência da 0.4.0), conferida contra a `Pagination` original em 294 casos antes da remoção |
| `src/browser.ts`, `src/components/obTones.ts`, `src/components/obToastPos.ts`, `src/primitives/badgeTones.ts`, `src/components/SearchInput/SearchInput.tsx`, `src/primitives/Icons/PhIcon.tsx`, `src/primitives/Spinner/Spinner.tsx`, `src/components/ToastStack/ToastStack.tsx` | comentários que citam o legado (`Components.jsx:NNN`, "no original", "via Babel") | reescritos ou removidos junto com o código que explicavam |
| `tsup.config.ts` | comentário "compatibility bundle for the existing preview pages" | passa a citar preview + web app |

Congelamento: um script de uso único executa `Primitives.jsx` e `Components.jsx` em Node (esbuild +
`react-dom/server`), grava `brands.json` e `logo.json` e confere a tabela de ícones e a referência da
paginação. Rodado duas vezes numa cópia: fixtures byte a byte iguais; o `Brands` atual do pacote já
bate com a fixture em dados e marcação. Isso acontece **antes** de apagar o legado; depois, os
smokes leem só as fixtures.

### `project/export/*.html` e `project/_ds_bundle.js`

- `export/Onblide-Web-App-Standalone.html` (9,7 MB, 2026-09-01): bundle do Claude Design
  (`__bundler/manifest` com 58 recursos gzip/base64). Decodificado: embute o **código-fonte do UI kit
  antigo** (os recursos `fcf3bef6…` = `Primitives.jsx`, com o `Logo` antigo, e `d30f31cf…` =
  `Components.jsx`), além de `Chrome.jsx`, `Screens.jsx`, `tweaks-panel.jsx` e React. Não é
  regenerável a partir do repositório (é gerado pelo Claude Design) e nada o carrega; só o índice do
  `project/README.md` o descreve. **Decisão: apagar** (recuperável pelo git; pode ser regerado pelo
  Claude Design a partir do app migrado, se o usuário quiser) e ajustar a linha do README.
- `export/Onblide-Slide-Deck.html`: embute só `slides/index.html` e `deck-stage.js`; nenhum
  vestígio do UI kit. **Mantido** (fora do escopo desta fase).
- `_ds_bundle.js` (304 KB): bundle do Claude Design (`@ds-bundle format 3`) que compila
  `slides/deck-stage.js` e os cinco `.jsx` do web app, inclusive `Components.jsx` e `Primitives.jsx`
  (com `PhIcon` e `ob-prim-kf`). Expõe `"components": []`; nada no repositório o referencia; os
  hashes `sha256[:12]` de `Components.jsx`/`Primitives.jsx` no cabeçalho já não batem com os
  arquivos atuais (já estava desatualizado). **Decisão: apagar** — é uma cópia compilada do legado; o
  `/design-sync`/Claude Design o recria a partir das fontes vivas. `_ds_manifest.json` fica (os
  cartões, inclusive o do web app, continuam válidos; ele não cita os arquivos apagados).
  `_adherence.oxlintrc.json` fica (o padrão `ui_kits/web_app/**` continua válido).

### Resíduos dentro do pacote

- **`PhIcon` duplica `Ph`.** Unificado: `Icons` passa a renderizar `<Ph n={glifo} size={p.size ?? 20}
  style={p.style}/>` e `PhIcon.tsx` é apagado. Diferença de marcação (medida): o `<i>` ganha
  `color:currentColor` inline (mesma cor que a herança já dava; nenhum CSS do repositório pinta o `<i>`
  dos ícones) e a ordem dos atributos serializados muda (`aria-hidden` antes de `style`). Tamanho
  padrão continua 20. O smoke de ícones passa a exigir marcação idêntica à do `Ph`.
- **Keyframes duplicadas.** `SearchInput` injetava `ob-spin` sob `ob-spin-kf` e o `Spinner` injetava
  `ob-spin` + `ob-pulse` sob `ob-prim-kf`, "por fidelidade". A leitura mostrou que o comentário do
  `Spinner` estava errado: `ob-pulse` **é** usada, pelas linhas-esqueleto do `Table` (`loading`).
  Consolidação: `src/internal/keyframes.ts` com `injectSpinKeyframes()` (`ob-spin-kf`, chamada pelo
  `Spinner` e pelo `SearchInput`), e o `Table` injeta a sua `ob-pulse` sob `ob-pulse-kf`. As regras
  `@keyframes` injetadas são as mesmas (conjunto comparado por script); só ids e ordem mudam, e o
  golden é atualizado de propósito: `ob-skeleton-kf, ob-tip-kf, ob-spin-kf, ob-indet-kf, ob-toast-kf,
  ob-toast-pos, ob-shake-kf, ob-pulse-kf, ob-modal-kf` (antes: `…ob-prim-kf…ob-spin-kf…`). Nenhum
  arquivo do repositório referencia os ids `ob-prim-kf`/`ob-spin-kf` fora do pacote, do legado e do
  `_ds_bundle.js`.
- **Keyframe morta na página do `Table`.** `ds/components/components-table.html` declara no `<head>`
  um `@keyframes ob-pulse` próprio (valores diferentes), resíduo de antes da migração: o `<style>`
  injetado pelo bundle entra depois no `<head>` e vence. Removido (sem efeito visual).
- **Arquivos/exports órfãos:** nenhum (todo `.ts/.tsx` de `src` é importado por alguém).
- **Mantidos de propósito:** `badgeTones`/`obTones` (vocabulários distintos); os comentários "forma
  frouxa (idêntica à `SelectProps` original)" de `Select`/`Slider` (falam do tipo antes da união, não
  do legado); o comentário de `tokens.css` (fala de `colors_and_type.css`).

### Documentação viva

- `project/README.md`: linhas que apontam `Icons` e `Logo` para `Primitives.jsx`; linha de
  `export/` (descreve o standalone do web app); o índice não tem `package/`.
- `project/SKILL.md`: manda copiar `Primitives.jsx`; lista `OB_TONES` como primitivo compartilhado.
- `project/ui_kits/web_app/README.md`: lista `Primitives.jsx`; não cita `tweaks-panel.jsx` nem a
  tela de Integrações; não diz que o app depende do build.
- `project/CLAUDE.md`: regra 5 de iconografia cita "o objeto `Icons` do UI kit do web app"; a seção
  de preview não diz que o web app também depende do bundle; a de verificação não cita o smoke novo.
- `project/package/README.md`: seção "`Ph` ou `Icons`?" ("nenhum foi removido") e título "bundle de
  navegador (páginas de preview)"; não documenta o `Logo`.
- `docs/superpowers/specs|plans`: **mantidos**. São o registro do processo (inclusive desta fase) e
  citam o legado como história; apagar ou reescrever documentos datados não remove código, e o git
  já é o histórico. A varredura final exclui só esse diretório. `.superpowers/` e
  `.code-review-graph/` são locais e ignorados pelo git (não versionados), fora do escopo.

## Escopo

| # | Item | Tipo |
|---|---|---|
| 1 | Congelar `brands.json`/`logo.json` a partir do original; conferir tabela de ícones e referência da paginação; smokes deixam de ler o legado | infra |
| 2 | Portar `Logo` (+ `LogoProps`), cópia mecânica, smoke contra a fixture, teste de tipos | feature |
| 3 | `Icons` construído sobre `Ph`; apagar `PhIcon.tsx` | refactor (marcação mínima, documentada) |
| 4 | Consolidar `ob-spin`/`ob-pulse`; golden atualizado; keyframe morta da página do `Table` | refactor |
| 5 | Comentários do pacote que citam o legado (JS emitido idêntico) | limpeza |
| 6 | Web app carrega o bundle; smoke `smoke-web-app.mjs`; cabeçalhos `/* global */` corretos | migração |
| 7 | Apagar `Components.jsx`/`Primitives.jsx` e toda referência viva | remoção |
| 8 | Apagar `export/Onblide-Web-App-Standalone.html` e `_ds_bundle.js` | remoção |
| 9 | Documentação viva (`README`, `SKILL`, `CLAUDE.md`, `README` do pacote) | doc |
| 10 | Verificação final (reinstalação limpa, varredura com zero ocorrências, contagens) | verificação |
| 11 | Conferência visual — **do controlador** | verificação |
| 12 | Release `0.6.0` | release |

Versão alvo: **0.6.0** (minor): export novo (`Logo`, `LogoProps`) e mudanças internas de marcação
e de ids de `<style>`.

## Mudanças de comportamento esperadas no web app

O app passa a usar os componentes do pacote, que já incluem as correções da Fase 3 e da 0.5.1:
`Pagination` com as duas reticências e `<nav>`; `Toggle` com `role="switch"`, foco por Tab (anel de
foco do navegador) e Espaço/Enter; `Modal` com atributos de diálogo; `Tooltip` sem ficar preso
aberto. É o que a conferência visual do controlador deve esperar ver (não são regressões).

## Fora do escopo (com o motivo)

- `<i class="ph …">` montado direto em `Chip`, `SearchInput` (ícone de carregamento) e
  `DeadlineCalendar`: não é legado; trocar por `Ph` muda `display` (inline → inline-flex) e layout.
- Tirar o Babel standalone do web app (compilar `Chrome.jsx`/`Screens.jsx`): as telas são do app,
  não do UI kit antigo; exige um build do app que ninguém pediu.
- `export/Onblide-Slide-Deck.html` e regenerar qualquer export pelo Claude Design.
- Rodar o `/design-sync` e o merge `dev`→`main`.

## Riscos

- Apagar `_ds_bundle.js` afeta só o Claude Design, que o recria no próximo `/design-sync`; nada no
  repositório o carrega. Recuperável com `git show <commit>^:project/_ds_bundle.js`.
- O web app abre em branco sem `dist/` (como as páginas de preview): documentado no `CLAUDE.md` e no
  `README` do web app.
- `smoke-web-app.mjs` importa `esbuild`, que chega pelo `tsup` (já usado pelo `tsup.config.ts`); não
  há dependência nova. Ele não roda efeitos nem abre modais: a checagem estática de tags cobre os
  globais desses ramos, e o resto fica para a conferência visual.
- `Icons` com `color:currentColor` inline: um CSS futuro que pinte `.ph` diretamente perderia para o
  inline; hoje não existe nenhum.

## Verificação

`npm run verify` verde ao fim de cada tarefa (20 smokes na base; 21 com o `Logo`; 22 com o web
app). Vermelho→verde registrado para `smoke-logo`, a asserção nova de `smoke-icons`, o golden e
`smoke-web-app`. Nas tarefas de limpeza, `cmp` do JS emitido. Varredura final:
`git grep -nI -E "Components\.jsx|Primitives\.jsx|PhIcon|ob-prim-kf|_ds_bundle|Web-App-Standalone" -- . ':!docs/superpowers'`
sem nenhuma ocorrência.
