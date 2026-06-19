/* global React */
const { useState } = React;

// ============================================================
// Onblide Web App — shared UI primitives
// ============================================================

const Logo = ({ size = 28 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <svg width={size} height={size} viewBox="0 0 56 56">
      <rect width="56" height="56" rx="14" fill="#0a4ee4"/>
      <rect x="10" y="10" width="20" height="20" rx="6" fill="#f2f0e8"/>
      <circle cx="38" cy="38" r="10" fill="#eb7c2d"/>
    </svg>
    <span style={{ fontWeight: 800, fontSize: size * 0.72, letterSpacing: '-0.03em', color: 'var(--ob-fg-strong)' }}>
      on<span style={{ color: 'var(--ob-blue)' }}>blide</span>
    </span>
  </div>
);

// ── Phosphor Icons (real library via @phosphor-icons/web) ──────────────────
// Renders authentic Phosphor glyphs from the webfont CSS loaded in index.html.
// Usage identical to before: <Icons.house size={18}/> etc.
const PhIcon = ({ name, size = 20, style = {} }) => (
  <i className={`ph ph-${name}`} style={{ fontSize: size, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true"/>
);

const Icons = {
  search:         (p={}) => <PhIcon name="magnifying-glass"    size={p.size} style={p.style}/>,
  house:          (p={}) => <PhIcon name="house"               size={p.size} style={p.style}/>,
  user:           (p={}) => <PhIcon name="user"                size={p.size} style={p.style}/>,
  chart:          (p={}) => <PhIcon name="chart-line"          size={p.size} style={p.style}/>,
  gear:           (p={}) => <PhIcon name="gear"                size={p.size} style={p.style}/>,
  bell:           (p={}) => <PhIcon name="bell"                size={p.size} style={p.style}/>,
  plus:           (p={}) => <PhIcon name="plus"                size={p.size} style={p.style}/>,
  check:          (p={}) => <PhIcon name="check"               size={p.size} style={p.style}/>,
  x:              (p={}) => <PhIcon name="x"                   size={p.size} style={p.style}/>,
  arrowR:         (p={}) => <PhIcon name="arrow-right"         size={p.size} style={p.style}/>,
  caretD:         (p={}) => <PhIcon name="caret-down"          size={p.size} style={p.style}/>,
  caretL:         (p={}) => <PhIcon name="caret-left"          size={p.size} style={p.style}/>,
  caretR:         (p={}) => <PhIcon name="caret-right"         size={p.size} style={p.style}/>,
  folder:         (p={}) => <PhIcon name="folder"              size={p.size} style={p.style}/>,
  file:           (p={}) => <PhIcon name="file"                size={p.size} style={p.style}/>,
  calendar:       (p={}) => <PhIcon name="calendar"            size={p.size} style={p.style}/>,
  kanban:         (p={}) => <PhIcon name="kanban"              size={p.size} style={p.style}/>,
  bolt:           (p={}) => <PhIcon name="lightning"           size={p.size} style={p.style}/>,
  chat:           (p={}) => <PhIcon name="chat-text"           size={p.size} style={p.style}/>,
  logout:         (p={}) => <PhIcon name="sign-out"            size={p.size} style={p.style}/>,
  star:           (p={}) => <PhIcon name="star"                size={p.size} style={p.style}/>,
  heart:          (p={}) => <PhIcon name="heart"               size={p.size} style={p.style}/>,
  more:           (p={}) => <PhIcon name="dots-three"          size={p.size} style={p.style}/>,
  grid:           (p={}) => <PhIcon name="squares-four"        size={p.size} style={p.style}/>,
  sync:           (p={}) => <PhIcon name="arrows-clockwise"    size={p.size} style={p.style}/>,
  link:           (p={}) => <PhIcon name="link"                size={p.size} style={p.style}/>,
  info:           (p={}) => <PhIcon name="info"                size={p.size} style={p.style}/>,
  arrowSquareOut: (p={}) => <PhIcon name="arrow-square-out"    size={p.size} style={p.style}/>,
};

// ============================================================
// Brand logos — faithful SVG reproductions in authentic brand colors.
// NOTE: @phosphor-icons/web (webfont) does not include brand logo glyphs —
// those only exist in the React package. Until the React package is added,
// these SVG marks (drawn in the Phosphor glyph style) are the correct approach.
// ============================================================
const Brands = {
  spotify: {
    name: 'Spotify', hex: '#1DB954', cat: 'Mídia',
    desc: 'Sincronize playlists e mostre o que você está ouvindo.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="11" fill="#1DB954"/>
        <path d="M6 11 C10 8.2 14 8.2 18 11" stroke="#000" strokeWidth="1.9" fill="none" strokeLinecap="round"/>
        <path d="M6.8 13.6 C10 11.4 14 11.4 17.2 13.6" stroke="#000" strokeWidth="1.7" fill="none" strokeLinecap="round"/>
        <path d="M7.7 16 C10.3 14.4 13.7 14.4 16.3 16" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  slack: {
    name: 'Slack', hex: '#611f69', cat: 'Comunicação',
    desc: 'Receba notificações de tarefas e menções no seu canal.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <rect x="3" y="10" width="8" height="4" rx="2" fill="#36C5F0"/>
        <rect x="10" y="13" width="4" height="8" rx="2" fill="#2EB67D"/>
        <rect x="13" y="10" width="8" height="4" rx="2" fill="#ECB22E"/>
        <rect x="10" y="3" width="4" height="8" rx="2" fill="#E01E5A"/>
      </svg>
    ),
  },
  notion: {
    name: 'Notion', hex: '#000000', cat: 'Produtividade',
    desc: 'Exporte documentos e tarefas para suas páginas do Notion.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="4.5" fill="#000"/>
        <path d="M8 16.5 V8 M8 8 L15.5 16.5 M15.5 16.5 V8" stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  figma: {
    name: 'Figma', hex: '#A259FF', cat: 'Design',
    desc: 'Importe frames e mantenha os tokens em sincronia.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path d="M12 2 H8.5 A3.5 3.5 0 0 0 8.5 9 H12 Z" fill="#F24E1E"/>
        <path d="M12 2 H15.5 A3.5 3.5 0 0 1 15.5 9 H12 Z" fill="#FF7262"/>
        <path d="M12 9 H8.5 A3.5 3.5 0 0 0 8.5 16 H12 Z" fill="#A259FF"/>
        <circle cx="15.5" cy="12.5" r="3.5" fill="#1ABCFE"/>
        <path d="M12 16 H8.5 A3.5 3.5 0 0 0 8.5 23 H12 Z" fill="#0ACF83"/>
      </svg>
    ),
  },
  github: {
    name: 'GitHub', hex: '#181717', cat: 'Desenvolvimento',
    desc: 'Vincule commits e pull requests às tarefas do board.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path fill="#181717" fillRule="evenodd" d="M12 2.2C6.5 2.2 2 6.7 2 12.2c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.5 4.9.4.3.7.9.7 1.8v2.6c0 .3.2.6.7.5 3.9-1.3 6.8-5.1 6.8-9.5 0-5.5-4.5-10-10-10Z"/>
      </svg>
    ),
  },
  dropbox: {
    name: 'Dropbox', hex: '#0061FF', cat: 'Armazenamento',
    desc: 'Anexe arquivos da sua conta diretamente nas tarefas.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <g fill="#0061FF">
          <path d="M6.4 2 L1 5.4 L6.4 8.8 L11.8 5.4 Z"/>
          <path d="M17.2 2 L11.8 5.4 L17.2 8.8 L22.6 5.4 Z"/>
          <path d="M1 12.2 L6.4 8.8 L11.8 12.2 L6.4 15.6 Z"/>
          <path d="M22.6 12.2 L17.2 8.8 L11.8 12.2 L17.2 15.6 Z"/>
          <path d="M6.4 16.7 L11.8 13.3 L17.2 16.7 L11.8 20.1 Z"/>
        </g>
      </svg>
    ),
  },
  discord: {
    name: 'Discord', hex: '#5865F2', cat: 'Comunicação',
    desc: 'Avise sua comunidade quando algo importante acontecer.',
    mark: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path fill="#5865F2" fillRule="evenodd" d="M19.5 5.6a16 16 0 0 0-4-1.3l-.3.5a14 14 0 0 0-4.4 0l-.3-.5a16 16 0 0 0-4 1.3C2 9.8 1.4 13.9 1.7 17.9a16 16 0 0 0 4.9 2.5 12 12 0 0 0 1-1.7c-.6-.2-1.1-.5-1.6-.8l.4-.3a11 11 0 0 0 9.2 0l.4.3c-.5.3-1 .6-1.6.8a12 12 0 0 0 1 1.7 16 16 0 0 0 4.9-2.5c.4-4.6-.7-8.7-2.2-12.3ZM8.4 15.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm7.2 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z"/>
      </svg>
    ),
  },
};

// Tile that frames a brand mark — keeps a constant light backing in
// both themes so dark marks (GitHub, Notion) stay legible.
const BrandTile = ({ brand, size = 44 }) => {
  const b = Brands[brand];
  if (!b) return null;
  return (
    <div style={{
      width: size, height: size, borderRadius: 11, background: '#ffffff',
      border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
    }}>
      {b.mark(Math.round(size * 0.56))}
    </div>
  );
};

// Buttons
const Button = ({ kind = 'primary', size = 'md', icon, children, onClick, style = {} }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center',
    fontFamily: 'inherit', fontWeight: 600, border: 'none', borderRadius: 'var(--ob-r-control)',
    cursor: 'pointer', transition: 'all 160ms cubic-bezier(0.2,0.7,0.2,1)',
    fontSize: size === 'sm' ? 13 : size === 'lg' ? 15 : 14,
    padding: size === 'sm' ? '7px 12px' : size === 'lg' ? '14px 22px' : '10px 18px',
  };
  const kinds = {
    primary:   { background: 'var(--ob-blue)', color: '#fff' },
    secondary: { background: 'var(--ob-surface)', color: 'var(--ob-fg-strong)', border: '1.5px solid var(--ob-border)' },
    ghost:     { background: 'transparent', color: 'var(--ob-blue)' },
    cream:     { background: 'var(--ob-bg-warm)', color: 'var(--ob-fg-strong)' },
    danger:    { background: 'var(--ob-danger)', color: '#fff' },
  };
  return (
    <button style={{ ...base, ...kinds[kind], ...style }} onClick={onClick}
      onMouseEnter={(e) => { if (kind === 'primary') e.currentTarget.style.boxShadow = '0 8px 24px rgba(10,78,228,0.28)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}>
      {icon}{children}
    </button>
  );
};

// ── FIELD SHELL ──────────────────────────────────────────
// Shared text-field surface. Owns border, radius, focus ring, error and
// disabled states so Input, SearchInput, Select and Datepicker never reinvent
// them. Tokens: --ob-r-control (radius) · --ob-focus-ring (focus) · --ob-danger.
const FieldShell = ({ focused = false, error = false, disabled = false, minHeight = 44, padding = '0 14px', onClick, style = {}, children }) => {
  const borderColor = error ? 'var(--ob-danger)' : focused ? 'var(--ob-blue)' : 'var(--ob-border)';
  const ring = !focused ? 'none'
    : error ? '0 0 0 4px color-mix(in srgb, var(--ob-danger) 22%, transparent)'
            : '0 0 0 4px var(--ob-focus-ring)';
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      minHeight, padding,
      background: disabled ? 'var(--ob-bg-alt)' : 'var(--ob-surface)',
      border: `1.5px solid ${borderColor}`,
      borderRadius: 'var(--ob-r-control)',
      boxShadow: ring,
      transition: 'border-color .15s, box-shadow .15s',
      opacity: disabled ? 0.6 : 1,
      boxSizing: 'border-box',
      ...style,
    }}>
      {children}
    </div>
  );
};

// Form input — composes FieldShell
const Input = ({ label, hint, error, icon, ...rest }) => {
  const [focused, setFocused] = useState(false);
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{label}</span>}
      <FieldShell focused={focused} error={!!error}>
        {icon && <span style={{ display: 'flex', color: 'var(--ob-fg-mute)', flex: 'none' }}>{icon}</span>}
        <input
          {...rest}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'inherit', fontSize: 14, color: 'var(--ob-fg-strong)', padding: '10px 0',
          }}
        />
      </FieldShell>
      {(hint || error) && <span style={{ fontSize: 11, color: error ? 'var(--ob-danger)' : 'var(--ob-fg-mute)' }}>{error || hint}</span>}
    </label>
  );
};

// Badge — variant: subtle (default) | solid | outline | numeric
const Badge = ({ tone = 'blue', variant = 'subtle', dot = true, size = 'md', children }) => {
  const T = {
    blue:   { bg: 'var(--ob-blue-100)',    fg: 'var(--ob-blue-700)',    dot: 'var(--ob-blue)',    solid: 'var(--ob-blue)',    border: 'color-mix(in srgb, var(--ob-blue) 35%, transparent)' },
    green:  { bg: 'var(--ob-green-100)',   fg: 'var(--ob-green-700)',   dot: 'var(--ob-green)',   solid: 'var(--ob-green)',   border: 'color-mix(in srgb, var(--ob-green) 35%, transparent)' },
    orange: { bg: 'color-mix(in srgb, var(--ob-orange) 15%, var(--ob-surface))', fg: '#9a4000', dot: 'var(--ob-orange)', solid: 'var(--ob-orange)', border: 'color-mix(in srgb, var(--ob-orange) 45%, transparent)' },
    red:    { bg: 'var(--ob-danger-bg)',   fg: 'var(--ob-danger)',      dot: 'var(--ob-danger)',  solid: 'var(--ob-danger)',  border: 'color-mix(in srgb, var(--ob-danger) 40%, transparent)' },
    grey:   { bg: 'var(--ob-bg-warm)',     fg: 'var(--ob-fg-soft)',     dot: 'var(--ob-fg-mute)', solid: 'var(--ob-fg-mute)', border: 'var(--ob-border)' },
  };
  const t = T[tone] || T.blue;
  const fs = size === 'sm' ? 11 : 12;
  const px = size === 'sm' ? '2px 8px' : '4px 10px';

  const styles = {
    subtle:  { background: t.bg, color: t.fg, border: 'none' },
    solid:   { background: t.solid, color: '#fff', border: 'none' },
    outline: { background: 'transparent', color: t.fg, border: `1.5px solid ${t.border}` },
    numeric: { background: t.solid, color: '#fff', border: 'none', minWidth: 18, height: 18, padding: '0 5px', justifyContent: 'center' },
  };
  const s = styles[variant] || styles.subtle;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: variant === 'numeric' ? s.padding : px,
      borderRadius: 999, fontSize: fs, fontWeight: 700,
      lineHeight: 1, ...s,
    }}>
      {variant !== 'numeric' && dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: variant === 'solid' ? 'rgba(255,255,255,0.7)' : t.dot, flexShrink: 0 }}/>}
      {children}
    </span>
  );
};

// Card
const Card = ({ children, style = {}, padding = 20, elevation = 'border' }) => {
  const ev = elevation === 'shadow'
    ? { boxShadow: 'var(--ob-shadow-md)' }
    : { border: '1px solid var(--ob-border)' };
  return (
    <div style={{ background: 'var(--ob-surface)', borderRadius: 'var(--ob-r-surface)', padding, ...ev, ...style }}>{children}</div>
  );
};

// Avatar
const Avatar = ({ name = 'OB', size = 32, color = 'var(--ob-blue)' }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', background: color,
    color: '#fff', fontSize: size * 0.4, fontWeight: 700, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flex: 'none',
  }}>{name.slice(0, 2).toUpperCase()}</div>
);

// ── Datepicker helpers ────────────────────────────────────
const dpFmt = (d) => {
  if (!d) return '';
  if (typeof d === 'string') { const [y,m,day]=d.split('-'); return `${day}/${m}/${y}`; }
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};
const dpParse = (str) => {
  if (!str || !/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return null;
  const [dd,mm,yyyy] = str.split('/').map(Number);
  if (mm<1||mm>12||dd<1||dd>31) return null;
  const d = new Date(yyyy, mm-1, dd);
  return (d.getDate()===dd && d.getMonth()===mm-1 && d.getFullYear()===yyyy) ? d : null;
};
const dpMask = (val) => {
  const digits = val.replace(/\D/g,'').slice(0,8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0,2)}/${digits.slice(2)}`;
  return `${digits.slice(0,2)}/${digits.slice(2,4)}/${digits.slice(4)}`;
};
const dpToIso = (d) => d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : null;

// Datepicker — manual entry + calendar
const Datepicker = ({ 
  singleDate = false,
  clearLabel = 'Limpar',
  defaultValues = { startDate: null, endDate: null },
  endDateLabel = 'até',
  onChange,
  onClear,
  resetOnSubmit = false,
  showSubmitButton = true,
  startDateLabel = 'de',
  onSubmit,
  submitLabel = 'Confirmar',
  values = { startDate: null, endDate: null },
  minBookingDate = null,
  maxBookingDays,
  label,
  hint,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(new Date());
  const [localValues, setLocalValues] = useState(values || defaultValues);
  const [startText, setStartText] = useState(dpFmt(values?.startDate || defaultValues?.startDate));
  const [endText, setEndText] = useState(dpFmt(values?.endDate || defaultValues?.endDate));
  const [startErr, setStartErr] = useState('');
  const [endErr, setEndErr] = useState('');
  const [startFocus, setStartFocus] = useState(false);
  const [endFocus, setEndFocus] = useState(false);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const daysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth(month) }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  // validate & apply typed start date
  const handleStartInput = (e) => {
    const masked = dpMask(e.target.value);
    setStartText(masked);
    if (masked.length < 10) { setStartErr(''); return; }
    const d = dpParse(masked);
    if (!d) { setStartErr('Data inválida'); return; }
    if (minBookingDate && d < minBookingDate) { setStartErr(`Mín: ${dpFmt(minBookingDate)}`); return; }
    setStartErr('');
    const iso = dpToIso(d);
    const newVals = { ...localValues, startDate: iso, endDate: null };
    setLocalValues(newVals);
    setEndText('');
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    onChange?.(newVals);
  };

  // validate & apply typed end date
  const handleEndInput = (e) => {
    const masked = dpMask(e.target.value);
    setEndText(masked);
    if (masked.length < 10) { setEndErr(''); return; }
    const d = dpParse(masked);
    if (!d) { setEndErr('Data inválida'); return; }
    if (localValues.startDate && dpToIso(d) < localValues.startDate) { setEndErr('Deve ser após data inicial'); return; }
    setEndErr('');
    const iso = dpToIso(d);
    const newVals = { ...localValues, endDate: iso };
    setLocalValues(newVals);
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    onChange?.(newVals);
  };

  const isInRange = (day) => {
    const dIso = `${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    if (!localValues.startDate || !localValues.endDate) return false;
    return dIso > localValues.startDate && dIso < localValues.endDate;
  };

  const handleDayClick = (day) => {
    const d = new Date(month.getFullYear(), month.getMonth(), day);
    const iso = dpToIso(d);
    if (singleDate) {
      const newVals = { startDate: iso, endDate: iso };
      setLocalValues(newVals); setStartText(dpFmt(d)); setStartErr('');
      onChange?.(newVals); setOpen(false);
    } else {
      if (!localValues.startDate || (localValues.startDate && localValues.endDate) || iso < localValues.startDate) {
        const newVals = { startDate: iso, endDate: null };
        setLocalValues(newVals); setStartText(dpFmt(d)); setEndText(''); setStartErr(''); setEndErr('');
        onChange?.(newVals);
      } else {
        const newVals = { ...localValues, endDate: iso };
        setLocalValues(newVals); setEndText(dpFmt(d)); setEndErr('');
        onChange?.(newVals); setOpen(false);
      }
    }
  };

  const handleClear = () => {
    const newVals = { startDate: null, endDate: null };
    setLocalValues(newVals); setStartText(''); setEndText(''); setStartErr(''); setEndErr('');
    onClear?.(); onChange?.(newVals);
  };

  const handleSubmit = () => {
    onSubmit?.(localValues.startDate, localValues.endDate);
    if (resetOnSubmit) handleClear();
    setOpen(false);
  };

  const prevMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1));
  const nextMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1));

  const handleInputClick = (e) => { e.stopPropagation(); setOpen(true); };

  const dpInputStyle = {
    flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
    fontFamily: 'inherit', fontSize: 14, color: 'var(--ob-fg-strong)', padding: '10px 0',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}
         onClick={(e) => e.stopPropagation()}>
      {label && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{label}</span>}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        {!singleDate ? (
          <>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ob-fg-soft)', marginBottom: 4 }}>{startDateLabel}</div>
              <FieldShell focused={startFocus} error={!!startErr} onClick={handleInputClick}>
                <input
                  type="text" value={startText} maxLength={10} placeholder="dd/mm/yyyy"
                  onChange={handleStartInput} onClick={handleInputClick}
                  onFocus={() => setStartFocus(true)} onBlur={() => setStartFocus(false)}
                  style={dpInputStyle}
                />
              </FieldShell>
              {startErr && <div style={{ fontSize: 11, color: 'var(--ob-danger)', marginTop: 4 }}>{startErr}</div>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ob-fg-soft)', marginBottom: 4 }}>{endDateLabel}</div>
              <FieldShell focused={endFocus} error={!!endErr} onClick={handleInputClick}>
                <input
                  type="text" value={endText} maxLength={10} placeholder="dd/mm/yyyy"
                  onChange={handleEndInput} onClick={handleInputClick}
                  onFocus={() => setEndFocus(true)} onBlur={() => setEndFocus(false)}
                  style={dpInputStyle}
                />
              </FieldShell>
              {endErr && <div style={{ fontSize: 11, color: 'var(--ob-danger)', marginTop: 4 }}>{endErr}</div>}
            </div>
          </>
        ) : (
          <div style={{ flex: 1 }}>
            <FieldShell focused={startFocus} error={!!startErr} onClick={handleInputClick}>
              <input
                type="text" value={startText} maxLength={10} placeholder="dd/mm/yyyy"
                onChange={handleStartInput} onClick={handleInputClick}
                onFocus={() => setStartFocus(true)} onBlur={() => setStartFocus(false)}
                style={dpInputStyle}
              />
            </FieldShell>
            {startErr && <div style={{ fontSize: 11, color: 'var(--ob-danger)', marginTop: 4 }}>{startErr}</div>}
          </div>
        )}
      </div>
      
      {open && (
        <div onClick={(e) => e.stopPropagation()} style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 8, background: 'var(--ob-surface)', border: '1px solid var(--ob-border)',
          borderRadius: 'var(--ob-r-surface)', padding: 16, boxShadow: 'var(--ob-shadow-lg)', zIndex: 'var(--ob-z-dropdown)', minWidth: 300,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: 'var(--ob-blue)', borderRadius: 'var(--ob-r-xs)' }}>←</button>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{monthNames[month.getMonth()]} {month.getFullYear()}</span>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: 'var(--ob-blue)', borderRadius: 'var(--ob-r-xs)' }}>→</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 10 }}>
            {['D','S','T','Q','Q','S','S'].map((d,i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--ob-fg-mute)', padding: '4px 0' }}>{d}</div>
            ))}
            {blanks.map((_, i) => <div key={`b-${i}`}/>)}
            {days.map(day => {
              const iso = `${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const isStart = iso === localValues.startDate;
              const isEnd   = iso === localValues.endDate;
              const inRange = isInRange(day);
              return (
                <button key={day} onClick={() => handleDayClick(day)} style={{
                  padding: '6px 0', borderRadius: 'var(--ob-r-xs)', border: 'none', textAlign: 'center',
                  background: isStart || isEnd ? 'var(--ob-blue)' : inRange ? 'var(--ob-blue-100)' : 'var(--ob-surface)',
                  color: isStart || isEnd ? '#fff' : 'var(--ob-fg-strong)',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'background 100ms',
                }}>{day}</button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--ob-border)', paddingTop: 10 }}>
            <Button kind="ghost" onClick={handleClear} style={{ flex: 1, fontSize: 12 }}>{clearLabel}</Button>
            {showSubmitButton && (
              <Button kind="primary" onClick={handleSubmit} style={{ flex: 1, fontSize: 12 }}>{submitLabel}</Button>
            )}
          </div>
        </div>
      )}
      {(hint || error) && <span style={{ fontSize: 11, color: error ? 'var(--ob-danger)' : 'var(--ob-fg-mute)', marginTop: 4 }}>{error || hint}</span>}
    </div>
  );
};

// ── SLIDER ──────────────────────────────────────────────────
const Slider = ({
  value, min = 0, max = 100, step = 1,
  onChange, label, hint, error, disabled = false,
  showValue = true, marks = false,
  tone = 'default',
  range = false,
}) => {
  const { useRef } = React;
  const trackRef    = useRef(null);
  const draggingRef = useRef(null); // null | 'lo' | 'hi'
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const lo = range ? (value?.[0] ?? min) : (value ?? min);
  const hi = range ? (value?.[1] ?? max) : null;

  const toneColor = tone === 'success' ? 'var(--ob-green)'
                  : tone === 'warning' ? 'var(--ob-orange)'
                  : tone === 'danger'  ? 'var(--ob-danger)'
                  : 'var(--ob-blue)';
  const toneRing  = tone === 'success' ? 'rgba(119,158,61,.28)'
                  : tone === 'warning' ? 'rgba(235,124,45,.28)'
                  : tone === 'danger'  ? 'rgba(214,54,54,.28)'
                  : 'var(--ob-focus-ring)';

  const clamp  = (v) => Math.min(max, Math.max(min, v));
  const snap   = (v) => Math.round((v - min) / step) * step + min;
  const pct    = (v) => ((v - min) / (max - min)) * 100;
  const fmt    = (v) => Number.isInteger(v) ? v : v.toFixed(1);

  const valFromX = (clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    return clamp(snap(min + ((clientX - rect.left) / rect.width) * (max - min)));
  };

  const applyVal = (which, v) => {
    const cb = onChangeRef.current;
    if (!cb) return;
    if (!range) { cb(v); return; }
    if (which === 'lo') cb([Math.min(v, hi), hi]);
    else                cb([lo, Math.max(v, lo)]);
  };

  // Drag: add/remove document listeners — survives re-renders
  const startDrag = (which, e) => {
    if (disabled) return;
    e.preventDefault();
    draggingRef.current = which;
    applyVal(which, valFromX(e.clientX));

    const onMove = (ev) => {
      if (!draggingRef.current) return;
      applyVal(draggingRef.current, valFromX(ev.clientX));
    };
    const onUp = () => {
      draggingRef.current = null;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  };

  const onKeyThumb = (which) => (e) => {
    if (disabled) return;
    const delta = e.shiftKey ? step * 10 : step;
    const cur   = which === 'hi' ? hi : lo;
    let next = cur;
    if      (e.key === 'ArrowRight' || e.key === 'ArrowUp')   next = clamp(cur + delta);
    else if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown') next = clamp(cur - delta);
    else if (e.key === 'Home') next = min;
    else if (e.key === 'End')  next = max;
    else return;
    e.preventDefault();
    applyVal(which, next);
  };

  const [loFocus, setLoFocus] = useState(false);
  const [hiFocus, setHiFocus] = useState(false);

  const thumbStyle = (val, focused) => ({
    position: 'absolute', top: '50%', left: `${pct(val)}%`,
    transform: 'translate(-50%, -50%)',
    width: 20, height: 20, borderRadius: '50%',
    background: 'var(--ob-surface)',
    border: `2px solid ${error ? 'var(--ob-danger)' : toneColor}`,
    boxShadow: focused
      ? `0 0 0 4px ${error ? 'rgba(214,54,54,.22)' : toneRing}, var(--ob-shadow-sm)`
      : 'var(--ob-shadow-sm)',
    cursor: disabled ? 'not-allowed' : 'grab',
    transition: 'box-shadow .15s',
    zIndex: 2, outline: 'none',
    opacity: disabled ? 0.5 : 1,
    boxSizing: 'border-box',
    touchAction: 'none', userSelect: 'none',
  });

  const fillLeft  = range ? pct(lo) : 0;
  const fillRight = range ? 100 - pct(hi) : 100 - pct(lo);

  const stepCount     = Math.round((max - min) / step);
  const markPositions = marks && stepCount <= 20
    ? Array.from({ length: stepCount + 1 }, (_, i) => min + i * step)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, opacity: disabled ? 0.6 : 1 }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{label}</span>}
          {showValue && (
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--ob-font-mono)', color: error ? 'var(--ob-danger)' : toneColor }}>
              {range ? `${fmt(lo)} – ${fmt(hi)}` : fmt(lo)}
            </span>
          )}
        </div>
      )}
      {/* Track — only handles click-to-jump, NOT drag */}
      <div ref={trackRef}
        style={{ position: 'relative', height: 20, cursor: disabled ? 'not-allowed' : 'pointer', touchAction: 'none', userSelect: 'none' }}
        onClick={(e) => {
          // Suppress click if we just finished a drag
          if (disabled || draggingRef.current) return;
          const v = valFromX(e.clientX);
          if (!range) { onChange?.(v); return; }
          const mid = (lo + hi) / 2;
          onChange?.(v <= mid ? [clamp(snap(v)), hi] : [lo, clamp(snap(v))]);
        }}>
        {/* Rail */}
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0,
          height: 5, transform: 'translateY(-50%)',
          background: 'var(--ob-bg-alt)', borderRadius: 999, overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${fillLeft}%`, right: `${fillRight}%`,
            background: error ? 'var(--ob-danger)' : toneColor, borderRadius: 999,
          }}/>
        </div>
        {/* Marks */}
        {markPositions.map((v) => (
          <div key={v} style={{
            position: 'absolute', top: '50%', left: `${pct(v)}%`,
            width: 4, height: 4, borderRadius: '50%',
            background: v <= lo ? 'var(--ob-surface)' : 'var(--ob-fg-mute)',
            transform: 'translate(-50%, -50%)', opacity: .7, zIndex: 1, pointerEvents: 'none',
          }}/>
        ))}
        {/* Thumb lo — onPointerDown only; drag handled via document listeners */}
        <div role="slider" tabIndex={disabled ? -1 : 0}
          aria-valuemin={min} aria-valuemax={max} aria-valuenow={lo}
          onPointerDown={(e) => { e.stopPropagation(); startDrag('lo', e); }}
          onKeyDown={onKeyThumb('lo')}
          onFocus={() => setLoFocus(true)} onBlur={() => setLoFocus(false)}
          style={thumbStyle(lo, loFocus)} />
        {/* Thumb hi (range only) */}
        {range && (
          <div role="slider" tabIndex={disabled ? -1 : 0}
            aria-valuemin={min} aria-valuemax={max} aria-valuenow={hi}
            onPointerDown={(e) => { e.stopPropagation(); startDrag('hi', e); }}
            onKeyDown={onKeyThumb('hi')}
            onFocus={() => setHiFocus(true)} onBlur={() => setHiFocus(false)}
            style={thumbStyle(hi, hiFocus)} />
        )}
      </div>
      {marks && markPositions.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <span style={{ fontSize: 10, color: 'var(--ob-fg-mute)', fontFamily: 'var(--ob-font-mono)' }}>{min}</span>
          <span style={{ fontSize: 10, color: 'var(--ob-fg-mute)', fontFamily: 'var(--ob-font-mono)' }}>{max}</span>
        </div>
      )}
      {(hint || error) && (
        <span style={{ fontSize: 11, color: error ? 'var(--ob-danger)' : 'var(--ob-fg-mute)' }}>{error || hint}</span>
      )}
    </div>
  );
};

// ── SPINNER ─────────────────────────────────────────────────
// Circular indeterminate loading indicator.
// size: 'xs'(12) | 'sm'(16) | 'md'(24) | 'lg'(40) | 'xl'(56)
// tone: 'default' | 'success' | 'warning' | 'danger' | 'muted'
const Spinner = ({ size = 'md', tone = 'default', label }) => {
  const px     = { xs: 12, sm: 16, md: 24, lg: 40, xl: 56 }[size] || 24;
  const sw     = px <= 16 ? 2 : px <= 24 ? 2.5 : 3.5;
  const r      = (px - sw * 2) / 2;
  const circ   = 2 * Math.PI * r;
  const color  = tone === 'success' ? 'var(--ob-green)'
               : tone === 'warning' ? 'var(--ob-orange)'
               : tone === 'danger'  ? 'var(--ob-danger)'
               : tone === 'muted'   ? 'var(--ob-fg-mute)'
               : 'var(--ob-blue)';
  return (
    <span role="status" aria-label={label || 'Carregando…'} aria-live="polite"
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} fill="none"
        style={{ animation: 'ob-spin 0.75s linear infinite' }}>
        <circle cx={px/2} cy={px/2} r={r} stroke={color} strokeOpacity="0.15" strokeWidth={sw} />
        <circle cx={px/2} cy={px/2} r={r} stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={`${circ * 0.72} ${circ * 0.28}`}
          transform={`rotate(-90 ${px/2} ${px/2})`} />
      </svg>
    </span>
  );
};

// ── PROGRESS CIRCLE ──────────────────────────────────────────
// Circular determinate progress indicator.
// value: 0–100
// size: 'sm'(32) | 'md'(48) | 'lg'(64) | 'xl'(96)
const ProgressCircle = ({ value = 0, size = 'md', tone = 'default', showLabel = true, label }) => {
  const px    = { sm: 32, md: 48, lg: 64, xl: 96 }[size] || 48;
  const sw    = px <= 32 ? 3.5 : px <= 48 ? 4.5 : px <= 64 ? 5 : 7;
  const r     = (px - sw * 2) / 2;
  const circ  = 2 * Math.PI * r;
  const v     = Math.min(100, Math.max(0, value));
  const offset = circ - (v / 100) * circ;
  const color = tone === 'success' ? 'var(--ob-green)'
              : tone === 'warning' ? 'var(--ob-orange)'
              : tone === 'danger'  ? 'var(--ob-danger)'
              : 'var(--ob-blue)';
  const fs    = px <= 32 ? 9 : px <= 48 ? 11 : px <= 64 ? 14 : 20;
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} fill="none" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={px/2} cy={px/2} r={r} stroke="var(--ob-bg-alt)" strokeWidth={sw} />
        <circle cx={px/2} cy={px/2} r={r} stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      {showLabel && (
        <span style={{ position: 'absolute', fontSize: fs, fontWeight: 700, fontFamily: 'var(--ob-font-mono)', color, lineHeight: 1 }}>
          {label || `${Math.round(v)}%`}
        </span>
      )}
    </span>
  );
};

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('ob-prim-kf')) {
  const s = document.createElement('style'); s.id = 'ob-prim-kf';
  s.textContent = '@keyframes ob-spin{to{transform:rotate(360deg)}}@keyframes ob-pulse{0%,100%{opacity:1}50%{opacity:.4}}';
  document.head.appendChild(s);
}

Object.assign(window, { Logo, Icons, Brands, BrandTile, Button, Input, Badge, Card, Avatar, Datepicker, FieldShell, Slider, Spinner, ProgressCircle });
