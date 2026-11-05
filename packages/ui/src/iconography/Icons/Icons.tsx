import React from 'react';
import { Ph, type IconWeight } from '../Ph/Ph';

export interface IconProps {
  /** Tamanho do ícone em px. */
  size?: number;
  /** Peso do ícone (padrão `regular`); veja as regras em Fundações › Iconografia. */
  weight?: IconWeight;
  /** Estilos inline adicionais aplicados ao ícone. */
  style?: React.CSSProperties;
}

export type IconName =
  | 'search' | 'house' | 'user' | 'chart' | 'gear' | 'bell' | 'plus' | 'check'
  | 'x' | 'arrowR' | 'caretD' | 'caretL' | 'caretR' | 'folder' | 'file'
  | 'calendar' | 'kanban' | 'bolt' | 'chat' | 'logout' | 'star' | 'heart'
  | 'more' | 'grid' | 'sync' | 'link' | 'info' | 'arrowSquareOut';

export type IconComponent = (p?: IconProps) => React.ReactElement;

/** Registro central de ícones da interface, construído sobre `Ph`. */
export const Icons: Record<IconName, IconComponent> = {
  search:         (p = {}) => <Ph n="magnifying-glass"    size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  house:          (p = {}) => <Ph n="house"               size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  user:           (p = {}) => <Ph n="user"                size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  chart:          (p = {}) => <Ph n="chart-line"          size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  gear:           (p = {}) => <Ph n="gear"                size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  bell:           (p = {}) => <Ph n="bell"                size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  plus:           (p = {}) => <Ph n="plus"                size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  check:          (p = {}) => <Ph n="check"               size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  x:              (p = {}) => <Ph n="x"                   size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  arrowR:         (p = {}) => <Ph n="arrow-right"         size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  caretD:         (p = {}) => <Ph n="caret-down"          size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  caretL:         (p = {}) => <Ph n="caret-left"          size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  caretR:         (p = {}) => <Ph n="caret-right"         size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  folder:         (p = {}) => <Ph n="folder"              size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  file:           (p = {}) => <Ph n="file"                size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  calendar:       (p = {}) => <Ph n="calendar"            size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  kanban:         (p = {}) => <Ph n="kanban"              size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  bolt:           (p = {}) => <Ph n="lightning"           size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  chat:           (p = {}) => <Ph n="chat-text"           size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  logout:         (p = {}) => <Ph n="sign-out"            size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  star:           (p = {}) => <Ph n="star"                size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  heart:          (p = {}) => <Ph n="heart"               size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  more:           (p = {}) => <Ph n="dots-three"          size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  grid:           (p = {}) => <Ph n="squares-four"        size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  sync:           (p = {}) => <Ph n="arrows-clockwise"    size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  link:           (p = {}) => <Ph n="link"                size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  info:           (p = {}) => <Ph n="info"                size={p.size ?? 20} weight={p.weight} style={p.style}/>,
  arrowSquareOut: (p = {}) => <Ph n="arrow-square-out"    size={p.size ?? 20} weight={p.weight} style={p.style}/>,
};
