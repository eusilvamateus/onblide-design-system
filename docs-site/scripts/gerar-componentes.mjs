import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const pacote = path.resolve('../packages/ui');
const src = path.join(pacote, 'src');
const pastaExemplos = path.resolve('exemplos');
const saida = path.resolve('docs/componentes');

const categorias = ['actions', 'forms', 'feedback', 'overlays', 'navigation', 'data-display', 'brand', 'iconography'];

const descricoes = {
  Button: 'Botão de ação, em cinco variantes e três tamanhos.',
  Link: 'Link de texto, com variantes e indicação de link externo.',
  Input: 'Campo de texto com rótulo, dica, ícone e estado de erro.',
  SearchInput: 'Campo de busca com sugestões e estado de carregamento.',
  Select: 'Lista suspensa de seleção única ou múltipla, com busca.',
  Datepicker: 'Campo de data única ou intervalo, com digitação mascarada e calendário em popover.',
  CodeInput: 'Campo para códigos curtos (verificação, PIN), um dígito por caixa.',
  Checkbox: 'Caixa de seleção, com estado indeterminado.',
  Radio: 'Botão de opção única.',
  RadioGroup: 'Grupo de opções únicas com navegação por teclado.',
  Switch: 'Interruptor liga/desliga.',
  Slider: 'Controle deslizante de valor único ou de faixa.',
  FieldShell: 'Superfície comum dos campos: borda, foco, erro e desabilitado.',
  Alert: 'Aviso em linha, em quatro tons, com ação e opção de dispensar.',
  Toast: 'Notificação temporária.',
  ToastStack: 'Fila de notificações, montada uma vez na raiz do app.',
  ProgressBar: 'Barra de progresso: determinada, indeterminada ou segmentada.',
  ProgressCircle: 'Indicador de progresso circular.',
  Spinner: 'Indicador de carregamento animado.',
  Skeleton: 'Espaço reservado enquanto o conteúdo carrega.',
  Modal: 'Janela de diálogo modal, com tamanhos e rodapé.',
  Drawer: 'Painel lateral que desliza sobre a tela.',
  Tooltip: 'Dica que aparece ao passar o mouse ou focar.',
  Tabs: 'Abas para alternar entre visões do mesmo contexto.',
  SideNav: 'Navegação lateral do app, recolhível.',
  Pagination: 'Paginação com janela de páginas e setas.',
  Table: 'Tabela com seleção, ordenação e estados vazio e de carregamento.',
  Card: 'Cartão de conteúdo, com borda ou sombra.',
  Kbd: 'Tecla ou atalho de teclado, em fonte monoespaçada.',
  AvatarGroup: 'Avatares sobrepostos, com contador de excedentes.',
  EmptyState: 'Mensagem no lugar de um conteúdo que ainda não existe, com ação opcional.',
  Accordion: 'Seções que abrem e fecham, em modo único ou múltiplo, com teclado.',
  AlertDialog: 'Diálogo de confirmação, para decidir antes de uma ação.',
  Calendar: 'Calendário mensal de uma data ou de um intervalo, com navegação por teclado.',
  Avatar: 'Avatar com imagem ou iniciais, em tamanhos e cores.',
  Badge: 'Selo de status ou contagem, em cinco tons.',
  Chip: 'Chip de filtro, selecionável e removível.',
  Logo: 'Logo horizontal da Onblide, que se adapta ao tema.',
  Icons: 'Registro central de ícones da interface.',
  Ph: 'Componente base que renderiza qualquer glifo do Phosphor.',
  Divider: 'Linha de separação entre blocos de conteúdo, com rótulo opcional.',
  ScrollArea: 'Área com rolagem nativa e barra fina e discreta, nos dois eixos.',
  List: 'Linha de lista oficial, base do Select, Menu, Autocomplete e TreeView.',
  Timeline: 'Eventos em ordem cronológica, para leitura.',
  TreeView: 'Hierarquia que abre e fecha, com seleção, busca e edição.',
  Textarea: 'Campo de texto de várias linhas, com contador de caracteres.',
  NumberField: 'Campo numérico com incremento/decremento, limites e formato pt-BR.',
  FileUpload: 'Envio de arquivos por arrastar/soltar ou seletor, com fila de progresso.',
  Autocomplete: 'Campo de texto com lista de sugestões, seleção única ou múltipla.',
  Breadcrumbs: 'Trilha de navegação com a hierarquia da página atual.',
  Stepper: 'Indicador de etapas de um fluxo.',
  Menubar: 'Barra fixa com vários menus lado a lado, padrão de app de edição.',
  Popover: 'Conteúdo rico ancorado a um gatilho, não modal.',
  Menu: 'Menu de comandos aberto a partir de um gatilho, com teclado completo.',
  ToggleButton: 'Botão com dois estados, pressionado e não pressionado, com aria-pressed.',
  ButtonGroup: 'Agrupa Buttons ou ToggleButtons relacionados, anexados ou espaçados.',
  Navbar: 'Barra de navegação superior, com marca, links, busca ou contexto, e ações.',
};

const titulos = {
  Aberto: 'Aberto', Acoes: 'Ações', AlinhadoADireita: 'Alinhado à direita', Borda: 'Com borda', Carregando: 'Carregando',
  CartaoCarregando: 'Cartão carregando', ComAcao: 'Com ação', ComDescricao: 'Com descrição', ComErro: 'Com erro',
  ComIcone: 'Com ícone', SemFundo: 'Sem fundo', RedimensionavelNosDoisEixos: 'Redimensionável nos dois eixos', Completo: 'Completo', ComPontoETamanhos: 'Com ponto e tamanhos', ComRotulo: 'Com rótulo',
  ComTitulo: 'Com título', ComValor: 'Com valor', Confirmacao: 'Confirmação', Cores: 'Cores', DataMinima: 'Data mínima',
  DataUnica: 'Data única', Desabilitado: 'Desabilitado', Direita: 'À direita', Dispensavel: 'Dispensável',
  EntregaPendente: 'Entrega pendente', Erro: 'Erro', Esquerda: 'À esquerda', Estados: 'Estados', Expandido: 'Expandido',
  Externo: 'Externo', Faixa: 'Faixa', Fechado: 'Fechado', FilaDeAvisos: 'Fila de avisos', Filtros: 'Filtros', Fim: 'Fim',
  Formas: 'Formas', Grupo: 'Grupo', Icones: 'Ícones', IndeterminadoESegmentado: 'Indeterminado e segmentado',
  Inicio: 'Início', Integracoes: 'Integrações', Intervalo: 'Intervalo', Invertido: 'Invertido', Linha: 'Linha',
  Medio: 'Médio', Meio: 'Meio', Multipla: 'Múltipla', Navegacao: 'Navegação', Padrao: 'Padrão', Pequeno: 'Pequeno',
  Pilula: 'Pílula', PreEnchido: 'Pré-preenchido', Recolhido: 'Recolhido', Removiveis: 'Removíveis',
  Rolavel: 'Rolável', Selecionavel: 'Selecionável',
  SemDescricao: 'Sem descrição', Simples: 'Simples', Sombra: 'Com sombra', Sucesso: 'Sucesso', Tamanhos: 'Tamanhos',
  TamanhosECores: 'Tamanhos e cores', Texto: 'Texto', Tons: 'Tons', Variantes: 'Variantes', Vazio: 'Vazio',
  Aparencia: 'Aparência', SoIcone: 'Só ícone', Anexado: 'Anexado', Espacado: 'Espaçado', SemCaixa: 'Sem caixa', NaoControlado: 'Não controlado',
  SelecaoUnica: 'Seleção única', SelecaoMultipla: 'Seleção múltipla', SplitButton: 'Split button',
  ComLinks: 'Com links', BuscaCentral: 'Busca central', ComAbas: 'Com abas', Contexto: 'Contexto',
  DatasIndisponiveis: 'Datas indisponíveis',
  Dropzone: 'Dropzone', Botao: 'Botão', FotoDePerfil: 'Foto de perfil', FotoAtual: 'Foto atual', Enviando: 'Enviando', Arrastando: 'Arrastando', ComArquivos: 'Com arquivos',
  Disparando: 'Disparando', Posicoes: 'Posições', Persistente: 'Persistente',
  EmFundoEscuro: 'Em fundo escuro', EmFundoClaro: 'Em fundo claro',
  Meses: 'Meses', Anos: 'Anos', AnosComLimites: 'Anos com limites', Teclas: 'Teclas', SemCaixa: 'Sem caixa', NaoControlado: 'Não controlado', Invertido: 'Invertido', ComLimite: 'Com limite', Busca: 'Busca',
  Multiplo: 'Múltiplo', SemIcone: 'Sem ícone', SemIcones: 'Sem ícones', Destrutivo: 'Destrutivo',
  SemanaNaSegunda: 'Semana na segunda',
  Unico: 'Único',
  IniciaisProprias: 'Iniciais próprias',
  ComFoto: 'Com foto',
  SoIcone: 'Só ícone',
  NeutroComContador: 'Neutro com contador',
};

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

const dedentar = (texto) => {
  const linhas = texto.split('\n');
  const recuo = Math.min(...linhas.slice(1).filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return [linhas[0], ...linhas.slice(1).map((l) => l.slice(Number.isFinite(recuo) ? recuo : 0))].join('\n');
};

const exemplosDe = (nome) => {
  const arq = path.join(pastaExemplos, `${nome}.tsx`);
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

const demoDe = (nome) => {
  const arq = path.resolve('demos', `${nome}.jsx`);
  if (!fs.existsSync(arq)) return null;
  const texto = fs.readFileSync(arq, 'utf8').replace(/\r\n/g, '\n');
  const sf = ts.createSourceFile(`${nome}.jsx`, texto, ts.ScriptTarget.ESNext, true, ts.ScriptKind.JSX);
  const ultimo = sf.statements.at(-1);
  if (!ultimo || !ts.isExpressionStatement(ultimo)) throw new Error(`demos/${nome}.jsx: a última instrução deve ser o JSX da demo`);
  let raiz = ultimo.expression;
  while (ts.isParenthesizedExpression(raiz)) raiz = raiz.expression;
  let alvo = null;
  const visitar = (n) => {
    if (alvo) return;
    const abre = ts.isJsxElement(n) ? n.openingElement : ts.isJsxSelfClosingElement(n) ? n : null;
    if (abre && abre.tagName.getText(sf) === nome) { alvo = { no: n, abre }; return; }
    ts.forEachChild(n, visitar);
  };
  visitar(raiz);
  if (!alvo) throw new Error(`demos/${nome}.jsx: não há <${nome}> no JSX da demo`);
  const literais = {};
  const brutos = {};
  for (const a of alvo.abre.attributes.properties) {
    if (!ts.isJsxAttribute(a)) continue;
    const k = a.name.getText(sf);
    const ini = a.initializer;
    if (!ini) { literais[k] = true; continue; }
    if (ts.isStringLiteral(ini)) { literais[k] = ini.text; continue; }
    const ex = ini.expression;
    if (!ex) continue;
    if (ts.isNumericLiteral(ex)) literais[k] = Number(ex.text);
    else if (ex.kind === ts.SyntaxKind.TrueKeyword || ex.kind === ts.SyntaxKind.FalseKeyword) literais[k] = ex.kind === ts.SyntaxKind.TrueKeyword;
    else if (ts.isStringLiteral(ex) || ts.isNoSubstitutionTemplateLiteral(ex)) literais[k] = ex.text;
    else brutos[k] = ex.getText(sf);
  }
  let filhos = null;
  if (ts.isJsxElement(alvo.no) && alvo.no.children.length) {
    const t = dedentar(texto.slice(alvo.no.openingElement.end, alvo.no.closingElement.getStart(sf)).replace(/^\s*\n/, '').replace(/\s+$/, '')).trim();
    filhos = t || null;
  }
  const rIni = raiz.getStart(sf);
  const moldura = raiz === alvo.no ? null
    : texto.slice(rIni, alvo.no.getStart(sf)) + '__DEMO__' + texto.slice(alvo.no.end, raiz.end);
  const auxiliares = sf.statements.slice(0, -1).map((st) => st.getText(sf)).join('\n\n');
  return { literais, brutos, filhos, auxiliares, moldura };
};

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

const changelog = fs
  .readFileSync(path.join(pacote, 'CHANGELOG.md'), 'utf8')
  .replace(/^# .*\r?\n/, '')
  .replace(/^## .*\(arquivada\)\r?\n[\s\S]*?(?=^## )/gm, '');
fs.writeFileSync(
  path.resolve('docs/changelog.md'),
  `---\ntitle: Changelog\nsidebar_position: 5\ndescription: Histórico de versões do @onblide/ui.\n---\n\n${changelog}`,
);
let total = 0;
const nomes = categorias
  .map((dir) => path.join(src, dir))
  .filter((pasta) => fs.existsSync(pasta))
  .flatMap((pasta) => fs.readdirSync(pasta, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name))
  .sort((a, b) => a.localeCompare(b));
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
      `<Playground nome="${nome}" literais=${j(demo.literais)} brutos=${j(demo.brutos)} filhos=${j(demo.filhos)} auxiliares=${j(demo.auxiliares)} moldura=${j(demo.moldura)} />`, '');
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
  fs.writeFileSync(path.join(saida, `${nome}.mdx`), partes.join('\n'));
  total++;
});
console.log(`componentes: ${total} páginas em docs/componentes`);
