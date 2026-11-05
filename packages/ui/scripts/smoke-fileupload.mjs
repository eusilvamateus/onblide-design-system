import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FileUpload } from '../dist/index.js';

const h = React.createElement;
const fail = (msg, html) => { console.error('FAIL: ' + msg, html); process.exit(1); };
const render = (props) => renderToStaticMarkup(h(FileUpload, props));
const contar = (html, trecho) => (html.match(new RegExp(trecho, 'g')) ?? []).length;
const foto = 'data:image/svg+xml;utf8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27/%3E';

const dropzone = render({});
if (!dropzone.includes('role="button"') || !dropzone.includes('Arraste arquivos')) fail('dropzone deveria ter a área de arrastar', dropzone);

const button = render({ variant: 'button', buttonLabel: 'Anexar PDF' });
if (!button.includes('Anexar PDF')) fail('variant button deveria mostrar o buttonLabel', button);
if (!button.includes('ph-paperclip')) fail('variant button tem o ícone de anexo', button);
if (!button.includes('Ou arraste os arquivos para cá')) fail('variant button avisa que dá para arrastar', button);
if (render({ variant: 'button', hint: 'Até 5 MB' }).includes('Ou arraste')) fail('com hint, o aviso de arrastar não aparece');
if (render({ variant: 'button', disabled: true }).includes('Ou arraste')) fail('desabilitado não convida a arrastar');

const vazia = render({ variant: 'image' });
if (!vazia.includes('Escolher imagem')) fail('variant image deveria mostrar o rótulo de escolher imagem', vazia);
if (!vazia.includes('ph-upload-simple')) fail('o botão de escolher imagem tem ícone', vazia);
if (!vazia.includes('ph-camera-plus') || !vazia.includes('Adicionar foto')) fail('a área da foto vazia convida a adicionar', vazia);
if (!vazia.includes('Ou arraste uma imagem para cá')) fail('a variante de imagem avisa que dá para arrastar', vazia);
if (!vazia.includes('width:120px') || !vazia.includes('height:120px')) fail('tamanho padrão 120', vazia);
if (!vazia.includes('border-radius:var(--ob-r-surface)')) fail('forma quadrada por padrão', vazia);
if (!vazia.includes('type="file"') || !vazia.includes('display:none')) fail('seletor nativo escondido', vazia);
if (vazia.includes('multiple')) fail('imagem é sempre um arquivo só', vazia);
const logo = render({ variant: 'image', buttonLabel: 'Subir logo' });
if (!logo.includes('>Subir logo<') || logo.includes('>Escolher imagem<')) fail('buttonLabel vale também na variante de imagem', logo);

const circular = render({ variant: 'image', shape: 'circle', size: 96 });
if (!circular.includes('border-radius:var(--ob-r-circle)')) fail('shape circle deixa a área redonda', circular);
if (!circular.includes('width:96px') || !circular.includes('height:96px')) fail('size define o lado da área', circular);
const pequena = render({ variant: 'image', shape: 'circle', size: 72 });
if (pequena.includes('Adicionar foto')) fail('em área pequena só o ícone, sem texto', pequena);

const comFoto = render({ variant: 'image', shape: 'circle', defaultFiles: [{ name: 'perfil.png', size: 1000, url: foto }] });
if (!comFoto.includes('<img')) fail('mostra a prévia da foto existente', comFoto);
if (comFoto.includes('Escolher imagem<') || comFoto.includes('Ou arraste')) fail('com foto, some o botão de texto e o convite', comFoto);
if (!comFoto.includes('aria-label="Trocar imagem"')) fail('a área da foto também troca a imagem, com nome acessível', comFoto);
if (!new RegExp('<button[^>]*><i[^>]*ph-camera[^>]*></i>Trocar imagem</button>').test(comFoto)) fail('com foto, o botão Trocar imagem tem ícone e texto', comFoto);
if (!new RegExp('<button[^>]*><i[^>]*ph-trash[^>]*></i>Remover imagem</button>').test(comFoto)) fail('com foto, o botão Remover imagem tem ícone e texto', comFoto);
if (!comFoto.includes('ob-fileupload-camada')) fail('camada de trocar sobre a foto', comFoto);

const enviando = render({ variant: 'image', defaultFiles: [{ name: 'a.png', size: 1, url: foto, status: 'uploading', progress: 60 }] });
if (!enviando.includes('>60%<')) fail('envio em andamento mostra o progresso circular sobre a foto', enviando);
if (enviando.includes('ob-fileupload-camada')) fail('durante o envio não há camada de trocar', enviando);
const envioIndeterminado = render({ variant: 'image', indeterminate: true, defaultFiles: [{ name: 'a.png', size: 1, url: foto, status: 'uploading' }] });
if (!envioIndeterminado.includes('aria-label="Enviando imagem"')) fail('envio sem progresso real mostra spinner acessível', envioIndeterminado);
if (envioIndeterminado.includes('>0%<')) fail('envio sem progresso real não mostra porcentagem fictícia', envioIndeterminado);
const listaIndeterminada = render({ indeterminate: true, defaultFiles: [{ name: 'a.pdf', size: 1, status: 'uploading' }] });
if (!listaIndeterminada.includes('aria-label="Enviando a.pdf"') || !listaIndeterminada.includes('Enviando...')) fail('lista sem progresso real mostra estado de envio', listaIndeterminada);

const comErro = render({ variant: 'image', defaultFiles: [{ name: 'a.png', size: 1, url: foto, status: 'error', error: 'Maior que 2 MB' }] });
if (!comErro.includes('Maior que 2 MB') || !comErro.includes('var(--ob-danger)')) fail('erro aparece ao lado da foto em vermelho', comErro);

const arrastando = render({ variant: 'image', dragging: true });
if (!arrastando.includes('Solte aqui') || !arrastando.includes('ph-download-simple')) fail('estado de arrastar mostra "Solte aqui"', arrastando);
if (!arrastando.includes('var(--ob-blue-050)')) fail('estado de arrastar destaca a área', arrastando);

const desabilitada = render({ variant: 'image', disabled: true });
if (!desabilitada.includes('aria-disabled="true"') || !/<button[^>]*disabled/.test(desabilitada)) fail('disabled desativa a área e o botão', desabilitada);
if (desabilitada.includes('Ou arraste')) fail('desabilitado não convida a arrastar', desabilitada);

const withFiles = render({ defaultFiles: [{ name: 'contrato.pdf', size: 204800 }, { name: 'falha.pdf', size: 1024, status: 'error', error: 'Falha no envio' }] });
if (!withFiles.includes('contrato.pdf') || !withFiles.includes('200 KB')) fail('deveria listar os arquivos e o tamanho formatado', withFiles);
if (!withFiles.includes('Falha no envio')) fail('arquivo com erro deveria mostrar a mensagem', withFiles);
if (contar(withFiles, '<img') !== 0) fail('arquivos sem imagem não têm miniatura', withFiles);

const miniaturas = render({ defaultFiles: [{ name: 'foto.png', size: 2048, url: foto }, { name: 'contrato.pdf', size: 204800 }] });
if (contar(miniaturas, '<img') !== 1) fail('arquivo de imagem mostra miniatura e o PDF mostra ícone', miniaturas);
if (!miniaturas.includes('ph-file-pdf')) fail('o PDF continua com o ícone de PDF', miniaturas);

const disabled = render({ disabled: true });
if (!disabled.includes('aria-disabled="true"')) fail('disabled deveria marcar aria-disabled na área', disabled);
if (/#[0-9a-f]{3,8}\b|rgba?\(/i.test(vazia + comFoto + enviando + arrastando)) fail('nenhuma cor solta na variante de imagem');

console.log('OK: FileUpload (dropzone, button, image quadrada e circular, foto existente, envio, erro, arrastar, miniaturas, disabled)');
