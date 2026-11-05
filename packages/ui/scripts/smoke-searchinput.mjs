import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SearchInput } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props) => renderToStaticMarkup(React.createElement(SearchInput, props));

const vazio = render({});
if (!vazio.includes('ph-magnifying-glass')) fail('ícone de busca Phosphor', vazio);
if (!vazio.includes('placeholder="Buscar…"')) fail('placeholder padrão', vazio);
if (!vazio.includes('role="searchbox"') || !vazio.includes('aria-label="Buscar"')) fail('campo de busca com nome acessível', vazio);
if (vazio.includes('aria-label="Limpar"')) fail('vazio não mostra o botão de limpar', vazio);
if (!render({ placeholder: 'Procurar' }).includes('placeholder="Procurar"')) fail('placeholder');
if (!render({ ariaLabel: 'Buscar tarefas' }).includes('aria-label="Buscar tarefas"')) fail('ariaLabel');

const comValor = render({ value: 'ab' });
if (!comValor.includes('value="ab"') || !comValor.includes('aria-label="Limpar"')) fail('valor e botão de limpar', comValor);

const carregando = render({ value: 'ab', loading: true });
if (!carregando.includes('ph-circle-notch')) fail('loading mostra o indicador', carregando);
if (carregando.includes('aria-label="Limpar"')) fail('loading esconde o botão de limpar', carregando);

const desabilitado = render({ value: 'ab', disabled: true });
if (!/<input[^>]*disabled/.test(desabilitado)) fail('disabled desativa o campo', desabilitado);
if (desabilitado.includes('aria-label="Limpar"')) fail('disabled esconde o botão de limpar', desabilitado);

if (!render({ width: 200 }).includes('width:200px')) fail('largura');
if (render({ value: 'a', results: ['um', 'dois'] }).includes('dois')) fail('a lista de sugestões não existe mais; use o Autocomplete');

if (!comValor.includes('ph-x-circle')) fail('botão de limpar com ícone Phosphor', comValor);
console.log('OK: SearchInput (lupa, searchbox, limpar, loading, disabled, largura)');
