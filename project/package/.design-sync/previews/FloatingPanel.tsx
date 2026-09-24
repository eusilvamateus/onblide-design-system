import { FloatingPanel } from '@onblide/ui';

const frame = { position: 'relative' as const, padding: 16, minHeight: 200 };

export const Padrao = () => (
  <div style={frame}>
    <FloatingPanel minWidth={240} padding={16} style={{ position: 'relative' }}>
      <strong>Resumo do projeto</strong>
      <p style={{ margin: '6px 0 0' }}>12 tarefas concluídas de 18 nesta semana.</p>
    </FloatingPanel>
  </div>
);

export const Rolavel = () => (
  <div style={frame}>
    <FloatingPanel minWidth={240} maxHeight={120} padding={12} style={{ position: 'relative' }}>
      {['Ana Souza', 'Bruno Lima', 'Carla Dias', 'Diego Rocha', 'Elisa Prado', 'Fábio Nunes'].map((n) => (
        <div key={n} style={{ padding: '6px 0' }}>{n}</div>
      ))}
    </FloatingPanel>
  </div>
);
