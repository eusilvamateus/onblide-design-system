// Ponto de partida da demo interativa do ToastStack: o elemento <ToastStack> abaixo define os valores iniciais dos controles.

<>
  <Button kind="secondary" onClick={() => window.obToast({ tone: 'success', title: 'Projeto salvo', body: 'As alterações foram publicadas.' })}>
    Mostrar aviso
  </Button>
  <ToastStack position="bottom-right" />
</>
