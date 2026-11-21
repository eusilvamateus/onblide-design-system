import { Link } from '@onblide/ui';

const col = { display: 'flex', flexDirection: 'column' as const, gap: 12, padding: 16, fontSize: 14 };

export const Variantes = () => (
  <div style={col}>
    <Link href="#" tone="primary">Ver todos os projetos</Link>
    <Link href="#" tone="neutral">Política de privacidade</Link>
    <Link href="#" tone="muted">Esqueci minha senha</Link>
  </div>
);

export const Externo = () => (
  <div style={col}>
    <Link href="https://onblide.com" external>Abrir documentação</Link>
  </div>
);

export const EmTexto = () => (
  <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ob-fg)', maxWidth: 460 }}>
    A onblide constrói soluções online — veja a <Link href="#">documentação</Link> ou explore o{' '}
    <Link href="#" external>repositório público</Link> pra começar.
  </p>
);
