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
    <Tooltip label="Salvar alterações" shortcut={['Ctrl', 'S']}><Button kind="secondary">Salvar</Button></Tooltip>
  </Aberto>
);

export const Invertido = () => (
  <Aberto>
    <Tooltip appearance="outline" placement="bottom" label="Copiar link do projeto"><Button kind="ghost">Compartilhar</Button></Tooltip>
  </Aberto>
);

export const ComTitulo = () => (
  <Aberto>
    <Tooltip variant="image" placement="bottom" title="Painel de metas" subtitle="Acompanhe o progresso do trimestre"><Button kind="secondary">Metas</Button></Tooltip>
  </Aberto>
);

const IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='200' height='120'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#0a4ee4'/><stop offset='1' stop-color='#eb7c2d'/></linearGradient></defs><rect width='200' height='120' fill='url(#g)'/></svg>"
);

export const ComImagem = () => (
  <Aberto>
    <Tooltip variant="image" placement="bottom" image={IMG} title="onblide Dashboard" subtitle="Atualizado há 2h · v2.4"><Button kind="secondary">Pré-visualizar</Button></Tooltip>
  </Aberto>
);

export const PosicaoDireita = () => (
  <Aberto>
    <Tooltip label="Buscar" shortcut="/" placement="right"><Button kind="ghost">Buscar</Button></Tooltip>
  </Aberto>
);
