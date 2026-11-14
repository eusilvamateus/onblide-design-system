import path from 'node:path';
import { carregarPacoteNoNavegador, obterChromium, pasta } from './lib/pacote-no-navegador.mjs';

const chromium = obterChromium();
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1000, height: 700 } });
await p.setContent('<html><body style="margin:0"><div id="r"></div></body></html>');
await p.addStyleTag({ path: path.join(pasta, 'src/tokens.css') });
await carregarPacoteNoNavegador(p);

const falhas = [];

await p.evaluate(() => {
  const e = React.createElement;
  const nada = () => { window.__fechou = true; };
  window.__flutuantes = {
    Select: { no: () => e(window.Select, { label: 'Categoria', options: ['Bolsas', 'Calçados', 'Acessórios', 'Roupas', 'Casa'], placeholder: 'Escolha', width: 240 }), abrir: 'input[placeholder="Escolha"]', textos: ['Bolsas', 'Casa'] },
    Autocomplete: { no: () => e(window.Autocomplete, { label: 'Cidade', placeholder: 'Digite a cidade', options: ['Belém', 'Curitiba', 'Recife', 'Salvador', 'São Paulo'], width: 240 }), abrir: 'input[placeholder="Digite a cidade"]', textos: ['Belém', 'São Paulo'] },
    Menu: { no: () => e(window.Menu, { ariaLabel: 'Ações', trigger: e(window.Button, { id: 'gatilho' }, 'Ações'), items: [{ label: 'Editar' }, { label: 'Duplicar' }, { label: 'Arquivar' }, { label: 'Excluir', tone: 'danger' }] }), abrir: '#gatilho', textos: ['Editar', 'Excluir'] },
    Popover: { no: () => e(window.Popover, { trigger: e(window.Button, { id: 'gatilho' }, 'Detalhes'), title: 'Resumo do pedido' }, e('p', { style: { margin: 0, height: 120 } }, 'Entrega em três dias úteis.')), abrir: '#gatilho', textos: ['Resumo do pedido', 'Entrega em três dias úteis.'] },
    Tooltip: { no: () => e(window.Tooltip, { label: 'Dica da ação', delay: 0 }, e(window.Button, { id: 'gatilho' }, 'Dica')), passar: '#gatilho', textos: ['Dica da ação'] },
    Datepicker: { no: () => e(window.Datepicker, { label: 'Data' }), abrir: 'button[aria-label="Abrir calendário"]', textos: ['15'] },
  };
  window.__conteineres = {
    Modal: (f) => e(window.Modal, { open: true, title: 'Janela', onClose: nada }, f),
    Drawer: (f) => e(window.Drawer, { open: true, title: 'Painel', onClose: nada }, e('div', { style: { height: 40 } }), f),
    Accordion: (f) => e('div', { style: { width: 480, padding: 16 } }, e(window.Accordion, { defaultValue: ['a'], items: [{ id: 'a', title: 'Seção', content: f }] })),
    ScrollArea: (f) => e('div', { style: { width: 480, padding: 16 } }, e(window.ScrollArea, { maxHeight: 90 }, e('div', { style: { padding: 8 } }, f, e('div', { style: { height: 200 } })))),
    Table: (f) => e('div', { style: { width: 640, padding: 16 } }, e(window.Table, { rowKey: 'id', columns: [{ key: 'n', label: 'Nome' }, { key: 'x', label: 'Ação', render: () => f }], rows: [{ id: 1, n: 'Item' }] })),
  };
  window.__montar = (conteiner, flutuante) => {
    window.__raiz?.unmount();
    window.__raiz = ReactDOM.createRoot(document.getElementById('r'));
    ReactDOM.flushSync(() => window.__raiz.render(window.__conteineres[conteiner](window.__flutuantes[flutuante].no())));
  };
  window.__ver = (texto) => {
    const folhas = [...document.querySelectorAll('body *')].filter((n) => [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim() === texto));
    const alvo = folhas[folhas.length - 1];
    if (!alvo) return 'não abriu';
    const r = alvo.getBoundingClientRect();
    if (!r.width || !r.height) return 'sem tamanho';
    const x = r.left + Math.min(r.width / 2, 12);
    const y = r.top + r.height / 2;
    if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return 'fora da janela';
    const baloes = [...document.querySelectorAll('[role="tooltip"], [role="tooltip"] *')];
    baloes.forEach((n) => { n.style.pointerEvents = 'auto'; });
    const topo = document.elementFromPoint(x, y);
    baloes.forEach((n) => { n.style.pointerEvents = ''; });
    if (!topo) return 'nada no ponto';
    if (topo === alvo || alvo.contains(topo)) return 'ok';
    let n = alvo;
    for (let i = 0; i < 3 && n; i += 1) { n = n.parentElement; if (n === topo) return 'ok'; }
    return `coberto por <${topo.tagName.toLowerCase()} ${topo.getAttribute('role') ?? ''}${topo.className ? ' .' + topo.className : ''}>`;
  };
  window.__corpoRolou = () => [...document.querySelectorAll('*')].some((n) => n.scrollTop > 0);
});

for (const conteiner of ['Modal', 'Drawer', 'Accordion', 'ScrollArea', 'Table']) {
  for (const flutuante of ['Select', 'Autocomplete', 'Menu', 'Popover', 'Tooltip', 'Datepicker']) {
    await p.evaluate(({ conteiner, flutuante }) => { window.__fechou = false; window.__montar(conteiner, flutuante); }, { conteiner, flutuante });
    await p.waitForTimeout(450);
    const f = await p.evaluate((nome) => ({ abrir: window.__flutuantes[nome].abrir, passar: window.__flutuantes[nome].passar, textos: window.__flutuantes[nome].textos }), flutuante);
    if (f.passar) await p.hover(f.passar);
    else await p.click(f.abrir);
    await p.waitForTimeout(350);
    for (const texto of f.textos) {
      const r = await p.evaluate((t) => window.__ver(t), texto);
      if (r !== 'ok') falhas.push(`${flutuante} dentro de ${conteiner}: "${texto}" ${r}`);
    }
    if (await p.evaluate(() => window.__corpoRolou())) falhas.push(`${flutuante} dentro de ${conteiner}: abrir fez o contêiner rolar`);
    await p.mouse.move(0, 0);
    await p.keyboard.press('Escape');
    await p.waitForTimeout(150);
    if (!f.passar && (conteiner === 'Modal' || conteiner === 'Drawer')) {
      if (await p.evaluate(() => window.__fechou)) falhas.push(`${flutuante} dentro de ${conteiner}: o Esc fechou o ${conteiner} junto com o painel`);
      const sobrou = await p.evaluate((t) => window.__ver(t), f.textos[0]);
      if (sobrou === 'ok') falhas.push(`${flutuante} dentro de ${conteiner}: o Esc não fechou o painel`);
    }
  }
}

const empilhar = async (nome, montar, texto) => {
  await p.evaluate(montar);
  await p.waitForTimeout(450);
  const r = await p.evaluate((t) => window.__ver(t), texto);
  if (r !== 'ok') falhas.push(`${nome}: "${texto}" ${r}`);
};
await empilhar('AlertDialog aberto de dentro de um Drawer', () => {
  const e = React.createElement;
  window.__raiz?.unmount();
  window.__raiz = ReactDOM.createRoot(document.getElementById('r'));
  ReactDOM.flushSync(() => window.__raiz.render(e('div', null,
    e(window.Drawer, { open: true, title: 'Editar produto', onClose: () => {} }, 'Campos do produto'),
    e(window.AlertDialog, { open: true, title: 'Descartar as alterações?', confirmLabel: 'Descartar', onClose: () => {}, onConfirm: () => {} }, 'O que você mudou não fica salvo.'),
  )));
}, 'Descartar');
await empilhar('Modal aberto de dentro de um Drawer', () => {
  const e = React.createElement;
  window.__raiz?.unmount();
  window.__raiz = ReactDOM.createRoot(document.getElementById('r'));
  ReactDOM.flushSync(() => window.__raiz.render(e(window.Drawer, { open: true, title: 'Editar produto', onClose: () => {} },
    e(window.Modal, { open: true, title: 'Escolher foto', onClose: () => {} }, 'Arraste a foto aqui.'))));
}, 'Arraste a foto aqui.');
await empilhar('Toast sobre um Modal', () => {
  const e = React.createElement;
  window.__raiz?.unmount();
  window.__raiz = ReactDOM.createRoot(document.getElementById('r'));
  ReactDOM.flushSync(() => window.__raiz.render(e('div', null,
    e(window.Modal, { open: true, title: 'Janela', size: 'full', onClose: () => {} }, 'Conteúdo'),
    e(window.ToastStack, { position: 'bottom-right', duration: 0 }),
  )));
  window.toast.success('Salvo com sucesso');
}, 'Salvo com sucesso');

const lados = await p.evaluate(async () => {
  const e = React.createElement;
  const medir = async (props) => {
    window.__raiz?.unmount();
    window.__raiz = ReactDOM.createRoot(document.getElementById('r'));
    ReactDOM.flushSync(() => window.__raiz.render(e('div', { style: { position: 'absolute', top: 300, left: 300 } },
      e(window.Menu, { defaultOpen: true, trigger: e(window.Button, { id: 'gatilho' }, 'Ações'), items: [{ label: 'Editar' }, { label: 'Duplicar' }], ...props }))));
    await new Promise((r) => setTimeout(r, 100));
    const g = document.getElementById('gatilho').getBoundingClientRect();
    const m = document.querySelector('[role="menu"]').getBoundingClientRect();
    return { g, m };
  };
  const res = {};
  let { g, m } = await medir({ placement: 'top' });
  res.top = Math.round(g.top - m.bottom);
  ({ g, m } = await medir({ placement: 'right-end' }));
  res.rightEnd = { distancia: Math.round(m.left - g.right), base: Math.round(m.bottom - g.bottom) };
  ({ g, m } = await medir({ align: 'right' }));
  res.alinhadoADireita = Math.round(m.right - g.right);
  ({ g, m } = await medir({}));
  res.abaixo = Math.round(m.top - g.bottom);
  return res;
});
if (lados.top !== 6) falhas.push(`Menu placement="top" deveria abrir 6px acima do gatilho (${lados.top})`);
if (lados.rightEnd.distancia !== 8 || lados.rightEnd.base !== 0) falhas.push(`Menu placement="right-end" deveria abrir 8px ao lado, alinhado à base (${JSON.stringify(lados.rightEnd)})`);
if (lados.alinhadoADireita !== 0) falhas.push(`Menu align="right" deveria alinhar a borda direita à do gatilho (${lados.alinhadoADireita})`);
if (lados.abaixo !== 6) falhas.push(`Menu deveria abrir 6px abaixo do gatilho por padrão (${lados.abaixo})`);

await b.close();
if (falhas.length) { console.error('FAIL: camadas\n' + falhas.join('\n')); process.exit(1); }
console.log('OK: camadas (Select, Autocomplete, Menu, Popover, Tooltip e Datepicker aparecem inteiros dentro de Modal, Drawer, Accordion, ScrollArea e Table; AlertDialog e Modal abrem por cima do Drawer; Toast fica por cima do Modal; o Esc fecha só o painel aberto, não o Modal nem o Drawer; Menu abre no lado e no alinhamento pedidos)');
