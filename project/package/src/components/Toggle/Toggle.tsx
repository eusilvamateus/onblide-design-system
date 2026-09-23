import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, disabled = false, size = 'md' }) => {
  const w = size === 'sm' ? 32 : 40, h = size === 'sm' ? 18 : 22, knob = h - 4;
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
      <span onClick={() => !disabled && onChange?.(!checked)} style={{
        width: w, height: h, borderRadius: 999, flex: 'none', position: 'relative',
        background: checked ? 'var(--ob-blue)' : 'var(--ob-border)', transition: 'background 200ms var(--ob-ease)',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: checked ? w - knob - 2 : 2, width: knob, height: knob,
          borderRadius: '50%', background: '#fff', transition: 'left 200ms var(--ob-ease)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }} />
      </span>
      {label && <span style={{ fontSize: 14, color: 'var(--ob-fg-strong)', fontWeight: 500 }}>{label}</span>}
    </label>
  );
};
