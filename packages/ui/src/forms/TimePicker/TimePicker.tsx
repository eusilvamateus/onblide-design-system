import React, { useRef, useState } from 'react';
import { FieldShell } from '../FieldShell/FieldShell';
import { Button } from '../../actions/Button/Button';
import { ButtonGroup } from '../../actions/ButtonGroup/ButtonGroup';
import { ToggleButton } from '../../actions/ToggleButton/ToggleButton';
import { Popover } from '../../overlays/Popover/Popover';
import { Ph } from '../../iconography/Ph/Ph';
import { agora, duracao, escreverHorario, exibirHorario, foraDoLimite, lerHorario, type LimitesDeHorario } from '../../internal/horario';
import { CampoDeHorario, SeletorDeHorario, type ParteDoHorario } from '../../internal/pecasDeHorario';
import { ESCALA_DE_CAMPO, estiloDaAcao, type TamanhoDeCampo } from '../../internal/tamanhoDeCampo';

/** Tamanho do campo: `sm` 32px, `md` 40px e `lg` 48px de altura, as mesmas alturas do `Button`. A lista e o relógio não mudam com ele. */
export type TimePickerSize = TamanhoDeCampo;

/** Início e fim de um período de horário, em `HH:mm` (ou `HH:mm:ss` com `precision="second"`). */
export interface TimeRange {
  start: string | null;
  end: string | null;
}

interface TimePickerBaseProps {
  /** Rótulo exibido acima do campo. */
  label?: React.ReactNode;
  /** Texto de apoio abaixo do campo; some quando há erro. */
  hint?: React.ReactNode;
  /** Mensagem de erro externa, exibida no lugar do texto de apoio e com a borda vermelha. */
  error?: React.ReactNode;
  /** Intervalo, em minutos, da lista de minutos, do relógio e das setas no campo de minutos. */
  step?: number;
  /** Primeiro horário permitido, em `HH:mm`. Vale para a lista, o relógio e a digitação. */
  min?: string;
  /** Último horário permitido, em `HH:mm`. Vale para a lista, o relógio e a digitação. */
  max?: string;
  /** Desabilita horários específicos; recebe o horário em `HH:mm` (ou `HH:mm:ss`). */
  isTimeDisabled?: (time: string) => boolean;
  /** Relógio de 24 horas (padrão) ou de 12 horas com AM e PM. O valor é sempre de 24 horas. */
  hourCycle?: 12 | 24;
  /** Escolhe até o minuto (padrão) ou até o segundo; com `second` o valor vira `HH:mm:ss`. */
  precision?: 'minute' | 'second';
  /** Forma da escolha no popover: colunas roláveis de hora e minuto (padrão) ou relógio analógico. */
  variant?: 'columns' | 'clock';
  /** Tamanho do campo, que ajusta altura, fonte e largura. A lista e o relógio não mudam; no celular eles crescem para o toque. */
  size?: TimePickerSize;
  /** Desabilita o campo e o popover. */
  disabled?: boolean;
  /** Largura do campo. Sem ela, o campo tem a largura do horário. */
  width?: number | string;
  /** Nome acessível do campo quando não há `label` em texto. */
  ariaLabel?: string;
}

export interface SingleTimePickerProps extends TimePickerBaseProps {
  /** Escolhe um único horário. */
  mode?: 'single';
  /** Horário escolhido em `HH:mm` (24 horas), em modo controlado. `null` é vazio. */
  value?: string | null;
  /** Horário inicial, em modo não controlado. */
  defaultValue?: string | null;
  /** Chamado ao completar ou escolher um horário, ou com `null` ao esvaziar o campo. */
  onChange?: (value: string | null) => void;
}

export interface RangeTimePickerProps extends TimePickerBaseProps {
  /** Escolhe início e fim, com dois campos, a duração e um único popover. */
  mode: 'range';
  /** Período escolhido, em modo controlado. */
  value?: TimeRange;
  /** Período inicial, em modo não controlado. */
  defaultValue?: TimeRange;
  /** Chamado ao completar ou escolher o início ou o fim. */
  onChange?: (value: TimeRange) => void;
}

export type TimePickerProps = SingleTimePickerProps | RangeTimePickerProps;

const VAZIO: TimeRange = { start: null, end: null };
const FIXO: Record<TamanhoDeCampo, number> = { sm: 40, md: 54, lg: 60 };
const FONTE: Record<TamanhoDeCampo, number> = { sm: 13, md: 14, lg: 15 };
const noTamanho = (larguraNoMd: number, size: TamanhoDeCampo) => Math.round(((larguraNoMd - FIXO.md) * FONTE[size]) / FONTE.md + FIXO[size]);

const Fase: React.FC<{ nome: string; valor: string | null; ciclo: 12 | 24; comSegundos: boolean }> = ({ nome, valor, ciclo, comSegundos }) => (
  <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 'var(--ob-space-4)', whiteSpace: 'nowrap' }}>
    <span style={{ fontSize: 'var(--ob-fs-11)', fontWeight: 'var(--ob-w-medium)', color: 'var(--ob-fg-mute)' }}>{nome}</span>
    <span style={{ fontSize: 'var(--ob-fs-13)', fontWeight: 'var(--ob-w-semibold)' }}>{exibirHorario(valor, ciclo, comSegundos) ?? '--:--'}</span>
  </span>
);

/** Campo de horário com digitação por partes (hora, minuto, AM/PM), setas do teclado e escolha em colunas ou num relógio analógico, de um horário ou de um período. */
export const TimePicker: React.FC<TimePickerProps> = (props) => {
  const {
    label, hint, error, step = 1, min, max, isTimeDisabled, hourCycle = 24, precision = 'minute', variant = 'columns',
    size = 'md', disabled = false, width, ariaLabel,
  } = props;
  const intervalo = props.mode === 'range';
  const escala = ESCALA_DE_CAMPO[size];
  const comSegundos = precision === 'second';
  const [interno, setInterno] = useState<string | null | TimeRange>(props.defaultValue ?? (intervalo ? VAZIO : null));
  const valor = props.value !== undefined ? props.value : interno;
  const unico = !intervalo && typeof valor === 'string' ? valor : null;
  const faixa = intervalo && valor && typeof valor === 'object' ? valor : VAZIO;
  const [lado, setLado] = useState<'start' | 'end'>('start');
  const [focado, setFocado] = useState(false);
  const refPrimeiro = useRef<HTMLSpanElement | null>(null);
  const refFim = useRef<HTMLSpanElement | null>(null);

  const mudar = (novo: string | null | TimeRange) => {
    if (props.value === undefined) setInterno(novo);
    if (props.mode === 'range') props.onChange?.(novo as TimeRange);
    else props.onChange?.(novo as string | null);
  };

  const limites: LimitesDeHorario = { min, max, isTimeDisabled };
  const nome = ariaLabel ?? (typeof label === 'string' ? label : 'Horário');
  const tempo = intervalo ? duracao(faixa.start, faixa.end) : null;
  const invertido = intervalo && !!faixa.start && !!faixa.end && !tempo;
  const indisponivel = (texto: string | null) => {
    const t = lerHorario(texto);
    return !!t && foraDoLimite(t, limites, comSegundos);
  };
  const mensagem = error
    ?? (invertido ? 'O fim deve ser depois do início' : undefined)
    ?? ((intervalo ? indisponivel(faixa.start) || indisponivel(faixa.end) : indisponivel(unico)) ? 'Horário indisponível' : undefined);
  const invalido = !!mensagem;

  const larguraNoMd = intervalo
    ? 228 + (hourCycle === 12 ? 72 : 0) + (comSegundos ? 56 : 0)
    : 132 + (hourCycle === 12 ? 36 : 0) + (comSegundos ? 28 : 0);
  const comum = { ciclo: hourCycle, comSegundos, passo: step, disabled, invalido, fonte: escala.fonte } as const;
  const parteFinal: ParteDoHorario = comSegundos ? 'segundo' : 'minuto';

  const gatilho = (
    <Button kind="neutral" iconOnly size="sm" disabled={disabled} aria-label="Abrir horários" style={estiloDaAcao(size)} icon={<Ph n="clock" size={escala.icone} />} />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-6)' }}>
      {label && <span style={{ fontSize: 'var(--ob-fs-12)', fontWeight: 'var(--ob-w-semibold)', color: 'var(--ob-fg-strong)' }}>{label}</span>}
      <div style={{ width: width ?? noTamanho(larguraNoMd, size), maxWidth: '100%' }}
        onFocus={() => setFocado(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocado(false); }}>
        <FieldShell focused={focado} error={invalido} disabled={disabled} size={size} padding={`0 ${escala.recuoDaAcao} 0 ${escala.recuo}`}
          onClick={(e) => { if (e.target === e.currentTarget) refPrimeiro.current?.focus(); }}>
          {intervalo ? (
            <>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 'var(--ob-space-6)' }}>
                <CampoDeHorario {...comum} valor={faixa.start} rotulo={`${nome}, início`} refPrimeiro={refPrimeiro}
                  aoMudar={(v) => mudar({ ...faixa, start: v })} aoSairPelaDireita={() => refFim.current?.focus()} />
                <span aria-hidden="true" style={{ color: 'var(--ob-fg-mute)' }}>–</span>
                <CampoDeHorario {...comum} valor={faixa.end} rotulo={`${nome}, fim`} refPrimeiro={refFim} aoMudar={(v) => mudar({ ...faixa, end: v })} />
              </span>
              {tempo && <span style={{ fontSize: 'var(--ob-fs-12)', color: 'var(--ob-fg-mute)', whiteSpace: 'nowrap', margin: '0 var(--ob-space-4)' }}>{tempo}</span>}
              <Popover align="end" width="auto" padding="var(--ob-space-12)" closeButton={false} ariaLabel={`Escolher período: ${nome}`} trigger={gatilho}
                onOpenChange={(aberto) => { if (aberto) setLado(faixa.start && !faixa.end ? 'end' : 'start'); }}
                footer={() => (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--ob-space-6)', width: '100%', fontSize: 'var(--ob-fs-12)', color: 'var(--ob-fg-soft)' }}>
                    <Ph n="hourglass-medium" size={14} />
                    <span>Duração</span>
                    <span style={{ fontWeight: 'var(--ob-w-semibold)', color: tempo ? 'var(--ob-fg-strong)' : 'var(--ob-fg-mute)' }}>{tempo ?? '—'}</span>
                  </div>
                )}>
                {(fechar) => (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-10)' }}>
                    <ButtonGroup selection="single" value={lado} onChange={(v) => { if (v) setLado(v as 'start' | 'end'); }} fullWidth size="sm" ariaLabel="Início ou fim">
                      <ToggleButton value="start" appearance="ghost" tone="neutral"><Fase nome="Início" valor={faixa.start} ciclo={hourCycle} comSegundos={comSegundos} /></ToggleButton>
                      <ToggleButton value="end" appearance="ghost" tone="neutral"><Fase nome="Fim" valor={faixa.end} ciclo={hourCycle} comSegundos={comSegundos} /></ToggleButton>
                    </ButtonGroup>
                    <SeletorDeHorario key={lado} forma={variant} valor={lado === 'start' ? faixa.start : faixa.end} passo={step} ciclo={hourCycle} comSegundos={comSegundos}
                      limites={lado === 'start' ? limites : { ...limites, depoisDe: faixa.start }}
                      aoEscolher={(novo, parte) => {
                        mudar(lado === 'start'
                          ? { start: novo, end: faixa.end && duracao(novo, faixa.end) ? faixa.end : null }
                          : { ...faixa, end: novo });
                        if (parte !== parteFinal) return;
                        if (lado === 'start') setLado('end');
                        else fechar();
                      }} />
                  </div>
                )}
              </Popover>
            </>
          ) : (
            <>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                <CampoDeHorario {...comum} valor={unico} rotulo={nome} refPrimeiro={refPrimeiro} aoMudar={mudar} />
              </span>
              <Popover align="end" width="auto" padding="var(--ob-space-12)" closeButton={false} ariaLabel={`Escolher horário: ${nome}`} trigger={gatilho}
                footer={(fechar) => (
                  <Button kind="quiet" size="sm" icon={<Ph n="clock-clockwise" size={16} />}
                    onClick={() => { mudar(escreverHorario(agora(step), comSegundos)); fechar(); }}>Agora</Button>
                )}>
                {(fechar) => (
                  <SeletorDeHorario forma={variant} valor={unico} passo={step} ciclo={hourCycle} comSegundos={comSegundos} limites={limites}
                    aoEscolher={(novo, parte) => {
                      mudar(novo);
                      if (parte === parteFinal) fechar();
                    }} />
                )}
              </Popover>
            </>
          )}
        </FieldShell>
      </div>
      {(hint || mensagem) && <span style={{ fontSize: 'var(--ob-fs-11)', color: mensagem ? 'var(--ob-danger)' : 'var(--ob-fg-mute)' }}>{mensagem || hint}</span>}
    </div>
  );
};
