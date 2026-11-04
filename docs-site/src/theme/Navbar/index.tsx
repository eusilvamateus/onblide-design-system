import React, { type ReactNode } from 'react';
import { useHistory } from '@docusaurus/router';
import { useColorMode } from '@docusaurus/theme-common';
import { Button, Link, Logo, Ph, Switch, useBreakpoint } from '@onblide/ui';

export default function Navbar(): ReactNode {
  const { colorMode, setColorMode } = useColorMode();
  const history = useHistory();
  const pequena = !useBreakpoint().atLeast('sm');
  return (
    <header className="ob-topbar">
      <div className="ob-topbar__inner">
        <div className="ob-topbar__brand">
          <span className="ob-topbar__menu">
            <Button
              kind="ghost"
              size="sm"
              aria-label="Abrir navegação"
              onClick={() => window.dispatchEvent(new CustomEvent('ob-abrir-navegacao'))}
              icon={<Ph n="list" size={18} />}
            />
          </span>
          <a href="/" onClick={(e) => { e.preventDefault(); history.push('/'); }} aria-label="Onblide Design System" style={{ display: 'inline-flex' }}>
            <Logo size={26} />
          </a>
          <span className="ob-eyebrow ob-topbar__label">Design System</span>
        </div>
        <div className="ob-topbar__actions">
          <span className="ob-topbar__github">
            <Link href="https://github.com/eusilvamateus/onblide-design-system" external tone="neutral">GitHub</Link>
          </span>
          <Switch
            size="sm"
            label={pequena ? undefined : 'Tema escuro'}
            checked={colorMode === 'dark'}
            onChange={(v) => setColorMode(v ? 'dark' : 'light')}
          />
        </div>
      </div>
    </header>
  );
}
