import React, { useEffect, useState } from 'react';
import { FieldShell } from '../FieldShell/FieldShell';
import { Button } from '../../actions/Button/Button';
import { Calendar } from '../../data-display/Calendar/Calendar';
import type { CalendarRange } from '../../data-display/Calendar/Calendar';
import { Popover } from '../../overlays/Popover/Popover';
import { Ph } from '../../iconography/Ph/Ph';
import { diaDesabilitado } from '../../internal/calendarLogic';
import type { SemanaComecaEm } from '../../internal/calendarLogic';
import { compararDias, formatarData, interpretarData, mascararData, paraIso } from '../../internal/dates';

interface DatepickerBaseProps {
  /** Rótulo exibido acima do campo. */
  label?: React.ReactNode;
  /** Texto de apoio abaixo do campo; some quando há erro. */
  hint?: React.ReactNode;
  /** Mensagem de erro externa, exibida no lugar do texto de apoio e com a borda vermelha. */
  error?: React.ReactNode;
  /** Primeira data selecionável; vale para o calendário e para a digitação. */
  min?: Date;
  /** Última data selecionável; vale para o calendário e para a digitação. */
  max?: Date;
  /** Desabilita dias específicos (feriados, datas indisponíveis). */
  isDateDisabled?: (date: Date) => boolean;
  /** Dia em que a semana começa no calendário: `0` domingo (padrão) ou `1` segunda-feira. */
  weekStartsOn?: SemanaComecaEm;
  /** Texto exibido enquanto o campo está vazio. */
  placeholder?: string;
  /** Desabilita o campo e o calendário. */
  disabled?: boolean;
}

export interface SingleDatepickerProps extends DatepickerBaseProps {
  /** Seleciona uma única data. */
  mode?: 'single';
  /** Data selecionada, em modo controlado. */
  value?: Date | null;
  /** Data inicial, em modo não controlado. */
  defaultValue?: Date | null;
  /** Chamado ao escolher ou digitar uma data válida, ou `null` ao esvaziar o campo. */
  onChange?: (value: Date | null) => void;
}

export interface RangeDatepickerProps extends DatepickerBaseProps {
  /** Seleciona um intervalo de datas, com dois campos e um calendário. */
  mode: 'range';
  /** Intervalo selecionado, em modo controlado. */
  value?: CalendarRange;
  /** Intervalo inicial, em modo não controlado. */
  defaultValue?: CalendarRange;
  /** Chamado ao escolher ou digitar uma data válida do intervalo. */
  onChange?: (value: CalendarRange) => void;
}

export type DatepickerProps = SingleDatepickerProps | RangeDatepickerProps;

const VAZIO: CalendarRange = { start: null, end: null };

const estiloDoCampo: React.CSSProperties = {
  flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
  fontFamily: 'inherit', fontSize: 14, color: 'var(--ob-fg-strong)', padding: '10px 0',
};

/** Campo de data única ou intervalo, com digitação mascarada (dd/mm/aaaa) e calendário em popover. */
export const Datepicker: React.FC<DatepickerProps> = (props) => {
  const {
    label, hint, error, min, max, isDateDisabled, weekStartsOn, placeholder = 'dd/mm/aaaa', disabled = false,
  } = props;
  const intervalo = props.mode === 'range';
  const limites = { min, max, isDateDisabled };

  const [valorInterno, setValorInterno] = useState<Date | null | CalendarRange>(props.defaultValue ?? (intervalo ? VAZIO : null));
  const valor = props.value !== undefined ? props.value : valorInterno;
  const unico = intervalo ? null : (valor as Date | null);
  const faixa: CalendarRange = intervalo ? ((valor as CalendarRange | null) ?? VAZIO) : VAZIO;
  const inicio = intervalo ? faixa.start : unico;

  const [textoInicio, setTextoInicio] = useState(formatarData(inicio));
  const [textoFim, setTextoFim] = useState(formatarData(faixa.end));
  const [erroInicio, setErroInicio] = useState('');
  const [erroFim, setErroFim] = useState('');
  const [focado, setFocado] = useState(false);

  const isoInicio = paraIso(inicio);
  const isoFim = paraIso(faixa.end);
  useEffect(() => { setTextoInicio(formatarData(inicio)); setErroInicio(''); }, [isoInicio]);
  useEffect(() => { setTextoFim(formatarData(faixa.end)); setErroFim(''); }, [isoFim]);

  const confirmar = (novo: Date | null | CalendarRange) => {
    if (props.value === undefined) setValorInterno(novo);
    if (props.mode === 'range') props.onChange?.(novo as CalendarRange);
    else props.onChange?.(novo as Date | null);
  };

  const validar = (data: Date): string => {
    if (diaDesabilitado(data, limites)) return 'Data indisponível';
    return '';
  };

  const digitarInicio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const texto = mascararData(e.target.value);
    setTextoInicio(texto);
    if (texto === '') {
      setErroInicio('');
      confirmar(intervalo ? { start: null, end: faixa.end } : null);
      return;
    }
    if (texto.length < 10) { setErroInicio(''); return; }
    const data = interpretarData(texto);
    if (!data) { setErroInicio('Data inválida'); return; }
    const problema = validar(data);
    if (problema) { setErroInicio(problema); return; }
    setErroInicio('');
    if (!intervalo) { confirmar(data); return; }
    const fimValido = faixa.end && compararDias(faixa.end, data) >= 0 ? faixa.end : null;
    confirmar({ start: data, end: fimValido });
  };

  const digitarFim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const texto = mascararData(e.target.value);
    setTextoFim(texto);
    if (texto === '') { setErroFim(''); confirmar({ start: faixa.start, end: null }); return; }
    if (texto.length < 10) { setErroFim(''); return; }
    const data = interpretarData(texto);
    if (!data) { setErroFim('Data inválida'); return; }
    const problema = validar(data);
    if (problema) { setErroFim(problema); return; }
    if (faixa.start && compararDias(data, faixa.start) < 0) { setErroFim('Deve ser após a data inicial'); return; }
    setErroFim('');
    confirmar({ start: faixa.start, end: data });
  };

  const mensagem = error ?? (erroInicio || erroFim || undefined);
  const temErro = !!mensagem;

  const calendario = (fechar: () => void) => (
    intervalo ? (
      <Calendar mode="range" value={faixa} min={min} max={max} isDateDisabled={isDateDisabled} weekStartsOn={weekStartsOn}
        onChange={(novo) => { confirmar(novo); if (novo.end) fechar(); }} />
    ) : (
      <Calendar value={unico} min={min} max={max} isDateDisabled={isDateDisabled} weekStartsOn={weekStartsOn}
        onChange={(novo) => { confirmar(novo); fechar(); }} />
    )
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{label}</span>}
      <div onFocus={() => setFocado(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocado(false); }}>
        <FieldShell focused={focado} error={temErro} disabled={disabled} padding="0 6px 0 14px">
          <input type="text" inputMode="numeric" maxLength={10} value={textoInicio} placeholder={placeholder} disabled={disabled}
            aria-label={intervalo ? 'Data inicial' : undefined} aria-invalid={!!(error || erroInicio) || undefined}
            onChange={digitarInicio} style={estiloDoCampo} />
          {intervalo && (
            <>
              <span aria-hidden="true" style={{ color: 'var(--ob-fg-mute)', flex: 'none' }}>–</span>
              <input type="text" inputMode="numeric" maxLength={10} value={textoFim} placeholder={placeholder} disabled={disabled}
                aria-label="Data final" aria-invalid={!!(error || erroFim) || undefined}
                onChange={digitarFim} style={estiloDoCampo} />
            </>
          )}
          <Popover align="end" width={276} padding={12} closeButton={false} ariaLabel="Calendário"
            trigger={<Button kind="neutral" iconOnly size="sm" disabled={disabled} aria-label="Abrir calendário" icon={<Ph n="calendar-blank" size={18} />} />}>
            {calendario}
          </Popover>
        </FieldShell>
      </div>
      {(hint || mensagem) && <span style={{ fontSize: 11, color: mensagem ? 'var(--ob-danger)' : 'var(--ob-fg-mute)' }}>{mensagem || hint}</span>}
    </div>
  );
};
