import { Breadcrumbs } from '@onblide/ui';

export const Padrao = () => (
  <div style={{ padding: 16, width: 420 }}>
    <Breadcrumbs items={[{ icon: 'house', ariaLabel: 'Início' }, { label: 'Clientes' }, { label: 'Padaria Estrela' }]} />
  </div>
);

export const Recolhido = () => (
  <div style={{ padding: 16, width: 420 }}>
    <Breadcrumbs
      maxItems={4}
      items={[{ icon: 'house', ariaLabel: 'Início' }, { label: 'Clientes' }, { label: 'Padaria Estrela' }, { label: 'Projetos' }, { label: 'Campanha de fim de ano' }]}
    />
  </div>
);

export const Pequeno = () => (
  <div style={{ padding: 16, width: 420 }}>
    <Breadcrumbs size="sm" items={[{ label: 'Configurações' }, { label: 'Equipe' }, { label: 'Permissões' }]} />
  </div>
);
