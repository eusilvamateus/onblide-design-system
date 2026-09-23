// project/package/src/primitives/Icons/Icons.tsx
import React from 'react';
import { PhIcon } from './PhIcon';

export interface IconProps {
  size?: number;
  style?: React.CSSProperties;
}

export type IconName =
  | 'search' | 'house' | 'user' | 'chart' | 'gear' | 'bell' | 'plus' | 'check'
  | 'x' | 'arrowR' | 'caretD' | 'caretL' | 'caretR' | 'folder' | 'file'
  | 'calendar' | 'kanban' | 'bolt' | 'chat' | 'logout' | 'star' | 'heart'
  | 'more' | 'grid' | 'sync' | 'link' | 'info' | 'arrowSquareOut';

export type IconComponent = (p?: IconProps) => React.ReactElement;

export const Icons: Record<IconName, IconComponent> = {
  search:         (p = {}) => <PhIcon name="magnifying-glass"    size={p.size} style={p.style}/>,
  house:          (p = {}) => <PhIcon name="house"               size={p.size} style={p.style}/>,
  user:           (p = {}) => <PhIcon name="user"                size={p.size} style={p.style}/>,
  chart:          (p = {}) => <PhIcon name="chart-line"          size={p.size} style={p.style}/>,
  gear:           (p = {}) => <PhIcon name="gear"                size={p.size} style={p.style}/>,
  bell:           (p = {}) => <PhIcon name="bell"                size={p.size} style={p.style}/>,
  plus:           (p = {}) => <PhIcon name="plus"                size={p.size} style={p.style}/>,
  check:          (p = {}) => <PhIcon name="check"               size={p.size} style={p.style}/>,
  x:              (p = {}) => <PhIcon name="x"                   size={p.size} style={p.style}/>,
  arrowR:         (p = {}) => <PhIcon name="arrow-right"         size={p.size} style={p.style}/>,
  caretD:         (p = {}) => <PhIcon name="caret-down"          size={p.size} style={p.style}/>,
  caretL:         (p = {}) => <PhIcon name="caret-left"          size={p.size} style={p.style}/>,
  caretR:         (p = {}) => <PhIcon name="caret-right"         size={p.size} style={p.style}/>,
  folder:         (p = {}) => <PhIcon name="folder"              size={p.size} style={p.style}/>,
  file:           (p = {}) => <PhIcon name="file"                size={p.size} style={p.style}/>,
  calendar:       (p = {}) => <PhIcon name="calendar"            size={p.size} style={p.style}/>,
  kanban:         (p = {}) => <PhIcon name="kanban"              size={p.size} style={p.style}/>,
  bolt:           (p = {}) => <PhIcon name="lightning"           size={p.size} style={p.style}/>,
  chat:           (p = {}) => <PhIcon name="chat-text"           size={p.size} style={p.style}/>,
  logout:         (p = {}) => <PhIcon name="sign-out"            size={p.size} style={p.style}/>,
  star:           (p = {}) => <PhIcon name="star"                size={p.size} style={p.style}/>,
  heart:          (p = {}) => <PhIcon name="heart"               size={p.size} style={p.style}/>,
  more:           (p = {}) => <PhIcon name="dots-three"          size={p.size} style={p.style}/>,
  grid:           (p = {}) => <PhIcon name="squares-four"        size={p.size} style={p.style}/>,
  sync:           (p = {}) => <PhIcon name="arrows-clockwise"    size={p.size} style={p.style}/>,
  link:           (p = {}) => <PhIcon name="link"                size={p.size} style={p.style}/>,
  info:           (p = {}) => <PhIcon name="info"                size={p.size} style={p.style}/>,
  arrowSquareOut: (p = {}) => <PhIcon name="arrow-square-out"    size={p.size} style={p.style}/>,
};
