import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { Menu } from '../../overlays/Menu/Menu';
import { Button } from '../../actions/Button/Button';

export type BreadcrumbSeparator = 'caret' | 'slash';
export type BreadcrumbSize = 'sm' | 'md';

export interface BreadcrumbItem {
  /** Texto do nível; omitido quando o item é só ícone (com `ariaLabel`). */
  label?: React.ReactNode;
  /** URL do nível; sem `onNavigate`, o clique segue o link normalmente. */
  href?: string;
  /** Nome do ícone Phosphor exibido antes do rótulo. */
  icon?: string;
  /** Nome acessível, obrigatório quando o item só tem ícone. */
  ariaLabel?: string;
}

export interface BreadcrumbsProps {
  /** Trilha completa; o último item é a página atual e não vira link. */
  items: BreadcrumbItem[];
  /** Símbolo entre os níveis. */
  separator?: BreadcrumbSeparator;
  size?: BreadcrumbSize;
  /** Recolhe os níveis do meio num menu quando a trilha passa desse tamanho (0 desliga). */
  maxItems?: number;
  /** Chamado ao clicar num nível (exceto o atual); sem isso, o link segue `href` normalmente. */
  onNavigate?: (item: BreadcrumbItem) => void;
}

function BreadcrumbSeparatorIcon({ kind, size }: { kind: BreadcrumbSeparator; size: BreadcrumbSize }) {
  if (kind === 'slash') return <span aria-hidden="true" style={{ color: 'var(--ob-fg-mute)', padding: '0 2px', userSelect: 'none' }}>/</span>;
  return <span aria-hidden="true" style={{ display: 'flex', color: 'var(--ob-fg-mute)' }}><Ph n="caret-right" size={size === 'sm' ? 12 : 14} c="currentColor" /></span>;
}

function Crumb({ item, current, size, onNavigate }: { item: BreadcrumbItem; current: boolean; size: BreadcrumbSize; onNavigate?: (item: BreadcrumbItem) => void }) {
  const pad = size === 'sm' ? '2px 4px' : '4px 6px';
  const inner = (
    <>
      {item.icon && <Ph n={item.icon} size={size === 'sm' ? 14 : 16} c="currentColor" />}
      {item.label && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>}
    </>
  );
  const base: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, maxWidth: 220, padding: pad,
    borderRadius: 'var(--ob-r-sm)', textDecoration: 'none',
    transition: 'background var(--ob-dur-base) var(--ob-ease), color var(--ob-dur-base) var(--ob-ease)',
  };
  if (current) {
    return (
      <span aria-current="page" title={typeof item.label === 'string' ? item.label : undefined}
        style={{ ...base, color: 'var(--ob-fg-strong)', fontWeight: 'var(--ob-w-semibold)' }}>{inner}</span>
    );
  }
  return (
    <a href={item.href || '#'} title={typeof item.label === 'string' ? item.label : undefined}
      aria-label={item.label ? undefined : item.ariaLabel}
      onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate(item); } }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ob-fg-strong)'; e.currentTarget.style.background = 'var(--ob-surface-2)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ob-fg-soft)'; e.currentTarget.style.background = 'transparent'; }}
      style={{ ...base, color: 'var(--ob-fg-soft)' }}>{inner}</a>
  );
}

/** Trilha de navegação com a hierarquia da página atual; recolhe o meio num menu quando passa de `maxItems`. */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, separator = 'caret', size = 'md', maxItems = 0, onNavigate }) => {
  type Visible = { it: BreadcrumbItem; i: number; more?: false } | { more: true };
  let visible: Visible[] = items.map((it, i) => ({ it, i }));
  let hidden: BreadcrumbItem[] = [];
  if (maxItems && items.length > maxItems) {
    const tail = Math.max(1, maxItems - 1);
    hidden = items.slice(1, items.length - tail);
    visible = [{ it: items[0], i: 0 }, { more: true }, ...items.slice(items.length - tail).map((it, k) => ({ it, i: items.length - tail + k }))];
  }
  return (
    <nav aria-label="Você está em">
      <ol style={{
        listStyle: 'none', margin: 0, padding: 0, display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        rowGap: 4, columnGap: 2, fontSize: size === 'sm' ? 'var(--ob-fs-xs)' : 'var(--ob-fs-sm)',
        lineHeight: 'var(--ob-lh-normal)', fontWeight: 'var(--ob-w-medium)',
      }}>
        {visible.map((v, k) => (
          <li key={k} style={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
            {k > 0 && <BreadcrumbSeparatorIcon kind={separator} size={size} />}
            {'more' in v && v.more ? (
              <Menu
                ariaLabel="Níveis ocultos"
                trigger={<Button kind="neutral" iconOnly size="sm" aria-label={`Mostrar mais ${hidden.length} níveis`} icon={<Ph n="dots-three" size={16} c="currentColor" />} />}
                items={hidden.map((h) => ({ label: typeof h.label === 'string' ? h.label : h.ariaLabel ?? '', icon: 'folder-simple', onSelect: () => onNavigate?.(h) }))}
              />
            ) : (
              <Crumb item={(v as { it: BreadcrumbItem }).it} current={(v as { i: number }).i === items.length - 1} size={size} onNavigate={onNavigate} />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
