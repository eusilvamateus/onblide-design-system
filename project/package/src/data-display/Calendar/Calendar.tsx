import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../../actions/Button/Button';
import { Ph } from '../../iconography/Ph/Ph';
import { injectStyleOnce } from '../../internal/injectStyleOnce';
import {
  TAMANHO_DO_BLOCO_DE_ANOS,
  anoForaDosLimites,
  celulasDoMes,
  cliqueNoIntervalo,
  cliqueNoPeriodo,
  dentroDoIntervalo,
  diaDesabilitado,
  diaDoFoco,
  ehHoje,
  inicioDoBlocoDeAnos,
  mesForaDosLimites,
  moverFoco,
  moverNaGrade,
  posicaoNaFaixa,
} from '../../internal/calendarLogic';
import type { SemanaComecaEm } from '../../internal/calendarLogic';
import {
  DIAS_DA_SEMANA,
  INICIAIS_DA_SEMANA,
  MESES,
  MESES_ABREVIADOS,
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

/** Vista do calendário: os dias de um mês, os 12 meses de um ano ou um bloco de 12 anos. */
export type CalendarView = 'days' | 'months' | 'years';

interface CalendarBaseProps {
  /** Mês exibido, em modo controlado (use junto com `onMonthChange`). */
  month?: Date;
  /** Mês exibido inicialmente, em modo não controlado. Padrão: o mês da seleção ou o mês atual. */
  defaultMonth?: Date;
  /** Chamado quando o usuário navega para outro mês ou ano. */
  onMonthChange?: (month: Date) => void;
  /** Vista exibida ao montar: `days` (padrão), `months` ou `years`. Clicar no mês ou no ano do cabeçalho troca de vista. */
  openTo?: CalendarView;
  /** Primeira data selecionável; dias anteriores ficam desabilitados, assim como meses e anos inteiros antes dela. */
  min?: Date;
  /** Última data selecionável; dias posteriores ficam desabilitados, assim como meses e anos inteiros depois dela. */
  max?: Date;
  /** Desabilita dias específicos (feriados, datas indisponíveis). */
  isDateDisabled?: (date: Date) => boolean;
  /** Dia em que a semana começa: `0` domingo (padrão) ou `1` segunda-feira. */
  weekStartsOn?: SemanaComecaEm;
  /** Desabilita o calendário inteiro. */
  disabled?: boolean;
  /** Nome acessível do calendário. */
  ariaLabel?: string;
  /** O que a seleção escolhe: um dia (padrão), um mês inteiro ou um ano inteiro. Em `month` e `year` o calendário abre na grade de meses ou de anos, e `isDateDisabled` não se aplica. Na data única, escolher um item seleciona o primeiro dia do mês ou 1º de janeiro; no intervalo, o início vira o primeiro dia e o fim o último dia do mês ou do ano. */
  precision?: 'day' | 'month' | 'year';
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

const CELULA = 34;
const ESPACO = 2;
const LARGURA = CELULA * 7 + ESPACO * 6;
const ALTURA_DA_GRADE = 28 + CELULA * 6 + ESPACO * 6;
const COLUNAS = 3;
const INTERVALO_VAZIO: CalendarRange = { start: null, end: null };

/** Calendário mensal de uma data ou de um intervalo, com navegação por mês e por ano e teclado completo; base do Datepicker. */
export const Calendar: React.FC<CalendarProps> = (props) => {
  const {
    month, defaultMonth, onMonthChange, openTo: abrirEm, min, max, isDateDisabled, weekStartsOn = 0, disabled = false,
    ariaLabel = 'Calendário', style,
  } = props;
  const intervalo = props.mode === 'range';
  const precisao = props.precision ?? 'day';
  const vistaMinima: CalendarView = precisao === 'day' ? 'days' : precisao === 'month' ? 'months' : 'years';
  const openTo = abrirEm ?? vistaMinima;
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
  const ano = mesVisivel.getFullYear();
  const mes = mesVisivel.getMonth();

  const [vista, setVista] = useState<CalendarView>(openTo);
  const [bloco, setBloco] = useState(inicioDoBlocoDeAnos(ano));
  const [foco, setFoco] = useState<Date | null>(null);
  const [focoDaGrade, setFocoDaGrade] = useState<number | null>(null);
  const [previa, setPrevia] = useState<Date | null>(null);
  const [previaDaGrade, setPreviaDaGrade] = useState<number | null>(null);
  const grade = useRef<HTMLDivElement>(null);
  const pedirFoco = useRef(false);

  const irParaMes = (alvo: Date) => {
    const novo = inicioDoMes(alvo);
    if (month === undefined) setMesInterno(novo);
    onMonthChange?.(novo);
  };

  const limites = { min, max, isDateDisabled: precisao === 'day' ? isDateDisabled : undefined };
  const alvoDoFoco = diaDoFoco(mesVisivel, foco, referencia, hoje);
  const indiceDeAno = Math.min(TAMANHO_DO_BLOCO_DE_ANOS - 1, Math.max(0, ano - bloco));
  const indiceDoFoco = focoDaGrade ?? (vista === 'months' ? mes : indiceDeAno);

  useEffect(() => {
    if (!pedirFoco.current) return;
    pedirFoco.current = false;
    grade.current?.querySelector<HTMLElement>('button[tabindex="0"]')?.focus();
  });

  const trocarVista = (nova: CalendarView) => {
    if (nova === 'years') setBloco(inicioDoBlocoDeAnos(ano));
    setFocoDaGrade(null);
    setPreviaDaGrade(null);
    pedirFoco.current = true;
    setVista(nova);
  };

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

  const selecionarPeriodo = (data: Date) => {
    if (props.mode === 'range') {
      const novo = cliqueNoPeriodo(faixa, data, precisao);
      if (props.value === undefined) setValorInterno(novo);
      props.onChange?.(novo);
      return;
    }
    if (props.value === undefined) setValorInterno(data);
    props.onChange?.(data);
  };

  const escolherMes = (m: number) => {
    irParaMes(new Date(ano, m, 1));
    setFoco(null);
    if (precisao === 'month') { selecionarPeriodo(new Date(ano, m, 1)); setFocoDaGrade(m); return; }
    trocarVista('days');
  };

  const escolherAno = (a: number) => {
    irParaMes(new Date(a, mes, 1));
    if (precisao === 'year') { selecionarPeriodo(new Date(a, 0, 1)); return; }
    trocarVista('months');
  };

  const navegar = (sentido: 1 | -1) => {
    if (vista === 'days') irParaMes(somarMeses(mesVisivel, sentido));
    else if (vista === 'months') irParaMes(somarMeses(mesVisivel, sentido * 12));
    else setBloco(bloco + sentido * TAMANHO_DO_BLOCO_DE_ANOS);
  };

  const aoTeclarDias = (e: React.KeyboardEvent) => {
    const proximo = moverFoco(alvoDoFoco, e.key, e.shiftKey, weekStartsOn);
    if (!proximo) return;
    e.preventDefault();
    setFoco(proximo);
    pedirFoco.current = true;
    if (!mesmoMes(proximo, mesVisivel)) irParaMes(proximo);
  };

  const aoTeclarGrade = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (vista === vistaMinima) return;
      e.preventDefault();
      e.stopPropagation();
      trocarVista(vista === 'years' ? 'months' : 'days');
      return;
    }
    if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      navegar(e.key === 'PageUp' ? -1 : 1);
      pedirFoco.current = true;
      return;
    }
    const proximo = moverNaGrade(indiceDoFoco, e.key, COLUNAS, 12);
    if (proximo === null) return;
    e.preventDefault();
    setFocoDaGrade(proximo);
    pedirFoco.current = true;
  };

  const celulas = celulasDoMes(mesVisivel, weekStartsOn);
  const cabecalho = Array.from({ length: 7 }, (_, i) => (i + weekStartsOn) % 7);
  const semanas: (Date | null)[][] = [];
  for (let i = 0; i < celulas.length; i += 7) semanas.push(celulas.slice(i, i + 7));
  const linha: React.CSSProperties = { display: 'grid', gridTemplateColumns: `repeat(7, ${CELULA}px)`, columnGap: ESPACO };

  const rotuloDaVista = {
    days: ['Mês anterior', 'Próximo mês'],
    months: ['Ano anterior', 'Próximo ano'],
    years: ['Anos anteriores', 'Próximos anos'],
  }[vista];

  const botaoDoCabecalho = (texto: React.ReactNode, rotulo: string, aoClicar: () => void) => (
    <Button kind="neutral" size="sm" aria-label={rotulo} disabled={disabled} onClick={aoClicar} style={{ padding: '7px 8px', fontSize: 14 }}>
      {texto}
    </Button>
  );

  const ordemDoInicio = (de: (d: Date) => number) => (intervalo && faixa.start ? de(faixa.start) : null);
  const ordemDoFim = (de: (d: Date) => number) => (intervalo && faixa.start && faixa.end ? de(faixa.end) : null);
  const emMeses = (d: Date) => d.getFullYear() * 12 + d.getMonth();
  const emAnos = (d: Date) => d.getFullYear();

  interface CelulaDaGrade {
    indice: number;
    texto: string;
    rotulo: string;
    ativo: boolean;
    atual: boolean;
    inativo: boolean;
    ordem: number;
    ordemDaPrevia: number | null;
    de: (d: Date) => number;
    aoClicar: () => void;
  }

  const celulaDaGrade = ({ indice, texto, rotulo, ativo, atual, inativo, ordem, ordemDaPrevia, de, aoClicar }: CelulaDaGrade) => {
    const posicao = posicaoNaFaixa(ordem, ordemDoInicio(de), ordemDoFim(de), ordemDaPrevia);
    const marcado = intervalo ? posicao === 'inicio' || posicao === 'fim' : ativo;
    const emFaixa = posicao === 'dentro';
    const sobMouse = previaDaGrade === indice && !inativo;
    return (
      <div key={indice} role="gridcell" aria-selected={marcado || emFaixa || undefined} style={{ height: '100%' }}>
        <button type="button" className="ob-calendar-dia" tabIndex={indice === indiceDoFoco ? 0 : -1} aria-label={rotulo}
          aria-disabled={inativo || undefined} aria-current={atual ? 'date' : undefined}
          onClick={() => { if (!inativo) aoClicar(); }}
          onMouseEnter={() => !inativo && setPreviaDaGrade(indice)}
          onFocus={() => setFocoDaGrade(indice)}
          style={{
            width: '100%', height: '100%', border: 'none', padding: 0, borderRadius: 'var(--ob-r-sm)',
            background: marcado ? 'var(--ob-blue)' : emFaixa ? 'var(--ob-blue-100)' : sobMouse ? 'var(--ob-blue-050)' : 'transparent',
            color: marcado ? 'var(--ob-fg-on-color)' : 'var(--ob-fg-strong)',
            boxShadow: posicao === 'alvo' ? 'inset 0 0 0 1.5px var(--ob-blue)' : atual && !marcado ? 'inset 0 0 0 1px var(--ob-blue)' : 'none',
            opacity: inativo ? 0.35 : 1, cursor: inativo ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', fontSize: 13, fontWeight: marcado ? 700 : 500, transition: 'background 100ms',
          }}>{texto}</button>
      </div>
    );
  };

  const linhasDaGrade = (itens: React.ReactNode[]) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: ESPACO, height: ALTURA_DA_GRADE }}>
      {[0, 1, 2, 3].map((l) => (
        <div key={l} role="row" style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${COLUNAS}, 1fr)`, columnGap: ESPACO }}>
          {itens.slice(l * COLUNAS, l * COLUNAS + COLUNAS)}
        </div>
      ))}
    </div>
  );

  return (
    <div role="group" aria-label={ariaLabel} style={{
      display: 'inline-flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--ob-font)',
      opacity: disabled ? 0.5 : 1, ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: LARGURA }}>
        <Button kind="neutral" iconOnly size="sm" aria-label={rotuloDaVista[0]} disabled={disabled}
          onClick={() => navegar(-1)} icon={<Ph n="caret-left" size={16} />} />
        <div aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 14, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>
          {vista === 'days' && (
            <>
              {botaoDoCabecalho(MESES[mes], `Escolher o mês, ${MESES[mes]}`, () => trocarVista('months'))}
              {botaoDoCabecalho(ano, `Escolher o ano, ${ano}`, () => trocarVista('years'))}
            </>
          )}
          {vista === 'months' && botaoDoCabecalho(ano, `Escolher o ano, ${ano}`, () => trocarVista('years'))}
          {vista === 'years' && <span>{bloco} – {bloco + TAMANHO_DO_BLOCO_DE_ANOS - 1}</span>}
        </div>
        <Button kind="neutral" iconOnly size="sm" aria-label={rotuloDaVista[1]} disabled={disabled}
          onClick={() => navegar(1)} icon={<Ph n="caret-right" size={16} />} />
      </div>

      {vista === 'days' && (
        <div ref={grade} role="grid" aria-label={`${MESES[mes]} ${ano}`}
          onKeyDown={aoTeclarDias} onMouseLeave={() => setPrevia(null)} style={{ display: 'flex', flexDirection: 'column', gap: ESPACO }}>
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
                const sobMouse = !inativo && !!previa && mesmoDia(dia, previa);
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
                        borderRadius: 'var(--ob-r-sm)',
                        background: marcado ? 'var(--ob-blue)' : emIntervalo ? 'var(--ob-blue-100)' : sobMouse ? 'var(--ob-blue-050)' : 'transparent',
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
      )}

      {vista === 'months' && (
        <div ref={grade} role="grid" aria-label={`Meses de ${ano}`} onKeyDown={aoTeclarGrade} onMouseLeave={() => setPreviaDaGrade(null)} style={{ width: LARGURA }}>
          {linhasDaGrade(MESES_ABREVIADOS.map((abreviado, m) => celulaDaGrade({
            indice: m, texto: abreviado, rotulo: `${MESES[m]} de ${ano}`,
            ativo: precisao === 'month' ? !!selecionadoUnico && selecionadoUnico.getFullYear() === ano && selecionadoUnico.getMonth() === m : m === mes,
            atual: hoje.getFullYear() === ano && hoje.getMonth() === m,
            inativo: disabled || mesForaDosLimites(ano, m, limites),
            ordem: ano * 12 + m, ordemDaPrevia: previaDaGrade === null ? null : ano * 12 + previaDaGrade, de: emMeses,
            aoClicar: () => escolherMes(m),
          })))}
        </div>
      )}

      {vista === 'years' && (
        <div ref={grade} role="grid" aria-label={`Anos de ${bloco} a ${bloco + TAMANHO_DO_BLOCO_DE_ANOS - 1}`} onKeyDown={aoTeclarGrade} onMouseLeave={() => setPreviaDaGrade(null)} style={{ width: LARGURA }}>
          {linhasDaGrade(Array.from({ length: TAMANHO_DO_BLOCO_DE_ANOS }, (_, i) => bloco + i).map((a, i) => celulaDaGrade({
            indice: i, texto: String(a), rotulo: String(a),
            ativo: precisao === 'year' ? selecionadoUnico?.getFullYear() === a : a === ano, atual: hoje.getFullYear() === a,
            inativo: disabled || anoForaDosLimites(a, limites),
            ordem: a, ordemDaPrevia: previaDaGrade === null ? null : bloco + previaDaGrade, de: emAnos,
            aoClicar: () => escolherAno(a),
          })))}
        </div>
      )}
    </div>
  );
};
