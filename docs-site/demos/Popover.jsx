// Ponto de partida da demo interativa do Popover: o elemento <Popover> abaixo define os valores iniciais dos controles.

<Popover
  trigger={<Button kind="secondary">Filtrar</Button>}
  title="Filtrar por status"
  placement="bottom"
  align="start"
>
  <Checkbox label="Em andamento" checked onChange={() => {}} />
  <Checkbox label="Concluída" checked={false} onChange={() => {}} />
</Popover>
