import React, { useEffect, useRef, useState } from 'react';
import * as OnblideUI from '@onblide/ui';

// O Drawer é renderizado direto no <body>, então um exemplo aberto cobriria a página inteira ao carregar.
// Nos exemplos do site ele começa fechado, atrás de um botão, e fecha pelo próprio Drawer. O resto do código
// do exemplo continua igual ao do card do Claude Design, onde cada exemplo tem a própria página.
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
