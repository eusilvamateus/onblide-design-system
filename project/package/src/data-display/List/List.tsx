import React from 'react';
import { Divider } from '../Divider/Divider';

// Linha de lista oficial: Select, Dropdown, Menu e Autocomplete desenhavam cada um a sua própria. List e
// ListItem definem anatomia, densidade, estados e tons; o comportamento (role, teclado, foco) fica com quem usa.

export type ListSize = 'md' | 'sm';

interface SizeSpec { pad: string; minH: number; fs: number; lh: string; gap: number; icon: number; sub: string }
const LIST_SIZES: Record<ListSize, SizeSpec> = {
  md: { pad: '8px 12px', minH: 36, fs: 14, lh: '20px', gap: 10, icon: 16, sub: '8px 12px 4px' },
  sm: { pad: '4px 8px', minH: 28, fs: 13, lh: '18px', gap: 8, icon: 14, sub: '6px 8px 2px' },
};

interface ListContextValue { size: ListSize; itemAs: 'li' | 'div' }
const ListContext = React.createContext<ListContextValue | null>(null);

export interface ListProps extends React.HTMLAttributes<HTMLElement> {
  /** Densidade herdada pelos ListItem/ListSubheader filhos que não definem a própria. */
  size?: ListSize;
  /** Traça uma borda entre os itens em vez do respiro padrão de 1px e recorta seus estados no contorno da lista. */
  dividers?: boolean;
  /** Acrescenta 4px de respiro interno ao container. */
  inset?: boolean;
  /** Elemento raiz: `ul`/`ol` fazem os filhos virarem `li`; qualquer outro vira `div`. */
  as?: React.ElementType;
  /** Rótulo acessível do container. */
  ariaLabel?: string;
  children?: React.ReactNode;
}

/** Container de lista: densidade, respiro e separadores compartilhados pelos ListItem. */
export const List: React.FC<ListProps> = ({ size = 'md', dividers = false, inset = false, as, ariaLabel, style, children, ...rest }) => {
  const Tag = (as ?? 'ul') as React.ElementType;
  const itemAs: 'li' | 'div' = as === undefined || as === 'ul' || as === 'ol' ? 'li' : 'div';
  const kids = React.Children.toArray(children);
  const items = dividers
    ? kids.map((c, i) => (React.isValidElement(c) ? React.cloneElement(c as React.ReactElement<{ _divider?: boolean }>, { _divider: i < kids.length - 1 }) : c))
    : kids;
  return (
    <ListContext.Provider value={{ size, itemAs }}>
      <Tag aria-label={ariaLabel} {...rest} style={{ listStyle: 'none', margin: 0, padding: inset ? 4 : 0, display: 'flex', flexDirection: 'column', gap: dividers ? 0 : 1, borderRadius: dividers ? 'var(--ob-r-surface)' : undefined, overflow: dividers ? 'hidden' : undefined, ...style }}>
        {items}
      </Tag>
    </ListContext.Provider>
  );
};

export type ListItemTone = 'danger' | 'accent';
export type ListItemSelectedStyle = 'fill' | 'none';
export type ListItemAlign = 'center' | 'start';

export interface ListItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Conteúdo à esquerda: ícone, Checkbox, Avatar — o que for. */
  leading?: React.ReactNode;
  /** Texto principal da linha. */
  title?: React.ReactNode;
  /** Texto de apoio abaixo do título. */
  description?: React.ReactNode;
  /** Valor curto alinhado à direita, antes do `trailing` (contagem, data). */
  meta?: React.ReactNode;
  /** Conteúdo à direita: ações, atalho, seta de submenu. */
  trailing?: React.ReactNode;
  size?: ListSize;
  tone?: ListItemTone;
  /** Estado destacado; quando indefinido e o item tem `href`/`onClick`, segue o próprio hover. */
  highlighted?: boolean;
  selected?: boolean;
  selectedStyle?: ListItemSelectedStyle;
  disabled?: boolean;
  /** Reserva o espaço do `leading` mesmo sem conteúdo, para alinhar com itens que têm. */
  indent?: boolean;
  align?: ListItemAlign;
  /** Deixa a descrição quebrar linha em vez de cortar com reticências. */
  wrap?: boolean;
  /** Título em peso 600, independente da seleção. */
  strong?: boolean;
  as?: React.ElementType;
  href?: string;
  /** @internal aplicado pelo `List` quando `dividers` está ligado. */
  _divider?: boolean;
}

/** Linha de lista: anatomia fixa (leading · title · description · meta · trailing), estados e tons. */
export const ListItem: React.FC<ListItemProps> = (props) => {
  const {
    leading, title, description, meta, trailing, children, size: sizeProp, tone, highlighted, selected = false,
    selectedStyle = 'fill', disabled = false, indent = false, align = 'center', wrap = false, strong = false,
    as, href, onClick, onMouseEnter, onMouseLeave, style, _divider, ...rest
  } = props;
  const ctx = React.useContext(ListContext);
  const z = LIST_SIZES[sizeProp ?? ctx?.size ?? 'md'];
  const [hover, setHover] = React.useState(false);
  const self = highlighted === undefined && !!(href || onClick);
  const hl = !disabled && (highlighted ?? (self && hover));
  const fill = selected && selectedStyle === 'fill';
  const Tag = (as ?? (href ? 'a' : ctx?.itemAs ?? 'div')) as React.ElementType;
  const color = disabled ? 'var(--ob-fg-mute)' : tone === 'danger' ? 'var(--ob-danger)' : tone === 'accent' ? 'var(--ob-blue)' : fill ? 'var(--ob-blue-700)' : 'var(--ob-fg-strong)';
  const leadColor = disabled ? 'inherit' : tone === 'danger' ? 'var(--ob-danger)' : tone === 'accent' || fill ? 'var(--ob-blue)' : 'var(--ob-fg-soft)';
  const pointer = !disabled && (self || highlighted !== undefined);
  return (
    <Tag
      href={disabled ? undefined : href}
      aria-disabled={disabled || undefined}
      {...rest}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={(e: React.MouseEvent) => { setHover(true); onMouseEnter?.(e as React.MouseEvent<HTMLElement>); }}
      onMouseLeave={(e: React.MouseEvent) => { setHover(false); onMouseLeave?.(e as React.MouseEvent<HTMLElement>); }}
      style={{
        position: 'relative', display: 'flex', alignItems: align === 'start' ? 'flex-start' : 'center', gap: z.gap,
        padding: z.pad, minHeight: z.minH, boxSizing: 'border-box', borderRadius: _divider !== undefined ? 0 : 'var(--ob-r-sm)',
        borderBottom: _divider ? '1px solid var(--ob-border)' : 'none',
        background: hl ? 'var(--ob-bg-warm)' : fill ? 'var(--ob-blue-100)' : 'transparent', color,
        fontFamily: 'var(--ob-font)', fontSize: z.fs, lineHeight: z.lh, fontWeight: fill || strong ? 600 : 400,
        textDecoration: 'none', cursor: disabled ? 'not-allowed' : pointer ? 'pointer' : 'default',
        opacity: disabled ? 0.5 : 1, userSelect: 'none', transition: 'background .12s', ...style,
      }}>
      {(leading || indent) && (
        <span style={{ flex: 'none', minWidth: z.icon, minHeight: z.lh, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: z.gap, color: leadColor }}>
          {leading}
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
        {description && (
          <span style={{
            fontSize: 'var(--ob-fs-xs)', lineHeight: 'var(--ob-lh-normal)', fontWeight: 400,
            color: disabled ? 'inherit' : 'var(--ob-fg-soft)', whiteSpace: wrap ? 'normal' : 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis', textWrap: wrap ? 'pretty' : undefined,
          }}>{description}</span>
        )}
      </span>
      {meta != null && meta !== false && (
        <span style={{ flex: 'none', minHeight: z.lh, display: 'flex', alignItems: 'center', fontSize: 'var(--ob-fs-xs)', fontWeight: 400, color: disabled ? 'inherit' : 'var(--ob-fg-soft)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
          {meta}
        </span>
      )}
      {trailing && (
        <span style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'center', color: disabled ? 'inherit' : 'var(--ob-fg-soft)' }}>
          {trailing}
        </span>
      )}
      {children}
    </Tag>
  );
};

export interface ListSubheaderProps {
  /** Fixa o título no topo da lista durante a rolagem. */
  sticky?: boolean;
  size?: ListSize;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/** Título de um grupo de itens dentro da lista. */
export const ListSubheader: React.FC<ListSubheaderProps> = ({ children, sticky = false, size: sizeProp, id, style }) => {
  const ctx = React.useContext(ListContext);
  const z = LIST_SIZES[sizeProp ?? ctx?.size ?? 'md'];
  return (
    <div id={id} role="presentation" style={{
      padding: z.sub, fontFamily: 'var(--ob-font)', fontSize: 'var(--ob-fs-xs)', lineHeight: 'var(--ob-lh-normal)',
      fontWeight: 'var(--ob-w-semibold)', color: 'var(--ob-fg-soft)',
      ...(sticky ? { position: 'sticky' as const, top: -4, zIndex: 1, background: 'var(--ob-surface)' } : {}),
      ...style,
    }}>{children}</div>
  );
};

export interface ListDividerProps {
  /** Estende a linha além do padding do container, em px. */
  bleed?: number;
  /** Margem acima e abaixo da linha, em px. */
  space?: number;
  style?: React.CSSProperties;
}

/** Separador entre grupos de itens; encosta nas bordas do container com `bleed`. */
export const ListDivider: React.FC<ListDividerProps> = ({ bleed = 0, space = 4, style }) => (
  <Divider bleed={bleed} spacing={space} style={style} />
);
