import React, { useState } from 'react';
import { Icons } from '../../iconography/Icons/Icons';

/** Nível de ênfase visual do link: `default` (cor de destaque), `subtle` (cor do texto) ou `quiet` (cor esmaecida). */
export type LinkVariant = 'default' | 'subtle' | 'quiet';

export interface LinkProps {
  /** Destino do link, usado no atributo `href` da âncora. */
  href?: string;
  /** Conteúdo textual (ou nós React) exibido dentro do link. */
  children?: React.ReactNode;
  /** Variante de ênfase que define a cor do link. */
  variant?: LinkVariant;
  /** Marca o link como externo: abre em nova aba e exibe um ícone de seta indicando saída do site. */
  external?: boolean;
  /** Handler chamado ao clicar no link. */
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

/** Link de navegação textual com variantes de ênfase e indicador opcional de destino externo. Herda o tamanho e a fonte do texto ao redor. */
export const Link: React.FC<LinkProps> = ({ href = '#', children, variant = 'default', external = false, onClick }) => {
  const [hover, setHover] = useState(false);
  const variants: Record<LinkVariant, React.CSSProperties> = {
    default: { color: 'var(--ob-blue)', textDecoration: hover ? 'underline' : 'none' },
    subtle:  { color: 'var(--ob-fg)', textDecoration: hover ? 'underline' : 'none' },
    quiet:   { color: 'var(--ob-fg-soft)', textDecoration: hover ? 'underline' : 'none' },
  };
  return (
    <a href={href} onClick={onClick} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'inherit',
        fontWeight: 500, fontSize: 'inherit', cursor: 'pointer', transition: 'color 120ms',
        ...variants[variant],
      }}>
      {children}
      {external && <Icons.arrowSquareOut size={13} weight="bold"/>}
    </a>
  );
};
