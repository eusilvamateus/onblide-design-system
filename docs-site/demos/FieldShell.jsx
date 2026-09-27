// Ponto de partida da demo interativa do FieldShell: o elemento <FieldShell> abaixo define os valores iniciais dos controles.

const Conteudo = ({ t }) => <span style={{ fontSize: 14 }}>{t}</span>;

<FieldShell
  focused
>
  <Conteudo t="Campo em foco" />
</FieldShell>
