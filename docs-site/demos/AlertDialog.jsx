<>
  <Button kind="secondary" onClick={abrir}>Excluir projeto</Button>
  <AlertDialog
    open={false}
    title="Excluir projeto?"
    tone="danger"
    confirmLabel="Excluir"
    onConfirm={fechar}
  >
    Esta ação não pode ser desfeita. Todas as tarefas do projeto serão removidas.
  </AlertDialog>
</>
