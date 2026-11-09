import React from 'react';
import { StatusDot } from '../../internal/StatusDot';
import { Ph } from '../../iconography/Ph/Ph';
import { Avatar } from '../Avatar/Avatar';
import { ScrollArea } from '../ScrollArea/ScrollArea';
import type { BadgeTone } from '../../internal/badgeTones';

export type TimelineOrientation = 'vertical' | 'horizontal';
export type TimelineAlign = 'start' | 'alternate';
export type TimelineMarker = 'dot' | 'icon' | 'avatar';
export type TimelineTimePosition = 'inline' | 'opposite';
export type TimelineItemStatus = 'done' | 'current' | 'pending' | 'error';

export interface TimelineItem {
  title: React.ReactNode;
  time?: React.ReactNode;
  description?: React.ReactNode;
  status?: TimelineItemStatus;
  /** Nome do ícone Phosphor, usado com `marker="icon"`. */
  icon?: string;
  /** Nome usado nas iniciais do Avatar, usado com `marker="avatar"`. */
  person?: string;
  /** Conteúdo livre abaixo da descrição (Badge, Button, Card…). */
  content?: React.ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  orientation?: TimelineOrientation;
  /** Conteúdo de um lado só, ou revezando (lados na vertical, acima/abaixo na horizontal). */
  align?: TimelineAlign;
  /** Só na vertical (ignorado com `align="alternate"`): data acima do título, ou em coluna à esquerda. */
  timePosition?: TimelineTimePosition;
  marker?: TimelineMarker;
  ariaLabel?: string;
}

const TONE: Record<TimelineItemStatus, { c: string; bg: string; dot: BadgeTone }> = {
  done: { c: 'var(--ob-success)', bg: 'var(--ob-success-bg)', dot: 'success' },
  current: { c: 'var(--ob-blue)', bg: 'var(--ob-blue-050)', dot: 'primary' },
  pending: { c: 'var(--ob-fg-mute)', bg: 'var(--ob-surface)', dot: 'neutral' },
  error: { c: 'var(--ob-danger)', bg: 'var(--ob-danger-bg)', dot: 'danger' },
};
const STATUS_LABEL: Record<TimelineItemStatus, string> = { done: 'Concluído', current: 'Em andamento', pending: 'Pendente', error: 'Com erro' };

function Marker({ item, marker }: { item: TimelineItem; marker: TimelineMarker }) {
  const s = item.status || 'done', t = TONE[s];
  if (marker === 'avatar') {
    return (
      <span style={{
        display: 'flex', borderRadius: 'var(--ob-r-circle)',
        boxShadow: s === 'current' ? '0 0 0 2px var(--ob-surface), 0 0 0 4px var(--ob-blue)' : s === 'error' ? '0 0 0 2px var(--ob-surface), 0 0 0 4px var(--ob-danger)' : 'none',
        opacity: s === 'pending' ? 'var(--ob-opacity-muted)' : 1,
      }}><Avatar name={item.person} size={28} /></span>
    );
  }
  if (marker === 'icon') {
    return (
      <span style={{ width: 28, height: 28, borderRadius: 'var(--ob-r-circle)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bg, color: t.c, border: `1.5px ${s === 'pending' ? 'dashed' : 'solid'} ${s === 'pending' ? 'var(--ob-border)' : t.c}` }}>
        <Ph n={s === 'error' ? 'warning' : item.icon || 'circle'} size={14} c="currentColor" />
      </span>
    );
  }
  return (
    <span style={{ width: 16, height: 16, borderRadius: 'var(--ob-r-circle)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: s === 'current' ? '0 0 0 4px var(--ob-blue-100)' : 'none' }}>
      <StatusDot tone={t.dot} />
    </span>
  );
}
function line(item: TimelineItem, next: TimelineItem | undefined, dir: 'v' | 'h'): React.CSSProperties {
  const done = (item.status || 'done') === 'done' && !!next && (next.status || 'done') !== 'pending';
  const dashed = next?.status === 'pending';
  const side = dir === 'v' ? 'borderLeft' : 'borderTop';
  return { [side]: `2px ${dashed ? 'dashed' : 'solid'} ${done ? 'var(--ob-success)' : 'var(--ob-border)'}` } as React.CSSProperties;
}
function Content({ item, showTime = true, align = 'left' }: { item: TimelineItem; showTime?: boolean; align?: 'left' | 'right' | 'center' }) {
  const s = item.status || 'done';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-2)', minWidth: 0, textAlign: align, alignItems: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start' }}>
      {showTime && item.time && <span style={{ fontSize: 'var(--ob-fs-12)', lineHeight: 'var(--ob-lh-normal)', color: 'var(--ob-fg-soft)' }}>{item.time}</span>}
      <span style={{ fontSize: 'var(--ob-fs-14)', lineHeight: '20px', fontWeight: 'var(--ob-w-semibold)', color: s === 'pending' ? 'var(--ob-fg-soft)' : s === 'error' ? 'var(--ob-danger)' : 'var(--ob-fg-strong)' }}>{item.title}</span>
      {item.description && <span style={{ fontSize: 'var(--ob-fs-14)', lineHeight: 'var(--ob-lh-normal)', color: 'var(--ob-fg)', textWrap: 'pretty' }}>{item.description}</span>}
      {item.content && <div style={{ marginTop: 'var(--ob-space-8)', width: '100%' }}>{item.content}</div>}
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{STATUS_LABEL[s]}</span>
    </div>
  );
}

/** Eventos em ordem cronológica, para leitura — registro histórico, sem interação própria. */
export const Timeline: React.FC<TimelineProps> = ({ items, orientation = 'vertical', align = 'start', timePosition = 'inline', marker = 'dot', ariaLabel = 'Linha do tempo' }) => {
  const mw = marker === 'dot' ? 16 : 28;

  if (orientation === 'horizontal') {
    const alt = align === 'alternate';
    return (
      <ScrollArea orientation="horizontal">
      <ol aria-label={ariaLabel} style={{ listStyle: 'none', margin: 0, padding: 'var(--ob-space-4) var(--ob-space-4) var(--ob-space-8)', display: 'flex' }}>
        {items.map((it, i) => {
          const next = items[i + 1], top = alt && i % 2 === 1;
          return (
            <li key={i} style={{ margin: 0, flex: '1 0 168px', display: 'grid', gridTemplateRows: alt ? 'minmax(64px, auto) auto minmax(64px, auto)' : 'auto auto', rowGap: 'var(--ob-space-12)', position: 'relative' }}>
              {alt && <div style={{ alignSelf: 'end', paddingRight: 'var(--ob-space-16)' }}>{top && <Content item={it} />}</div>}
              <div style={{ display: 'flex', alignItems: 'center', height: mw }}>
                <Marker item={it} marker={marker} />
                {next && <span style={{ flex: 1, margin: '0 var(--ob-space-6)', ...line(it, next, 'h') }} />}
              </div>
              <div style={{ paddingRight: 'var(--ob-space-16)' }}>{(!alt || !top) && <Content item={it} />}</div>
            </li>
          );
        })}
      </ol>
      </ScrollArea>
    );
  }

  const opp = timePosition === 'opposite' && align !== 'alternate', alt = align === 'alternate';
  const cols = alt ? `minmax(0,1fr) ${mw}px minmax(0,1fr)` : opp ? `96px ${mw}px minmax(0,1fr)` : `${mw}px minmax(0,1fr)`;
  return (
    <ol aria-label={ariaLabel} style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
      {items.map((it, i) => {
        const next = items[i + 1], left = alt && i % 2 === 1;
        const rail = (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: marker === 'dot' ? 'var(--ob-space-2)' : 0 }}>
            <Marker item={it} marker={marker} />
            {next && <span style={{ flex: 1, minHeight: 16, margin: 'var(--ob-space-6) 0', ...line(it, next, 'v') }} />}
          </div>
        );
        const pad: React.CSSProperties = { paddingBottom: next ? 'var(--ob-space-24)' : 0, paddingTop: marker === 'dot' ? 0 : 'var(--ob-space-4)' };
        return (
          <li key={i} style={{ margin: 0, display: 'grid', gridTemplateColumns: cols, columnGap: 'var(--ob-space-12)', position: 'relative' }}>
            {opp && <div style={{ ...pad, textAlign: 'right', fontSize: 'var(--ob-fs-12)', lineHeight: '20px', color: 'var(--ob-fg-soft)' }}>{it.time}</div>}
            {alt && <div style={pad}>{left && <Content item={it} align="right" />}</div>}
            {rail}
            <div style={pad}>{(!alt || !left) && <Content item={it} showTime={!opp} />}</div>
          </li>
        );
      })}
    </ol>
  );
};
