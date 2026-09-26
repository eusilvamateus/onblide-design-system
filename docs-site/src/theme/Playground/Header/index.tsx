import React, { type ReactNode } from 'react';

export default function PlaygroundHeader({ children, buttons }: { children: ReactNode; buttons?: ReactNode }): ReactNode {
  return (
    <div className="ob-playground__header">
      <span className="ob-eyebrow">{children}</span>
      {buttons}
    </div>
  );
}
