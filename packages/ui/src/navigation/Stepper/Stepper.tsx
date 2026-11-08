import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { ProgressBar } from '../../feedback/ProgressBar/ProgressBar';

export type StepStatus = 'error' | 'disabled';
export type StepperVariant = 'horizontal' | 'vertical' | 'bar' | 'segmented' | 'compact';
export type StepperMarker = 'number' | 'icon' | 'dot';
export type StepperSize = 'sm' | 'md' | 'lg';
type StepState = 'upcoming' | 'current' | 'done' | 'error' | 'disabled';

export interface StepItem {
  label: React.ReactNode;
  hint?: React.ReactNode;
  /** Nome do ícone Phosphor, usado com `marker="icon"`. */
  icon?: string;
  optional?: boolean;
  /** Sobrepõe o estado derivado de `current`. */
  status?: StepStatus;
}

export interface StepperProps {
  steps: StepItem[];
  current: number;
  variant?: StepperVariant;
  marker?: StepperMarker;
  /** Tamanho dos marcadores, do texto e do espaçamento: `sm`, `md` (padrão) ou `lg`, para fluxos de página inteira. */
  size?: StepperSize;
  /** Só etapas concluídas são clicáveis; com `false`, qualquer etapa não desabilitada é. */
  linear?: boolean;
  onStepClick?: (index: number) => void;
}

function stepState(step: StepItem, i: number, current: number): StepState {
  if (step.status === 'error' || step.status === 'disabled') return step.status;
  return i < current ? 'done' : i === current ? 'current' : 'upcoming';
}
const labelColor = (st: StepState) => st === 'error' ? 'var(--ob-danger)' : st === 'upcoming' ? 'var(--ob-fg-soft)' : st === 'disabled' ? 'var(--ob-fg-mute)' : 'var(--ob-fg-strong)';

interface EscalaDoStepper {
  marcador: number; icone: number; ponto: number; numero: number | string; rotulo: string; dica: string | null;
  destaque: string; contador: string; passo: number; linha: number; recuoTopo: string; recuoBase: string; barra: 'sm' | 'md' | 'lg';
}

const ESCALA: Record<StepperSize, EscalaDoStepper> = {
  sm: { marcador: 22, icone: 12, ponto: 8, numero: 11, rotulo: 'var(--ob-fs-xs)', dica: null, destaque: 'var(--ob-fs-sm)', contador: 'var(--ob-fs-xs)', passo: 88, linha: 16, recuoTopo: 'var(--ob-space-2)', recuoBase: 'var(--ob-space-12)', barra: 'sm' },
  md: { marcador: 28, icone: 14, ponto: 10, numero: 'var(--ob-fs-xs)', rotulo: 'var(--ob-fs-sm)', dica: 'var(--ob-fs-xs)', destaque: 'var(--ob-fs-base)', contador: 'var(--ob-fs-xs)', passo: 112, linha: 24, recuoTopo: 'var(--ob-space-4)', recuoBase: 'var(--ob-space-24)', barra: 'md' },
  lg: { marcador: 34, icone: 16, ponto: 12, numero: 'var(--ob-fs-sm)', rotulo: 'var(--ob-fs-base)', dica: 'var(--ob-fs-sm)', destaque: 'var(--ob-fs-md)', contador: 'var(--ob-fs-sm)', passo: 136, linha: 32, recuoTopo: 'var(--ob-space-6)', recuoBase: 'var(--ob-space-32)', barra: 'lg' },
};

function StepMark({ state, n, icon, marker = 'number', size = 'md' }: { state: StepState; n: number; icon?: string; marker?: StepperMarker; size?: StepperSize }) {
  const e = ESCALA[size];
  if (marker === 'dot') {
    const d = e.ponto;
    const bg = { done: 'var(--ob-blue)', current: 'var(--ob-blue)', error: 'var(--ob-danger)', upcoming: 'var(--ob-surface)', disabled: 'var(--ob-surface-2)' }[state];
    const ring = state === 'current' ? '0 0 0 4px var(--ob-blue-100)' : state === 'error' ? '0 0 0 4px var(--ob-red-100)' : 'none';
    return <span style={{ width: d, height: d, boxSizing: 'border-box', margin: (e.marcador - d) / 2, borderRadius: 'var(--ob-r-pill)', flex: 'none', background: bg, border: state === 'upcoming' || state === 'disabled' ? '1.5px solid var(--ob-border)' : 'none', boxShadow: ring, transition: 'all var(--ob-dur-base) var(--ob-ease)' }} />;
  }
  const d = e.marcador, ic = e.icone;
  const base: React.CSSProperties = { width: d, height: d, boxSizing: 'border-box', borderRadius: 'var(--ob-r-pill)', display: 'grid', placeItems: 'center', flex: 'none', fontSize: e.numero, fontWeight: 'var(--ob-w-semibold)', transition: 'all var(--ob-dur-base) var(--ob-ease)' };
  const content = marker === 'icon' && icon ? <Ph n={icon} size={ic} c="currentColor" /> : n;
  if (state === 'done') return <span style={{ ...base, background: 'var(--ob-blue)', color: 'var(--ob-fg-on-color)' }}><Ph n="check" size={ic} c="currentColor" /></span>;
  if (state === 'error') return <span style={{ ...base, background: 'var(--ob-red-100)', color: 'var(--ob-danger)' }}><Ph n="warning" size={ic} c="currentColor" /></span>;
  if (state === 'current') return <span style={{ ...base, border: '2px solid var(--ob-blue)', background: 'var(--ob-surface)', color: 'var(--ob-blue)', boxShadow: '0 0 0 4px var(--ob-blue-100)' }}>{content}</span>;
  if (state === 'disabled') return <span style={{ ...base, border: '1px dashed var(--ob-border)', background: 'var(--ob-surface-2)', color: 'var(--ob-fg-mute)' }}>{content}</span>;
  return <span style={{ ...base, border: '1px solid var(--ob-border)', background: 'var(--ob-surface)', color: 'var(--ob-fg-mute)' }}>{content}</span>;
}
function StepText({ step, state, size = 'md', align = 'left' as const }: { step: StepItem; state: StepState; size?: StepperSize; align?: 'left' | 'right' | 'center' }) {
  const e = ESCALA[size];
  return (
    <div style={{ textAlign: align, minWidth: 0 }}>
      <div style={{ fontSize: e.rotulo, fontWeight: 'var(--ob-w-semibold)', color: labelColor(state), transition: 'color var(--ob-dur-base) var(--ob-ease)' }}>{step.label}</div>
      {e.dica && (step.hint || step.optional) && (
        <div style={{ fontSize: e.dica, color: state === 'error' ? 'var(--ob-danger)' : 'var(--ob-fg-soft)', marginTop: 'var(--ob-space-2)' }}>
          {step.hint}{step.hint && step.optional ? ' · ' : ''}{step.optional ? 'Opcional' : ''}
        </div>
      )}
    </div>
  );
}
function Hit({ can, onClick, children, style }: { can: boolean; onClick: () => void; children: React.ReactNode; style: React.CSSProperties }) {
  if (!can) return <div style={style}>{children}</div>;
  return <button type="button" onClick={onClick} style={{ ...style, border: 'none', background: 'transparent', font: 'inherit', textAlign: 'inherit', cursor: 'pointer' }}>{children}</button>;
}

/** Indicador de etapas de um fluxo: cinco layouts, três marcadores, estados derivados de `current`. */
export const Stepper: React.FC<StepperProps> = ({ steps, current = 0, variant = 'horizontal', marker = 'number', size = 'md', linear = true, onStepClick }) => {
  const n = steps.length, escala = ESCALA[size];
  const st = (i: number) => stepState(steps[i], i, current);
  const can = (i: number) => !!onStepClick && st(i) !== 'disabled' && i !== current && (linear ? i < current : true);
  const click = (i: number) => () => onStepClick?.(i);
  const lineOn = (i: number) => i < current;
  const md = escala.marcador;
  const ariaCur = (i: number): 'step' | undefined => (i === current ? 'step' : undefined);

  if (variant === 'compact') {
    const idx = Math.min(current, n - 1), s = st(idx), next = steps[idx + 1];
    return (
      <div role="group" aria-label="Progresso" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--ob-space-12)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--ob-space-8)', minWidth: 0 }}>
            <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: escala.contador, color: 'var(--ob-fg-soft)', whiteSpace: 'nowrap' }}>Etapa {idx + 1} de {n}</span>
            <span style={{ fontSize: escala.destaque, fontWeight: 'var(--ob-w-semibold)', color: labelColor(s === 'upcoming' ? 'current' : s) }}>{steps[idx].label}</span>
          </div>
          {next && <span style={{ fontSize: escala.contador, color: 'var(--ob-fg-soft)' }}>Próxima: {next.label}</span>}
        </div>
        <ProgressBar value={current >= n ? 100 : ((idx + 0.5) / n) * 100} tone={s === 'error' ? 'danger' : 'primary'} size={escala.barra} />
        {s === 'error' && steps[idx].hint && <span style={{ fontSize: escala.contador, color: 'var(--ob-danger)' }}>{steps[idx].hint}</span>}
      </div>
    );
  }

  if (variant === 'segmented') {
    return (
      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gap: 'var(--ob-space-8)' }}>
        {steps.map((step, i) => {
          const s = st(i), val = s === 'done' || s === 'error' ? 100 : s === 'current' ? 50 : 0;
          return (
            <li key={i} aria-current={ariaCur(i)} style={{ margin: 0, minWidth: 0 }}>
              <Hit can={can(i)} onClick={click(i)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-8)', width: '100%', opacity: s === 'disabled' ? 'var(--ob-opacity-disabled)' : 1 }}>
                <ProgressBar value={val} tone={s === 'error' ? 'danger' : 'primary'} size={size === 'lg' ? 'md' : 'sm'} />
                <div style={{ display: 'flex', gap: 'var(--ob-space-6)', alignItems: 'baseline', minWidth: 0 }}>
                  <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: escala.contador, color: s === 'error' ? 'var(--ob-danger)' : s === 'upcoming' || s === 'disabled' ? 'var(--ob-fg-mute)' : 'var(--ob-blue)' }}>{String(i + 1).padStart(2, '0')}</span>
                  <StepText step={step} state={s} size={size} />
                </div>
              </Hit>
            </li>
          );
        })}
      </ol>
    );
  }

  if (variant === 'bar') {
    const pct = n > 1 ? (Math.min(current, n - 1) / (n - 1)) * 100 : 100;
    return (
      <div style={{ padding: `0 ${md / 2}px` }}>
        <div style={{ position: 'relative', height: md, display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1 }}><ProgressBar value={pct} size={size === 'lg' ? 'md' : 'sm'} /></div>
          {steps.map((step, i) => (
            <div key={i} style={{ position: 'absolute', left: `${(n > 1 ? i / (n - 1) : 0) * 100}%`, top: 0, transform: 'translateX(-50%)' }}>
              <Hit can={can(i)} onClick={click(i)} style={{ display: 'flex', borderRadius: 'var(--ob-r-pill)' }}><StepMark state={st(i)} n={i + 1} icon={step.icon} marker={marker} size={size} /></Hit>
            </div>
          ))}
        </div>
        <ol style={{ listStyle: 'none', margin: `var(--ob-space-12) -${md / 2}px 0`, padding: 0, display: 'flex', justifyContent: 'space-between', gap: 'var(--ob-space-12)' }}>
          {steps.map((step, i) => (
            <li key={i} aria-current={ariaCur(i)} style={{ margin: 0, flex: 1, minWidth: 0, display: 'flex', justifyContent: i === 0 ? 'flex-start' : i === n - 1 ? 'flex-end' : 'center' }}>
              <StepText step={step} state={st(i)} size={size} align={i === 0 ? 'left' : i === n - 1 ? 'right' : 'center'} />
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
        {steps.map((step, i) => {
          const s = st(i), last = i === n - 1;
          return (
            <li key={i} aria-current={ariaCur(i)} style={{ margin: 0, display: 'grid', gridTemplateColumns: `${md}px 1fr`, columnGap: 'var(--ob-space-12)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <StepMark state={s} n={i + 1} icon={step.icon} marker={marker} size={size} />
                {!last && <span style={{ flex: 1, width: 2, minHeight: escala.linha, margin: 'var(--ob-space-4) 0', background: lineOn(i) ? 'var(--ob-blue)' : 'var(--ob-border)', transition: 'background var(--ob-dur-base) var(--ob-ease)' }} />}
              </div>
              <Hit can={can(i)} onClick={click(i)} style={{ paddingBottom: last ? 0 : escala.recuoBase, paddingTop: escala.recuoTopo, alignSelf: 'start' }}><StepText step={step} state={s} size={size} /></Hit>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', minWidth: n * escala.passo }}>
      {steps.map((step, i) => {
        const s = st(i);
        return (
          <li key={i} aria-current={ariaCur(i)} style={{ margin: 0, flex: 1, minWidth: 0, marginLeft: i > 0 ? 'calc(var(--ob-space-2) * -1)' : 0 }}>
            <Hit can={can(i)} onClick={click(i)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--ob-space-8)', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <span style={{ flex: 1, height: 2, background: i === 0 ? 'transparent' : lineOn(i - 1) ? 'var(--ob-blue)' : 'var(--ob-border)', transition: 'background var(--ob-dur-base) var(--ob-ease)' }} />
                <span style={{ padding: '0 var(--ob-space-6)', display: 'flex' }}><StepMark state={s} n={i + 1} icon={step.icon} marker={marker} size={size} /></span>
                <span style={{ flex: 1, height: 2, background: i === n - 1 ? 'transparent' : lineOn(i) ? 'var(--ob-blue)' : 'var(--ob-border)', transition: 'background var(--ob-dur-base) var(--ob-ease)' }} />
              </div>
              <div style={{ padding: '0 var(--ob-space-4)' }}><StepText step={step} state={s} size={size} align="center" /></div>
            </Hit>
          </li>
        );
      })}
    </ol>
  );
};
