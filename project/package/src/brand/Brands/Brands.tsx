import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';

export type BrandKey = 'spotify' | 'slack' | 'notion' | 'figma' | 'github' | 'dropbox' | 'discord';

export interface Brand {
  name: string;
  hex: string;
  cat: string;
  desc: string;
  mark: (s: number) => React.ReactElement;
}

// Logos de marca: glifos oficiais do Phosphor (ph-<marca>-logo, já incluídos no webfont),
// na cor autêntica de cada marca. Marca sem glifo no Phosphor não é implementada.
export const Brands: Record<BrandKey, Brand> = {
  spotify: {
    name: 'Spotify', hex: '#1DB954', cat: 'Mídia',
    desc: 'Sincronize playlists e mostre o que você está ouvindo.',
    mark: (s) => <Ph n="spotify-logo" size={s} c="#1DB954" />,
  },
  slack: {
    name: 'Slack', hex: '#611f69', cat: 'Comunicação',
    desc: 'Receba notificações de tarefas e menções no seu canal.',
    mark: (s) => <Ph n="slack-logo" size={s} c="#611f69" />,
  },
  notion: {
    name: 'Notion', hex: '#000000', cat: 'Produtividade',
    desc: 'Exporte documentos e tarefas para suas páginas do Notion.',
    mark: (s) => <Ph n="notion-logo" size={s} c="#000000" />,
  },
  figma: {
    name: 'Figma', hex: '#A259FF', cat: 'Design',
    desc: 'Importe frames e mantenha os tokens em sincronia.',
    mark: (s) => <Ph n="figma-logo" size={s} c="#A259FF" />,
  },
  github: {
    name: 'GitHub', hex: '#181717', cat: 'Desenvolvimento',
    desc: 'Vincule commits e pull requests às tarefas do board.',
    mark: (s) => <Ph n="github-logo" size={s} c="#181717" />,
  },
  dropbox: {
    name: 'Dropbox', hex: '#0061FF', cat: 'Armazenamento',
    desc: 'Anexe arquivos da sua conta diretamente nas tarefas.',
    mark: (s) => <Ph n="dropbox-logo" size={s} c="#0061FF" />,
  },
  discord: {
    name: 'Discord', hex: '#5865F2', cat: 'Comunicação',
    desc: 'Avise sua comunidade quando algo importante acontecer.',
    mark: (s) => <Ph n="discord-logo" size={s} c="#5865F2" />,
  },
};
