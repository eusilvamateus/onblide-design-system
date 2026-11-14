import React, { useEffect, useRef, useState } from 'react';
import * as OnblideUI from '@onblide/ui';

type Abrivel = { open?: boolean; onClose?: () => void; onConfirm?: () => void; title?: React.ReactNode };

function abrirPorBotao<P extends Abrivel>(Componente: React.ComponentType<P>, rotulo: string) {
  return function Exemplo({ open, onClose, onConfirm, ...props }: P) {
    const [aberto, setAberto] = useState(false);
    const fechar = () => { setAberto(false); onClose?.(); };
    return (
      <>
        <OnblideUI.Button kind="secondary" onClick={() => setAberto(true)}>
          {`${rotulo}${typeof props.title === 'string' ? `: ${props.title}` : ''}`}
        </OnblideUI.Button>
        <Componente {...(props as P)} open={aberto} onClose={fechar} onConfirm={onConfirm ? () => { onConfirm(); fechar(); } : undefined} />
      </>
    );
  };
}

const ReactLiveScope = {
  React,
  useState,
  useEffect,
  useRef,
  ...OnblideUI,
  Modal: abrirPorBotao(OnblideUI.Modal, 'Abrir modal'),
  AlertDialog: abrirPorBotao(OnblideUI.AlertDialog, 'Abrir diálogo'),
  Drawer: abrirPorBotao(OnblideUI.Drawer, 'Abrir drawer'),
};

export default ReactLiveScope;
