// Ponto de partida da demo interativa do Drawer: o elemento <Drawer> abaixo define os valores iniciais dos controles.

<>
  <Button kind="secondary" onClick={abrir}>Abrir drawer</Button>
  <Drawer open={false} side="right" width={360} title="Filtros">
    Selecione o período, o responsável e o status dos projetos.
  </Drawer>
</>
