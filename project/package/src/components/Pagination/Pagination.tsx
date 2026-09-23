import React from 'react';
import { Icons } from '../../primitives/Icons/Icons';

export interface PaginationProps {
  page?: number;
  total?: number;
  onChange?: (page: number) => void;
  siblings?: number;
}

export const Pagination: React.FC<PaginationProps> = ({ page = 1, total = 10, onChange, siblings = 1 }) => {
  const range = (s: number, e: number) => Array.from({ length: e - s + 1 }, (_, i) => s + i);
  const pages: (number | '…')[] = [];
  const left = Math.max(2, page - siblings);
  const right = Math.min(total - 1, page + siblings);
  pages.push(1);
  if (left > 2) pages.push('…');
  pages.push(...range(left, right));
  if (right < total - 1) pages.push('…');
  if (total > 1) pages.push(total);

  const Arrow = ({ dir, disabled }: { dir: 'prev' | 'next'; disabled: boolean }) => (
    <button disabled={disabled} onClick={() => onChange?.(dir === 'prev' ? page - 1 : page + 1)} style={{
      width: 34, height: 34, borderRadius: 'var(--ob-r-sm)', border: '1px solid var(--ob-border)',
      background: 'var(--ob-surface)', color: disabled ? 'var(--ob-fg-mute)' : 'var(--ob-fg)',
      cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 120ms',
    }}>
      {dir === 'prev' ? <Icons.caretL size={16}/> : <Icons.caretR size={16}/>}
    </button>
  );

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Arrow dir="prev" disabled={page === 1} />
      {pages.map((p, i) => p === '…' ? (
        <span key={`e${i}`} style={{ width: 34, textAlign: 'center', color: 'var(--ob-fg-mute)' }}>…</span>
      ) : (
        <button key={p} onClick={() => onChange?.(p)} style={{
          minWidth: 34, height: 34, padding: '0 8px', borderRadius: 'var(--ob-r-sm)',
          border: `1px solid ${p === page ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
          background: p === page ? 'var(--ob-blue)' : 'var(--ob-surface)',
          color: p === page ? '#fff' : 'var(--ob-fg)', fontFamily: 'inherit', fontSize: 14,
          fontWeight: p === page ? 600 : 500, cursor: 'pointer', transition: 'all 120ms',
        }}>{p}</button>
      ))}
      <Arrow dir="next" disabled={page === total} />
    </div>
  );
};
