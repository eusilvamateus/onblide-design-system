import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Alert, Button } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props, filhos) => renderToStaticMarkup(React.createElement(Alert, props, filhos));

function achar(el, teste, achados = []) {
  if (!React.isValidElement(el)) return achados;
  if (teste(el)) achados.push(el);
  React.Children.forEach(el.props.children, (filho) => achar(filho, teste, achados));
  return achados;
}

const basico = render({ tone: 'danger', title: 'Erro' }, 'Corpo da mensagem');
if (!basico.includes('role="alert"')) fail('role alert', basico);
if (!basico.includes('Erro') || !basico.includes('Corpo da mensagem')) fail('título e corpo', basico);
if (basico.includes('aria-label="Fechar"')) fail('sem dismissible não há botão de fechar', basico);
if (basico.includes('<button')) fail('sem ação nem fechar não há botões', basico);

const dismissivel = render({ title: 'Aviso', dismissible: true, onClose() {} });
if (!dismissivel.includes('aria-label="Fechar"') || !dismissivel.includes('ph-x')) fail('botão de fechar com ícone Phosphor', dismissivel);
if (render({ title: 'Aviso', dismissible: true }).includes('aria-label="Fechar"')) fail('dismissible sem onClose não mostra o botão');

if (!render({ tone: 'nenhum', title: 'x' }).includes('role="status"')) fail('tom desconhecido cai em info');
for (const tone of ['info', 'success']) if (!render({ tone, title: 'x' }).includes('role="status"')) fail(`${tone} é anunciado sem interromper`);
for (const tone of ['warning', 'danger']) if (!render({ tone, title: 'x' }).includes('role="alert"')) fail(`${tone} interrompe o leitor de tela`);
if (!render({ tone: 'danger', role: 'note', title: 'x' }).includes('role="note"')) fail('role explícito vence o do tom');

const simples = render({ tone: 'warning', title: 'x' });
if (!simples.includes('background:var(--ob-surface)') || !simples.includes('border:1px solid var(--ob-border)')) fail('plain é o padrão: superfície e borda neutra', simples);
if (!simples.includes('var(--ob-orange-700)')) fail('no plain, só o ícone leva a cor do tom', simples);
const contorno = render({ tone: 'warning', appearance: 'outline', title: 'x' });
if (!contorno.includes('background:var(--ob-orange-050)') || !contorno.includes('border:1px solid color-mix(in srgb, var(--ob-orange) 45%, transparent)')) fail('outline usa o fundo clarinho e a borda na cor do tom', contorno);
if (!render({ tone: 'danger', appearance: 'outline', title: 'x' }).includes('border:1px solid color-mix(in srgb, var(--ob-danger) 40%, transparent)')) fail('outline de danger tem a borda vermelha');
if (!contorno.includes('var(--ob-orange-700)')) fail('ícone na cor forte do tom', contorno);
const suave = render({ tone: 'warning', appearance: 'soft', title: 'x' });
if (!suave.includes('background:var(--ob-orange-050)') || !suave.includes('border:1px solid transparent')) fail('soft usa o fundo clarinho do tom, sem borda visível', suave);
if (!render({ tone: 'danger', appearance: 'soft', title: 'x' }).includes('var(--ob-red-050)')) fail('soft de danger usa o vermelho clarinho');
if (!render({ tone: 'info', icon: 'rocket', title: 'x' }).includes('ph-rocket')) fail('icon troca o ícone do tom');
const comAtributos = render({ title: 'x', className: 'meu-alerta', 'data-teste': 'a', style: { marginTop: 8 } });
if (!comAtributos.includes('class="meu-alerta"') || !comAtributos.includes('data-teste="a"') || !comAtributos.includes('margin-top:8px')) fail('repassa atributos e style', comAtributos);

const cliques = [];
const arvore = Alert({ title: 'T', dismissible: true, onClose: () => cliques.push('fechar'), action: 'Ver', onAction: () => cliques.push('acao') });
const botoes = achar(arvore, (el) => el.type === Button);
if (botoes.length !== 2) fail('fechar e ação são Button do design system', botoes.length);
const fechar = botoes.find((b) => b.props['aria-label'] === 'Fechar');
const acao = botoes.find((b) => b.props['aria-label'] !== 'Fechar');
if (!fechar || fechar.props.iconOnly !== true) fail('fechar é Button iconOnly');
fechar.props.onClick();
acao.props.onClick();
if (cliques.join() !== 'fechar,acao') fail('handlers de fechar e ação', cliques.join());
if (acao.props.kind !== 'cream' || acao.props.size !== 'sm') fail('ação é um Button com fundo discreto', JSON.stringify(acao.props.kind));
const comAcao = render({ title: 'T', action: 'Ver' });
if (!comAcao.includes('Ver') || !comAcao.includes('ph-arrow-right') || comAcao.includes('→')) fail('ação com rótulo e ícone Phosphor', comAcao);
console.log('OK: Alert (papel por tom, tons, appearance, icon, atributos, fechar e ação via Button, handlers)');
