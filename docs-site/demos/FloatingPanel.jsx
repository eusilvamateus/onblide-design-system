// Ponto de partida da demo interativa do FloatingPanel: o elemento <FloatingPanel> abaixo define os valores iniciais dos controles.

<FloatingPanel padding={8} minWidth={240} style={{ position: 'relative' }}>
  {['Editar', 'Duplicar', 'Arquivar'].map((t) => (
    <div key={t} style={{ padding: '9px 12px', fontSize: 14 }}>{t}</div>
  ))}
</FloatingPanel>
