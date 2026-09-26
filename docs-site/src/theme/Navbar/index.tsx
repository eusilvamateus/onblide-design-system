import React, { useEffect, useState, type ReactNode } from 'react';
import { useHistory } from '@docusaurus/router';
import { useColorMode } from '@docusaurus/theme-common';
import { Button, Link, Logo, Ph, Toggle } from '@onblide/ui';

// Abaixo do breakpoint `sm` (768px) o rótulo do interruptor some para a barra caber.
function useTelaPequena(): boolean {
  const [pequena, setPequena] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const atualizar = () => setPequena(mq.matches);
    atualizar();
    mq.addEventListener('change', atualizar);
    return () => mq.removeEventListener('change', atualizar);
  }, []);
  return pequena;
}

export default function Navbar(): ReactNode {
  const { colorMode, setColorMode } = useColorMode();
  const history = useHistory();
  const pequena = useTelaPequena();
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
            <Link href="https://github.com/eusilvamateus/onblide-design-system" external variant="subtle">GitHub</Link>
          </span>
          <Toggle
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
