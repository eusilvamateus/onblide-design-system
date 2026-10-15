import React, { useEffect, useState } from 'react';
import { FieldShell } from '../FieldShell/FieldShell';
import { Button } from '../../actions/Button/Button';
import { Calendar } from '../../data-display/Calendar/Calendar';
import type { CalendarRange } from '../../data-display/Calendar/Calendar';
import { Popover } from '../../overlays/Popover/Popover';
import { Ph } from '../../iconography/Ph/Ph';
import { diaDesabilitado, vizinhaSelecionavel } from '../../internal/calendarLogic';
import type { SemanaComecaEm, UnidadeDePasso } from '../../internal/calendarLogic';
import {
  PLACEHOLDER_DA_DATA, TAMANHO_DO_TEXTO, compararDias, formatarPorPrecisao, interpretarPorPrecisao, mascararPorPrecisao,
  normalizarPorPrecisao, paraIso,
} from '../../internal/dates';
import type { PrecisaoDaData } from '../../internal/dates';

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
  /** Exibe o calendário em um popover (padrão) ou permanentemente abaixo dos campos. */
  calendarDisplay?: 'popover' | 'inline';
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
  /** Mostra botões de seta ao lado do campo que andam a data por dia (`day`), mês (`month`) ou ano (`year`), sem abrir o calendário. Em `month` e `year` o campo mostra só `mm/aaaa` ou `aaaa`, a data guardada é o primeiro dia do mês ou do ano, `isDateDisabled` não se aplica e o calendário abre na grade de meses ou de anos. */
  stepper?: UnidadeDePasso;
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
  fontFamily: 'inherit', fontSize: 14, color: 'var(--ob-fg-strong)', padding: '10px 0', textAlign: 'center',
};

/** Campo de data única ou intervalo, com digitação mascarada (dd/mm/aaaa) e calendário em popover. */
export const Datepicker: React.FC<DatepickerProps> = (props) => {
  const {
    label, hint, error, min, max, isDateDisabled, weekStartsOn, disabled = false,
    calendarDisplay = 'popover',
  } = props;
  const intervalo = props.mode === 'range';
  const precisao: PrecisaoDaData = props.mode === 'range' ? 'day' : (props.stepper ?? 'day');
  const placeholder = props.placeholder ?? PLACEHOLDER_DA_DATA[precisao];
  const tamanhoDoTexto = TAMANHO_DO_TEXTO[precisao];
  const calendarioInline = calendarDisplay === 'inline';
  const limites = precisao === 'day'
    ? { min, max, isDateDisabled }
    : { min: min && normalizarPorPrecisao(min, precisao), max: max && normalizarPorPrecisao(max, precisao) };

  const [valorInterno, setValorInterno] = useState<Date | null | CalendarRange>(props.defaultValue ?? (intervalo ? VAZIO : null));
  const valor = props.value !== undefined ? props.value : valorInterno;
  const unico = intervalo ? null : (valor as Date | null);
  const faixa: CalendarRange = intervalo ? ((valor as CalendarRange | null) ?? VAZIO) : VAZIO;
  const inicio = intervalo ? faixa.start : unico;

  const [textoInicio, setTextoInicio] = useState(formatarPorPrecisao(inicio, precisao));
  const [textoFim, setTextoFim] = useState(formatarPorPrecisao(faixa.end, precisao));
  const [erroInicio, setErroInicio] = useState('');
  const [erroFim, setErroFim] = useState('');
  const [focado, setFocado] = useState(false);

  const isoInicio = paraIso(inicio);
  const isoFim = paraIso(faixa.end);
  useEffect(() => { setTextoInicio(formatarPorPrecisao(inicio, precisao)); setErroInicio(''); }, [isoInicio, precisao]);
  useEffect(() => { setTextoFim(formatarPorPrecisao(faixa.end, precisao)); setErroFim(''); }, [isoFim, precisao]);

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
    const texto = mascararPorPrecisao(e.target.value, precisao);
    setTextoInicio(texto);
    if (texto === '') {
      setErroInicio('');
      confirmar(intervalo ? { start: null, end: faixa.end } : null);
      return;
    }
    if (texto.length < tamanhoDoTexto) { setErroInicio(''); return; }
    const data = interpretarPorPrecisao(texto, precisao);
    if (!data) { setErroInicio('Data inválida'); return; }
    const problema = validar(data);
    if (problema) { setErroInicio(problema); return; }
    setErroInicio('');
    if (!intervalo) { confirmar(data); return; }
    const fimValido = faixa.end && compararDias(faixa.end, data) >= 0 ? faixa.end : null;
    confirmar({ start: data, end: fimValido });
  };

  const digitarFim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const texto = mascararPorPrecisao(e.target.value, precisao);
    setTextoFim(texto);
    if (texto === '') { setErroFim(''); confirmar({ start: faixa.start, end: null }); return; }
    if (texto.length < tamanhoDoTexto) { setErroFim(''); return; }
    const data = interpretarPorPrecisao(texto, precisao);
    if (!data) { setErroFim('Data inválida'); return; }
    const problema = validar(data);
    if (problema) { setErroFim(problema); return; }
    if (faixa.start && compararDias(data, faixa.start) < 0) { setErroFim('Deve ser após a data inicial'); return; }
    setErroFim('');
    confirmar({ start: faixa.start, end: data });
  };

  const rotulos: Record<UnidadeDePasso, [string, string]> = {
    day: ['Dia anterior', 'Próximo dia'],
    month: ['Mês anterior', 'Próximo mês'],
    year: ['Ano anterior', 'Próximo ano'],
  };
  const unidadeDoPasso: UnidadeDePasso = precisao;
  const comStepper = props.mode !== 'range' && !!props.stepper;
  const vizinha = (unidade: UnidadeDePasso, sentido: 1 | -1) => vizinhaSelecionavel(unico, normalizarPorPrecisao(new Date(), precisao), unidade, sentido, limites);

  const andarData = (unidade: UnidadeDePasso, sentido: 1 | -1) => {
    const proxima = vizinha(unidade, sentido);
    if (proxima) confirmar(normalizarPorPrecisao(proxima, precisao));
  };

  const teclasDoCampo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (intervalo || disabled || e.altKey || e.ctrlKey || e.metaKey) return;
    const sentido = e.key === 'ArrowUp' || e.key === 'PageUp' ? 1 : e.key === 'ArrowDown' || e.key === 'PageDown' ? -1 : 0;
    if (!sentido) return;
    e.preventDefault();
    const unidade: UnidadeDePasso = e.key.startsWith('Page') ? 'year' : e.shiftKey && precisao === 'day' ? 'month' : unidadeDoPasso;
    andarData(unidade, sentido);
  };

  const mensagem = error ?? (erroInicio || erroFim || undefined);
  const temErro = !!mensagem;

  const calendario = (fechar: () => void) => (
    intervalo ? (
      <Calendar mode="range" value={faixa} min={min} max={max} isDateDisabled={isDateDisabled} weekStartsOn={weekStartsOn}
        onChange={(novo) => { confirmar(novo); if (novo.end) fechar(); }} />
    ) : (
      <Calendar value={unico} min={min} max={max} isDateDisabled={isDateDisabled} weekStartsOn={weekStartsOn} precision={precisao}
        onChange={(novo) => { confirmar(novo); fechar(); }} />
    )
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{label}</span>}
      <div onFocus={() => setFocado(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocado(false); }}>
        <FieldShell focused={focado} error={temErro} disabled={disabled} padding={comStepper ? '0 6px' : calendarioInline ? '0 14px' : '0 6px 0 14px'}>
          {comStepper && (
            <Button kind="neutral" iconOnly size="sm" disabled={disabled || !vizinha(unidadeDoPasso, -1)}
              aria-label={rotulos[unidadeDoPasso][0]} onClick={() => andarData(unidadeDoPasso, -1)}
              icon={<Ph n="caret-left" size={16} />} />
          )}
          <input type="text" inputMode="numeric" maxLength={tamanhoDoTexto} value={textoInicio} placeholder={placeholder} disabled={disabled}
            aria-label={intervalo ? 'Data inicial' : undefined} aria-invalid={!!(error || erroInicio) || undefined}
            onChange={digitarInicio} onKeyDown={teclasDoCampo} style={estiloDoCampo} />
          {intervalo && (
            <>
              <span aria-hidden="true" style={{ color: 'var(--ob-fg-mute)', flex: 'none' }}>–</span>
              <input type="text" inputMode="numeric" maxLength={tamanhoDoTexto} value={textoFim} placeholder={placeholder} disabled={disabled}
                aria-label="Data final" aria-invalid={!!(error || erroFim) || undefined}
                onChange={digitarFim} style={estiloDoCampo} />
            </>
          )}
          {comStepper && (
            <Button kind="neutral" iconOnly size="sm" disabled={disabled || !vizinha(unidadeDoPasso, 1)}
              aria-label={rotulos[unidadeDoPasso][1]} onClick={() => andarData(unidadeDoPasso, 1)}
              icon={<Ph n="caret-right" size={16} />} />
          )}
          {!calendarioInline && (
            <Popover align="end" width={276} padding={12} closeButton={false} ariaLabel="Calendário"
              trigger={<Button kind="neutral" iconOnly size="sm" disabled={disabled} aria-label="Abrir calendário" icon={<Ph n="calendar-blank" size={18} />} />}>
              {calendario}
            </Popover>
          )}
        </FieldShell>
      </div>
      {calendarioInline && calendario(() => undefined)}
      {(hint || mensagem) && <span style={{ fontSize: 11, color: mensagem ? 'var(--ob-danger)' : 'var(--ob-fg-mute)' }}>{mensagem || hint}</span>}
    </div>
  );
};
