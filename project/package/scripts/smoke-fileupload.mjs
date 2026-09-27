import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FileUpload } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };

const dropzone = renderToStaticMarkup(h(FileUpload, {}));
if (!dropzone.includes('role="button"') || !dropzone.includes('Arraste arquivos')) fail('dropzone deveria ter a área de arrastar', dropzone);

const button = renderToStaticMarkup(h(FileUpload, { variant: 'button', buttonLabel: 'Anexar PDF' }));
if (!button.includes('Anexar PDF')) fail('variant button deveria mostrar o buttonLabel', button);

const image = renderToStaticMarkup(h(FileUpload, { variant: 'image' }));
if (!image.includes('Escolher imagem')) fail('variant image deveria mostrar o rótulo de escolher imagem', image);

const withFiles = renderToStaticMarkup(h(FileUpload, { defaultFiles: [{ name: 'contrato.pdf', size: 204800 }, { name: 'falha.pdf', size: 1024, status: 'error', error: 'Falha no envio' }] }));
if (!withFiles.includes('contrato.pdf') || !withFiles.includes('200 KB')) fail('deveria listar os arquivos e o tamanho formatado', withFiles);
if (!withFiles.includes('Falha no envio')) fail('arquivo com erro deveria mostrar a mensagem', withFiles);

const disabled = renderToStaticMarkup(h(FileUpload, { disabled: true }));
if (!disabled.includes('aria-disabled="true"')) fail('disabled deveria marcar aria-disabled na área', disabled);

console.log('OK: FileUpload (dropzone, button, image, lista de arquivos e erro, disabled)');
