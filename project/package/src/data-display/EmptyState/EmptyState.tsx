import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';

export interface EmptyStateProps {
  /** Nome do ícone Phosphor (sem o prefixo "ph-") exibido acima do título. */
  icon?: string;
  /** Título curto que diz o que está vazio. */
  title: React.ReactNode;
  /** Explicação de por que está vazio e do que o usuário pode fazer. */
  description?: React.ReactNode;
  /** Ação principal, geralmente um `Button`, exibida abaixo do texto. */
  action?: React.ReactNode;
  /** Tamanho do bloco: `sm` para áreas pequenas, como o corpo de uma tabela. */
  size?: 'sm' | 'md';
}

/** Mensagem exibida no lugar de um conteúdo que ainda não existe: lista, tabela ou busca sem resultados. */
export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, size = 'md' }) => {
  const pequeno = size === 'sm';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: pequeno ? 6 : 8,
      padding: pequeno ? '20px 16px' : '40px 24px', fontFamily: 'var(--ob-font)',
    }}>
      {icon && (
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', width: pequeno ? 40 : 56, height: pequeno ? 40 : 56,
          borderRadius: '50%', background: 'var(--ob-bg-warm)', color: 'var(--ob-fg-soft)', marginBottom: pequeno ? 4 : 8,
        }}>
          <Ph n={icon} size={pequeno ? 20 : 28} />
        </span>
      )}
      <div style={{ fontSize: pequeno ? 14 : 16, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{title}</div>
      {description && <div style={{ fontSize: pequeno ? 13 : 14, lineHeight: 1.5, color: 'var(--ob-fg-soft)', maxWidth: 360 }}>{description}</div>}
      {action && <div style={{ marginTop: pequeno ? 4 : 8 }}>{action}</div>}
    </div>
  );
};
