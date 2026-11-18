import { TimePicker } from '@onblide/ui';

const caixa = { padding: 16, minHeight: 110 };

export const Padrao = () => (
  <div style={caixa}>
    <TimePicker label="Enviar às" hint="Digite, use ↑ ↓ ou abra a lista" defaultValue="14:30" />
  </div>
);

export const Relogio = () => (
  <div style={caixa}>
    <TimePicker label="Lembrete" variant="clock" defaultValue="09:15" />
  </div>
);

export const DozeHoras = () => (
  <div style={caixa}>
    <TimePicker label="Lembrete" hourCycle={12} defaultValue="21:30" />
  </div>
);

export const ComSegundos = () => (
  <div style={caixa}>
    <TimePicker label="Início da gravação" precision="second" defaultValue="07:05:32" />
  </div>
);

export const DeQuinzeEmQuinze = () => (
  <div style={caixa}>
    <TimePicker label="Horário da reunião" step={15} defaultValue="13:45" />
  </div>
);

export const ComLimites = () => (
  <div style={caixa}>
    <TimePicker label="Enviar às" hint="Entre 08:00 e 20:00" min="08:00" max="20:00" defaultValue="23:10" />
  </div>
);

export const Periodo = () => (
  <div style={caixa}>
    <TimePicker mode="range" label="Atendimento" step={15} defaultValue={{ start: '08:00', end: '17:45' }} />
  </div>
);

export const Tamanhos = () => (
  <div style={{ ...caixa, display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-12)' }}>
    <TimePicker size="sm" ariaLabel="Horário pequeno" defaultValue="09:17" />
    <TimePicker size="md" ariaLabel="Horário médio" defaultValue="09:17" />
    <TimePicker size="lg" ariaLabel="Horário grande" defaultValue="09:17" />
  </div>
);

export const Vazio = () => (
  <div style={caixa}>
    <TimePicker label="Horário de retirada" hint="Opcional" />
  </div>
);

export const Desabilitado = () => (
  <div style={caixa}>
    <TimePicker label="Enviar às" defaultValue="10:00" disabled />
  </div>
);
