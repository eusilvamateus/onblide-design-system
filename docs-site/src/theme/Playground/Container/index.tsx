import React, { type ReactNode } from 'react';

// Moldura do exemplo ao vivo: superfície com borda e raio de superfície do design system.
export default function PlaygroundContainer({ children }: { children: ReactNode }): ReactNode {
  return <div className="ob-playground">{children}</div>;
}
