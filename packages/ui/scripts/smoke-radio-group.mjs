import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RadioGroup } from '../dist/index.js';

// options vazio não pode lançar exceção nem renderizar nada além do wrapper
const empty = renderToStaticMarkup(React.createElement(RadioGroup, { options: [] }));
if (!empty.includes('<div') || empty.includes('<label')) {
  console.error('FAIL: options vazio deveria renderizar só o wrapper, sem nenhum <label>:', empty);
  process.exit(1);
}

// options preenchido continua funcionando normalmente
const filled = renderToStaticMarkup(React.createElement(RadioGroup, {
  options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }],
  value: 'b',
}));
if ((filled.match(/<label/g) || []).length !== 2) {
  console.error('FAIL: esperava 2 <label> para 2 opções:', filled);
  process.exit(1);
}

const grande = renderToStaticMarkup(React.createElement(RadioGroup, { options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], value: 'a', size: 'lg' }));
if ((grande.match(/width:20px;height:20px/g) || []).length !== 2) {
  console.error('FAIL: size do grupo deveria chegar a todos os radios:', grande);
  process.exit(1);
}

console.log('OK: options vazio e preenchido, ambos corretos, size repassado aos radios');
