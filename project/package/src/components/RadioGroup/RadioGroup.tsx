import React from 'react';
import { Radio } from '../Radio/Radio';

export interface RadioGroupOption {
  value: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioGroupOption[];
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ options, value, onChange, name = 'radio-group' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {options.map(opt => (
      <Radio key={opt.value} name={name} value={opt.value} label={opt.label}
        description={opt.description} disabled={opt.disabled}
        checked={value === opt.value} onChange={onChange} />
    ))}
  </div>
);
