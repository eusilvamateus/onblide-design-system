<div style={{ position: 'relative', height: 320, transform: 'translateZ(0)', overflow: 'hidden', border: '1.5px dashed var(--ob-border)', borderRadius: 'var(--ob-r-surface)', background: 'var(--ob-bg-warm)', padding: 16 }}>
  <Button kind="secondary" onClick={() => toast.success('Projeto salvo', { body: 'As alterações foram publicadas.' })}>
    Mostrar aviso
  </Button>
  <ToastStack name={undefined} position="bottom-right" duration={5000} limit={3} />
</div>
