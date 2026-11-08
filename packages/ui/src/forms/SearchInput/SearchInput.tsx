import React, { useState } from 'react';
import { FieldShell } from '../FieldShell/FieldShell';
import { Button } from '../../actions/Button/Button';
import { Ph } from '../../iconography/Ph/Ph';
import { Spinner } from '../../feedback/Spinner/Spinner';
import { ESCALA_DE_CAMPO, estiloDaAcao, type TamanhoDeCampo } from '../../internal/tamanhoDeCampo';

/** Tamanho do campo: `sm` 32px, `md` 40px e `lg` 48px de altura, as mesmas alturas do `Button`. */
export type SearchInputSize = TamanhoDeCampo;

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
  /** Tamanho do campo, que ajusta altura, fonte, ícone e o botão de limpar. */
  size?: SearchInputSize;
  /** Largura do campo de busca. */
  width?: number | string;
}

/** Campo de texto de busca, com ícone de lupa, botão de limpar e estado de carregamento. Para sugestões, use o Autocomplete. */
export const SearchInput: React.FC<SearchInputProps> = ({
  value = '', onChange, loading = false, placeholder = 'Buscar…', ariaLabel = 'Buscar', disabled = false, size = 'md', width = 320,
}) => {
  const [focus, setFocus] = useState(false);
  const escala = ESCALA_DE_CAMPO[size];
  return (
    <div style={{ width }}>
      <FieldShell focused={focus} disabled={disabled} size={size} padding={`0 ${escala.recuoDaAcao} 0 ${escala.recuo}`}>
        <Ph n="magnifying-glass" size={escala.icone} c="var(--ob-fg-mute)" />
        <input role="searchbox" value={value} disabled={disabled} aria-label={ariaLabel} placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ flex: 1, minWidth: 0, alignSelf: 'stretch', padding: 0, border: 'none', outline: 'none', background: 'none', fontFamily: 'var(--ob-font)', fontSize: escala.fonte, color: 'var(--ob-fg-strong)' }} />
        {loading && (
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: escala.acao, height: escala.acao, flex: 'none' }}>
            <Spinner size={size === 'sm' ? 'xs' : 'sm'} label="Buscando" />
          </span>
        )}
        {!loading && value && !disabled && (
          <Button kind="neutral" iconOnly size="sm" aria-label="Limpar" onClick={() => onChange?.('')}
            style={estiloDaAcao(size)} icon={<Ph n="x-circle" size={escala.icone - 1} />} />
        )}
      </FieldShell>
    </div>
  );
};
