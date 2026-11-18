import path from 'node:path';
import { carregarPacoteNoNavegador, obterChromium, pasta } from './lib/pacote-no-navegador.mjs';

const chromium = obterChromium();
const b = await chromium.launch();
const falhas = [];
const esperar = (ok, msg) => { if (!ok) falhas.push(msg); };

const abrir = async (largura, altura) => {
  const p = await b.newPage({ viewport: { width: largura, height: altura } });
  p.on('pageerror', (e) => falhas.push(`erro na página (${largura}px): ${e.message}`));
  await p.setContent('<html><body style="margin:0;font-family:sans-serif"><div id="r"></div></body></html>');
  await p.addStyleTag({ path: path.join(pasta, 'src/tokens.css') });
  await carregarPacoteNoNavegador(p);
  await p.evaluate(() => {
    const { useState, createElement: h } = React;
    window.__valores = {};
    const Campo = (props) => {
      const [valor, setValor] = useState(props.defaultValue);
      return h(TimePicker, { ...props, defaultValue: undefined, value: valor, onChange: (v) => { setValor(v); window.__valores[props.label] = v; } });
    };
    const App = () => h('div', { style: { display: 'flex', flexDirection: 'column', gap: 16, padding: 16, alignItems: 'flex-start' } },
      h(Campo, { label: 'Enviar às', defaultValue: '10:07', min: '08:00', max: '20:00' }),
      h(Campo, { label: 'Lembrete', defaultValue: '10:07', hourCycle: 12 }),
      h(Campo, { label: 'Relógio', defaultValue: '10:07', variant: 'clock' }),
      h(Campo, { label: 'Atendimento', mode: 'range', defaultValue: { start: null, end: null }, step: 15 }));
    ReactDOM.createRoot(document.getElementById('r')).render(h(App));
  });
  await p.waitForTimeout(200);
  return p;
};

const p = await abrir(1280, 900);
const assentar = () => p.waitForTimeout(150);
const valor = (nome) => p.evaluate((n) => window.__valores[n], nome);
const grupo = (nome) => p.getByRole('group', { name: nome });
const gatilho = (i) => p.getByRole('button', { name: 'Abrir horários' }).nth(i);
const dlg = p.getByRole('dialog');

await p.getByRole('spinbutton', { name: 'Enviar às, horas' }).click();
await p.keyboard.type('1437');
await assentar();
esperar((await valor('Enviar às')) === '14:37', `digitar 1437 deveria dar 14:37 (${await valor('Enviar às')})`);
await p.keyboard.press('ArrowUp');
await assentar();
esperar((await valor('Enviar às')) === '14:38', `↑ nos minutos deveria andar um minuto (${await valor('Enviar às')})`);
await p.keyboard.press('ArrowLeft');
await p.keyboard.press('ArrowDown');
await assentar();
esperar((await valor('Enviar às')) === '13:38', `← e ↓ deveriam voltar uma hora (${await valor('Enviar às')})`);

await gatilho(0).click();
await dlg.waitFor();
esperar(await dlg.getByRole('listbox', { name: 'Min' }).getByRole('option').count() === 60, 'a coluna de minutos deveria ter os 60 minutos');
esperar(await dlg.getByRole('listbox', { name: 'Hora' }).getByRole('option', { name: '07' }).isDisabled(), 'antes do mínimo, a hora deveria ficar indisponível');
esperar(await dlg.getByRole('listbox', { name: 'Hora' }).getByRole('option', { name: '21' }).isDisabled(), 'depois do máximo, a hora deveria ficar indisponível');
await dlg.getByRole('listbox', { name: 'Hora' }).getByRole('option', { name: '16' }).click();
await assentar();
await dlg.getByRole('listbox', { name: 'Min' }).getByRole('option', { name: '07' }).click();
await assentar();
esperar((await valor('Enviar às')) === '16:07', `16 e 07 na lista deveriam dar 16:07 (${await valor('Enviar às')})`);
esperar(await dlg.count() === 0, 'escolher o minuto deveria fechar a lista');

await gatilho(0).click();
await dlg.waitFor();
await dlg.getByRole('button', { name: 'Agora' }).click();
await assentar();
esperar(/^\d{2}:\d{2}$/.test((await valor('Enviar às')) ?? '') && await dlg.count() === 0, 'Agora deveria preencher o horário e fechar');

await p.getByRole('spinbutton', { name: 'Lembrete, horas' }).click();
await p.keyboard.type('0930a');
await assentar();
esperar((await valor('Lembrete')) === '09:30', `digitar 0930a deveria dar 09:30 (${await valor('Lembrete')})`);
await p.keyboard.press('ArrowLeft');
await p.keyboard.press('ArrowLeft');
await p.keyboard.press('ArrowRight');
await p.keyboard.press('ArrowRight');
await p.keyboard.press('ArrowUp');
await assentar();
esperar((await valor('Lembrete')) === '21:30', `↑ no AM/PM deveria trocar para 21:30 (${await valor('Lembrete')})`);
esperar((await grupo('Lembrete').textContent()) === '09:30PM', `em 12 horas o campo deveria mostrar 09:30 PM (${await grupo('Lembrete').textContent()})`);

const clicarNoRelogio = async (nome, indice, total, fracaoDoRaio) => {
  const caixa = await dlg.getByRole('slider', { name: nome }).boundingBox();
  const a = (indice / total) * 2 * Math.PI;
  const raio = (caixa.width / 2) * fracaoDoRaio;
  await p.mouse.click(caixa.x + caixa.width / 2 + raio * Math.sin(a), caixa.y + caixa.height / 2 - raio * Math.cos(a));
  await p.waitForTimeout(300);
};
await gatilho(2).click();
await dlg.waitFor();
esperar(Math.round((await dlg.getByRole('slider', { name: 'Hora' }).boundingBox()).width) === 232, 'no computador o relógio deveria ter 232 px');
await clicarNoRelogio('Hora', 4, 12, 58 / 116);
esperar(await dlg.getByRole('slider', { name: 'Minutos' }).count() === 1, 'escolher a hora deveria passar para os minutos');
await clicarNoRelogio('Minutos', 7, 60, 90 / 116);
esperar((await valor('Relógio')) === '16:07', `16 (anel de dentro) e 07 no relógio deveriam dar 16:07 (${await valor('Relógio')})`);
esperar(await dlg.count() === 0, 'escolher o minuto no relógio deveria fechar');
await gatilho(2).click();
await dlg.waitFor();
await dlg.getByRole('slider', { name: 'Hora' }).focus();
await p.keyboard.press('ArrowUp');
await assentar();
esperar((await valor('Relógio')) === '17:07', `↑ no relógio deveria ir para 17:07 (${await valor('Relógio')})`);
await p.keyboard.press('Enter');
await assentar();
esperar(await dlg.getByRole('slider', { name: 'Minutos' }).count() === 1, 'Enter no relógio deveria passar para os minutos');
await p.keyboard.press('Escape');
await dlg.waitFor({ state: 'detached' });

await gatilho(3).click();
await dlg.waitFor();
await dlg.getByRole('listbox', { name: 'Hora' }).getByRole('option', { name: '09' }).click();
await assentar();
await dlg.getByRole('listbox', { name: 'Min' }).getByRole('option', { name: '15' }).click();
await assentar();
esperar(JSON.stringify(await valor('Atendimento')) === '{"start":"09:15","end":null}', `o início deveria ser 09:15 (${JSON.stringify(await valor('Atendimento'))})`);
esperar(await dlg.count() === 1, 'escolher o início deveria manter o popover aberto para o fim');
esperar(await dlg.getByRole('listbox', { name: 'Hora' }).getByRole('option', { name: '08' }).isDisabled(), 'no fim, as horas antes do início deveriam ficar indisponíveis');
await dlg.getByRole('listbox', { name: 'Hora' }).getByRole('option', { name: '18' }).click();
await assentar();
await dlg.getByRole('listbox', { name: 'Min' }).getByRole('option', { name: '00' }).click();
await assentar();
esperar(JSON.stringify(await valor('Atendimento')) === '{"start":"09:15","end":"18:00"}', `o período deveria ser 09:15 a 18:00 (${JSON.stringify(await valor('Atendimento'))})`);
esperar(await dlg.count() === 0, 'escolher o fim deveria fechar');
esperar((await p.getByText('8h45').count()) === 1, 'o campo deveria mostrar a duração 8h45');

const cortes = await p.evaluate(() => {
  const achados = [];
  const raiz = document.createElement('div');
  document.body.appendChild(raiz);
  const r = ReactDOM.createRoot(raiz);
  for (const size of ['sm', 'md', 'lg']) {
    for (const hourCycle of [24, 12]) {
      for (const precision of ['minute', 'second']) {
        for (const mode of ['single', 'range']) {
          const valor = precision === 'second' ? '23:58:59' : '23:58';
          const props = mode === 'range'
            ? { mode, size, hourCycle, precision, value: { start: precision === 'second' ? '08:08:08' : '08:08', end: valor } }
            : { size, hourCycle, precision, value: valor };
          ReactDOM.flushSync(() => r.render(React.createElement(TimePicker, props)));
          const casca = [...raiz.querySelectorAll('div')].find((d) => d.style.border.startsWith('1.5px'));
          const conteudo = casca.firstElementChild;
          const partes = [...casca.querySelectorAll('[role="spinbutton"]')];
          const limite = casca.querySelector('button').getBoundingClientRect().left;
          const ultimo = Math.max(...partes.map((x) => x.getBoundingClientRect().right), ...[...casca.children].filter((x) => x.tagName === 'SPAN' && x !== conteudo && !x.querySelector('button')).map((x) => x.getBoundingClientRect().right));
          if (conteudo.scrollWidth > conteudo.clientWidth + 1 || ultimo > limite + 0.5) achados.push(`${mode} ${size} ${hourCycle}h ${precision}`);
        }
      }
    }
  }
  r.unmount();
  raiz.remove();
  return achados;
});
esperar(cortes.length === 0, `o horário não deveria ficar cortado no campo: ${cortes.join(', ')}`);

const m = await abrir(390, 844);
await m.getByRole('button', { name: 'Abrir horários' }).nth(2).click();
const md = m.getByRole('dialog');
await md.waitFor();
await m.waitForTimeout(150);
esperar(Math.round((await md.getByRole('slider', { name: 'Hora' }).boundingBox()).width) === 288, 'no celular o relógio deveria crescer para 288 px');
const caixa = await md.boundingBox();
esperar(caixa.x >= 0 && caixa.x + caixa.width <= 390, `no celular o relógio deveria caber na tela (${Math.round(caixa.x)} a ${Math.round(caixa.x + caixa.width)})`);
await m.keyboard.press('Escape');
await md.waitFor({ state: 'detached' });
await m.getByRole('button', { name: 'Abrir horários' }).first().click();
await md.waitFor();
await m.waitForTimeout(150);
const item = await md.getByRole('listbox', { name: 'Min' }).getByRole('option').first().boundingBox();
esperar(item.height >= 40, `no celular os itens da lista deveriam ter 40 px de toque (${item.height})`);
esperar((await m.evaluate(() => document.documentElement.scrollWidth)) <= 390, 'no celular a página não deveria rolar de lado');

await b.close();
if (falhas.length) {
  console.error(`FAIL: TimePicker no navegador\n${falhas.join('\n')}`);
  process.exit(1);
}
console.log('OK: TimePicker no navegador (digitar, setas, lista com limites, Agora, 12 horas, relógio por clique e teclado, período com duração, sem corte em nenhum tamanho, celular)');
