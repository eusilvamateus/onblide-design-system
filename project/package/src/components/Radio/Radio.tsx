import React from 'react';

export interface RadioProps {
  name?: string;
  value: string;
  checked: boolean;
  onChange?: (value: string) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  description?: React.ReactNode;
}

export const Radio: React.FC<RadioProps> = ({
  name, value, checked, onChange, label, disabled = false, description,
}) => (
  <label style={{
    display: 'flex', alignItems: 'flex-start', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  }}>
    <span style={{ position: 'relative', flex: 'none', marginTop: 1 }}>
      <input type="radio" name={name} value={value} checked={checked} disabled={disabled}
        onChange={() => onChange?.(value)}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
      <span style={{
        display: 'block', width: 18, height: 18, borderRadius: '50%',
        border: `1.5px solid ${checked ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
        background: 'var(--ob-surface)', transition: 'border-color 160ms',
      }}>
        {checked && <span style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 8, height: 8, borderRadius: '50%', background: 'var(--ob-blue)',
        }} />}
      </span>
    </span>
    <span>
      <span style={{ fontSize: 14, color: 'var(--ob-fg-strong)', fontWeight: 500, lineHeight: 1.3, display: 'block' }}>{label}</span>
      {description && <span style={{ fontSize: 12, color: 'var(--ob-fg-soft)', marginTop: 2, display: 'block' }}>{description}</span>}
    </span>
  </label>
);
