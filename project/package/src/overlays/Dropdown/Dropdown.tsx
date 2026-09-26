// project/package/src/overlays/Dropdown/Dropdown.tsx
import React, { useEffect, useRef, useState } from 'react';
import { FloatingPanel, FloatingPanelAlign } from '../FloatingPanel/FloatingPanel';

export interface DropdownItem {
  label?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  icon?: React.ReactNode;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: FloatingPanelAlign;
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, items, align = 'left' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <span onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>{trigger}</span>
      {open && (
        <FloatingPanel align={align} minWidth={180} padding={6}>
          {items.map((it, i) => it.divider ? (
            <div key={`d${i}`} style={{ height: 1, background: 'var(--ob-border)', margin: '6px 0' }} />
          ) : (
            <button key={i} onClick={() => { it.onClick?.(); setOpen(false); }} disabled={it.disabled} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px',
              border: 'none', borderRadius: 'var(--ob-r-sm)', background: 'transparent', cursor: it.disabled ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 500, textAlign: 'left',
              color: it.danger ? 'var(--ob-danger)' : 'var(--ob-fg-strong)', opacity: it.disabled ? 0.5 : 1,
              transition: 'background 120ms',
            }}
            onMouseEnter={(e) => { if (!it.disabled) e.currentTarget.style.background = 'var(--ob-bg-alt)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
              {it.icon && <span style={{ color: it.danger ? 'var(--ob-danger)' : 'var(--ob-fg-soft)', display: 'flex' }}>{it.icon}</span>}
              {it.label}
            </button>
          ))}
        </FloatingPanel>
      )}
    </div>
  );
};
