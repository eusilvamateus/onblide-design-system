/* global React, Icons */
const { useState, useEffect, useRef } = React;

// ============================================================
// Onblide Web App — extended component set
// All components use semantic CSS tokens (var(--ob-*)) so they
// respond to light/dark theme automatically.
// ============================================================

// ── RADIO ───────────────────────────────────────────────
const Radio = ({ name, value, checked, onChange, label, disabled = false, description }) => (
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

const RadioGroup = ({ options, value, onChange, name = 'radio-group' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {options.map(opt => (
      <Radio key={opt.value} name={name} value={opt.value} label={opt.label}
        description={opt.description} disabled={opt.disabled}
        checked={value === opt.value} onChange={onChange} />
    ))}
  </div>
);

// ── TOGGLE (switch) ──────────────────────────────────────
const Toggle = ({ checked, onChange, label, disabled = false, size = 'md' }) => {
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

// ── CHECKBOX ─────────────────────────────────────────────
const Checkbox = ({ checked, onChange, label, disabled = false, indeterminate = false, description }) => (
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
        <Icons.check size={12} style={{ color: '#fff', lineHeight: 1 }}/>
      )}
      {indeterminate && <span style={{ width: 9, height: 2, background: '#fff', borderRadius: 1 }} />}
    </span>
    <span>
      <span style={{ fontSize: 14, color: 'var(--ob-fg-strong)', fontWeight: 500, lineHeight: 1.3, display: 'block' }}>{label}</span>
      {description && <span style={{ fontSize: 12, color: 'var(--ob-fg-soft)', marginTop: 2, display: 'block' }}>{description}</span>}
    </span>
  </label>
);

// ── LINK ─────────────────────────────────────────────────
const Link = ({ href = '#', children, variant = 'default', external = false, onClick }) => {
  const [hover, setHover] = useState(false);
  const variants = {
    default: { color: 'var(--ob-blue)', textDecoration: hover ? 'underline' : 'none' },
    subtle:  { color: 'var(--ob-fg)', textDecoration: hover ? 'underline' : 'none' },
    quiet:   { color: 'var(--ob-fg-soft)', textDecoration: hover ? 'underline' : 'none' },
  };
  return (
    <a href={href} onClick={onClick} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'inherit',
        fontWeight: 500, fontSize: 14, cursor: 'pointer', transition: 'color 120ms',
        ...variants[variant],
      }}>
      {children}
      {external && <Icons.arrowSquareOut size={13}/>}
    </a>
  );
};

// ── SKELETON ─────────────────────────────────────────────
const Skeleton = ({ width = '100%', height = 16, radius = 6, circle = false, style = {} }) => (
  <span style={{
    display: 'block',
    width: circle ? height : width,
    height,
    borderRadius: circle ? '50%' : radius,
    background: 'linear-gradient(90deg, var(--ob-bg-alt) 25%, var(--ob-border) 50%, var(--ob-bg-alt) 75%)',
    backgroundSize: '200% 100%',
    animation: 'ob-shimmer 1.4s ease-in-out infinite',
    ...style,
  }} />
);

// inject shimmer keyframes once
if (typeof document !== 'undefined' && !document.getElementById('ob-skeleton-kf')) {
  const st = document.createElement('style');
  st.id = 'ob-skeleton-kf';
  st.textContent = '@keyframes ob-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }';
  document.head.appendChild(st);
}

// ── PAGINATION ───────────────────────────────────────────
const Pagination = ({ page = 1, total = 10, onChange, siblings = 1 }) => {
  const range = (s, e) => Array.from({ length: e - s + 1 }, (_, i) => s + i);
  let pages = [];
  const left = Math.max(2, page - siblings);
  const right = Math.min(total - 1, page + siblings);
  pages.push(1);
  if (left > 2) pages.push('…');
  pages.push(...range(left, right));
  if (right < total - 1) pages.push('…');
  if (total > 1) pages.push(total);
  pages = [...new Set(pages)];

  const Arrow = ({ dir, disabled }) => (
    <button disabled={disabled} onClick={() => onChange?.(dir === 'prev' ? page - 1 : page + 1)} style={{
      width: 34, height: 34, borderRadius: 8, border: '1px solid var(--ob-border)',
      background: 'var(--ob-surface)', color: disabled ? 'var(--ob-fg-mute)' : 'var(--ob-fg)',
      cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 120ms',
    }}>
      {dir === 'prev' ? <Icons.caretL size={16}/> : <Icons.caretR size={16}/>}
    </button>
  );

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Arrow dir="prev" disabled={page === 1} />
      {pages.map((p, i) => p === '…' ? (
        <span key={`e${i}`} style={{ width: 34, textAlign: 'center', color: 'var(--ob-fg-mute)' }}>…</span>
      ) : (
        <button key={p} onClick={() => onChange?.(p)} style={{
          minWidth: 34, height: 34, padding: '0 8px', borderRadius: 8,
          border: `1px solid ${p === page ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
          background: p === page ? 'var(--ob-blue)' : 'var(--ob-surface)',
          color: p === page ? '#fff' : 'var(--ob-fg)', fontFamily: 'inherit', fontSize: 14,
          fontWeight: p === page ? 600 : 500, cursor: 'pointer', transition: 'all 120ms',
        }}>{p}</button>
      ))}
      <Arrow dir="next" disabled={page === total} />
    </div>
  );
};

// ── DROPDOWN (menu) ──────────────────────────────────────
const Dropdown = ({ trigger, items, align = 'left' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <span onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>{trigger}</span>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', [align]: 0, zIndex: 1000,
          minWidth: 180, background: 'var(--ob-surface)', border: '1px solid var(--ob-border)',
          borderRadius: 12, boxShadow: 'var(--ob-shadow-lg)', padding: 6, overflow: 'hidden',
        }}>
          {items.map((it, i) => it.divider ? (
            <div key={`d${i}`} style={{ height: 1, background: 'var(--ob-border)', margin: '6px 0' }} />
          ) : (
            <button key={i} onClick={() => { it.onClick?.(); setOpen(false); }} disabled={it.disabled} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px',
              border: 'none', borderRadius: 8, background: 'transparent', cursor: it.disabled ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 500, textAlign: 'left',
              color: it.danger ? 'var(--ob-danger)' : 'var(--ob-fg-strong)', opacity: it.disabled ? 0.5 : 1,
              transition: 'background 120ms',
            }}
            onMouseEnter={(e) => { if (!it.disabled) e.currentTarget.style.background = 'var(--ob-bg-alt)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
              {it.icon && <span style={{ color: it.danger ? 'var(--ob-danger)' : 'var(--ob-fg-soft)', display: 'flex' }}>{it.icon}</span>}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── MODAL ────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, footer, width = 440 }) => {
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(20,20,20,0.45)', backdropFilter: 'blur(2px)', padding: 24,
      animation: 'ob-fade 160ms ease-out',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width, maxWidth: '100%', background: 'var(--ob-surface)', borderRadius: 16,
        boxShadow: 'var(--ob-shadow-lg)', overflow: 'hidden', animation: 'ob-pop 200ms var(--ob-ease-spring)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '20px 24px 0' }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--ob-fg-strong)' }}>{title}</h3>
          <button onClick={onClose} style={{
            flex: 'none', width: 30, height: 30, borderRadius: 8, border: 'none', background: 'transparent',
            color: 'var(--ob-fg-soft)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ob-bg-alt)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
            <Icons.x size={18}/>
          </button>
        </div>
        <div style={{ padding: '12px 24px 20px', fontSize: 14, lineHeight: 1.6, color: 'var(--ob-fg)' }}>{children}</div>
        {footer && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '16px 24px', borderTop: '1px solid var(--ob-border)', background: 'var(--ob-bg-alt)' }}>{footer}</div>
        )}
      </div>
    </div>
  );
};

// modal keyframes
if (typeof document !== 'undefined' && !document.getElementById('ob-modal-kf')) {
  const st = document.createElement('style');
  st.id = 'ob-modal-kf';
  st.textContent = '@keyframes ob-fade { from { opacity: 0; } to { opacity: 1; } } @keyframes ob-pop { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }';
  document.head.appendChild(st);
}

// ── TOOLTIP ──────────────────────────────────────────────
// variant: 'text' (default) | 'image' | 'inverted'
// placement: 'top' (default) | 'bottom' | 'left' | 'right'
const Tooltip = ({ children, variant = 'text', placement = 'top', label, shortcut, image, title, subtitle, delay = 120, maxWidth = 240 }) => {
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  const show = () => { timer.current = setTimeout(() => setOpen(true), delay); };
  const hide = () => { clearTimeout(timer.current); setOpen(false); };

  const inverted = variant === 'inverted';
  const bg = inverted ? 'var(--ob-surface)' : 'var(--ob-ink-strong)';
  const fg = inverted ? 'var(--ob-fg-strong)' : '#fff';
  const subFg = inverted ? 'var(--ob-fg-soft)' : 'rgba(255,255,255,0.7)';
  const bordered = inverted ? '1px solid var(--ob-border)' : 'none';

  // popup position
  const pos = {
    top:    { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8 },
    left:   { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 8 },
    right:  { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 8 },
  }[placement];

  // arrow position
  const arrowBase = { position: 'absolute', width: 8, height: 8, background: bg, transform: 'rotate(45deg)', border: bordered };
  const arrowPos = {
    top:    { bottom: -4, left: '50%', marginLeft: -4, borderTop: 'none', borderLeft: 'none' },
    bottom: { top: -4, left: '50%', marginLeft: -4, borderBottom: 'none', borderRight: 'none' },
    left:   { right: -4, top: '50%', marginTop: -4, borderBottom: 'none', borderLeft: 'none' },
    right:  { left: -4, top: '50%', marginTop: -4, borderTop: 'none', borderRight: 'none' },
  }[placement];

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {open && (
        <span role="tooltip" style={{
          position: 'absolute', zIndex: 1500, ...pos,
          background: bg, color: fg, border: bordered,
          borderRadius: variant === 'image' ? 12 : 8,
          boxShadow: inverted ? 'var(--ob-shadow-md)' : '0 4px 12px rgba(0,0,0,0.18)',
          padding: variant === 'image' ? 6 : '8px 11px',
          fontSize: 13, lineHeight: 1.4, fontWeight: 500, whiteSpace: variant === 'image' ? 'normal' : 'nowrap',
          maxWidth: variant === 'image' ? 200 : maxWidth, pointerEvents: 'none',
          animation: 'ob-tip 140ms var(--ob-ease-out)',
        }}>
          {variant === 'image' ? (
            <span style={{ display: 'block', width: 188 }}>
              <span style={{ display: 'block', width: '100%', height: 110, borderRadius: 8, overflow: 'hidden', background: 'var(--ob-bg-alt)' }}>
                {image && <img src={image} alt={title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </span>
              {title && <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: fg, marginTop: 8, padding: '0 4px', whiteSpace: 'normal' }}>{title}</span>}
              {subtitle && <span style={{ display: 'block', fontSize: 12, color: subFg, marginTop: 2, padding: '0 4px 4px', whiteSpace: 'normal' }}>{subtitle}</span>}
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span>{label}</span>
              {shortcut && (
                <kbd style={{
                  fontFamily: 'var(--ob-font-mono)', fontSize: 11, fontWeight: 600,
                  padding: '2px 6px', borderRadius: 5,
                  background: inverted ? 'var(--ob-bg-alt)' : 'rgba(255,255,255,0.16)',
                  color: inverted ? 'var(--ob-fg-soft)' : 'rgba(255,255,255,0.9)',
                }}>{shortcut}</kbd>
              )}
            </span>
          )}
          {variant !== 'image' && <span style={{ ...arrowBase, ...arrowPos }} />}
        </span>
      )}
    </span>
  );
};

if (typeof document !== 'undefined' && !document.getElementById('ob-tip-kf')) {
  const st = document.createElement('style');
  st.id = 'ob-tip-kf';
  st.textContent = '@keyframes ob-tip { from { opacity: 0; } }';
  document.head.appendChild(st);
}

// ── PhIcon (local helper — requires @phosphor-icons/web CSS) ────
const Ph = ({ n, size = 18, c }) => (
  <i className={`ph ph-${n}`} aria-hidden="true"
     style={{ fontSize: size, color: c || 'currentColor', lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} />
);

// Shared tone map used by Alert, Toast and ProgressBar
const OB_TONES = {
  info:    { fg: 'var(--ob-blue)',   bg: 'var(--ob-blue-100)',   strong: 'var(--ob-blue-700)',   icon: 'info' },
  success: { fg: 'var(--ob-green)',  bg: 'var(--ob-green-100)',  strong: 'var(--ob-green-700)',  icon: 'check-circle' },
  warning: { fg: 'var(--ob-orange)', bg: 'var(--ob-orange-100)', strong: 'var(--ob-orange-700)', icon: 'warning' },
  danger:  { fg: 'var(--ob-danger)', bg: 'var(--ob-danger-bg)',  strong: 'var(--ob-danger)',     icon: 'warning-circle' },
};

// ── CODE INPUT (OTP / verificação) ──────────────────────
const CodeInput = ({ length = 6, value = '', onChange, status = 'default' }) => {
  const refs = useRef([]);
  const vals = value.split('');
  const set = (i, ch) => {
    const next = value.split(''); next[i] = ch;
    onChange?.(next.join('').slice(0, length));
    if (ch && i < length - 1) refs.current[i + 1]?.focus();
  };
  const keyDown = (i, e) => {
    if (e.key === 'Backspace' && !vals[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft'  && i > 0)          refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
  };
  const paste = (e) => {
    e.preventDefault();
    const digits = (e.clipboardData.getData('text').match(/\d/g) || []).slice(0, length);
    onChange?.(digits.join(''));
    refs.current[Math.min(digits.length, length - 1)]?.focus();
  };
  if (typeof document !== 'undefined' && !document.getElementById('ob-shake-kf')) {
    const st = document.createElement('style'); st.id = 'ob-shake-kf';
    st.textContent = '@keyframes ob-shake{10%,90%{transform:translateX(-1px)}20%,80%{transform:translateX(2px)}30%,50%,70%{transform:translateX(-4px)}40%,60%{transform:translateX(4px)}}';
    document.head.appendChild(st);
  }
  const borderFor = (filled) =>
    status === 'error' ? 'var(--ob-danger)' : status === 'success' ? 'var(--ob-green)' : filled ? 'var(--ob-blue)' : 'var(--ob-border)';
  return (
    <div style={{ display: 'inline-flex', gap: 10, animation: status === 'error' ? 'ob-shake 0.4s' : 'none' }} onPaste={paste}>
      {Array.from({ length }).map((_, i) => (
        <input key={i} ref={el => refs.current[i] = el} inputMode="numeric" maxLength={1}
          value={vals[i] || ''} onChange={e => set(i, e.target.value.replace(/\D/g, ''))} onKeyDown={e => keyDown(i, e)}
          style={{
            width: 48, height: 56, textAlign: 'center', fontFamily: 'var(--ob-font)', fontSize: 22, fontWeight: 700,
            borderRadius: 'var(--ob-r-md)', caretColor: 'var(--ob-blue)', outline: 'none',
            color: status === 'error' ? 'var(--ob-danger)' : status === 'success' ? 'var(--ob-green-700)' : 'var(--ob-fg-strong)',
            background: 'var(--ob-surface)', border: `2px solid ${borderFor(!!vals[i])}`,
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={e => { if (status === 'default') e.target.style.boxShadow = '0 0 0 4px var(--ob-blue-100)'; }}
          onBlur={e => e.target.style.boxShadow = 'none'} />
      ))}
    </div>
  );
};

// ── SEARCH INPUT ────────────────────────────────────────
const SearchInput = ({ value = '', onChange, loading = false, placeholder = 'Buscar…', results = [], onSelect, width = 320 }) => {
  const [focus, setFocus] = useState(false);
  const showDrop = focus && results.length > 0;
  if (typeof document !== 'undefined' && !document.getElementById('ob-spin-kf')) {
    const st = document.createElement('style'); st.id = 'ob-spin-kf';
    st.textContent = '@keyframes ob-spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(st);
  }
  return (
    <div style={{ position: 'relative', width }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, height: 44, padding: '0 14px',
        background: 'var(--ob-surface)', border: `1.5px solid ${focus ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
        borderRadius: 'var(--ob-r-md)', boxShadow: focus ? '0 0 0 4px var(--ob-blue-100)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}>
        <Ph n="magnifying-glass" size={18} c="var(--ob-fg-mute)" />
        <input value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
          onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'none', fontFamily: 'var(--ob-font)', fontSize: 14.5, color: 'var(--ob-fg-strong)' }} />
        {loading && <i className="ph ph-circle-notch" style={{ fontSize: 17, color: 'var(--ob-blue)', animation: 'ob-spin 0.8s linear infinite' }} />}
        {!loading && value && <button onClick={() => onChange?.('')} aria-label="Limpar" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ob-fg-mute)', display: 'flex', padding: 2 }}><Ph n="x-circle" size={17} /></button>}
      </div>
      {showDrop && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 1200, background: 'var(--ob-surface)', border: '1px solid var(--ob-border)', borderRadius: 'var(--ob-r-md)', boxShadow: 'var(--ob-shadow-lg)', overflow: 'hidden' }}>
          {results.map((r, i) => {
            const lbl = typeof r === 'string' ? r : r.label;
            return (
              <button key={i} onMouseDown={() => { onSelect?.(r); onChange?.(lbl); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', border: 'none', borderBottom: i < results.length - 1 ? '1px solid var(--ob-line-soft)' : 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--ob-font)', fontSize: 14, color: 'var(--ob-fg)', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--ob-bg-warm)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Ph n="arrow-elbow-down-right" size={14} c="var(--ob-fg-mute)" />{lbl}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── ALERT ───────────────────────────────────────────────
const Alert = ({ tone = 'info', title, children, dismissible = false, onClose, action, onAction }) => {
  const t = OB_TONES[tone] || OB_TONES.info;
  return (
    <div role="alert" style={{ display: 'flex', gap: 13, width: '100%', padding: '14px 16px', background: t.bg, border: `1px solid color-mix(in srgb, ${t.fg} 28%, transparent)`, borderRadius: 'var(--ob-r-md)', boxSizing: 'border-box' }}>
      <Ph n={t.icon} size={20} c={t.fg} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ob-fg-strong)', marginBottom: children ? 3 : 0 }}>{title}</div>}
        {children && <div style={{ fontSize: 13.5, color: 'var(--ob-fg)', lineHeight: 1.5 }}>{children}</div>}
        {action && <button onClick={onAction} style={{ marginTop: 10, border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: t.strong, fontWeight: 700, fontSize: 13, fontFamily: 'var(--ob-font)' }}>{action} →</button>}
      </div>
      {dismissible && onClose && <button onClick={onClose} aria-label="Fechar" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ob-fg-soft)', display: 'flex', padding: 2, flex: 'none' }}><Ph n="x" size={15} /></button>}
    </div>
  );
};

// ── TOAST ───────────────────────────────────────────────
const Toast = ({ tone = 'info', title, body, action, onAction, onClose }) => {
  const t = OB_TONES[tone] || OB_TONES.info;
  return (
    <div role="status" style={{ display: 'flex', gap: 12, width: 360, padding: '14px 14px 14px 16px', background: 'var(--ob-surface)', border: '1px solid var(--ob-border)', borderLeft: `3px solid ${t.fg}`, borderRadius: 'var(--ob-r-md)', boxShadow: '0 10px 30px rgba(0,0,0,0.13)' }}>
      <Ph n={t.icon} size={20} c={t.fg} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{title}</div>
        {body && <div style={{ fontSize: 13, color: 'var(--ob-fg-soft)', marginTop: 2, lineHeight: 1.45 }}>{body}</div>}
        {action && <button onClick={onAction} style={{ marginTop: 8, border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: t.strong, fontWeight: 700, fontSize: 13, fontFamily: 'var(--ob-font)' }}>{action}</button>}
      </div>
      {onClose && <button onClick={onClose} aria-label="Fechar" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ob-fg-mute)', display: 'flex', padding: 2, flex: 'none' }}><Ph n="x" size={15} /></button>}
    </div>
  );
};

// ── PROGRESS BAR ────────────────────────────────────────
const ProgressBar = ({ value = 0, tone = 'info', size = 'md', indeterminate = false, showLabel = false, segments, currentSegment = 0 }) => {
  const t = OB_TONES[tone] || OB_TONES.info;
  const h = size === 'sm' ? 6 : size === 'lg' ? 14 : 10;
  if (typeof document !== 'undefined' && !document.getElementById('ob-indet-kf')) {
    const st = document.createElement('style'); st.id = 'ob-indet-kf';
    st.textContent = '@keyframes ob-indet{0%{left:-40%;width:40%}50%{width:55%}100%{left:100%;width:40%}}';
    document.head.appendChild(st);
  }
  if (segments) return (
    <div style={{ display: 'flex', gap: 6, width: '100%' }}>
      {Array.from({ length: segments }).map((_, i) => <div key={i} style={{ flex: 1, height: h, borderRadius: 999, background: i < currentSegment ? t.fg : 'var(--ob-border)' }} />)}
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
      <div style={{ flex: 1, height: h, background: 'var(--ob-bg-warm)', borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
        {indeterminate
          ? <div style={{ position: 'absolute', height: '100%', background: t.fg, borderRadius: 999, animation: 'ob-indet 1.4s ease-in-out infinite' }} />
          : <div style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: '100%', background: t.fg, borderRadius: 999, transition: 'width 0.4s cubic-bezier(.4,0,.2,1)' }} />}
      </div>
      {showLabel && !indeterminate && <span style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)', width: 36, textAlign: 'right', flex: 'none' }}>{Math.round(value)}%</span>}
    </div>
  );
};

// ── SIDE NAV ────────────────────────────────────────────
const SideNav = ({ items = [], active, onNav, collapsed = false, onToggle, flush = false, workspaceName = 'Workspace', userInitials = 'OB' }) => (
  <div style={{ width: flush ? '100%' : (collapsed ? 72 : 240), minWidth: 0, boxSizing: 'border-box', overflow: 'hidden', height: flush ? '100%' : undefined, background: 'var(--ob-surface)', border: flush ? 'none' : '1px solid var(--ob-border)', borderRight: flush ? '1px solid var(--ob-border)' : undefined, borderRadius: flush ? 0 : 'var(--ob-r-lg)', padding: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
    {collapsed
      ? <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 14px' }}>
          <button onClick={onToggle} title="Expandir" style={{ width: 36, height: 36, borderRadius: 'var(--ob-r-md)', border: '1.5px solid var(--ob-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ob-fg-soft)' }}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--ob-bg-warm)';e.currentTarget.style.color='var(--ob-blue)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--ob-fg-soft)';}}>
            <Ph n="caret-line-right" size={18}/>
          </button>
        </div>
      : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 4px 14px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--ob-blue)', color: '#fff', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>O</span>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--ob-fg-strong)', letterSpacing: '-0.02em' }}>Onblide</span>
          </div>
          {onToggle && <button onClick={onToggle} title="Recolher" style={{ width: 30, height: 30, borderRadius: 'var(--ob-r-md)', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ob-fg-soft)' }}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--ob-bg-warm)';e.currentTarget.style.color='var(--ob-fg-strong)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--ob-fg-soft)';}}>
            <Ph n="caret-line-left" size={18}/>
          </button>}
        </div>
    }
    {!collapsed && <p style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ob-fg-mute)', margin: '0 10px 6px' }}>Menu</p>}
    {items.map((it, i) => {
      if (it.section) return !collapsed ? <p key={i} style={{ fontFamily: 'var(--ob-font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ob-fg-mute)', margin: '12px 10px 4px' }}>{it.section}</p> : null;
      const on = active === it.id;
      return (
        <button key={it.id || i} onClick={() => onNav?.(it.id)} title={collapsed ? it.label : undefined}
          style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: collapsed ? 'center' : 'flex-start', height: 42, padding: collapsed ? 0 : '0 12px', borderRadius: 'var(--ob-r-md)', border: 'none', cursor: 'pointer', position: 'relative', background: on ? 'var(--ob-blue-100)' : 'transparent', color: on ? 'var(--ob-blue-700)' : 'var(--ob-fg-soft)', fontFamily: 'var(--ob-font)', fontSize: 14, fontWeight: on ? 600 : 500, transition: 'background 0.12s' }}
          onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--ob-bg-warm)'; }}
          onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
          {on && <span style={{ position: 'absolute', left: 0, top: 10, bottom: 10, width: 3, borderRadius: 3, background: 'var(--ob-blue)' }} />}
          {it.icon && <Ph n={it.icon} size={20} />}
          {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{it.label}</span>}
          {!collapsed && it.badge != null && <span style={{ minWidth: 20, height: 20, padding: '0 6px', borderRadius: 999, background: 'var(--ob-orange)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.badge}</span>}
          {collapsed && it.badge != null && <span style={{ position: 'absolute', top: 7, right: 9, width: 8, height: 8, borderRadius: 999, background: 'var(--ob-orange)', border: '2px solid var(--ob-surface)' }} />}
        </button>
      );
    })}
    <div style={{ marginTop: 'auto', borderTop: '1px solid var(--ob-line-soft)', display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px 0 2px' : '10px 8px 2px', justifyContent: collapsed ? 'center' : 'flex-start' }}>
      <span style={{ width: 30, height: 30, borderRadius: 999, background: 'var(--ob-blue)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{userInitials}</span>
      {!collapsed && <div style={{ minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ob-fg-strong)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Onblide</div><div style={{ fontSize: 11, color: 'var(--ob-fg-mute)' }}>{workspaceName}</div></div>}
    </div>
  </div>
);

// ── TOAST STACK (global singleton) ────────────────────────
const ToastStack = () => {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const handler = (e) => {
      const id = Date.now() + Math.random();
      setToasts(ts => [...ts.slice(-2), { ...e.detail, id }]);
      setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 4800);
    };
    window.addEventListener('ob-toast', handler);
    return () => window.removeEventListener('ob-toast', handler);
  }, []);
  if (!toasts.length) return null;
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column-reverse', gap: 10, pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'all', animation: 'ob-toast-in 0.24s cubic-bezier(.2,1.3,.4,1) both' }}>
          <Toast {...t} onClose={() => setToasts(ts => ts.filter(x => x.id !== t.id))} />
        </div>
      ))}
    </div>
  );
};
if (typeof document !== 'undefined' && !document.getElementById('ob-toast-kf')) {
  const st = document.createElement('style'); st.id = 'ob-toast-kf';
  st.textContent = '@keyframes ob-toast-in{from{opacity:0;transform:translateY(16px) scale(0.95)}to{opacity:1;transform:none}}';
  document.head.appendChild(st);
}
window.obToast = (detail) => window.dispatchEvent(new CustomEvent('ob-toast', { detail }));

Object.assign(window, { Radio, RadioGroup, Toggle, Checkbox, Link, Skeleton, Pagination, Dropdown, Modal, Tooltip, Ph, OB_TONES, CodeInput, SearchInput, Alert, Toast, ProgressBar, SideNav, ToastStack });
