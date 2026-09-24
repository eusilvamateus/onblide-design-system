import { Link } from '@onblide/ui';

const col = { display: 'flex', flexDirection: 'column' as const, gap: 12, padding: 16 };

export const Variantes = () => (
  <div style={col}>
    <Link href="#" variant="default">Ver todos os projetos</Link>
    <Link href="#" variant="subtle">Política de privacidade</Link>
    <Link href="#" variant="quiet">Esqueci minha senha</Link>
  </div>
);

export const Externo = () => (
  <div style={col}>
    <Link href="https://onblide.com" external>Abrir documentação</Link>
  </div>
);
