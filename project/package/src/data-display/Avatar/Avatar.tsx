import React, { useState } from 'react';

export interface AvatarProps {
  /** Nome usado para gerar as iniciais exibidas: primeira letra da primeira e da última palavra ("Mateus Silva" vira "MS"); com uma palavra só, as duas primeiras letras. */
  name?: string;
  /** Iniciais exibidas no lugar das geradas a partir do nome, para quando o nome não serve (até dois caracteres). */
  initials?: string;
  /** URL opcional da imagem. Quando indisponível ou ao falhar o carregamento, o componente preserva as iniciais como fallback. */
  src?: string;
  /** Texto alternativo da imagem. Omitido quando o avatar for apenas decorativo. */
  alt?: string;
  /** Diâmetro do avatar em px. */
  size?: number;
  /** Cor de fundo do avatar. */
  color?: string;
}

const iniciaisDoNome = (nome: string): string => {
  const palavras = nome.trim().split(/\s+/).filter(Boolean).map((p) => Array.from(p));
  if (palavras.length === 0) return '';
  if (palavras.length === 1) return palavras[0].slice(0, 2).join('').toUpperCase();
  return (palavras[0][0] + palavras[palavras.length - 1][0]).toUpperCase();
};

/** Avatar circular com as iniciais de um nome; aceita imagem, com fallback automático pras iniciais se a imagem não carregar. */
export const Avatar: React.FC<AvatarProps> = ({ name = 'OB', initials, src, alt, size = 32, color = 'var(--ob-blue)' }) => {
  // Guarda qual `src` falhou: se a prop mudar pra uma URL nova, tenta carregar de novo em vez de continuar preso no fallback.
  const [srcComErro, setSrcComErro] = useState<string | undefined>(undefined);
  const mostrarImagem = !!src && src !== srcComErro;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color,
      color: '#fff', fontSize: size * 0.4, fontWeight: 700, display: 'flex',
      alignItems: 'center', justifyContent: 'center', flex: 'none', overflow: 'hidden',
    }}>
      {mostrarImagem
        ? <img src={src} alt={alt ?? ''} onError={() => setSrcComErro(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : (initials ? Array.from(initials).slice(0, 2).join('') : iniciaisDoNome(name)).toUpperCase()}
    </div>
  );
};
