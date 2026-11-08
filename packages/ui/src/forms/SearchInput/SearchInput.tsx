import React, { useState } from 'react';
import { FieldShell } from '../FieldShell/FieldShell';
import { Button } from '../../actions/Button/Button';
import { Ph } from '../../iconography/Ph/Ph';
import { Spinner } from '../../feedback/Spinner/Spinner';

const ESPACO_DA_ACAO = 32;

export interface SearchInputProps {
  /** Texto atual do campo de busca. */
  value?: string;
  /** Chamado a cada alteração do texto digitado, recebendo o novo valor; `''` ao limpar. */
  onChange?: (value: string) => void;
  /** Exibe um indicador de carregamento no lugar do botão de limpar, para uma busca em andamento. */
  loading?: boolean;
  /** Texto de apoio exibido quando o campo está vazio. */
  placeholder?: string;
  /** Nome acessível do campo, quando não há rótulo visível. */
  ariaLabel?: string;
  /** Desabilita o campo. */
  disabled?: boolean;
  /** Largura do campo de busca. */
  width?: number | string;
}

/** Campo de texto de busca, com ícone de lupa, botão de limpar e estado de carregamento. Para sugestões, use o Autocomplete. */
export const SearchInput: React.FC<SearchInputProps> = ({
  value = '', onChange, loading = false, placeholder = 'Buscar…', ariaLabel = 'Buscar', disabled = false, width = 320,
}) => {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ width }}>
      <FieldShell focused={focus} disabled={disabled} padding="0 var(--ob-space-6) 0 var(--ob-space-16)">
        <Ph n="magnifying-glass" size={18} c="var(--ob-fg-mute)" />
        <input role="searchbox" value={value} disabled={disabled} aria-label={ariaLabel} placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'none', fontFamily: 'var(--ob-font)', fontSize: 14.5, color: 'var(--ob-fg-strong)' }} />
        {loading && (
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: ESPACO_DA_ACAO, height: ESPACO_DA_ACAO, flex: 'none' }}>
            <Spinner size="sm" label="Buscando" />
          </span>
        )}
        {!loading && value && !disabled && (
          <Button kind="neutral" iconOnly size="sm" aria-label="Limpar" onClick={() => onChange?.('')} icon={<Ph n="x-circle" size={17} />} />
        )}
      </FieldShell>
    </div>
  );
};
