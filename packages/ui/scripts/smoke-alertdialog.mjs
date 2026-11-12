import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AlertDialog, Modal } from '../dist/index.js';

function fail(msg, extra) {
  console.error('FAIL:', msg, extra ?? '');
  process.exit(1);
}
const render = (props, filhos = 'Esta ação não pode ser desfeita.') => renderToStaticMarkup(React.createElement(AlertDialog, props, filhos));

if (render({ open: false, title: 'x' }) !== '') fail('fechado não renderiza nada');
const aberto = render({ open: true, title: 'Excluir projeto?' });
if (!aberto.includes('role="alertdialog"') || !aberto.includes('aria-modal="true"')) fail('papel de alertdialog modal', aberto);
if (!aberto.includes('Excluir projeto?') || !aberto.includes('Esta ação não pode ser desfeita.')) fail('título e descrição', aberto);
const descricao = aberto.match(/aria-describedby="([^"]+)"/)?.[1];
if (!descricao || !aberto.includes(`id="${descricao}"`)) fail('o corpo é a descrição acessível do diálogo', aberto);
if (aberto.includes('aria-label="Fechar"')) fail('alertdialog não tem botão de fechar no cabeçalho', aberto);
if (!aberto.includes('>Cancelar<') || !aberto.includes('>Confirmar<')) fail('rótulos padrão dos botões', aberto);
const personalizado = render({ open: true, title: 'x', confirmLabel: 'Excluir', cancelLabel: 'Manter' });
if (!personalizado.includes('>Excluir<') || !personalizado.includes('>Manter<')) fail('rótulos personalizados', personalizado);
if (aberto.includes('var(--ob-danger)')) fail('o tom padrão não é destrutivo', aberto);
if (!render({ open: true, title: 'x', tone: 'danger' }).includes('var(--ob-danger)')) fail('danger usa o token de perigo');

const fechar = () => {};
const emAndamento = AlertDialog({ open: true, title: 'x', onClose: fechar, loading: true });
const [cancelar, confirmar] = emAndamento.props.footer.props.children;
if (emAndamento.props.onClose !== undefined) fail('loading impede que Esc e o backdrop fechem o diálogo');
if (!cancelar.props.disabled) fail('loading desabilita o botão de cancelar');
if (!confirmar.props.loading) fail('loading põe o botão de confirmar em carregamento');
const parado = AlertDialog({ open: true, title: 'x', onClose: fechar });
if (parado.props.onClose !== fechar || parado.props.footer.props.children[0].props.disabled) fail('sem loading Esc, backdrop e cancelar fecham');
if (!render({ open: true, title: 'x', loading: true }).includes('aria-busy="true"')) fail('o botão de confirmar marca aria-busy');

const modal = renderToStaticMarkup(React.createElement(Modal, { open: true, title: 'M' }, 'c'));
if (!modal.includes('role="dialog"') || modal.includes('aria-describedby')) fail('Modal continua dialog por padrão', modal);
if (!modal.includes('aria-label="Fechar"')) fail('Modal continua com o botão de fechar por padrão', modal);
const semFechar = renderToStaticMarkup(React.createElement(Modal, { open: true, title: 'M', closeButton: false }, 'c'));
if (semFechar.includes('aria-label="Fechar"')) fail('closeButton={false} esconde o botão de fechar');
console.log('OK: AlertDialog (alertdialog modal, descrição acessível, rótulos, danger, loading) e Modal (role, closeButton)');
