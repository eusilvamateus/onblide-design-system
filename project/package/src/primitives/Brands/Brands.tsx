import React from 'react';

export type BrandKey = 'spotify' | 'slack' | 'notion' | 'figma' | 'github' | 'dropbox' | 'discord';

export interface Brand {
  name: string;
  hex: string;
  cat: string;
  desc: string;
  mark: (s: number) => React.ReactElement;
}

// Logos de marca — reproduções fiéis em SVG, nas cores autênticas de cada
// marca. O webfont do Phosphor não inclui glifos de marca (só o pacote React
// inclui), então estas marcas SVG seguem sendo a abordagem correta.
export const Brands: Record<BrandKey, Brand> = {
  spotify: {
    name: 'Spotify', hex: '#1DB954', cat: 'Mídia',
    desc: 'Sincronize playlists e mostre o que você está ouvindo.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="11" fill="#1DB954"/>
        <path d="M6 11 C10 8.2 14 8.2 18 11" stroke="#000" strokeWidth="1.9" fill="none" strokeLinecap="round"/>
        <path d="M6.8 13.6 C10 11.4 14 11.4 17.2 13.6" stroke="#000" strokeWidth="1.7" fill="none" strokeLinecap="round"/>
        <path d="M7.7 16 C10.3 14.4 13.7 14.4 16.3 16" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  slack: {
    name: 'Slack', hex: '#611f69', cat: 'Comunicação',
    desc: 'Receba notificações de tarefas e menções no seu canal.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <rect x="3" y="10" width="8" height="4" rx="2" fill="#36C5F0"/>
        <rect x="10" y="13" width="4" height="8" rx="2" fill="#2EB67D"/>
        <rect x="13" y="10" width="8" height="4" rx="2" fill="#ECB22E"/>
        <rect x="10" y="3" width="4" height="8" rx="2" fill="#E01E5A"/>
      </svg>
    ),
  },
  notion: {
    name: 'Notion', hex: '#000000', cat: 'Produtividade',
    desc: 'Exporte documentos e tarefas para suas páginas do Notion.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="4.5" fill="#000"/>
        <path d="M8 16.5 V8 M8 8 L15.5 16.5 M15.5 16.5 V8" stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  figma: {
    name: 'Figma', hex: '#A259FF', cat: 'Design',
    desc: 'Importe frames e mantenha os tokens em sincronia.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path d="M12 2 H8.5 A3.5 3.5 0 0 0 8.5 9 H12 Z" fill="#F24E1E"/>
        <path d="M12 2 H15.5 A3.5 3.5 0 0 1 15.5 9 H12 Z" fill="#FF7262"/>
        <path d="M12 9 H8.5 A3.5 3.5 0 0 0 8.5 16 H12 Z" fill="#A259FF"/>
        <circle cx="15.5" cy="12.5" r="3.5" fill="#1ABCFE"/>
        <path d="M12 16 H8.5 A3.5 3.5 0 0 0 8.5 23 H12 Z" fill="#0ACF83"/>
      </svg>
    ),
  },
  github: {
    name: 'GitHub', hex: '#181717', cat: 'Desenvolvimento',
    desc: 'Vincule commits e pull requests às tarefas do board.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path fill="#181717" fillRule="evenodd" d="M12 2.2C6.5 2.2 2 6.7 2 12.2c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.5 4.9.4.3.7.9.7 1.8v2.6c0 .3.2.6.7.5 3.9-1.3 6.8-5.1 6.8-9.5 0-5.5-4.5-10-10-10Z"/>
      </svg>
    ),
  },
  dropbox: {
    name: 'Dropbox', hex: '#0061FF', cat: 'Armazenamento',
    desc: 'Anexe arquivos da sua conta diretamente nas tarefas.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <g fill="#0061FF">
          <path d="M6.4 2 L1 5.4 L6.4 8.8 L11.8 5.4 Z"/>
          <path d="M17.2 2 L11.8 5.4 L17.2 8.8 L22.6 5.4 Z"/>
          <path d="M1 12.2 L6.4 8.8 L11.8 12.2 L6.4 15.6 Z"/>
          <path d="M22.6 12.2 L17.2 8.8 L11.8 12.2 L17.2 15.6 Z"/>
          <path d="M6.4 16.7 L11.8 13.3 L17.2 16.7 L11.8 20.1 Z"/>
        </g>
      </svg>
    ),
  },
  discord: {
    name: 'Discord', hex: '#5865F2', cat: 'Comunicação',
    desc: 'Avise sua comunidade quando algo importante acontecer.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path fill="#5865F2" fillRule="evenodd" d="M19.5 5.6a16 16 0 0 0-4-1.3l-.3.5a14 14 0 0 0-4.4 0l-.3-.5a16 16 0 0 0-4 1.3C2 9.8 1.4 13.9 1.7 17.9a16 16 0 0 0 4.9 2.5 12 12 0 0 0 1-1.7c-.6-.2-1.1-.5-1.6-.8l.4-.3a11 11 0 0 0 9.2 0l.4.3c-.5.3-1 .6-1.6.8a12 12 0 0 0 1 1.7 16 16 0 0 0 4.9-2.5c.4-4.6-.7-8.7-2.2-12.3ZM8.4 15.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm7.2 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z"/>
      </svg>
    ),
  },
};
