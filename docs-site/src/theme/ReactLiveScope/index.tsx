import React, { useEffect, useRef, useState } from 'react';
import * as OnblideUI from '@onblide/ui';

function DrawerDeExemplo({ open, onClose, ...props }: React.ComponentProps<typeof OnblideUI.Drawer>) {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <OnblideUI.Button kind="secondary" onClick={() => setAberto(true)}>
        {`Abrir drawer${props.title ? `: ${props.title}` : ''}`}
      </OnblideUI.Button>
      <OnblideUI.Drawer {...props} open={aberto} onClose={() => { setAberto(false); onClose?.(); }} />
    </>
  );
}

// Tudo que os exemplos ao vivo podem usar sem importar: os componentes do pacote e os hooks do React.
const ReactLiveScope = { React, useState, useEffect, useRef, ...OnblideUI, Drawer: DrawerDeExemplo };

export default ReactLiveScope;
