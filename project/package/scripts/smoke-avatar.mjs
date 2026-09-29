import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Avatar } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

const iniciais = renderToStaticMarkup(h(Avatar, { name: 'Mateus Silva', size: 40 }));
if (!iniciais.includes('>MA<') || !iniciais.includes('width:40px')) fail('esperava iniciais "MA", width 40px', iniciais);

const comImagem = renderToStaticMarkup(h(Avatar, { name: 'Mateus Silva', src: 'https://exemplo.com/foto.jpg', alt: 'Foto de Mateus' }));
if (!comImagem.includes('<img src="https://exemplo.com/foto.jpg"')) fail('com src, deveria renderizar <img>', comImagem);
if (!comImagem.includes('alt="Foto de Mateus"')) fail('deveria repassar o alt informado', comImagem);
if (comImagem.includes('>MA<')) fail('com imagem, não deveria renderizar as iniciais', comImagem);

const semAlt = renderToStaticMarkup(h(Avatar, { src: 'https://exemplo.com/foto.jpg' }));
if (!semAlt.includes('alt=""')) fail('sem alt informado, deveria tratar como decorativo (alt vazio)', semAlt);

console.log('OK: Avatar (iniciais, imagem com src/alt, alt vazio por padrão)');
