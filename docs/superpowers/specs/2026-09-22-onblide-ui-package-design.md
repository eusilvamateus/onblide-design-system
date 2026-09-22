# `@onblide/ui` — pacote sincronizável com Claude Design (Fase 1)

**Status:** proposto — aguardando revisão
**Data:** 2026-09-22

## Contexto

O usuário quer sincronizar o `onblide-design-system` com o Claude Design
(claude.ai/design), usando a skill `design-sync`, para que o agente de
design monte protótipos com os componentes reais da marca em vez de
componentes genéricos.

A skill `design-sync` exige que o repositório sincronizado esteja num de dois
formatos: um **pacote npm instalável e buildável** (module ESM/CJS real, com
`package.json` + lockfile) ou um **Storybook**. Este repositório não tem
nenhum dos dois: `ui_kits/web_app/Components.jsx` e `Primitives.jsx` (os
~40 componentes reais do design system) são carregados direto no navegador
via Babel Standalone (`<script type="text/babel" src="...">`) e se
registram como globais (`Object.assign(window, { Checkbox, Modal, ... })`) —
não há `import`/`export`, não há build, não há `package.json`.

Esse padrão de carregamento (fetch de `.jsx` cru via Babel Standalone) já foi
a causa raiz de dois bugs reais corrigidos nesta mesma sessão (checkbox e
datepicker "não carregavam" quando abertos via `file://`, por CORS). Resolver
a estrutura de empacotamento resolve isso de raiz, além de habilitar o sync.

O objetivo desta Fase 1 é montar toda a infraestrutura necessária e provar
o pipeline ponta a ponta com um subconjunto pequeno de componentes, antes de
portar o restante (Fase 2, fora de escopo deste documento).

## Não-objetivos (fora de escopo)

- `Chrome.jsx` (Sidebar/Topbar), `Screens.jsx` (telas prontas) e
  `tweaks-panel.jsx` (ferramenta de dev) — são composições/ferramentas, não
  componentes de design system reutilizáveis. Continuam exatamente como
  estão, carregados via Babel Standalone, consumindo os globais que o novo
  bundle browser continua provendo.
- Porte dos ~34 componentes restantes de `Components.jsx`/`Primitives.jsx`
  além dos 5-6 pilotos — vira uma Fase 2, com seu próprio plano.
- Suíte de testes automatizados, Storybook, CI/CD, publicação em registry
  npm público. Nada disso foi pedido; não faz parte desta fase.
- Mudança de comportamento ou visual de qualquer componente — é um porte
  estrutural, não um redesign. Estilo (`style={{...}}` lendo
  `var(--ob-*)`) e lógica são preservados exatamente como estão hoje.
- `export/*.html` (snapshots compilados) — regenerados separadamente via
  Claude Design, como já documentado em memória de projeto.

## Decisões

### 1. Local e nome do pacote

Novo diretório `project/package/`, pacote `@onblide/ui`, dentro da mesma
raiz onde `CLAUDE.md` já rege as regras do design system.

### 2. Estrutura de arquivos

```text
project/package/
  package.json           # react/react-dom como peerDependencies
  tsconfig.json
  tsup.config.ts          # build: ESM + CJS + .d.ts + bundle IIFE browser
  CHANGELOG.md            # gerado pelo Changesets
  .changeset/              # config + changesets pendentes
  .design-sync/config.json
  src/
    index.ts               # re-exporta tudo
    tokens.css              # @import do colors_and_type.css do repo
    icons/                   # Phosphor auto-hospedado (webfont + css)
    primitives/
      Button/Button.tsx
      Checkbox/Checkbox.tsx
      Datepicker/Datepicker.tsx
      Ph/Ph.tsx
      ... (restante na Fase 2)
    components/
      Select/Select.tsx
      Dropdown/Dropdown.tsx
      ... (restante na Fase 2)
  dist/                    # saída do build (gitignored)
```

Um componente por arquivo (`src/<grupo>/<Nome>/<Nome>.tsx`), mapeando 1:1
para o formato que `design-sync` espera
(`components/<group>/<Name>/{.html,.jsx,.d.ts,.prompt.md}`).

### 3. Linguagem: TypeScript real

Componentes viram `.tsx` com props tipadas — não JSDoc inferido. É mais
trabalho por componente, mas gera um `.d.ts` de verdade (o contrato que o
agente de design lê para usar a API corretamente) e é o padrão de mercado
para bibliotecas de componentes.

### 4. Estilo e ícones

- Nenhuma dependência de CSS-in-JS a resolver: os componentes já usam
  `style={{ color: 'var(--ob-blue)' }}` etc. O pacote embarca
  `colors_and_type.css` (do repo) como seu stylesheet de tokens
  (`src/tokens.css`, importado por `styles.css` — a cadeia de `@import`
  que o Claude Design carrega em cada design renderizado).
- Ícones Phosphor (hoje via CDN) são **auto-hospedados** dentro do pacote,
  seguindo o mesmo padrão já usado para as fontes Poppins/Playfair/JetBrains
  (arquivos locais, sem dependência de rede em tempo de execução).

### 5. Build e compatibilidade com as páginas de preview existentes

`tsup` (baseado em esbuild) gera:

- `dist/index.js` (ESM) + `dist/index.d.ts` — o que `design-sync` consome
  para montar o bundle enviado ao Claude Design.
- `dist/onblide-ui.browser.js` — bundle IIFE que reproduz o efeito de
  `Object.assign(window, {...})`: cada export nomeado vira uma global
  (`window.Checkbox`, `window.Modal`, ...). Sem Babel no navegador.

As páginas de preview cujos componentes já foram portados nesta fase trocam
uma linha:

```diff
- <script type="text/babel" src="../../ui_kits/web_app/Components.jsx"></script>
+ <script src="../../package/dist/onblide-ui.browser.js"></script>
```

Páginas cujos componentes ainda não foram portados continuam carregando
`Components.jsx`/`Primitives.jsx` como hoje, até a Fase 2 terminar o porte
completo (nesse meio-tempo pode haver componentes definidos nos dois
lugares — ver "Riscos" abaixo).

### 6. Escopo do piloto (Fase 1)

Portar 5-6 componentes que cobrem os padrões estruturais existentes:

- **`Ph`** (ícones) — pré-requisito de quase todos os outros
- **`Button`** — simples, sem estado interno
- **`Checkbox`** — estado interno, variante indeterminate
- **`Select`** ou **`Dropdown`** — posicionamento/overlay
- **`Datepicker`** — o mais complexo (calendário, máscara de input, validação)

Critério de pronto: cada um builda limpo, o `.d.ts` gerado bate com a API
real, a página de preview migrada renderiza idêntica à versão anterior
(comparação visual manual), e o `/design-sync` roda até o fim e sobe os 5-6
componentes para um projeto no Claude Design sem erro de verificação.

### 7. Versionamento

- Semver no `package.json` do pacote, começando em `0.1.0` (instável/
  incompleto até a Fase 2 terminar; `1.0.0` quando os ~40 componentes
  estiverem portados e a API estabilizada).
- **Changesets** (`@changesets/cli`) para versionar e gerar o
  `CHANGELOG.md`: cada mudança relevante ganha um arquivo em `.changeset/`
  (via `changeset add`, interativo — tipo patch/minor/major + resumo);
  fechar uma versão roda `changeset version`, que soma os changesets
  pendentes, bump a versão e escreve o changelog, apagando os arquivos
  consumidos.
- Tag git ao final de cada release (`onblide-ui@0.1.0`) marcando o commit.
- Não há publicação em registry npm público — uso local/via `design-sync`.

### 8. Convenção de commits

Conventional Commits, em português, documentado no `CLAUDE.md` (sem
enforcement por ferramenta — sem commitlint/husky):

- Tipos: `feat`, `fix`, `docs`, `refactor`, `style`, `chore`, `test`
- Escopo: nome do componente ou área (`feat(checkbox): ...`); mudanças
  amplas ficam sem escopo (`feat: ...`)
- Descrição: minúscula, imperativo curto, sem ponto final
- Já é o padrão de fato usado nos commits recentes deste repositório —
  esta seção só o torna explícito.
- Tipo do commit e severidade do changeset **não são amarrados por
  ferramenta** — tendem a se alinhar na prática (`feat`→minor, `fix`→patch)
  mas são registrados independentemente.

## Riscos e mitigação

- **Duplicação temporária durante a transição de fases**: um componente
  como `Checkbox`, uma vez portado, passa a existir tanto em
  `ui_kits/web_app/Components.jsx` (ainda usado por `Screens.jsx` etc., fora
  de escopo) quanto em `project/package/src/components/Checkbox/`. Os dois
  precisam continuar se comportando igual até a Fase 2 eliminar a cópia
  antiga. Mitigação: nesta fase, tratar `ui_kits/web_app/*.jsx` como
  somente-leitura para os componentes já portados — qualquer correção vai
  primeiro no pacote novo.
- **Conversão para TypeScript pode expor inconsistências de props** não
  visíveis no JS solto atual (ex.: um `onChange` que às vezes recebe o
  valor, às vezes o evento). Mitigação: preservar o comportamento observado
  hoje exatamente como está, mesmo que o tipo resultante pareça pouco
  idiomático — não é o momento de "corrigir" a API.
- **Auto-hospedar o Phosphor** aumenta o peso do pacote. Aceitável dado que
  as outras fontes já seguem esse padrão.

## Verificação (Fase 1)

1. `cd project/package && npm install && npm run build` — build limpo, sem
   erros de tipo.
2. Abrir cada página de preview migrada via `http server` (nunca
   `file://` — ver memória do projeto) e comparar visualmente com a versão
   anterior ao porte.
3. Rodar `/design-sync` apontando para `project/package/` e confirmar que
   ele reconhece o formato "package", builda, verifica e sobe os 5-6
   componentes pilotos para um projeto no Claude Design.
4. `changeset add` + `changeset version` de teste, confirmar que
   `CHANGELOG.md` e a versão em `package.json` saem corretos.
