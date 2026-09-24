import { useEffect, useRef } from 'react';
import { Tooltip, Button } from '@onblide/ui';

// O balão só abre com hover: simula a entrada do mouse ao montar para mostrar o estado aberto.
const Aberto = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const alvo = ref.current?.querySelector('button');
    alvo?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body }));
  }, []);
  return <div ref={ref} style={{ padding: 48, minHeight: 240 }}>{children}</div>;
};

export const Texto = () => (
  <Aberto>
    <Tooltip label="Salvar alterações" shortcut="Ctrl S"><Button kind="secondary">Salvar</Button></Tooltip>
  </Aberto>
);

export const Invertido = () => (
  <Aberto>
    <Tooltip variant="inverted" placement="bottom" label="Copiar link do projeto"><Button kind="ghost">Compartilhar</Button></Tooltip>
  </Aberto>
);

export const ComTitulo = () => (
  <Aberto>
    <Tooltip variant="image" placement="bottom" title="Painel de metas" subtitle="Acompanhe o progresso do trimestre"><Button kind="secondary">Metas</Button></Tooltip>
  </Aberto>
);
