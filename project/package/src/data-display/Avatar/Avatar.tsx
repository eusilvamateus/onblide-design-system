import React, { useState } from 'react';

export interface AvatarProps {
  /** Nome usado para gerar as iniciais exibidas (dois primeiros caracteres). */
  name?: string;
  /** URL opcional da imagem. Quando indisponível ou ao falhar o carregamento, o componente preserva as iniciais como fallback. */
  src?: string;
  /** Texto alternativo da imagem. Omitido quando o avatar for apenas decorativo. */
  alt?: string;
  /** Diâmetro do avatar em px. */
  size?: number;
  /** Cor de fundo do avatar. */
  color?: string;
}

/** Avatar circular com as iniciais de um nome; aceita imagem, com fallback automático pras iniciais se a imagem não carregar. */
export const Avatar: React.FC<AvatarProps> = ({ name = 'OB', src, alt, size = 32, color = 'var(--ob-blue)' }) => {
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
        : name.slice(0, 2).toUpperCase()}
    </div>
  );
};
