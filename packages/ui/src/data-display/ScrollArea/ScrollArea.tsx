import React from 'react';
import { useBarrasDeRolagem } from '../../internal/barrasDeRolagem';

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';
export type ScrollAreaVisibility = 'hover' | 'auto' | 'always';

export interface ScrollAreaProps {
  /** Eixo em que a área rola. */
  orientation?: ScrollAreaOrientation;
  /** `hover` mostra a barra ao rolar, passar o mouse ou focar; `auto` a mantém visível enquanto houver o que rolar; `always` a mantém visível, com o trilho. */
  visibility?: ScrollAreaVisibility;
  /** Altura fixa da área. */
  height?: number | string;
  /** Altura máxima da área; acima dela o conteúdo rola. */
  maxHeight?: number | string;
  /** Nome acessível da região rolável. */
  ariaLabel?: string;
  /** Referência do elemento que rola, para ler ou mudar a posição da rolagem. */
  viewportRef?: React.Ref<HTMLDivElement>;
  /** Estilos inline adicionais da raiz. */
  style?: React.CSSProperties;
  /** Conteúdo que rola. */
  children?: React.ReactNode;
}

function atribuirRef<T>(ref: React.Ref<T> | undefined, valor: T | null) {
  if (typeof ref === 'function') ref(valor);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = valor;
}

/** Área com rolagem nativa e uma barra fina e discreta, desenhada com os tokens do tema. */
export const ScrollArea: React.FC<ScrollAreaProps> = ({
  orientation = 'vertical', visibility = 'hover', height, maxHeight, ariaLabel, viewportRef, style, children,
}) => {
  const { alvo, aoRolar, ativa, rolavel, barras } = useBarrasDeRolagem<HTMLDivElement>(orientation);

  const definirViewport = React.useCallback((el: HTMLDivElement | null) => {
    alvo.current = el;
    atribuirRef(viewportRef, el);
  }, [alvo, viewportRef]);

  return (
    <div className="ob-sa" data-visibilidade={visibility} data-ativa={ativa ? '' : undefined} style={{
      position: 'relative', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, height, maxHeight, ...style,
    }}>
      <div
        ref={definirViewport} className="ob-sa-viewport" onScroll={aoRolar}
        role={ariaLabel ? 'region' : undefined} aria-label={ariaLabel} tabIndex={rolavel ? 0 : undefined}
        style={{
          position: 'relative', flex: '1 1 auto', minWidth: 0, minHeight: 0,
          overflowX: orientation === 'vertical' ? 'hidden' : 'auto',
          overflowY: orientation === 'horizontal' ? 'hidden' : 'auto',
        }}
      >
        {children}
      </div>
      {barras}
    </div>
  );
};
