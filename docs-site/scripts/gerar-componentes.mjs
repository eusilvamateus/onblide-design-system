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
  actions: ['Ações', 'Botões e links que disparam uma ação ou levam a outro lugar.'],
  forms: ['Formulários', 'Campos e controles para o usuário informar dados.'],
  feedback: ['Feedback', 'Avisos, progresso e estados de carregamento.'],
  overlays: ['Sobreposições', 'Elementos que aparecem por cima da tela: modais, gavetas, menus e dicas.'],
  navigation: ['Navegação', 'Componentes para se mover entre telas, seções e páginas.'],
  'data-display': ['Exibição de dados', 'Tabelas, cartões, avatares, selos e calendários.'],
  brand: ['Marca', 'Logo e marcas de terceiros.'],
  iconography: ['Ícones', 'Registro de ícones e o componente base do Phosphor.'],
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
  const sf = ts.createSourceFile(`${nome}.tsx`, fs.readFileSync(arq, 'utf8'), ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
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

fs.rmSync(saida, { recursive: true, force: true });
fs.mkdirSync(saida, { recursive: true });
fs.writeFileSync(
  path.join(saida, '_category_.json'),
  JSON.stringify({ label: 'Componentes', position: 4, link: { type: 'generated-index', slug: '/componentes', description: 'Todos os componentes do @onblide/ui, por categoria.' } }, null, 2),
);

// Histórico de versões: cópia do CHANGELOG do pacote, gerado pelo changesets.
const changelog = fs.readFileSync(path.join(pacote, 'CHANGELOG.md'), 'utf8').replace(/^# .*\n/, '');
fs.writeFileSync(
  path.resolve('docs/changelog.md'),
  `---\ntitle: Changelog\nsidebar_position: 5\ndescription: Histórico de versões do @onblide/ui.\n---\n\n${changelog}`,
);
let posCat = 1;
let total = 0;
for (const [dir, [rotulo, resumo]] of Object.entries(categorias)) {
  const pasta = path.join(src, dir);
  if (!fs.existsSync(pasta)) continue;
  const alvo = path.join(saida, dir);
  fs.mkdirSync(alvo, { recursive: true });
  fs.writeFileSync(path.join(alvo, '_category_.json'), JSON.stringify({ label: rotulo, position: posCat++, link: { type: 'generated-index', description: resumo } }, null, 2));
  const nomes = fs.readdirSync(pasta, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
  nomes.forEach((nome, i) => {
    const ex = exemplosDe(nome);
    const temProps = nome !== 'Icons';
    const partes = [
      '---', `title: ${nome}`, `sidebar_position: ${i + 1}`, `description: ${JSON.stringify(descricoes[nome] ?? nome)}`, '---', '',
      "import PropsTable from '@site/src/components/PropsTable';", '',
      `${descricoes[nome] ?? ''}`, '', '```ts', `import { ${nome} } from '@onblide/ui';`, '```', '',
    ];
    if (ex.length) {
      partes.push('## Exemplos', '');
      for (const e of ex) partes.push(`### ${titulos[e.id] ?? e.id}`, '', `\`\`\`jsx ${e.modo}`, e.codigo, '```', '');
    }
    if (temProps) partes.push('## Props', '', `<PropsTable nome="${nome}" />`, '');
    fs.writeFileSync(path.join(alvo, `${nome}.mdx`), partes.join('\n'));
    total++;
  });
}
console.log(`componentes: ${total} páginas em docs/componentes`);
