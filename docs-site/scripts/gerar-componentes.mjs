// Gera docs/componentes/<categoria>/<Componente>.mdx a partir do código do pacote e dos exemplos
// (.design-sync/previews/*.tsx), que são a mesma fonte usada pelos cards do Claude Design.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const pacote = path.resolve('../project/package');
const src = path.join(pacote, 'src');
const previews = path.join(pacote, '.design-sync/previews');
const saida = path.resolve('docs/componentes');

const categorias = {
  actions: 'Ações',
  forms: 'Formulários',
  feedback: 'Feedback',
  overlays: 'Sobreposições',
  navigation: 'Navegação',
  'data-display': 'Exibição de dados',
  brand: 'Marca',
  iconography: 'Ícones',
};

const descricoes = {
  Button: 'Botão de ação, em cinco variantes e três tamanhos.',
  Link: 'Link de texto, com variantes e indicação de link externo.',
  Input: 'Campo de texto com rótulo, dica, ícone e estado de erro.',
  SearchInput: 'Campo de busca com sugestões e estado de carregamento.',
  Select: 'Lista suspensa de seleção única ou múltipla, com busca.',
  Datepicker: 'Seletor de data única ou de intervalo, com calendário.',
  CodeInput: 'Campo para códigos curtos (verificação, PIN), um dígito por caixa.',
  Checkbox: 'Caixa de seleção, com estado indeterminado.',
  Radio: 'Botão de opção única.',
  RadioGroup: 'Grupo de opções únicas com navegação por teclado.',
  Toggle: 'Interruptor liga/desliga.',
  Slider: 'Controle deslizante de valor único ou de faixa.',
  FieldShell: 'Superfície comum dos campos: borda, foco, erro e desabilitado.',
  Alert: 'Aviso em linha, em quatro tons, com ação e opção de dispensar.',
  Toast: 'Notificação temporária.',
  ToastStack: 'Fila de notificações, montada uma vez na raiz do app.',
  ProgressBar: 'Barra de progresso: determinada, indeterminada ou segmentada.',
  ProgressCircle: 'Indicador de progresso circular.',
  Spinner: 'Indicador de carregamento animado.',
  Skeleton: 'Espaço reservado enquanto o conteúdo carrega.',
  StatusDot: 'Ponto de status colorido, com rótulo opcional.',
  Modal: 'Janela de diálogo modal, com tamanhos e rodapé.',
  Drawer: 'Painel lateral que desliza sobre a tela.',
  Dropdown: 'Menu suspenso de ações.',
  Tooltip: 'Dica que aparece ao passar o mouse ou focar.',
  FloatingPanel: 'Superfície flutuante usada por menus e listas.',
  Tabs: 'Abas para alternar entre visões do mesmo contexto.',
  SideNav: 'Navegação lateral do app, recolhível.',
  Pagination: 'Paginação com janela de páginas e setas.',
  Table: 'Tabela com seleção, ordenação e estados vazio e de carregamento.',
  Card: 'Cartão de conteúdo, com borda ou sombra.',
  Avatar: 'Avatar com imagem ou iniciais, em tamanhos e cores.',
  Badge: 'Selo de status ou contagem, em cinco tons.',
  Chip: 'Chip de filtro, selecionável e removível.',
  DeadlineCalendar: 'Calendário mensal de prazos, com feriados.',
  Logo: 'Logo horizontal da Onblide, que se adapta ao tema.',
  BrandTile: 'Moldura com o logo de uma marca de terceiros.',
  Icons: 'Registro central de ícones da interface.',
  Ph: 'Componente base que renderiza qualquer glifo do Phosphor.',
};

const titulos = {
  Aberto: 'Aberto', Acoes: 'Ações', AlinhadoADireita: 'Alinhado à direita', Borda: 'Com borda', Carregando: 'Carregando',
  CartaoCarregando: 'Cartão carregando', ComAcao: 'Com ação', ComDescricao: 'Com descrição', ComErro: 'Com erro',
  ComIcone: 'Com ícone', Completo: 'Completo', ComPontoETamanhos: 'Com ponto e tamanhos', ComRotulo: 'Com rótulo',
  ComTitulo: 'Com título', ComValor: 'Com valor', Confirmacao: 'Confirmação', Cores: 'Cores', DataMinima: 'Data mínima',
  DataUnica: 'Data única', Desabilitado: 'Desabilitado', Direita: 'À direita', Dispensavel: 'Dispensável',
  EntregaPendente: 'Entrega pendente', Erro: 'Erro', Esquerda: 'À esquerda', Estados: 'Estados', Expandido: 'Expandido',
  Externo: 'Externo', Faixa: 'Faixa', Fechado: 'Fechado', FilaDeAvisos: 'Fila de avisos', Filtros: 'Filtros', Fim: 'Fim',
  Formas: 'Formas', Grupo: 'Grupo', Icones: 'Ícones', IndeterminadoESegmentado: 'Indeterminado e segmentado',
  Inicio: 'Início', Integracoes: 'Integrações', Intervalo: 'Intervalo', Invertido: 'Invertido', Linha: 'Linha',
  Medio: 'Médio', Meio: 'Meio', Multipla: 'Múltipla', Navegacao: 'Navegação', Padrao: 'Padrão', Pequeno: 'Pequeno',
  Pilula: 'Pílula', PreEnchido: 'Pré-preenchido', Recolhido: 'Recolhido', Removiveis: 'Removíveis',
  ResetAoEnviar: 'Reset ao enviar', Rolavel: 'Rolável', Selecionavel: 'Selecionável', SemBotaoEnviar: 'Sem botão de enviar',
  SemDescricao: 'Sem descrição', Simples: 'Simples', Sombra: 'Com sombra', Sucesso: 'Sucesso', Tamanhos: 'Tamanhos',
  TamanhosECores: 'Tamanhos e cores', Texto: 'Texto', Tons: 'Tons', Variantes: 'Variantes', Vazio: 'Vazio',
};

// Remove só as anotações de tipo (o editor ao vivo entende JSX, não TypeScript), preservando o texto original.
const semTipos = (sf, no) => {
  const cortes = [];
  const visitar = (n) => {
    if ((ts.isParameter(n) || ts.isVariableDeclaration(n)) && n.type) cortes.push([n.name.end, n.type.end]);
    else if (ts.isAsExpression(n)) cortes.push([n.expression.end, n.end]);
    else if ((ts.isCallExpression(n) || ts.isNewExpression(n)) && n.typeArguments) cortes.push([n.typeArguments.pos - 1, n.typeArguments.end + 1]);
    ts.forEachChild(n, visitar);
  };
  visitar(no);
  let texto = sf.text.slice(no.getStart(sf), no.end);
  const base = no.getStart(sf);
  for (const [a, b] of cortes.sort((x, y) => y[0] - x[0])) texto = texto.slice(0, a - base) + texto.slice(b - base);
  return texto;
};

// Tira a indentação comum das linhas, para o JSX extraído começar na coluna zero.
const dedentar = (texto) => {
  const linhas = texto.split('\n');
  const recuo = Math.min(...linhas.slice(1).filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return [linhas[0], ...linhas.slice(1).map((l) => l.slice(Number.isFinite(recuo) ? recuo : 0))].join('\n');
};

// Cada export do preview vira um exemplo. Se ele for só um JSX sem auxiliares, o exemplo mostra apenas esse JSX
// (modo em linha); se depender de auxiliares ou hooks, mostra o código completo com render(), como foi escrito.
const exemplosDe = (nome) => {
  const arq = path.join(previews, `${nome}.tsx`);
  if (!fs.existsSync(arq)) return [];
  const sf = ts.createSourceFile(`${nome}.tsx`, fs.readFileSync(arq, 'utf8').replace(/\r\n/g, '\n'), ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
  const auxiliares = [];
  const nomesAux = [];
  const exemplos = [];
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st)) continue;
    const exportado = ts.isVariableStatement(st) && st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!exportado) {
      auxiliares.push(semTipos(sf, st));
      if (ts.isVariableStatement(st)) nomesAux.push(...st.declarationList.declarations.map((d) => d.name.getText(sf)));
      else if (st.name) nomesAux.push(st.name.getText(sf));
      continue;
    }
    const decl = st.declarationList.declarations[0];
    const id = decl.name.getText(sf);
    const fn = decl.initializer;
    let corpo = fn && ts.isArrowFunction(fn) ? fn.body : null;
    while (corpo && ts.isParenthesizedExpression(corpo)) corpo = corpo.expression;
    const jsx = corpo && (ts.isJsxElement(corpo) || ts.isJsxFragment(corpo) || ts.isJsxSelfClosingElement(corpo)) ? corpo : null;
    const textoJsx = jsx ? semTipos(sf, jsx) : '';
    const usaAux = nomesAux.some((n) => new RegExp(`\\b${n}\\b`).test(textoJsx));
    if (jsx && !usaAux) exemplos.push({ id, modo: 'live', codigo: dedentar(textoJsx) });
    else {
      const proprio = semTipos(sf, st).replace(/^export\s+/, '');
      exemplos.push({ id, modo: 'live noInline', codigo: `${[...auxiliares, proprio].join('\n\n')}\n\nrender(<${id} />);` });
    }
  }
  return exemplos;
};

// Nomes exportados pelo pacote: identificadores que um exemplo pode usar sem declarar.
const exportados = new Set(
  [...fs.readFileSync(path.join(pacote, 'dist/index.d.ts'), 'utf8').matchAll(/declare const (\w+)/g)].map((m) => m[1]),
);
const GLOBAIS = new Set(['React', 'useState', 'useEffect', 'useRef', 'Math', 'Date', 'console', 'window', 'document', 'String', 'Number', 'Array', 'Object', 'JSON', 'undefined', 'Boolean', 'setTimeout']);

// Identificadores livres de uma expressão (os que precisam existir fora dela).
const livres = (no) => {
  const declarados = new Set();
  const usados = new Set();
  const visitar = (n) => {
    if ((ts.isParameter(n) || ts.isVariableDeclaration(n) || ts.isBindingElement(n)) && ts.isIdentifier(n.name)) declarados.add(n.name.text);
    if (ts.isIdentifier(n)) {
      const pai = n.parent;
      const ehNome = (ts.isPropertyAccessExpression(pai) && pai.name === n) || (ts.isPropertyAssignment(pai) && pai.name === n)
        || ts.isJsxAttribute(pai) || (ts.isParameter(pai) && pai.name === n) || (ts.isVariableDeclaration(pai) && pai.name === n)
        || (ts.isBindingElement(pai) && (pai.name === n || pai.propertyName === n));
      if (!ehNome) usados.add(n.text);
    }
    ts.forEachChild(n, visitar);
  };
  visitar(no);
  return [...usados].filter((x) => !declarados.has(x));
};

// Demo interativa: o uso mais completo do componente nos exemplos vira o ponto de partida dos controles.
const demoDe = (nome) => {
  const arq = path.join(previews, `${nome}.tsx`);
  if (!fs.existsSync(arq)) return null;
  const sf = ts.createSourceFile(`${nome}.tsx`, fs.readFileSync(arq, 'utf8').replace(/\r\n/g, '\n'), ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
  const aux = new Map();
  for (const st of sf.statements) {
    const exportado = st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (ts.isImportDeclaration(st) || exportado) continue;
    const nomes = ts.isVariableStatement(st) ? st.declarationList.declarations.map((d) => d.name.getText(sf)) : st.name ? [st.name.getText(sf)] : [];
    for (const n of nomes) aux.set(n, st);
  }
  let melhor = null;
  const visitar = (n) => {
    const abre = ts.isJsxElement(n) ? n.openingElement : ts.isJsxSelfClosingElement(n) ? n : null;
    if (abre && abre.tagName.getText(sf) === nome && (!melhor || abre.attributes.properties.length > melhor.abre.attributes.properties.length)) melhor = { no: n, abre };
    ts.forEachChild(n, visitar);
  };
  visitar(sf);
  if (!melhor) return null;
  const conhecido = (id) => GLOBAIS.has(id) || exportados.has(id) || aux.has(id);
  const precisa = new Set();
  const literais = {};
  const brutos = {};
  for (const a of melhor.abre.attributes.properties) {
    if (!ts.isJsxAttribute(a)) continue;
    const k = a.name.getText(sf);
    const ini = a.initializer;
    if (!ini) { literais[k] = true; continue; }
    if (ts.isStringLiteral(ini)) { literais[k] = ini.text; continue; }
    const ex = ini.expression;
    if (!ex) continue;
    if (ts.isNumericLiteral(ex)) { literais[k] = Number(ex.text); continue; }
    if (ex.kind === ts.SyntaxKind.TrueKeyword || ex.kind === ts.SyntaxKind.FalseKeyword) { literais[k] = ex.kind === ts.SyntaxKind.TrueKeyword; continue; }
    if (ts.isStringLiteral(ex) || ts.isNoSubstitutionTemplateLiteral(ex)) { literais[k] = ex.text; continue; }
    const ids = livres(ex);
    if (ids.every(conhecido)) { brutos[k] = semTipos(sf, ex); ids.filter((x) => aux.has(x)).forEach((x) => precisa.add(x)); }
  }
  let filhos = null;
  if (ts.isJsxElement(melhor.no) && melhor.no.children.length) {
    const ids = melhor.no.children.flatMap((c) => livres(c));
    if (ids.every(conhecido)) {
      const ini = melhor.no.openingElement.end;
      const fim = melhor.no.closingElement.getStart(sf);
      const texto = dedentar(sf.text.slice(ini, fim).replace(/^\s*\n/, '').replace(/\s+$/, ''));
      filhos = texto.trim() ? texto.trim() : null;
      ids.filter((x) => aux.has(x)).forEach((x) => precisa.add(x));
    }
  }
  // Auxiliares que os auxiliares usados também usam.
  for (const x of [...precisa]) for (const y of livres(aux.get(x))) if (aux.has(y)) precisa.add(y);
  const auxiliares = sf.statements.filter((st) => [...precisa].some((x) => aux.get(x) === st)).map((st) => semTipos(sf, st)).join('\n\n');
  // Sobreposições começam fechadas: abrir é uma das coisas que a demo deixa você fazer.
  if (literais.open === true) literais.open = false;
  return { literais, brutos, filhos, auxiliares };
};

// Guia de uso/conteúdo/design do componente (docs-site/guias/<Nome>.mdx), se existir.
const guiaDe = (nome) => {
  const arq = path.resolve('guias', `${nome}.mdx`);
  if (!fs.existsSync(arq)) return null;
  const texto = fs.readFileSync(arq, 'utf8').replace(/\r\n/g, '\n');
  const [, cab, corpo] = texto.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const resumo = JSON.parse(cab.match(/^resumo: (.*)$/m)[1]);
  const criterios = JSON.parse(cab.match(/^criterios: (.*)$/m)[1]);
  return { resumo, criterios, corpo: corpo.replace(/^\s*\{\/\*[\s\S]*?\*\/\}\s*/, '').trim() };
};

fs.rmSync(saida, { recursive: true, force: true });
fs.mkdirSync(saida, { recursive: true });
fs.writeFileSync(
  path.join(saida, '_category_.json'),
  JSON.stringify({ label: 'Componentes', position: 4 }, null, 2),
);

// Histórico de versões: cópia do CHANGELOG do pacote, gerado pelo changesets.
const changelog = fs.readFileSync(path.join(pacote, 'CHANGELOG.md'), 'utf8').replace(/^# .*\n/, '');
fs.writeFileSync(
  path.resolve('docs/changelog.md'),
  `---\ntitle: Changelog\nsidebar_position: 5\ndescription: Histórico de versões do @onblide/ui.\n---\n\n${changelog}`,
);
let posCat = 1;
let total = 0;
for (const [dir, rotulo] of Object.entries(categorias)) {
  const pasta = path.join(src, dir);
  if (!fs.existsSync(pasta)) continue;
  const alvo = path.join(saida, dir);
  fs.mkdirSync(alvo, { recursive: true });
  fs.writeFileSync(path.join(alvo, '_category_.json'), JSON.stringify({ label: rotulo, position: posCat++ }, null, 2));
  const nomes = fs.readdirSync(pasta, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
  nomes.forEach((nome, i) => {
    const ex = exemplosDe(nome);
    const demo = nome === 'Icons' ? null : demoDe(nome);
    const guia = guiaDe(nome);
    const resumo = guia?.resumo || descricoes[nome] || '';
    const j = (v) => `{${JSON.stringify(v)}}`;
    const partes = [
      '---', `title: ${nome}`, `sidebar_position: ${i + 1}`, `description: ${JSON.stringify(descricoes[nome] ?? nome)}`, '---', '',
      resumo, '', '```ts', `import { ${nome} } from '@onblide/ui';`, '```', '',
    ];
    if (demo) {
      partes.push('## Demo interativa', '', 'Ajuste as propriedades e veja o componente e o código mudarem juntos.', '',
        `<Playground nome="${nome}" literais=${j(demo.literais)} brutos=${j(demo.brutos)} filhos=${j(demo.filhos)} auxiliares=${j(demo.auxiliares)} />`, '');
    }
    if (nome !== 'Icons') partes.push('## Propriedades', '', `<PropsTable nome="${nome}" />`, '');
    if (ex.length) {
      partes.push('## Exemplos', '');
      for (const e of ex) partes.push(`### ${titulos[e.id] ?? e.id}`, '', `\`\`\`jsx ${e.modo}`, e.codigo, '```', '');
    }
    if (guia) {
      partes.push(guia.corpo, '');
      if (guia.criterios.length) partes.push('## Critérios de qualidade', '', `<Criterios itens=${j(guia.criterios)} />`, '');
    }
    fs.writeFileSync(path.join(alvo, `${nome}.mdx`), partes.join('\n'));
    total++;
  });
}
console.log(`componentes: ${total} páginas em docs/componentes`);
