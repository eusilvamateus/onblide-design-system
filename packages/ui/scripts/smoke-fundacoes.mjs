import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const pacote = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(pacote, 'src');

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}

const tokens = readFileSync(join(src, 'tokens.css'), 'utf8');
const temToken = (nome) => new RegExp(`${nome}\\s*:`).test(tokens);

const arquivos = [];
const andar = (dir) => {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) andar(caminho);
    else if (/\.tsx?$/.test(nome)) arquivos.push(caminho);
  }
};
andar(src);

const semComentarios = (texto) => texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1');

const regras = [
  {
    fundacao: 'tipografia',
    tokens: [
      ...[10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 28, 36, 48, 64, 88].map((n) => `--ob-fs-${n}`),
      ...['thin', 'extralight', 'light', 'regular', 'medium', 'semibold', 'bold', 'extrabold', 'black'].map((p) => `--ob-w-${p}`),
      '--ob-lh-none', '--ob-lh-display', '--ob-lh-tight', '--ob-lh-snug', '--ob-lh-normal', '--ob-lh-relaxed',
      '--ob-tracking-tighter', '--ob-tracking-tight', '--ob-tracking-snug', '--ob-tracking-normal',
    ],
    proibido: [
      { padrao: /(?:font-?[sS]ize|\bfonte|\bfs|\bcabecalho|\bnumero)['"]?\s*[:=]\s*['"`]?\d/g, motivo: 'tamanho de fonte fixo (use --ob-fs-*)' },
      { padrao: /font-?[sS]ize['"]?\s*:[^,;}\n]*\?\s*\d/g, motivo: 'tamanho de fonte fixo (use --ob-fs-*)' },
      { padrao: /font-?[wW]eight['"]?\s*[:=][^,;}\n]*?(?<![\w-])[1-9]00(?!\w)/g, motivo: 'peso fixo (use --ob-w-*)' },
      { padrao: /letter-?[sS]pacing['"]?\s*[:=]\s*['"`]?-?\d/g, motivo: 'espaçamento entre letras fixo (use --ob-tracking-*)' },
      { padrao: /uppercase/g, motivo: 'caixa-alta (a tipografia do sistema não usa caixa-alta)' },
      { padrao: /font-?[fF]amily['"]?\s*[:=]\s*['"`](?!var\(--ob-font|inherit)/g, motivo: 'família fixa (use --ob-font, --ob-font-serif ou --ob-font-mono)' },
      { padrao: /tabular-nums/g, motivo: 'tabular-nums não tem efeito na Poppins (use a fonte mono para números alinhados)' },
    ],
  },
  {
    fundacao: 'movimento',
    tokens: ['--ob-dur-fast', '--ob-dur-base', '--ob-dur-slow', '--ob-dur-spin', '--ob-dur-loop', '--ob-ease', '--ob-ease-out', '--ob-ease-in-out', '--ob-ease-spring'],
    proibido: [
      { padrao: /(?<![\w.$-])\d*\.?\d+(?:ms|s)(?![\w-])/g, motivo: 'duração fixa (use --ob-dur-*)' },
      { padrao: /cubic-bezier\(/g, motivo: 'curva fixa (use --ob-ease-*)' },
      { padrao: /(?<![\w-])ease(?:-in|-out|-in-out)?(?![\w-])/g, motivo: 'curva por palavra-chave (use --ob-ease-*)' },
    ],
  },
  {
    fundacao: 'raios',
    tokens: ['--ob-r-2xs', '--ob-r-xs', '--ob-r-sm', '--ob-r-md', '--ob-r-lg', '--ob-r-xl', '--ob-r-pill', '--ob-r-circle', '--ob-r-control', '--ob-r-surface', '--ob-r-overlay'],
    proibido: [
      { padrao: /border-?[rR]adius['"]?\s*[:=]\s*['"`]?(?!0(?![\d.])|var\(|calc\(var)[\d.]+(?:px|%)?/g, motivo: 'raio fixo (use --ob-r-*)' },
      { padrao: /\bradius\s*=\s*\d/g, motivo: 'raio padrão fixo (use --ob-r-*)' },
    ],
  },
  {
    fundacao: 'camadas',
    tokens: ['--ob-z-base', '--ob-z-raised', '--ob-z-dropdown', '--ob-z-tooltip', '--ob-z-overlay', '--ob-z-modal', '--ob-z-toast', '--ob-z-drag', '--ob-z-system'],
    proibido: [{ padrao: /z-?[iI]ndex['"]?\s*[:=]\s*[^,;}]*?(?<![\w-])(?:[3-9]|\d{2,})(?![\w.])/g, motivo: 'camada fixa (use --ob-z-*; só 0, 1 e 2 para a ordem local de um componente)' }],
  },
  {
    fundacao: 'opacidade',
    tokens: ['--ob-opacity-hover', '--ob-opacity-focus', '--ob-opacity-scrim', '--ob-opacity-muted', '--ob-opacity-disabled', '--ob-opacity-strong'],
    proibido: [{ padrao: /(?<![\w-])opacity['"]?\s*[:=]\s*[^,;}]*?(?<![\w.-])0?\.\d+/g, motivo: 'opacidade fixa (use --ob-opacity-*; só 0 e 1 literais)' }],
  },
  {
    fundacao: 'sombras',
    tokens: ['--ob-shadow-xs', '--ob-shadow-sm', '--ob-shadow-md', '--ob-shadow-lg', '--ob-shadow-pop', '--ob-focus-ring-width'],
    proibido: [
      { padrao: /[bB]ox-?[sS]hadow['"]?\s*[:=][^;}]*?-?\d+(?:\.\d+)?px\s+-?\d+(?:\.\d+)?px\s+[1-9]\d*(?:\.\d+)?px/g, motivo: 'sombra com desfoque fixa (use --ob-shadow-*)' },
      { padrao: /[bB]ox-?[sS]hadow['"]?\s*[:=][^;}]*?(?:rgba?\(|#[0-9a-fA-F]{3,8}\b)/g, motivo: 'cor fixa em sombra (use --ob-shadow-* ou uma cor de token)' },
      { padrao: /0 0 0 [\d.]+px var\(--ob-focus-ring\)/g, motivo: 'anel de foco com largura fixa (use --ob-focus-ring-width)' },
      { padrao: /outline['"]?\s*:\s*['"`]?[\d.]+px solid/g, motivo: 'contorno de foco com largura fixa (use --ob-focus-ring-width)' },
    ],
  },
];

const problemas = [];
for (const regra of regras) {
  for (const t of regra.tokens) if (!temToken(t)) problemas.push(`${regra.fundacao}: token ${t} não existe no tokens.css`);
  for (const arquivo of arquivos) {
    const texto = semComentarios(readFileSync(arquivo, 'utf8'));
    const linhas = texto.split('\n');
    linhas.forEach((linha, i) => {
      for (const { padrao, motivo } of regra.proibido) {
        for (const m of linha.matchAll(padrao)) {
          problemas.push(`${regra.fundacao}: ${motivo} em ${relative(pacote, arquivo)}:${i + 1}: ${m[0]}`);
        }
      }
    });
  }
}

if (!/@media \(prefers-reduced-motion: reduce\)\s*\{\s*:root\s*\{[^}]*--ob-dur-fast:\s*0ms/.test(tokens)) {
  problemas.push('movimento: o tokens.css deveria zerar --ob-dur-* em prefers-reduced-motion');
}

const CHAVES_DE_ESPACO = /(?<![\w-])(gap|rowGap|columnGap|padding(?:Top|Bottom|Left|Right|Inline|Block|Removivel)?|margin(?:Top|Bottom|Left|Right|Inline|Block)?|pad|sub|sepM|labelPad)(\s*[:=]\s*)([^,}\n]*)/g;
const ESPACO_EM_CSS = /(?<=[{;])(?:gap|row-gap|column-gap|padding[-a-z]*|margin[-a-z]*):([^;}'"]*)/g;
const PX = /(?<![\w.$-])(-?\d+(?:\.\d+)?)px/g;
const NUMERO_SOLTO = /(?<![\w.$*/+-]|[*/+-] )(-?\d+(?:\.\d+)?)(?![\w.%(]| ?[*/+-])/g;
const CITADO = /(['"`])((?:(?!\1).)*)\1/g;
const COMPENSACAO_DE_BORDA = new Set([1, 1.5]);
const fora = (n, chave) => n !== 0 && !(/^margin/.test(chave) && COMPENSACAO_DE_BORDA.has(Math.abs(n)));

let declaracoesDeEspaco = 0;
for (const arquivo of arquivos) {
  semComentarios(readFileSync(arquivo, 'utf8')).split('\n').forEach((linha, i) => {
    const onde = `${relative(pacote, arquivo)}:${i + 1}`;
    for (const m of linha.matchAll(ESPACO_EM_CSS)) {
      declaracoesDeEspaco++;
      for (const v of m[1].matchAll(PX)) if (fora(Number(v[1]), 'css')) problemas.push(`espaçamento: valor fixo (use --ob-space-*) em ${onde}: ${m[0]}`);
    }
    if (/^\s*import /.test(linha)) return;
    for (const [, chave, , valor] of linha.matchAll(CHAVES_DE_ESPACO)) {
      declaracoesDeEspaco++;
      for (const [, , texto] of valor.matchAll(CITADO)) {
        for (const v of texto.replace(/\$\{[^}]*\}/g, '').matchAll(PX)) if (fora(Number(v[1]), chave)) problemas.push(`espaçamento: valor fixo (use --ob-space-*) em ${onde}: ${chave} ${texto}`);
      }
      const solto = valor.replace(CITADO, '').replace(/\$\{[^}]*\}/g, '');
      for (const v of solto.matchAll(NUMERO_SOLTO)) if (fora(Number(v[1]), chave)) problemas.push(`espaçamento: número fixo (use --ob-space-*) em ${onde}: ${chave} ${valor.trim()}`);
    }
  });
}
if (declaracoesDeEspaco < 100) problemas.push(`espaçamento: só ${declaracoesDeEspaco} declarações encontradas; a busca quebrou?`);
for (const v of [2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64, 96, 128]) if (!temToken(`--ob-space-${v}`)) problemas.push(`espaçamento: token --ob-space-${v} não existe no tokens.css`);
if (/--ob-s-\d/.test(tokens)) problemas.push('espaçamento: o tokens.css ainda tem --ob-s-*');

if (problemas.length) fail(`${problemas.length} valores fora das fundações`, '\n' + problemas.join('\n'));
console.log(`OK: fundações (${regras.map((r) => r.fundacao).join(', ')}, espaçamento) sem valores fixos em ${arquivos.length} arquivos, ${declaracoesDeEspaco} declarações de espaçamento`);
