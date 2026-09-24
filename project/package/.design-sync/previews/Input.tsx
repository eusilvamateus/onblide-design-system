import { Input, Icons } from '@onblide/ui';

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
