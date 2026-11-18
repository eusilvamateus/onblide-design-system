import path from 'node:path';
import { carregarPacoteNoNavegador, obterChromium, pasta } from './lib/pacote-no-navegador.mjs';

const ALTURAS = { sm: 32, md: 40, lg: 48 };
const TOLERANCIA = 0.5;

const CASOS = [
  ['Input', {}],
  ['Input com addon', { componente: 'Input', endAddon: 'kg', defaultValue: '12' }],
  ['Select', { options: ['Ativo', 'Pausado'], value: 'Ativo' }],
  ['Select com chips', { componente: 'Select', multi: true, options: ['Ativo', 'Pausado', 'Encerrado'], value: ['Ativo', 'Pausado'] }],
  ['SearchInput limpar', { componente: 'SearchInput', value: 'abc' }],
  ['SearchInput carregando', { componente: 'SearchInput', value: 'abc', loading: true }],
  ['NumberField split', { componente: 'NumberField', defaultValue: 3 }],
  ['NumberField stacked', { componente: 'NumberField', defaultValue: 3, controls: 'stacked' }],
  ['NumberField none', { componente: 'NumberField', defaultValue: 3, controls: 'none' }],
  ['Datepicker', { componente: 'Datepicker' }],
  ['Datepicker stepper', { componente: 'Datepicker', stepper: 'day' }],
  ['Datepicker range', { componente: 'Datepicker', mode: 'range' }],
  ['ColorInput', { defaultValue: '#0a4ee4' }],
  ['ColorInput vazio', { componente: 'ColorInput' }],
  ['TimePicker', { defaultValue: '14:30' }],
  ['TimePicker 12h', { componente: 'TimePicker', hourCycle: 12, defaultValue: '14:30' }],
  ['TimePicker range', { componente: 'TimePicker', mode: 'range', defaultValue: { start: '08:00', end: '17:00' } }],
  ['Autocomplete', { componente: 'Autocomplete', options: ['Ana', 'Bruno'], defaultValue: 'Ana' }],
  ['Autocomplete com chips', { componente: 'Autocomplete', multiple: true, options: ['Ana', 'Bruno', 'Carla'], defaultValue: ['Ana', 'Bruno'] }],
];

const chromium = obterChromium();
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 900, height: 600 } });
await p.setContent('<html><body style="margin:0;font-family:sans-serif"><div id="r" style="width:420px;padding:20px"></div></body></html>');
await p.addStyleTag({ path: path.join(pasta, 'src/tokens.css') });
await carregarPacoteNoNavegador(p);

const montar = (nome, props) =>
  p.evaluate(({ nome, props }) => {
    window.__raiz?.unmount();
    window.__raiz = ReactDOM.createRoot(document.getElementById('r'));
    ReactDOM.flushSync(() => window.__raiz.render(React.createElement(window[nome], props)));
  }, { nome, props });

const alturaDaCasca = () =>
  p.evaluate(() => {
    const casca = [...document.querySelectorAll('#r div')].find((el) => el.style.border.startsWith('1.5px') && el.querySelector('input, [role="spinbutton"]'));
    return casca ? casca.getBoundingClientRect().height : null;
  });

const falhas = [];
for (const [rotulo, { componente, ...props }] of CASOS) {
  const nome = componente ?? rotulo;
  for (const [size, esperada] of Object.entries(ALTURAS)) {
    await montar(nome, { ...props, size, ariaLabel: rotulo });
    const altura = await alturaDaCasca();
    const ok = altura != null && Math.abs(altura - esperada) <= TOLERANCIA;
    if (!ok) falhas.push(`${rotulo} ${size}: ${altura}px (esperado ${esperada}px)`);
    console.log(`${rotulo.padEnd(24)} ${size} ${String(altura).padEnd(6)} ${ok ? 'ok' : 'FORA'}`);
  }
}

for (const size of Object.keys(ALTURAS)) {
  await montar('Button', { size, children: 'Salvar' });
  const botao = await p.evaluate(() => document.querySelector('#r button').getBoundingClientRect().height);
  if (botao !== ALTURAS[size]) falhas.push(`Button ${size}: ${botao}px (esperado ${ALTURAS[size]}px, a mesma altura do campo)`);
}

const alturas = async (nome, props, seletor) => {
  const medidas = {};
  for (const size of ['sm', 'md', 'lg']) {
    await montar(nome, { ...props, size });
    medidas[size] = await p.evaluate((s) => document.querySelector(s).getBoundingClientRect().height, seletor);
  }
  return medidas;
};
const crescente = (rotulo, m, igualNoMeio = false) => {
  const ok = (igualNoMeio ? m.sm <= m.md : m.sm < m.md) && m.md < m.lg;
  if (!ok) falhas.push(`${rotulo}: alturas deveriam crescer de sm para lg (${m.sm}, ${m.md}, ${m.lg})`);
  console.log(`${rotulo.padEnd(24)} sm ${m.sm} · md ${m.md} · lg ${m.lg} ${ok ? 'ok' : 'FORA'}`);
};
crescente('Tabs', await alturas('Tabs', { tabs: [{ id: 'a', label: 'Geral' }, { id: 'b', label: 'Faturas', badge: 3 }], active: 'a' }, '#r button'));
crescente('Badge', await alturas('Badge', { children: 'Ativo' }, '#r span'));
crescente('Badge numérico', await alturas('Badge', { children: 7, variant: 'numeric' }, '#r span'), true);
crescente('Textarea', await alturas('Textarea', { rows: 1, minRows: 1, ariaLabel: 'Nota' }, '#r textarea'));
crescente('CodeInput', await alturas('CodeInput', { length: 4 }, '#r input'));

await b.close();
if (falhas.length) { console.error('FAIL: tamanhos dos campos\n' + falhas.join('\n')); process.exit(1); }
console.log('OK: campos com 32, 40 e 48px, iguais ao Button, e Tabs, Badge, Textarea e CodeInput crescendo de sm para lg');
