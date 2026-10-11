import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../../actions/Button/Button';
import { Ph } from '../../iconography/Ph/Ph';
import { injectStyleOnce } from '../../internal/injectStyleOnce';
import {
  celulasDoMes,
  cliqueNoIntervalo,
  dentroDoIntervalo,
  diaDesabilitado,
  diaDoFoco,
  ehHoje,
  moverFoco,
} from '../../internal/calendarLogic';
import type { SemanaComecaEm } from '../../internal/calendarLogic';
import {
  DIAS_DA_SEMANA,
  INICIAIS_DA_SEMANA,
  MESES,
  inicioDoDia,
  inicioDoMes,
  mesmoDia,
  mesmoMes,
  rotuloDoDia,
  somarMeses,
} from '../../internal/dates';

/** Intervalo de datas selecionado no modo `range`; `end` é `null` enquanto o usuário escolhe o fim. */
export interface CalendarRange {
  /** Primeiro dia do intervalo. */
  start: Date | null;
  /** Último dia do intervalo. */
  end: Date | null;
}

interface CalendarBaseProps {
  /** Mês exibido, em modo controlado (use junto com `onMonthChange`). */
  month?: Date;
  /** Mês exibido inicialmente, em modo não controlado. Padrão: o mês da seleção ou o mês atual. */
  defaultMonth?: Date;
  /** Chamado quando o usuário navega para outro mês. */
  onMonthChange?: (month: Date) => void;
  /** Primeira data selecionável; dias anteriores ficam desabilitados. */
  min?: Date;
  /** Última data selecionável; dias posteriores ficam desabilitados. */
  max?: Date;
  /** Desabilita dias específicos (feriados, datas indisponíveis). */
  isDateDisabled?: (date: Date) => boolean;
  /** Dia em que a semana começa: `0` domingo (padrão) ou `1` segunda-feira. */
  weekStartsOn?: SemanaComecaEm;
  /** Desabilita o calendário inteiro. */
  disabled?: boolean;
  /** Nome acessível do calendário. */
  ariaLabel?: string;
  /** Estilos inline adicionais, mesclados por último. */
  style?: React.CSSProperties;
}

export interface SingleCalendarProps extends CalendarBaseProps {
  /** Seleciona uma única data. */
  mode?: 'single';
  /** Data selecionada, em modo controlado. */
  value?: Date | null;
  /** Data inicial, em modo não controlado. */
  defaultValue?: Date | null;
  /** Chamado ao escolher uma data. */
  onChange?: (value: Date | null) => void;
}

export interface RangeCalendarProps extends CalendarBaseProps {
  /** Seleciona um intervalo: o primeiro clique define o início e o segundo, o fim. */
  mode: 'range';
  /** Intervalo selecionado, em modo controlado. */
  value?: CalendarRange;
  /** Intervalo inicial, em modo não controlado. */
  defaultValue?: CalendarRange;
  /** Chamado a cada clique, com o intervalo parcial ou completo. */
  onChange?: (value: CalendarRange) => void;
}

export type CalendarProps = SingleCalendarProps | RangeCalendarProps;

injectStyleOnce('ob-calendar-dia', '.ob-calendar-dia:focus-visible{outline:2px solid var(--ob-blue);outline-offset:-2px}');

const CELULA = 36;
const INTERVALO_VAZIO: CalendarRange = { start: null, end: null };

/** Calendário mensal de uma data ou de um intervalo, com navegação por teclado; base do Datepicker. */
export const Calendar: React.FC<CalendarProps> = (props) => {
  const {
    month, defaultMonth, onMonthChange, min, max, isDateDisabled, weekStartsOn = 0, disabled = false,
    ariaLabel = 'Calendário', style,
  } = props;
  const intervalo = props.mode === 'range';
  const hoje = inicioDoDia(new Date());

  const [valorInterno, setValorInterno] = useState<Date | null | CalendarRange>(
    props.defaultValue ?? (intervalo ? INTERVALO_VAZIO : null),
  );
  const valor = props.value !== undefined ? props.value : valorInterno;
  const selecionadoUnico = intervalo ? null : (valor as Date | null);
  const faixa: CalendarRange = intervalo ? ((valor as CalendarRange | null) ?? INTERVALO_VAZIO) : INTERVALO_VAZIO;
  const referencia = intervalo ? faixa.start : selecionadoUnico;

  const [mesInterno, setMesInterno] = useState<Date>(inicioDoMes(defaultMonth ?? referencia ?? hoje));
  const mesVisivel = inicioDoMes(month ?? mesInterno);
  const [foco, setFoco] = useState<Date | null>(null);
  const [previa, setPrevia] = useState<Date | null>(null);
  const grade = useRef<HTMLDivElement>(null);
  const pedirFoco = useRef(false);

  const irParaMes = (alvo: Date) => {
    const novo = inicioDoMes(alvo);
    if (month === undefined) setMesInterno(novo);
    onMonthChange?.(novo);
  };

  const limites = { min, max, isDateDisabled };
  const alvoDoFoco = diaDoFoco(mesVisivel, foco, referencia, hoje);

  useEffect(() => {
    if (!pedirFoco.current) return;
    pedirFoco.current = false;
    grade.current?.querySelector<HTMLElement>('button[tabindex="0"]')?.focus();
  });

  const escolher = (dia: Date) => {
    if (disabled || diaDesabilitado(dia, limites)) return;
    setFoco(dia);
    if (props.mode === 'range') {
      const novo = cliqueNoIntervalo(faixa, dia);
      if (props.value === undefined) setValorInterno(novo);
      props.onChange?.(novo);
    } else {
      if (props.value === undefined) setValorInterno(dia);
      props.onChange?.(dia);
    }
  };

  const aoTeclar = (e: React.KeyboardEvent) => {
    const proximo = moverFoco(alvoDoFoco, e.key, e.shiftKey, weekStartsOn);
    if (!proximo) return;
    e.preventDefault();
    setFoco(proximo);
    pedirFoco.current = true;
    if (!mesmoMes(proximo, mesVisivel)) irParaMes(proximo);
  };

  const celulas = celulasDoMes(mesVisivel, weekStartsOn);
  const cabecalho = Array.from({ length: 7 }, (_, i) => (i + weekStartsOn) % 7);
  const semanas: (Date | null)[][] = [];
  for (let i = 0; i < celulas.length; i += 7) semanas.push(celulas.slice(i, i + 7));
  const linha: React.CSSProperties = { display: 'grid', gridTemplateColumns: `repeat(7, ${CELULA}px)` };

  return (
    <div role="group" aria-label={ariaLabel} style={{
      display: 'inline-flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--ob-font)',
      opacity: disabled ? 0.5 : 1, ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: CELULA * 7 }}>
        <Button kind="neutral" iconOnly size="sm" aria-label="Mês anterior" disabled={disabled}
          onClick={() => irParaMes(somarMeses(mesVisivel, -1))} icon={<Ph n="caret-left" size={16} />} />
        <div aria-live="polite" style={{ fontSize: 14, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>
          {MESES[mesVisivel.getMonth()]} {mesVisivel.getFullYear()}
        </div>
        <Button kind="neutral" iconOnly size="sm" aria-label="Próximo mês" disabled={disabled}
          onClick={() => irParaMes(somarMeses(mesVisivel, 1))} icon={<Ph n="caret-right" size={16} />} />
      </div>
      <div ref={grade} role="grid" aria-label={`${MESES[mesVisivel.getMonth()]} ${mesVisivel.getFullYear()}`}
        onKeyDown={aoTeclar} onMouseLeave={() => setPrevia(null)}>
        <div role="row" style={linha}>
          {cabecalho.map((dia) => (
            <div key={dia} role="columnheader" aria-label={DIAS_DA_SEMANA[dia]} style={{
              height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, color: 'var(--ob-fg-mute)',
            }}>{INICIAIS_DA_SEMANA[dia]}</div>
          ))}
        </div>
        {semanas.map((semana, s) => (
          <div key={s} role="row" style={linha}>
            {semana.map((dia, i) => {
              if (!dia) return <div key={i} role="gridcell" aria-hidden="true" />;
              const inativo = disabled || diaDesabilitado(dia, limites);
              const inicio = intervalo ? !!faixa.start && mesmoDia(dia, faixa.start) : !!selecionadoUnico && mesmoDia(dia, selecionadoUnico);
              const fim = intervalo && !!faixa.end && mesmoDia(dia, faixa.end);
              const marcado = inicio || fim;
              const emIntervalo = intervalo && dentroDoIntervalo(dia, faixa, previa);
              const alvoDaPrevia = intervalo && !!faixa.start && !faixa.end && !!previa && mesmoDia(dia, previa) && !inicio;
              const hojeAqui = ehHoje(dia, hoje);
              return (
                <div key={i} role="gridcell" aria-selected={marcado || emIntervalo || undefined}>
                  <button type="button" className="ob-calendar-dia" tabIndex={mesmoDia(dia, alvoDoFoco) ? 0 : -1}
                    aria-label={rotuloDoDia(dia)} aria-disabled={inativo || undefined} aria-current={hojeAqui ? 'date' : undefined}
                    onClick={() => escolher(dia)}
                    onMouseEnter={() => !inativo && setPrevia(dia)}
                    onFocus={() => setFoco(dia)}
                    style={{
                      width: CELULA, height: CELULA, border: 'none', padding: 0,
                      borderRadius: marcado || !emIntervalo ? 'var(--ob-r-sm)' : 0,
                      background: marcado ? 'var(--ob-blue)' : emIntervalo ? 'var(--ob-blue-100)' : 'transparent',
                      color: marcado ? 'var(--ob-fg-on-color)' : 'var(--ob-fg-strong)',
                      boxShadow: alvoDaPrevia
                        ? 'inset 0 0 0 1.5px var(--ob-blue)'
                        : hojeAqui && !marcado ? 'inset 0 0 0 1px var(--ob-blue)' : 'none',
                      opacity: inativo ? 0.35 : 1, cursor: inativo ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', fontSize: 13, fontWeight: marcado ? 700 : 500,
                      transition: 'background 100ms',
                    }}
                  >{dia.getDate()}</button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
