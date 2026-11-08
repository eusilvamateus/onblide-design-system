import { Input, Select, Icons } from '@onblide/ui';

export const Padrao = () => (
  <div style={{ padding: 16, width: 320 }}>
    <Input label="E-mail" placeholder="voce@empresa.com.br" hint="Usaremos para enviar notificações" />
  </div>
);

export const ComIcone = () => (
  <div style={{ padding: 16, width: 320 }}>
    <Input label="Buscar projetos" placeholder="Nome do projeto" icon={<Icons.search size={16} />} defaultValue="Portal do cliente" />
  </div>
);

export const ComErro = () => (
  <div style={{ padding: 16, width: 320 }}>
    <Input label="E-mail" defaultValue="mariana@empresa" error="Informe um e-mail válido" />
  </div>
);

export const Desabilitado = () => (
  <div style={{ padding: 16, width: 320 }}>
    <Input label="Plano" defaultValue="Não editável" hint="Campo bloqueado" disabled />
  </div>
);

export const EmFoco = () => (
  <div style={{ padding: 16, width: 320 }}>
    <Input label="Nome" defaultValue="Em foco — borda azul" autoFocus />
  </div>
);

export const ComUnidade = () => (
  <div style={{ padding: 16, width: 320 }}>
    <Input label="Altura do pacote" defaultValue="45" inputMode="decimal"
      endAddon={<Select embedded ariaLabel="Unidade" options={['cm', 'mm', 'm']} defaultValue="cm" />} />
  </div>
);

export const ComTextoNoInicio = () => (
  <div style={{ padding: 16, width: 320 }}>
    <Input label="Valor" defaultValue="1.250,00" startAddon="R$" />
  </div>
);

export const Tamanhos = () => (
  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12, padding: 16, width: 320 }}>
    <Input size="sm" aria-label="Nome pequeno" placeholder="Pequeno (32px)" />
    <Input size="md" aria-label="Nome médio" placeholder="Médio (40px)" />
    <Input size="lg" aria-label="Nome grande" placeholder="Grande (48px)" />
  </div>
);
