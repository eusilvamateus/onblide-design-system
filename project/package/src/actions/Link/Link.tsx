import React, { useState } from 'react';
import { Icons } from '../../iconography/Icons/Icons';

export type LinkVariant = 'default' | 'subtle' | 'quiet';

export interface LinkProps {
  href?: string;
  children?: React.ReactNode;
  variant?: LinkVariant;
  external?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

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
        fontWeight: 500, fontSize: 14, cursor: 'pointer', transition: 'color 120ms',
        ...variants[variant],
      }}>
      {children}
      {external && <Icons.arrowSquareOut size={13}/>}
    </a>
  );
};
