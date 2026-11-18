import path from 'node:path';
import { carregarPacoteNoNavegador, obterChromium, pasta } from './lib/pacote-no-navegador.mjs';

const chromium = obterChromium();
const b = await chromium.launch();
const falhas = [];
const esperar = (ok, msg) => { if (!ok) falhas.push(msg); };
let pagina;
const assentar = () => pagina.waitForTimeout(120);

const abrir = async (largura, altura) => {
  const p = await b.newPage({ viewport: { width: largura, height: altura } });
  p.on('pageerror', (e) => falhas.push(`erro na página (${largura}px): ${e.message}`));
  await p.setContent('<html><body style="margin:0;font-family:sans-serif"><div id="r"></div></body></html>');
  await p.addStyleTag({ path: path.join(pasta, 'src/tokens.css') });
  await carregarPacoteNoNavegador(p);
  await p.evaluate(() => {
    const { useState, createElement: h } = React;
    window.__eventos = { mudancas: 0, fins: 0 };
    const Painel = () => {
      const [valor, setValor] = useState('#0a4ee4cc');
      return h('div', { 'data-painel': '' }, h(ColorPicker, {
        value: valor, alpha: true, modes: ['area', 'grid', 'sliders'], swatches: ['#c0573e', '#1f6f5c'],
        onChange: (v) => { setValor(v); window.__eventos.mudancas++; },
        onChangeEnd: () => { window.__eventos.fins++; },
      }));
    };
    const App = () => h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 24, padding: 16, alignItems: 'flex-start' } },
      h('div', { style: { width: 220, display: 'flex', flexDirection: 'column', gap: 16 } },
        h(ColorInput, { label: 'Cor principal', defaultValue: '#faf9f5', swatches: [{ color: '#c2410c', label: 'Terracota' }, '#1f6f5c'] }),
        h(ColorInput, { label: 'Faixa', alpha: true, defaultValue: '#1f1f1fb3' }),
        h(ColorInput, { label: 'Variação', modes: ['grid', 'spectrum', 'sliders'], defaultValue: '#0a4ee4' })),
      h(Painel));
    ReactDOM.createRoot(document.getElementById('r')).render(h(App));
  });
  await p.waitForTimeout(200);
  pagina = p;
  return p;
};

const p = await abrir(1280, 900);
const principal = p.getByRole('textbox', { name: 'Cor principal' });
const gatilho = (i) => p.getByRole('button', { name: 'Abrir seletor de cor' }).nth(i);
const dlg = p.getByRole('dialog');

await principal.fill('0a4ee4');
await assentar();
esperar((await principal.inputValue()) === '#0A4EE4', `digitar 0a4ee4 deveria mostrar #0A4EE4 (${await principal.inputValue()})`);

await gatilho(0).click();
await dlg.waitFor();
await dlg.getByRole('option', { name: 'Terracota' }).click();
await assentar();
esperar((await principal.inputValue()) === '#C2410C', `a amostra Terracota deveria dar #C2410C (${await principal.inputValue()})`);
const area = await dlg.getByRole('slider', { name: 'Saturação e brilho' }).boundingBox();
await p.mouse.move(area.x + area.width * 0.9, area.y + area.height * 0.1);
await p.mouse.down();
await p.mouse.move(area.x + area.width * 0.95, area.y + area.height * 0.05, { steps: 4 });
await p.mouse.up();
await assentar();
const arrastada = await principal.inputValue();
esperar(arrastada !== '#C2410C' && /^#[0-9A-F]{6}$/.test(arrastada), `arrastar na área deveria mudar a cor (${arrastada})`);
await dlg.getByRole('slider', { name: 'Matiz' }).focus();
await p.keyboard.press('Shift+ArrowRight');
await assentar();
esperar((await principal.inputValue()) !== arrastada, 'Shift+→ na matiz deveria mudar a cor');
await dlg.getByRole('textbox', { name: 'Formato da cor' }).click();
await p.getByText('RGB', { exact: true }).last().click();
await assentar();
await p.waitForTimeout(150);
esperar(await dlg.count() === 1, 'escolher o formato não deveria fechar o painel');
esperar(await dlg.getByRole('spinbutton', { name: 'Red' }).count() === 1, 'trocar o formato deveria mostrar os campos RGB');
const voltar = dlg.getByRole('button', { name: /^Voltar para .+, #0A4EE4$/ });
esperar(/^Voltar para azul/.test((await voltar.getAttribute('aria-label')) ?? ''), 'voltar deveria dizer o nome da cor anterior');
await voltar.click();
await assentar();
esperar((await principal.inputValue()) === '#0A4EE4', `voltar deveria trazer a cor de quando o painel abriu (${await principal.inputValue()})`);
await p.keyboard.press('Escape');
await dlg.waitFor({ state: 'detached' });

await principal.fill('#1F');
await assentar();
esperar(await p.getByText(/Cor não reconhecida/).count() === 0, 'digitar pela metade não deveria acusar erro');
await principal.press('Enter');
esperar(await p.getByText(/Cor não reconhecida/).count() === 1, 'Enter com código incompleto deveria avisar');
await principal.blur();
await p.waitForTimeout(80);
esperar((await principal.inputValue()) === '#0A4EE4', `sair do campo inválido deveria voltar à cor anterior (${await principal.inputValue()})`);

for (const [nome, entrada, esperado, comTab] of [
  ['Cor principal', 'rgb(31, 111, 92)', '#1F6F5C', false],
  ['Cor principal', '#FFF', '#FFFFFF', true],
  ['Cor principal', 'hsl(220 90% 45%)', '#0B50DA', false],
  ['Cor principal', 'RGB(10%, 20%, 30%)', '#1A334D', false],
  ['Faixa', 'rgba(31, 111, 92, 0.5)', '#1F6F5C80', false],
  ['Faixa', 'rgb(0 0 0 / 50%)', '#00000080', false],
]) {
  const campo = p.getByRole('textbox', { name: nome });
  await campo.fill(entrada);
  await assentar();
  if (comTab) await campo.press('Tab');
  await p.waitForTimeout(60);
  esperar((await campo.inputValue()) === esperado, `"${entrada}" em ${nome} deveria dar ${esperado} (${await campo.inputValue()})`);
}

const painel = p.locator('[data-painel]');
const contagem = () => p.evaluate(() => ({ ...window.__eventos }));
const antes = await contagem();
const quadrado = await painel.getByRole('slider', { name: 'Saturação e brilho' }).boundingBox();
await p.mouse.move(quadrado.x + quadrado.width * 0.2, quadrado.y + quadrado.height * 0.2);
await p.mouse.down();
await p.mouse.move(quadrado.x + quadrado.width * 0.7, quadrado.y + quadrado.height * 0.6, { steps: 8 });
await p.mouse.up();
await assentar();
await p.waitForTimeout(100);
const depois = await contagem();
esperar(depois.mudancas - antes.mudancas > 3, `um arrasto deveria disparar vários onChange (${depois.mudancas - antes.mudancas})`);
esperar(depois.fins - antes.fins === 1, `um arrasto deveria disparar um só onChangeEnd (${depois.fins - antes.fins})`);

const alturaDoPainel = async () => (await painel.boundingBox()).height;
const alturaNaArea = await alturaDoPainel();
for (const aba of ['Grade', 'Barras']) {
  await painel.getByRole('tab', { name: aba, exact: true }).click();
  await assentar();
  esperar(Math.abs((await alturaDoPainel()) - alturaNaArea) < 1, `a aba ${aba} não deveria mudar a altura do painel`);
}
await painel.getByRole('tab', { name: 'Livre', exact: true }).click();
await assentar();

const MAIORES = { HEX: { Alfa: '100' }, RGB: { Red: '255', Green: '255', Blue: '255', Alfa: '100' }, HSL: { Hue: '360', 'Saturação': '100', Luz: '100', Alfa: '100' } };
for (const [formato, campos] of Object.entries(MAIORES)) {
  await painel.getByRole('textbox', { name: 'Formato da cor' }).click();
  await p.getByText(formato, { exact: true }).last().click();
  await assentar();
  await p.waitForTimeout(100);
  for (const [nome, maior] of Object.entries(campos)) {
    const campo = painel.getByRole('spinbutton', { name: nome });
    const medir = () => campo.evaluate((el) => {
      const cs = getComputedStyle(el);
      const c = document.createElement('canvas').getContext('2d');
      c.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const caixa = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      return { texto: el.value, cabe: c.measureText(el.value).width <= caixa + 0.5 };
    });
    await campo.fill(maior);
    await assentar();
    const digitando = await medir();
    await campo.press('Tab');
    await p.waitForTimeout(60);
    for (const medida of [digitando, await medir()]) esperar(medida.cabe, `${formato}: o campo ${nome} corta "${medida.texto}"`);
  }
}

const variacao = p.getByRole('textbox', { name: 'Variação' });
await gatilho(2).click();
await dlg.waitFor();
const grade = dlg.getByRole('listbox', { name: 'Grade de cores' });
const alturaNaGrade = (await dlg.boundingBox()).height;
esperar((await grade.getByRole('option').first().getAttribute('aria-label')) === 'branco, #FFFFFF', 'a primeira célula deveria se chamar branco');
const celula = grade.getByRole('option').nth(12 * 5 + 9);
const corDaCelula = (await celula.getAttribute('aria-label')).match(/#[0-9A-F]{6}/)[0];
await celula.click();
await assentar();
esperar((await variacao.inputValue()) === corDaCelula, `clicar na grade deveria dar ${corDaCelula} (${await variacao.inputValue()})`);
const caixaDaGrade = await grade.boundingBox();
const celulaEm = (coluna, linha) => [caixaDaGrade.x + (coluna + 0.5) * (caixaDaGrade.width / 12), caixaDaGrade.y + (linha + 0.5) * (caixaDaGrade.height / 10)];
await p.mouse.move(...celulaEm(1, 3));
await p.mouse.down();
await p.mouse.move(...celulaEm(6, 3), { steps: 6 });
await p.mouse.up();
await assentar();
const alvo = (await grade.getByRole('option').nth(3 * 12 + 6).getAttribute('aria-label')).match(/#[0-9A-F]{6}/)[0];
esperar((await variacao.inputValue()) === alvo, `arrastar na grade deveria parar na célula solta (${alvo}, veio ${await variacao.inputValue()})`);
await grade.getByRole('option').nth(3 * 12 + 6).focus();
await p.keyboard.press('ArrowDown');
await assentar();
await p.keyboard.press('Enter');
await assentar();
const abaixo = (await grade.getByRole('option').nth(4 * 12 + 6).getAttribute('aria-label')).match(/#[0-9A-F]{6}/)[0];
esperar((await variacao.inputValue()) === abaixo, `↓ e Enter na grade deveriam escolher a célula de baixo (${abaixo}, veio ${await variacao.inputValue()})`);

await dlg.getByRole('tab', { name: 'Espectro', exact: true }).click();
await assentar();
esperar(Math.abs((await dlg.boundingBox()).height - alturaNaGrade) < 1, 'o espectro não deveria mudar a altura do painel');
const espectro = dlg.getByRole('slider', { name: 'Espectro de cores' });
const esp = await espectro.boundingBox();
await p.mouse.click(esp.x + esp.width * 0.3, esp.y + esp.height * 0.4);
await assentar();
const noEspectro = await variacao.inputValue();
esperar(noEspectro !== abaixo, 'clicar no espectro deveria mudar a cor');
const matiz = (await espectro.getAttribute('aria-valuetext')).match(/matiz \d+/)[0];
await dlg.getByRole('slider', { name: 'Saturação' }).focus();
for (let i = 0; i < 6; i++) await p.keyboard.press('Shift+ArrowLeft');
await assentar();
esperar((await variacao.inputValue()) !== noEspectro, 'baixar a saturação deveria mudar a cor');
esperar((await espectro.getAttribute('aria-valuetext')).includes(matiz), 'baixar a saturação não deveria mexer na matiz');
await p.mouse.click(esp.x + esp.width * 0.6, esp.y + esp.height * 0.45);
await assentar();
esperar((await dlg.getByRole('slider', { name: 'Saturação' }).getAttribute('aria-valuenow')) !== '100', 'clicar no espectro deveria manter a saturação escolhida');

await dlg.getByRole('tab', { name: 'Barras', exact: true }).click();
await assentar();
esperar(Math.abs((await dlg.boundingBox()).height - alturaNaGrade) < 1, 'as barras não deveriam mudar a altura do painel');
const antesDasBarras = await variacao.inputValue();
await dlg.getByRole('slider', { name: 'Vermelho' }).focus();
await p.keyboard.press('Shift+ArrowRight');
await assentar();
esperar((await variacao.inputValue()) !== antesDasBarras, 'Shift+→ no vermelho deveria mudar a cor');
await p.keyboard.press('Escape');

const m = await abrir(390, 844);
await m.getByRole('button', { name: 'Abrir seletor de cor' }).first().click();
const md = m.getByRole('dialog');
await md.waitFor();
await m.waitForTimeout(150);
const faixa = await md.getByRole('slider', { name: 'Matiz' }).boundingBox();
esperar(faixa.height >= 32, `no celular, a barra deveria ter 32 px de área de toque (${faixa.height})`);
const amostra = await md.getByRole('option').first().boundingBox();
esperar(amostra.width >= 32, `no celular, a amostra deveria ter 32 px (${amostra.width})`);
const caixa = await md.boundingBox();
esperar(caixa.x >= 0 && caixa.x + caixa.width <= 390, `no celular, o painel deveria caber na tela (${Math.round(caixa.x)} a ${Math.round(caixa.x + caixa.width)})`);
esperar((await m.evaluate(() => document.documentElement.scrollWidth)) <= 390, 'no celular, a página não deveria rolar de lado');

await b.close();
if (falhas.length) {
  console.error(`FAIL: ColorPicker e ColorInput no navegador\n${falhas.join('\n')}`);
  process.exit(1);
}
console.log('OK: ColorPicker e ColorInput no navegador (digitar, colar, recusar, arrastar, onChangeEnd, grade, espectro, barras, campos sem corte, celular)');
