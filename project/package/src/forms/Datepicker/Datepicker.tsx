import React, { useEffect, useState } from 'react';
import { FieldShell } from '../FieldShell/FieldShell';
import { Button } from '../../actions/Button/Button';
import { Ph } from '../../iconography/Ph/Ph';

/** Par de datas (início e fim) em formato ISO usado pelo Datepicker. */
export interface DatepickerValues {
  /** Data inicial em formato ISO (yyyy-mm-dd), ou `null` quando não selecionada. */
  startDate: string | null;
  /** Data final em formato ISO (yyyy-mm-dd), ou `null` quando não selecionada. */
  endDate: string | null;
}

export interface DatepickerProps {
  /** Restringe a seleção a uma única data em vez de um intervalo (de/até). */
  singleDate?: boolean;
  /** Texto do botão que limpa as datas selecionadas. */
  clearLabel?: string;
  /** Valores iniciais não controlados, usados quando `values` não é informado. */
  defaultValues?: DatepickerValues;
  /** Rótulo exibido acima do campo de data final. */
  endDateLabel?: string;
  /** Chamado sempre que os valores selecionados mudam. */
  onChange?: (values: DatepickerValues) => void;
  /** Chamado quando o usuário limpa as datas selecionadas. */
  onClear?: () => void;
  /** Limpa os campos automaticamente logo após confirmar a seleção. */
  resetOnSubmit?: boolean;
  /** Exibe o botão de confirmação no rodapé do calendário. */
  showSubmitButton?: boolean;
  /** Rótulo exibido acima do campo de data inicial. */
  startDateLabel?: string;
  /** Chamado ao confirmar a seleção, recebendo a data inicial e a final. */
  onSubmit?: (startDate: string | null, endDate: string | null) => void;
  /** Texto do botão de confirmação. */
  submitLabel?: string;
  /** Valores selecionados em modo controlado. */
  values?: DatepickerValues;
  /** Data mínima permitida; datas anteriores são tratadas como inválidas. */
  minBookingDate?: Date | null;
  /** Quantidade máxima de dias do intervalo (contando início e fim); ignorado em `singleDate`. Depois de
   * escolhida a data inicial, dias além do limite ficam desabilitados no calendário e a digitação manual
   * de uma data final além do limite mostra erro. */
  maxBookingDays?: number;
  /** Rótulo exibido acima do campo. */
  label?: React.ReactNode;
  /** Texto de apoio exibido abaixo do campo quando não há erro. */
  hint?: React.ReactNode;
  /** Mensagem de erro exibida abaixo do campo, substituindo o hint. */
  error?: React.ReactNode;
}

const dpFmt = (d: string | Date | null | undefined): string => {
  if (!d) return '';
  if (typeof d === 'string') {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const dpParse = (str: string): Date | null => {
  if (!str || !/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return null;
  const [dd, mm, yyyy] = str.split('/').map(Number);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const d = new Date(yyyy, mm - 1, dd);
  return (d.getDate() === dd && d.getMonth() === mm - 1 && d.getFullYear() === yyyy) ? d : null;
};

const dpMask = (val: string): string => {
  const digits = val.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const dpToIso = (d: Date | null): string | null =>
  d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : null;

const dpParseIso = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const dpAddDays = (d: Date, n: number): Date => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

/** Campo de seleção de data única ou intervalo, com digitação mascarada e calendário popup. */
export const Datepicker: React.FC<DatepickerProps> = ({
  singleDate = false,
  clearLabel = 'Limpar',
  defaultValues = { startDate: null, endDate: null },
  endDateLabel = 'até',
  onChange,
  onClear,
  resetOnSubmit = false,
  showSubmitButton = true,
  startDateLabel = 'de',
  onSubmit,
  submitLabel = 'Confirmar',
  values = { startDate: null, endDate: null },
  minBookingDate = null,
  maxBookingDays,
  label,
  hint,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(new Date());
  const [localValues, setLocalValues] = useState<DatepickerValues>(values || defaultValues);
  const [startText, setStartText] = useState(dpFmt(values?.startDate || defaultValues?.startDate));
  const [endText, setEndText] = useState(dpFmt(values?.endDate || defaultValues?.endDate));
  const [startErr, setStartErr] = useState('');
  const [endErr, setEndErr] = useState('');
  const [startFocus, setStartFocus] = useState(false);
  const [endFocus, setEndFocus] = useState(false);
  const [hoverIso, setHoverIso] = useState<string | null>(null);

  const limiteIso = maxBookingDays && localValues.startDate
    ? dpToIso(dpAddDays(dpParseIso(localValues.startDate), maxBookingDays - 1))
    : null;

  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth(month) }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const handleStartInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = dpMask(e.target.value);
    setStartText(masked);
    if (masked.length < 10) { setStartErr(''); return; }
    const d = dpParse(masked);
    if (!d) { setStartErr('Data inválida'); return; }
    if (minBookingDate && d < minBookingDate) { setStartErr(`Mín: ${dpFmt(minBookingDate)}`); return; }
    setStartErr('');
    const iso = dpToIso(d);
    const newVals = { ...localValues, startDate: iso, endDate: null };
    setLocalValues(newVals);
    setEndText('');
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    onChange?.(newVals);
  };

  const handleEndInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = dpMask(e.target.value);
    setEndText(masked);
    if (masked.length < 10) { setEndErr(''); return; }
    const d = dpParse(masked);
    if (!d) { setEndErr('Data inválida'); return; }
    if (localValues.startDate && dpToIso(d)! < localValues.startDate) { setEndErr('Deve ser após data inicial'); return; }
    if (limiteIso && dpToIso(d)! > limiteIso) { setEndErr(`Máx: ${maxBookingDays} dias`); return; }
    setEndErr('');
    const iso = dpToIso(d);
    const newVals = { ...localValues, endDate: iso };
    setLocalValues(newVals);
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    onChange?.(newVals);
  };

  const isInRange = (day: number) => {
    const dIso = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (!localValues.startDate || !localValues.endDate) return false;
    return dIso > localValues.startDate && dIso < localValues.endDate;
  };

  const aguardandoFim = !singleDate && !!localValues.startDate && !localValues.endDate;
  const emPrevia = (iso: string) => {
    if (!aguardandoFim || !hoverIso || !localValues.startDate) return false;
    const [de, ate] = hoverIso < localValues.startDate ? [hoverIso, localValues.startDate] : [localValues.startDate, hoverIso];
    return iso > de && iso < ate;
  };

  const handleDayClick = (day: number) => {
    const d = new Date(month.getFullYear(), month.getMonth(), day);
    const iso = dpToIso(d);
    if (singleDate) {
      const newVals = { startDate: iso, endDate: iso };
      setLocalValues(newVals); setStartText(dpFmt(d)); setStartErr('');
      onChange?.(newVals); setOpen(false);
    } else {
      if (!localValues.startDate || (localValues.startDate && localValues.endDate)) {
        const newVals = { startDate: iso, endDate: null };
        setLocalValues(newVals); setStartText(dpFmt(d)); setEndText(''); setStartErr(''); setEndErr('');
        onChange?.(newVals);
      } else if (iso! < localValues.startDate) {
        const newVals = { startDate: iso, endDate: localValues.startDate };
        setLocalValues(newVals); setStartText(dpFmt(d)); setEndText(dpFmt(localValues.startDate)); setStartErr(''); setEndErr('');
        onChange?.(newVals); setOpen(false);
      } else if (limiteIso && iso! > limiteIso) {
        return;
      } else {
        const newVals = { ...localValues, endDate: iso };
        setLocalValues(newVals); setEndText(dpFmt(d)); setEndErr('');
        onChange?.(newVals); setOpen(false);
      }
    }
  };

  const handleClear = () => {
    const newVals = { startDate: null, endDate: null };
    setLocalValues(newVals); setStartText(''); setEndText(''); setStartErr(''); setEndErr('');
    onClear?.(); onChange?.(newVals);
  };

  const handleSubmit = () => {
    onSubmit?.(localValues.startDate, localValues.endDate);
    if (resetOnSubmit) handleClear();
    setOpen(false);
  };

  const prevMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1));
  const nextMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1));

  const handleInputClick = (e: React.SyntheticEvent) => { e.stopPropagation(); setOpen(true); };

  const dpInputStyle: React.CSSProperties = {
    flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
    fontFamily: 'inherit', fontSize: 14, color: 'var(--ob-fg-strong)', padding: '10px 0',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}
         onClick={(e) => e.stopPropagation()}>
      {label && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{label}</span>}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        {!singleDate ? (
          <>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ob-fg-soft)', marginBottom: 4 }}>{startDateLabel}</div>
              <FieldShell focused={startFocus} error={!!startErr} onClick={handleInputClick}>
                <input
                  type="text" value={startText} maxLength={10} placeholder="dd/mm/yyyy"
                  onChange={handleStartInput} onClick={handleInputClick}
                  onFocus={() => setStartFocus(true)} onBlur={() => setStartFocus(false)}
                  style={dpInputStyle}
                />
              </FieldShell>
              {startErr && <div style={{ fontSize: 11, color: 'var(--ob-danger)', marginTop: 4 }}>{startErr}</div>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ob-fg-soft)', marginBottom: 4 }}>{endDateLabel}</div>
              <FieldShell focused={endFocus} error={!!endErr} onClick={handleInputClick}>
                <input
                  type="text" value={endText} maxLength={10} placeholder="dd/mm/yyyy"
                  onChange={handleEndInput} onClick={handleInputClick}
                  onFocus={() => setEndFocus(true)} onBlur={() => setEndFocus(false)}
                  style={dpInputStyle}
                />
              </FieldShell>
              {endErr && <div style={{ fontSize: 11, color: 'var(--ob-danger)', marginTop: 4 }}>{endErr}</div>}
            </div>
          </>
        ) : (
          <div style={{ flex: 1 }}>
            <FieldShell focused={startFocus} error={!!startErr} onClick={handleInputClick}>
              <input
                type="text" value={startText} maxLength={10} placeholder="dd/mm/yyyy"
                onChange={handleStartInput} onClick={handleInputClick}
                onFocus={() => setStartFocus(true)} onBlur={() => setStartFocus(false)}
                style={dpInputStyle}
              />
            </FieldShell>
            {startErr && <div style={{ fontSize: 11, color: 'var(--ob-danger)', marginTop: 4 }}>{startErr}</div>}
          </div>
        )}
      </div>

      {open && (
        <div onClick={(e) => e.stopPropagation()} style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 8, background: 'var(--ob-surface)', border: '1px solid var(--ob-border)',
          borderRadius: 'var(--ob-r-surface)', padding: 16, boxShadow: 'var(--ob-shadow-lg)',
          zIndex: 'var(--ob-z-dropdown)' as React.CSSProperties['zIndex'],
          minWidth: 300,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <button type="button" aria-label="Mês anterior" onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', padding: '4px 8px', color: 'var(--ob-blue)', borderRadius: 'var(--ob-r-xs)' }}><Ph n="caret-left" size={16} /></button>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{monthNames[month.getMonth()]} {month.getFullYear()}</span>
            <button type="button" aria-label="Próximo mês" onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', padding: '4px 8px', color: 'var(--ob-blue)', borderRadius: 'var(--ob-r-xs)' }}><Ph n="caret-right" size={16} /></button>
          </div>
          <div onMouseLeave={() => setHoverIso(null)} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 10 }}>
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--ob-fg-mute)', padding: '4px 0' }}>{d}</div>
            ))}
            {blanks.map((_, i) => <div key={`b-${i}`} />)}
            {days.map(day => {
              const iso = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isStart = iso === localValues.startDate;
              const isEnd = iso === localValues.endDate;
              const inRange = isInRange(day) || emPrevia(iso);
              const alvoDaPrevia = aguardandoFim && hoverIso === iso && !isStart;
              const foraDoLimite = aguardandoFim && !!limiteIso && iso > limiteIso;
              return (
                <button key={day} disabled={foraDoLimite} onClick={() => handleDayClick(day)}
                  onMouseEnter={() => !foraDoLimite && setHoverIso(iso)} onFocus={() => !foraDoLimite && setHoverIso(iso)} style={{
                  padding: '6px 0', borderRadius: 'var(--ob-r-xs)', border: 'none', textAlign: 'center',
                  background: isStart || isEnd ? 'var(--ob-blue)' : inRange ? 'var(--ob-blue-100)' : (hoverIso === iso ? 'var(--ob-bg-warm)' : 'var(--ob-surface)'),
                  color: isStart || isEnd ? '#fff' : 'var(--ob-fg-strong)',
                  boxShadow: alvoDaPrevia ? 'inset 0 0 0 1.5px var(--ob-blue)' : 'none',
                  opacity: foraDoLimite ? 0.35 : 1,
                  fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
                  cursor: foraDoLimite ? 'not-allowed' : 'pointer', transition: 'background 100ms',
                }}>{day}</button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--ob-border)', paddingTop: 10 }}>
            <Button kind="ghost" onClick={handleClear} style={{ flex: 1, fontSize: 12 }}>{clearLabel}</Button>
            {showSubmitButton && (
              <Button kind="primary" onClick={handleSubmit} style={{ flex: 1, fontSize: 12 }}>{submitLabel}</Button>
            )}
          </div>
        </div>
      )}
      {(hint || error) && <span style={{ fontSize: 11, color: error ? 'var(--ob-danger)' : 'var(--ob-fg-mute)', marginTop: 4 }}>{error || hint}</span>}
    </div>
  );
};
