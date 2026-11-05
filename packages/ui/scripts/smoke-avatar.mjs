import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Avatar } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

const iniciais = renderToStaticMarkup(h(Avatar, { name: 'Mateus Silva', size: 40 }));
if (!iniciais.includes('>MS<') || !iniciais.includes('width:40px')) fail('esperava iniciais "MS" (primeira e última palavra), width 40px', iniciais);
const umaPalavra = renderToStaticMarkup(h(Avatar, { name: 'Mateus' }));
if (!umaPalavra.includes('>MA<')) fail('com uma palavra, deveria usar as duas primeiras letras', umaPalavra);
const tresPalavras = renderToStaticMarkup(h(Avatar, { name: 'Ana Maria Souza' }));
if (!tresPalavras.includes('>AS<')) fail('com três palavras, deveria usar a primeira e a última', tresPalavras);
const forcadas = renderToStaticMarkup(h(Avatar, { name: 'Mateus Silva', initials: 'xyzw' }));
if (!forcadas.includes('>XYZ<')) fail('initials deveria substituir as geradas, limitado a três caracteres', forcadas);

const comImagem = renderToStaticMarkup(h(Avatar, { name: 'Mateus Silva', src: 'https://exemplo.com/foto.jpg', alt: 'Foto de Mateus' }));
if (!comImagem.includes('<img src="https://exemplo.com/foto.jpg"')) fail('com src, deveria renderizar <img>', comImagem);
if (!comImagem.includes('alt="Foto de Mateus"')) fail('deveria repassar o alt informado', comImagem);
if (comImagem.includes('>MS<')) fail('com imagem, não deveria renderizar as iniciais', comImagem);

const semAlt = renderToStaticMarkup(h(Avatar, { src: 'https://exemplo.com/foto.jpg' }));
if (!semAlt.includes('alt=""')) fail('sem alt informado, deveria tratar como decorativo (alt vazio)', semAlt);

console.log('OK: Avatar (iniciais da primeira e última palavra, initials, imagem com src/alt, alt vazio por padrão)');
