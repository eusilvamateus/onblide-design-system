import React from 'react';
import { MenuPanel, type MenuItem } from '../../overlays/Menu/Menu';
import { Ancorado, estaDentro, retanguloDe, useCamada } from '../../internal/camada';

export interface MenubarMenu {
  label: string;
  items: MenuItem[];
}

export interface MenubarProps {
  menus: MenubarMenu[];
  ariaLabel?: string;
}

/** Barra fixa com vários menus lado a lado (Arquivo, Editar, Ver…), padrão de app de edição. Os menus são
 * irmãos: ←/→ trocam de menu, e com um aberto passar o mouse sobre outro troca sem clicar. Sem fundo
 * próprio — quem usa decide onde a barra fica. */
export const Menubar: React.FC<MenubarProps> = ({ menus, ariaLabel = 'Menu principal' }) => {
  const [open, setOpen] = React.useState<{ i: number; kb: boolean } | null>(null);
  const [focus, setFocus] = React.useState(0);
  const wrap = React.useRef<HTMLDivElement>(null);
  const btns = React.useRef<(HTMLButtonElement | null)[]>([]);
  const painel = React.useRef<HTMLDivElement>(null);
  const camada = useCamada();
  const n = menus.length;
  React.useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!estaDentro(e.target, camada, wrap.current, painel.current)) setOpen(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const focusBtn = (i: number) => btns.current[i]?.focus();
  const openMenu = (i: number, kb: boolean) => { setFocus(i); setOpen({ i, kb }); };
  const closeAll = () => { const i = open ? open.i : focus; setOpen(null); focusBtn(i); };
  return (
    <div ref={wrap} role="menubar" aria-label={ariaLabel} style={{ display: 'flex', alignItems: 'center', gap: 'var(--ob-space-2)' }}>
      {menus.map((m, i) => {
        const isOpen = !!open && open.i === i;
        return (
          <div key={i}>
            <button ref={(el) => { btns.current[i] = el; }} role="menuitem" aria-haspopup="menu" aria-expanded={isOpen} tabIndex={focus === i ? 0 : -1}
              onClick={(e) => (isOpen ? setOpen(null) : openMenu(i, e.detail === 0))}
              onMouseEnter={() => { if (open && !isOpen) openMenu(i, false); }}
              onMouseOver={(e) => { if (!isOpen) e.currentTarget.style.background = 'var(--ob-bg-alt)'; }}
              onMouseOut={(e) => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}
              onKeyDown={(e) => {
                const k = e.key;
                if (k === 'ArrowRight' || k === 'ArrowLeft' || k === 'Home' || k === 'End') {
                  e.preventDefault();
                  const j = k === 'Home' ? 0 : k === 'End' ? n - 1 : (i + (k === 'ArrowRight' ? 1 : -1) + n) % n;
                  setFocus(j); focusBtn(j);
                } else if (k === 'ArrowDown' || k === 'ArrowUp') { e.preventDefault(); openMenu(i, true); }
              }}
              style={{
                height: 32, padding: '0 var(--ob-space-10)', border: 'none', borderRadius: 'var(--ob-r-sm)', background: isOpen ? 'var(--ob-bg-alt)' : 'transparent',
                color: 'var(--ob-fg-strong)', fontFamily: 'inherit', fontSize: 'var(--ob-fs-14)', fontWeight: 'var(--ob-w-medium)', cursor: 'pointer', transition: 'background var(--ob-dur-fast) var(--ob-ease)',
              }}>{m.label}</button>
            {isOpen && (
              <Ancorado ref={painel} camada={camada} folga={4} ancora={() => retanguloDe(btns.current[i])}>
                <MenuPanel key={`${i}-${open.kb}`} items={m.items} keyboard={open.kb} onCloseTree={closeAll}
                  onNavOut={(d) => openMenu((i + d + n) % n, true)} ariaLabel={m.label} />
              </Ancorado>
            )}
          </div>
        );
      })}
    </div>
  );
};
