import React, { useState } from 'react';
import { Icons } from '../../iconography/Icons/Icons';
import type { Tone } from '../../internal/tone';

/** Cor do link: `primary` (azul da marca), `neutral` (cor do texto) ou `muted` (cinza esmaecido). */
export type LinkTone = Extract<Tone, 'primary' | 'neutral' | 'muted'>;

export interface LinkProps {
  /** Destino do link, usado no atributo `href` da âncora. */
  href?: string;
  /** Conteúdo textual (ou nós React) exibido dentro do link. */
  children?: React.ReactNode;
  /** Cor do link. */
  tone?: LinkTone;
  /** Marca o link como externo: abre em nova aba e exibe um ícone de seta indicando saída do site. */
  external?: boolean;
  /** Handler chamado ao clicar no link. */
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

/** Link de navegação textual com tons de cor e indicador opcional de destino externo. Herda o tamanho e a fonte do texto ao redor. */
export const Link: React.FC<LinkProps> = ({ href = '#', children, tone = 'primary', external = false, onClick }) => {
  const [hover, setHover] = useState(false);
  const tons: Record<LinkTone, React.CSSProperties> = {
    primary: { color: 'var(--ob-blue)', textDecoration: hover ? 'underline' : 'none' },
    neutral: { color: 'var(--ob-fg)', textDecoration: hover ? 'underline' : 'none' },
    muted:   { color: 'var(--ob-fg-soft)', textDecoration: hover ? 'underline' : 'none' },
  };
  return (
    <a href={href} onClick={onClick} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'inherit',
        fontWeight: 500, fontSize: 'inherit', cursor: 'pointer', transition: 'color var(--ob-dur-fast) var(--ob-ease)',
        ...tons[tone],
      }}>
      {children}
      {external && <Icons.arrowSquareOut size={13} weight="bold"/>}
    </a>
  );
};
