import React from 'react';
import { Ph } from '../Ph/Ph';

export interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  indeterminate?: boolean;
  description?: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked, onChange, label, disabled = false, indeterminate = false, description,
}) => (
  <label style={{
    display: 'flex', alignItems: 'flex-start', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  }}>
    <span onClick={() => !disabled && onChange?.(!checked)} style={{
      flex: 'none', marginTop: 1, width: 18, height: 18, borderRadius: 6,
      border: `1.5px solid ${checked || indeterminate ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
      background: checked || indeterminate ? 'var(--ob-blue)' : 'var(--ob-surface)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 160ms var(--ob-ease)',
    }}>
      {checked && !indeterminate && (
        <Ph n="check" size={12} c="#fff" style={{ lineHeight: 1 }} />
      )}
      {indeterminate && <span style={{ width: 9, height: 2, background: '#fff', borderRadius: 1 }} />}
    </span>
    <span>
      <span style={{ fontSize: 14, color: 'var(--ob-fg-strong)', fontWeight: 500, lineHeight: 1.3, display: 'block' }}>{label}</span>
      {description && <span style={{ fontSize: 12, color: 'var(--ob-fg-soft)', marginTop: 2, display: 'block' }}>{description}</span>}
    </span>
  </label>
);
