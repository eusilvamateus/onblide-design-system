// project/package/src/data-display/DeadlineCalendar/DeadlineCalendar.tsx
import React, { useEffect, useState } from 'react';
import { Ph } from '../../iconography/Ph/Ph';

export interface DeadlineCalendarPhase {
  /** Data de início da fase, no formato AAAA-MM-DD. */
  startDate?: string;
  /** Data de término da fase, no formato AAAA-MM-DD. */
  endDate?: string;
}

export interface DeadlineCalendarHoliday {
  /** Data do feriado, no formato AAAA-MM-DD. */
  date: string;
  /** Nome do feriado exibido no tooltip. */
  name: string;
}

export interface DeadlineCalendarProps {
  /** Data de referência (marco inicial); define o mês inicial exibido. */
  referenceDate?: string;
  /** Intervalo de produção, destacado em azul no calendário. */
  production?: DeadlineCalendarPhase | null;
  /** Intervalo de transporte/entrega, destacado em verde no calendário. */
  delivery?: DeadlineCalendarPhase | null;
  /** Data estimada de entrega, destacada com contorno e marcador. */
  estimatedDate?: string;
  /** Feriados nacionais exibidos com tooltip e cor de aviso. */
  holidays?: DeadlineCalendarHoliday[];
  /** Indica se a cobertura de feriados é nacional ou apenas fins de semana. */
  holidayCoverage?: string;
  /** Indica que a data de entrega ainda depende da escolha de um frete. */
  deliveryPending?: boolean;
}

/** Calendário que visualiza fases de produção, transporte, feriados e data estimada de entrega. */
export const DeadlineCalendar: React.FC<DeadlineCalendarProps> = ({
  referenceDate,
  production = null,
  delivery = null,
  estimatedDate = '',
  holidays = [],
  holidayCoverage = 'national',
  deliveryPending = false,
}) => {
  const parse = (value?: string | null) => {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12) : null;
  };
  const iso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const monthKey = (date: Date) => date.getFullYear() * 12 + date.getMonth();
  const reference = parse(referenceDate) || new Date();
  const finish = parse(estimatedDate) || parse(production?.endDate) || reference;
  const minMonth = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const maxMonth = new Date(finish.getFullYear(), finish.getMonth(), 1);
  const [month, setMonth] = useState(minMonth);
  useEffect(() => setMonth(minMonth), [referenceDate]);
  const activeMonth = monthKey(month) < monthKey(minMonth) ? minMonth : monthKey(month) > monthKey(maxMonth) ? maxMonth : month;
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const weekdayNames = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const holidayMap = Object.fromEntries((holidays || []).map((holiday) => [holiday.date, holiday]));
  const inPhase = (date: string, phase?: DeadlineCalendarPhase | null) => !!phase?.startDate && !!phase?.endDate && date >= phase.startDate && date <= phase.endDate;
  const firstDay = new Date(activeMonth.getFullYear(), activeMonth.getMonth(), 1).getDay();
  const days = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 0).getDate();
  const buttonStyle = (disabled: boolean): React.CSSProperties => ({
    width: 28, height: 28, display: 'grid', placeItems: 'center', padding: 0,
    border: '1px solid var(--ob-border)', borderRadius: 'var(--ob-r-sm)', background: 'var(--ob-surface)',
    color: 'var(--ob-fg-strong)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .45 : 1,
  });
  const legend = (color: string | null, label: string, border?: string) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--ob-fg-soft)', fontSize: 10 }}><i style={{ width: 8, height: 8, borderRadius: 3, background: color || 'transparent', border: border || 'none' }} />{label}</span>;

  return (
    <section aria-label="Calendário de prazos" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 12, border: '1px solid var(--ob-border)', borderRadius: 'var(--ob-r-surface)', background: 'var(--ob-surface)' }}>
      <strong style={{ color: 'var(--ob-fg-strong)', fontSize: 12 }}><Ph n="calendar-blank" size={12} weight="bold" style={{ verticalAlign: '-2px' }} /> Calendário de prazos</strong>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <button type="button" aria-label="Mês anterior" disabled={monthKey(activeMonth) <= monthKey(minMonth)} onClick={() => setMonth(new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1))} style={buttonStyle(monthKey(activeMonth) <= monthKey(minMonth))}><Ph n="caret-left" size={14} weight="bold" /></button>
        <strong aria-live="polite" style={{ minWidth: 142, color: 'var(--ob-fg-strong)', fontSize: 12, textAlign: 'center' }}>{monthNames[activeMonth.getMonth()]} de {activeMonth.getFullYear()}</strong>
        <button type="button" aria-label="Próximo mês" disabled={monthKey(activeMonth) >= monthKey(maxMonth)} onClick={() => setMonth(new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1))} style={buttonStyle(monthKey(activeMonth) >= monthKey(maxMonth))}><Ph n="caret-right" size={14} weight="bold" /></button>
      </div>
      <div aria-hidden="true" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 3 }}>{weekdayNames.map((name, index) => <span key={`${name}-${index}`} style={{ color: 'var(--ob-fg-mute)', fontFamily: 'var(--ob-font-mono)', fontSize: 9, fontWeight: 700, textAlign: 'center' }}>{name}</span>)}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 3 }}>
        {Array.from({ length: firstDay }).map((_, index) => <span key={`blank-${index}`} aria-hidden="true" style={{ minHeight: 28 }} />)}
        {Array.from({ length: days }, (_, index) => index + 1).map((day) => {
          const date = new Date(activeMonth.getFullYear(), activeMonth.getMonth(), day, 12);
          const key = iso(date); const holiday = holidayMap[key]; const weekend = date.getDay() === 0 || date.getDay() === 6;
          const productionDay = !weekend && !holiday && inPhase(key, production);
          const deliveryDay = !weekend && !holiday && inPhase(key, delivery);
          const estimated = key === estimatedDate;
          return <span key={key} title={holiday ? `Feriado nacional: ${holiday.name}` : estimated ? 'Data estimada de entrega' : undefined} aria-label={`${day} de ${monthNames[activeMonth.getMonth()]}${holiday ? ` · Feriado nacional: ${holiday.name}` : ''}${estimated ? ' · Data estimada de entrega' : ''}`} style={{ minHeight: 28, display: 'grid', placeItems: 'center', position: 'relative', borderRadius: 6, background: holiday ? 'var(--ob-warning-bg)' : deliveryDay ? 'var(--ob-success-bg)' : productionDay ? 'var(--ob-blue-100)' : weekend ? 'var(--ob-bg-alt)' : 'transparent', color: holiday ? 'var(--ob-orange-700)' : deliveryDay ? 'var(--ob-green-700)' : productionDay ? 'var(--ob-blue-700)' : weekend ? 'var(--ob-fg-mute)' : 'var(--ob-fg)', boxShadow: estimated ? 'inset 0 0 0 2px var(--ob-green-700)' : key === referenceDate ? 'inset 0 0 0 1px var(--ob-blue)' : 'none', fontSize: 11, fontWeight: estimated ? 800 : 600, cursor: holiday ? 'help' : 'default' }}>{day}{estimated && <i aria-hidden="true" style={{ width: 5, height: 5, position: 'absolute', right: 3, bottom: 3, borderRadius: '50%', background: 'var(--ob-green-700)' }} />}</span>;
        })}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 9px' }}>{legend('var(--ob-blue-100)', 'Produção')}{legend('var(--ob-success-bg)', 'Transporte')}{legend(null, 'Entrega prevista', '2px solid var(--ob-green-700)')}{legend('var(--ob-warning-bg)', 'Feriado')}</div>
      <p style={{ margin: 0, color: holidayCoverage === 'national' ? 'var(--ob-fg-soft)' : 'var(--ob-orange-700)', fontSize: 10, lineHeight: 1.4 }}>{deliveryPending ? 'Selecione uma opção de frete para visualizar a data estimada de entrega.' : !estimatedDate ? 'Retirada combinada: sem prazo de transporte.' : holidayCoverage === 'national' ? 'Previsão considera fins de semana e feriados nacionais.' : 'Feriados nacionais indisponíveis; a previsão considera somente fins de semana.'}</p>
    </section>
  );
};
