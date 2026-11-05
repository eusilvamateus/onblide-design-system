import { carregarTs } from './lib/carregar-ts.mjs';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const igual = (a, b, msg) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) fail(msg, `esperado ${JSON.stringify(b)}, veio ${JSON.stringify(a)}`);
};

const { escolherLado, posicionarPainel } = await carregarTs('src/internal/floating.ts');
const retangulo = (top, left, width = 100, height = 32) => ({ top, left, width, height, right: left + width, bottom: top + height });
const tela = { largura: 1000, altura: 800 };
const painel = { largura: 200, altura: 300 };

igual(escolherLado('bottom', retangulo(100, 100), painel, tela, 6, 8), 'bottom', 'abre embaixo quando cabe');
igual(escolherLado('bottom', retangulo(600, 100), painel, tela, 6, 8), 'top', 'vira para cima quando falta espaço embaixo e sobra em cima');
igual(escolherLado('bottom', retangulo(100, 100), { largura: 200, altura: 900 }, tela, 6, 8), 'bottom', 'sem espaço dos dois lados, mantém o preferido');
igual(escolherLado('top', retangulo(100, 100), painel, tela, 6, 8), 'bottom', 'top sem espaço em cima vira para baixo');
igual(escolherLado('top', retangulo(500, 100), painel, tela, 6, 8), 'top', 'top com espaço fica em cima');
igual(escolherLado('right', retangulo(100, 850), painel, tela, 6, 8), 'left', 'right sem espaço vira para a esquerda');
igual(escolherLado('left', retangulo(100, 20), painel, tela, 6, 8), 'right', 'left sem espaço vira para a direita');
igual(escolherLado('right', retangulo(100, 100), painel, tela, 6, 8), 'right', 'right com espaço fica');

const embaixo = posicionarPainel('bottom', 'start', retangulo(100, 100), painel, tela, 6);
igual([embaixo.side, embaixo.top, embaixo.left], ['bottom', 138, 100], 'bottom start: logo abaixo, alinhado à esquerda do gatilho');
const alinhadoAoFim = posicionarPainel('bottom', 'end', retangulo(100, 500), painel, tela, 6);
igual(alinhadoAoFim.left, 400, 'bottom end: borda direita alinhada à do gatilho');
const centro = posicionarPainel('bottom', 'center', retangulo(100, 500), painel, tela, 6);
igual(centro.left, 450, 'bottom center: centralizado no gatilho');
const naBorda = posicionarPainel('bottom', 'end', retangulo(100, 10, 40), painel, tela, 6);
igual(naBorda.left, 8, 'o painel não passa da margem esquerda da tela');
const naBordaDireita = posicionarPainel('bottom', 'start', retangulo(100, 950, 40), painel, tela, 6);
igual(naBordaDireita.left, 1000 - 200 - 8, 'o painel não passa da margem direita da tela');
const acima = posicionarPainel('bottom', 'start', retangulo(600, 100), painel, tela, 6);
igual([acima.side, acima.top], ['top', 600 - 6 - 300], 'vira para cima e encosta no gatilho');
const lateral = posicionarPainel('right', 'start', retangulo(100, 100), painel, tela, 6);
igual([lateral.side, lateral.left, lateral.top], ['right', 206, 100], 'right start: ao lado, alinhado ao topo');
igual(typeof lateral.ay, 'number', 'laterais devolvem o ponto da seta no eixo vertical');
igual(typeof embaixo.ax, 'number', 'verticais devolvem o ponto da seta no eixo horizontal');
console.log('OK: floating (escolha do lado com colisão, alinhamento, margens e seta)');
