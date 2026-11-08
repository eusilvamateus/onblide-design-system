import { Accordion } from '@onblide/ui';

const itens = [
  { id: 'conta', title: 'Conta', content: 'Nome, e-mail e foto de perfil. Alterações valem para todos os espaços de trabalho.', icon: 'user' },
  { id: 'cobranca', title: 'Cobrança', content: 'Plano atual, método de pagamento e histórico de faturas.', icon: 'credit-card' },
  { id: 'seguranca', title: 'Segurança', content: 'Senha, verificação em duas etapas e dispositivos conectados.', icon: 'shield-check' },
];

export const Unico = () => (
  <div style={{ padding: 16, maxWidth: 520 }}>
    <Accordion items={itens} defaultValue={['conta']} />
  </div>
);

export const Multiplo = () => (
  <div style={{ padding: 16, maxWidth: 520 }}>
    <Accordion items={itens} type="multiple" defaultValue={['conta', 'cobranca']} />
  </div>
);

export const SemIcones = () => (
  <div style={{ padding: 16, maxWidth: 520 }}>
    <Accordion
      defaultValue={['a']}
      items={[
        { id: 'a', title: 'Como funciona o período de teste?', content: 'Você usa todos os recursos por 14 dias, sem cartão de crédito.' },
        { id: 'b', title: 'Posso cancelar quando quiser?', content: 'Sim. O cancelamento vale ao fim do ciclo já pago.' },
      ]}
    />
  </div>
);

export const Desabilitado = () => (
  <div style={{ padding: 16, maxWidth: 520 }}>
    <Accordion
      items={[
        { id: 'a', title: 'Disponível', content: 'Este item abre normalmente.' },
        { id: 'b', title: 'Indisponível no seu plano', content: 'Conteúdo bloqueado.', disabled: true },
      ]}
    />
  </div>
);

export const Espacado = () => (
  <div style={{ padding: 16, maxWidth: 520 }}>
    <Accordion items={itens} attached={false} defaultValue={['conta']} />
  </div>
);

export const SemCaixa = () => (
  <div style={{ padding: 16, maxWidth: 520 }}>
    <Accordion items={itens} appearance="ghost" defaultValue={['conta']} />
  </div>
);

export const Tamanhos = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, maxWidth: 520 }}>
    <Accordion items={itens.slice(0, 2)} size="sm" />
    <Accordion items={itens.slice(0, 2)} size="md" />
    <Accordion items={itens.slice(0, 2)} size="lg" />
  </div>
);
