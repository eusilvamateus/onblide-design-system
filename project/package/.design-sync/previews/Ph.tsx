import { Ph } from '@onblide/ui';

const row = { display: 'flex', gap: 16, padding: 16, alignItems: 'center' };

export const Icones = () => (
  <div style={row}>
    <Ph n="house" size={24} />
    <Ph n="bell" size={24} />
    <Ph n="calendar" size={24} />
    <Ph n="chat" size={24} />
    <Ph n="gear" size={24} />
  </div>
);

export const TamanhosECores = () => (
  <div style={row}>
    <Ph n="star" size={16} />
    <Ph n="star" size={24} c="var(--ob-warning)" />
    <Ph n="heart" size={32} c="var(--ob-danger)" />
    <Ph n="check" size={40} c="var(--ob-success)" />
  </div>
);
