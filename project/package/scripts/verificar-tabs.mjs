import { createRequire } from 'node:module';
import path from 'node:path';

const exigir = createRequire(import.meta.url);
const aqui = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const candidatos = ['../../../docs-site/node_modules/playwright'];
let chromium;
for (const c of candidatos) {
  try {
    ({ chromium } = exigir(path.resolve(aqui, c)));
    break;
  } catch {
    chromium = undefined;
  }
}
if (!chromium) {
  console.log('SKIP: playwright não instalado (rode npm install em docs-site)');
  process.exit(0);
}

const pasta = path.resolve(aqui, '..');
const b = await chromium.launch();
const p = await b.newPage();
await p.setContent('<html><body style="margin:0"><div id="r"></div></body></html>');
await p.addStyleTag({ path: path.join(pasta, 'src/tokens.css') });
for (const f of [
  'node_modules/react/umd/react.production.min.js',
  'node_modules/react-dom/umd/react-dom.production.min.js',
  'dist/onblide-ui.browser.js',
]) {
  await p.addScriptTag({ path: path.join(pasta, f) });
}

const falhas = [];
const esperar = (cond, msg) => {
  if (!cond) falhas.push(msg);
};

const montar = (props) =>
  p.evaluate((props) => {
    const abas = [
      { id: 'a', label: 'Geral' },
      { id: 'b', label: 'Membros da equipe', tone: 'success', badge: 4 },
      { id: 'c', label: 'Faturas' },
    ];
    const Controlado = () => {
      const [ativa, setAtiva] = React.useState('a');
      return React.createElement(window.Tabs, { ...props, tabs: abas, active: ativa, onChange: setAtiva });
    };
    window.__raiz?.unmount();
    window.__raiz = ReactDOM.createRoot(document.getElementById('r'));
    ReactDOM.flushSync(() => window.__raiz.render(React.createElement(Controlado)));
  }, props);

const ler = () =>
  p.evaluate(() => {
    const indicador = document.querySelector('[data-indicador]');
    const ativa = document.querySelector('[data-ativa]');
    if (!indicador || !ativa) return null;
    const ri = indicador.getBoundingClientRect();
    const ra = ativa.getBoundingClientRect();
    const estilo = getComputedStyle(indicador);
    return {
      rotulo: ativa.textContent,
      esquerda: ri.left - ra.left,
      largura: ri.width - ra.width,
      fundoDaAba: getComputedStyle(ativa).backgroundColor,
      fundo: estilo.backgroundColor,
      sombra: estilo.boxShadow,
      propriedades: estilo.transitionProperty,
      duracao: estilo.transitionDuration,
      animando: indicador.getAnimations().map((a) => a.transitionProperty),
    };
  });

const clicar = (rotulo) =>
  p.evaluate(
    (rotulo) => [...document.querySelectorAll('button')].find((el) => el.textContent.includes(rotulo)).click(),
    rotulo,
  );
const assentar = () => p.waitForTimeout(400);

for (const variant of ['pill', 'line']) {
  await montar({ variant, appearance: 'solid' });
  await p.evaluate(() => new Promise(requestAnimationFrame));
  const inicio = await ler();
  esperar(inicio, `${variant}: deveria existir um único indicador atrás da aba ativa`);
  if (!inicio) continue;
  esperar(
    Math.abs(inicio.esquerda) < 0.5 && Math.abs(inicio.largura) < 0.5,
    `${variant}: indicador deveria cobrir a aba ativa, desvio ${JSON.stringify(inicio)}`,
  );
  esperar(
    inicio.fundoDaAba === 'rgba(0, 0, 0, 0)',
    `${variant}: com o indicador medido a aba não pinta o próprio fundo, veio ${inicio.fundoDaAba}`,
  );
  esperar(
    ['transform', 'width'].every((x) => inicio.propriedades.includes(x)),
    `${variant}: transição deveria cobrir transform e width, veio ${inicio.propriedades}`,
  );
  esperar(
    inicio.duracao.split(',').every((d) => d.trim() === '0.2s'),
    `${variant}: duração deveria ser --ob-dur-base (200ms), veio ${inicio.duracao}`,
  );

  await clicar('Membros');
  const meio = await ler();
  esperar(
    meio && meio.animando.includes('transform') && meio.animando.includes('width'),
    `${variant}: ao trocar de aba o indicador deveria deslizar (transform e width), veio ${meio?.animando}`,
  );
  await assentar();
  const fim = await ler();
  esperar(
    fim?.rotulo.includes('Membros'),
    `${variant}: clicar numa aba chama onChange com o id dela, ativa ficou ${fim?.rotulo}`,
  );
  esperar(
    fim && Math.abs(fim.esquerda) < 0.5 && Math.abs(fim.largura) < 0.5,
    `${variant}: indicador deveria parar sobre a nova aba, desvio ${JSON.stringify(fim)}`,
  );
  esperar(
    fim && fim.fundo !== inicio.fundo,
    `${variant}: a cor do indicador deveria seguir o tone da aba nova, ficou ${fim?.fundo}`,
  );
  if (variant === 'pill') {
    esperar(
      inicio.sombra !== 'none' && fim.sombra === 'none',
      `pill: sombra só sem appearance colorida, veio ${inicio.sombra} → ${fim.sombra}`,
    );
  }
}

await montar({ variant: 'pill' });
await p.evaluate(() => {
  const botoes = [...document.querySelectorAll('button')];
  botoes[0].firstChild.textContent = 'Visão geral do mês';
});
await assentar();
const crescida = await ler();
esperar(
  crescida && Math.abs(crescida.largura) < 0.5,
  `pill: quando a aba ativa muda de largura o indicador acompanha, desvio ${crescida?.largura}`,
);

await p.emulateMedia({ reducedMotion: 'reduce' });
await montar({ variant: 'pill' });
const reduzido = await ler();
esperar(
  reduzido && reduzido.duracao.split(',').every((d) => d.trim() === '0s'),
  `com prefers-reduced-motion o indicador não anima, veio ${reduzido?.duracao}`,
);
await clicar('Faturas');
const semAnimacao = await ler();
esperar(
  semAnimacao && semAnimacao.animando.length === 0 && Math.abs(semAnimacao.esquerda) < 0.5,
  `com prefers-reduced-motion a troca é imediata, veio ${JSON.stringify(semAnimacao)}`,
);

await b.close();
if (falhas.length) {
  console.error('FAIL: indicador do Tabs\n' + falhas.join('\n'));
  process.exit(1);
}
console.log(
  'OK: indicador do Tabs (único, mede a aba ativa, desliza em transform/width, segue tone e largura, respeita reduced-motion)',
);
