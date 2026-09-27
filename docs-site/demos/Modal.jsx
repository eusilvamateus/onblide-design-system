// Ponto de partida da demo interativa do Modal: o elemento <Modal> abaixo define os valores iniciais dos controles.

<>
  <Button kind="secondary" onClick={abrir}>Abrir modal</Button>
  <Modal
    open={false}
    title="Excluir projeto?"
    size="sm"
    footer={<><Button kind="secondary">Cancelar</Button><Button kind="danger">Excluir</Button></>}
  >
    Esta ação não pode ser desfeita. Todas as tarefas do projeto serão removidas.
  </Modal>
</>
