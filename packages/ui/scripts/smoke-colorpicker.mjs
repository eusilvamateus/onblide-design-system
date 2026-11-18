import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ColorInput, ColorPicker } from '../dist/index.js';
import { carregarTs } from './lib/carregar-ts.mjs';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const painel = (props) => renderToStaticMarkup(React.createElement(ColorPicker, props));
const campo = (props) => renderToStaticMarkup(React.createElement(ColorInput, props));
const contar = (html, trecho) => (html.match(new RegExp(trecho, 'g')) ?? []).length;
const igual = (a, b, msg) => { if (a !== b) fail(msg, `esperado ${JSON.stringify(b)}, veio ${JSON.stringify(a)}`); };

const basico = painel({ value: '#0a4ee4' });
if (!basico.includes('aria-label="Saturação e brilho"')) fail('a área livre é a forma padrão', basico);
if (!basico.includes('aria-label="Matiz"')) fail('a área livre vem com a barra de matiz', basico);
if (basico.includes('role="tablist"')) fail('com uma forma só, as abas não aparecem', basico);
if (basico.includes('Transparência')) fail('sem alpha, não há barra de transparência', basico);
if (!basico.includes('value="0A4EE4"')) fail('o campo hexadecimal mostra a cor', basico);
if (!basico.includes('aria-label="Formato da cor"')) fail('o formato dos campos pode ser trocado', basico);
if (basico.includes('Pegar cor da tela')) fail('o conta-gotas só aparece no navegador que tem EyeDropper', basico);

const comAlfa = painel({ value: '#0a4ee480', alpha: true });
if (!comAlfa.includes('aria-label="Transparência"')) fail('alpha mostra a barra de transparência', comAlfa);
if (!comAlfa.includes('aria-label="Alfa"')) fail('alpha mostra o campo de transparência', comAlfa);
if (!comAlfa.includes('aria-valuetext="50%"')) fail('a barra de transparência anuncia a porcentagem', comAlfa);

const formas = painel({ value: '#0a4ee4', modes: ['grid', 'spectrum', 'sliders'] });
if (!formas.includes('role="tablist" aria-label="Forma de escolher a cor"')) fail('várias formas viram abas com nome', formas);
for (const rotulo of ['Grade', 'Espectro', 'Barras']) if (!formas.includes(`>${rotulo}<`)) fail(`a aba ${rotulo} aparece`, formas);
if (contar(formas, 'role="option"') !== 120) fail('a primeira forma (grade) abre com 120 cores', contar(formas, 'role="option"'));
if (!formas.includes('aria-label="branco, #FFFFFF"')) fail('as células da grade têm nome de cor', formas);
if (formas.includes('aria-label="Matiz"')) fail('a grade não mostra a barra de matiz', formas);

const rgb = painel({ value: '#1f6f5c', format: 'rgb' });
for (const [canal, n] of [['Red', 31], ['Green', 111], ['Blue', 92]]) {
  if (!rgb.includes(`aria-label="${canal}"`)) fail(`o formato rgb mostra o campo ${canal}`, rgb);
  if (!new RegExp(`aria-label="${canal}"[^>]*value="${n}"|value="${n}"[^>]*aria-label="${canal}"`).test(rgb)) fail(`o campo ${canal} vale ${n}`, rgb);
}
if (!painel({ value: '#1f6f5c', format: 'hsl' }).includes('aria-label="Luz"')) fail('o formato hsl mostra matiz, saturação e luz');

const comAmostras = painel({ value: '#c0573e', swatches: ['#c0573e', { color: '#1f6f5c', label: 'Musgo' }] });
if (!comAmostras.includes('aria-label="Cores salvas"')) fail('as cores salvas formam uma lista', comAmostras);
if (!comAmostras.includes('aria-label="Musgo"')) fail('a amostra com nome usa o nome', comAmostras);
if (!/aria-selected="true"[^>]*aria-label="vermelho[^"]*, #C0573E"/.test(comAmostras)) fail('a amostra da cor atual fica marcada e sem nome usa o nome aproximado', comAmostras);
if (!comAmostras.includes('ph-check')) fail('a amostra marcada mostra o ícone Phosphor', comAmostras);

const soAmostras = painel({ swatchesOnly: true, swatches: ['#c0573e', '#1f6f5c'] });
if (soAmostras.includes('role="slider"') || soAmostras.includes('<input')) fail('swatchesOnly mostra só as amostras', soAmostras);
igual(contar(soAmostras, 'role="option"'), 2, 'swatchesOnly mostra cada amostra');
if (!painel({ defaultValue: '#ffcc00' }).includes('value="FFCC00"')) fail('defaultValue preenche o painel');

const vazio = campo({ label: 'Cor principal' });
if (!vazio.includes('placeholder="Sem cor"')) fail('o campo vazio diz que não há cor', vazio);
if (!vazio.includes('aria-label="Abrir seletor de cor"')) fail('o gatilho do painel é acessível', vazio);
if (!vazio.includes('aria-haspopup="dialog"')) fail('o gatilho anuncia o popover', vazio);
if (vazio.includes('role="slider"')) fail('o painel só aparece aberto', vazio);
if (!/<label for="([^"]+)"[^>]*>Cor principal<\/label>[\s\S]*<input id="\1"/.test(vazio)) fail('o rótulo nomeia o campo', vazio);
if (!vazio.includes('dashed')) fail('sem cor, a amostra é tracejada', vazio);

const cheio = campo({ value: '#0a4ee4', hint: 'Usada nos botões' });
if (!cheio.includes('value="#0A4EE4"')) fail('o campo mostra a cor em maiúsculas', cheio);
if (!cheio.includes('Usada nos botões')) fail('hint aparece', cheio);
const comErro = campo({ value: '#0a4ee4', hint: 'Usada nos botões', error: 'Contraste baixo' });
if (!comErro.includes('Contraste baixo') || comErro.includes('Usada nos botões')) fail('erro substitui o hint', comErro);
if (!comErro.includes('aria-invalid="true"') || !comErro.includes('var(--ob-danger)')) fail('erro marca o campo e usa o token de perigo', comErro);
if (!campo({ defaultValue: '#ffcc00' }).includes('value="#FFCC00"')) fail('defaultValue preenche o campo');
if (!campo({ ariaLabel: 'Cor do selo' }).includes('aria-label="Cor do selo"')) fail('ariaLabel nomeia o campo sem rótulo');
const desabilitado = campo({ value: '#0a4ee4', disabled: true });
if (!/<input[^>]*disabled/.test(desabilitado) || !/<button[^>]*disabled/.test(desabilitado)) fail('disabled desativa campo e gatilho', desabilitado);

const cor = await carregarTs('src/internal/cor.ts');
const hex = (texto) => { const c = cor.interpretarCor(texto); return c ? cor.escreverCor(c).toUpperCase() : null; };
igual(hex('#FFF'), '#FFFFFF', 'hex curto');
igual(hex('0a4ee4'), '#0A4EE4', 'hex sem #');
igual(hex('rgb(31, 111, 92)'), '#1F6F5C', 'rgb com vírgulas');
igual(hex('RGB(10%, 20%, 30%)'), '#1A334D', 'rgb em porcentagem e maiúsculas');
igual(hex('hsl(220 90% 45%)'), '#0B50DA', 'hsl com espaços');
igual(hex('rgba(31, 111, 92, 0.5)'), '#1F6F5C80', 'rgba com alfa decimal');
igual(hex('rgb(0 0 0 / 50%)'), '#00000080', 'rgb com alfa em porcentagem');
igual(hex('hsl(-120 50% 50%)'), hex('hsl(240 50% 50%)'), 'matiz negativa dá a volta');
for (const invalido of ['', '#1F', 'zz12', 'rgb(300, 0, 0)', 'rgb(1, 2)', 'hsl(10 120% 50%)', 'rgba(0,0,0,2)', 'azul']) igual(hex(invalido), null, `"${invalido}" não é cor`);
igual(cor.nomeDaCor('#ffffff'), 'branco', 'nome do branco');
igual(cor.nomeDaCor('#000000'), 'preto', 'nome do preto');
igual(cor.nomeDaCor('#808080'), 'cinza', 'nome do cinza');
igual(cor.nomeDaCor('#0a4ee4'), 'azul', 'nome do azul');
igual(cor.nomeDaCor('#1e3a8a'), 'azul escuro', 'nome do azul escuro');
igual(cor.nomeDaCor('#6b3e1f'), 'marrom', 'laranja escuro vira marrom');
igual(cor.nomeDaCor('#3b1f0a'), 'marrom escuro', 'marrom bem escuro');
igual(cor.nomeDaCor(null), 'sem cor', 'nome sem cor');
igual(Math.round(cor.contraste('#ffffff', '#000000')), 21, 'contraste máximo');
igual(cor.contraste('#ffffff', 'nada'), null, 'contraste sem cor');
igual(cor.CORES_DA_GRADE.length, cor.COLUNAS_DA_GRADE * cor.LINHAS_DA_GRADE, 'a grade é retangular');
igual(new Set(cor.CORES_DA_GRADE).size, cor.CORES_DA_GRADE.length, 'a grade não repete cores');
for (const original of ['#0a4ee4', '#c0573e', '#1f6f5c', '#ffcc00', '#7a7a7a']) {
  igual(cor.hsvaParaTexto(cor.hsvaDe(original)), original, `${original} volta igual depois de ir para HSV`);
}
igual(cor.hsvaDe('#808080', { h: 200, s: 50, v: 50, a: 1 }).h, 200, 'um cinza mantém a matiz anterior');
igual(cor.saturacaoDe('#ffffff', 37), 37, 'branco mantém a saturação anterior');

console.log('OK: ColorPicker e ColorInput (formas, formatos, alfa, amostras, campo, rótulo, erro, desabilitado) e a leitura de cores');
