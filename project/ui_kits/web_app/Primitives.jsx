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
    fontFamily: 'inherit', fontWeight: 600, border: 'none', borderRadius: 10,
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

// Form input
const Input = ({ label, hint, error, icon, ...rest }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{label}</span>}
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ob-fg-mute)' }}>{icon}</span>}
      <input
        {...rest}
        style={{
          width: '100%', padding: icon ? '10px 14px 10px 38px' : '10px 14px',
          borderRadius: 10, border: `1.5px solid ${error ? 'var(--ob-danger)' : 'var(--ob-border)'}`,
          fontFamily: 'inherit', fontSize: 14, color: 'var(--ob-fg-strong)', background: 'var(--ob-surface)',
          boxSizing: 'border-box', outline: 'none',
        }}
        onFocus={(e) => { if (!error) e.target.style.borderColor = 'var(--ob-blue)'; }}
        onBlur={(e) => { if (!error) e.target.style.borderColor = 'var(--ob-border)'; }}
      />
    </div>
    {(hint || error) && <span style={{ fontSize: 11, color: error ? 'var(--ob-danger)' : 'var(--ob-fg-mute)' }}>{error || hint}</span>}
  </label>
);

// Badge
const Badge = ({ tone = 'blue', children }) => {
  const tones = {
    blue:   { bg: 'var(--ob-blue-100)', fg: 'var(--ob-blue-700)', dot: 'var(--ob-blue)' },
    green:  { bg: 'var(--ob-green-100)', fg: 'var(--ob-green-700)', dot: 'var(--ob-green)' },
    orange: { bg: 'var(--ob-orange-100)', fg: 'var(--ob-orange-700)', dot: 'var(--ob-orange)' },
    red:    { bg: 'var(--ob-danger-bg)', fg: 'var(--ob-danger)', dot: 'var(--ob-danger)' },
    grey:   { bg: 'var(--ob-bg-warm)', fg: 'var(--ob-fg)', dot: 'var(--ob-fg-mute)' },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px',
      borderRadius: 999, fontSize: 12, fontWeight: 600, background: t.bg, color: t.fg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot }} />
      {children}
    </span>
  );
};

// Card
const Card = ({ children, style = {}, padding = 20, elevation = 'border' }) => {
  const ev = elevation === 'shadow'
    ? { boxShadow: '0 4px 12px rgba(20,20,20,0.06), 0 1px 3px rgba(20,20,20,0.04)' }
    : { border: '1px solid var(--ob-border)' };
  return (
    <div style={{ background: 'var(--ob-surface)', borderRadius: 12, padding, ...ev, ...style }}>{children}</div>
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

  const inputStyle = (hasErr) => ({
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: `1.5px solid ${hasErr ? 'var(--ob-danger)' : 'var(--ob-border)'}`,
    fontFamily: 'inherit', fontSize: 14, color: 'var(--ob-fg-strong)', background: 'var(--ob-surface)',
    boxSizing: 'border-box', outline: 'none', transition: 'border-color 160ms, box-shadow 160ms',
  });

  const handleInputClick = (e) => { e.stopPropagation(); setOpen(true); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}
         onClick={(e) => e.stopPropagation()}>
      {label && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{label}</span>}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        {!singleDate ? (
          <>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ob-fg-soft)', marginBottom: 4 }}>{startDateLabel}</div>
              <input
                type="text" value={startText} maxLength={10} placeholder="dd/mm/yyyy"
                onChange={handleStartInput} onClick={handleInputClick}
                style={inputStyle(!!startErr)}
                onFocus={(e) => { if (!startErr) e.target.style.borderColor='var(--ob-blue)'; e.target.style.boxShadow='0 0 0 4px rgba(10,78,228,0.16)'; }}
                onBlur={(e) => { e.target.style.borderColor=startErr?'var(--ob-danger)':'var(--ob-border)'; e.target.style.boxShadow='none'; }}
              />
              {startErr && <div style={{ fontSize: 11, color: 'var(--ob-danger)', marginTop: 4 }}>{startErr}</div>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ob-fg-soft)', marginBottom: 4 }}>{endDateLabel}</div>
              <input
                type="text" value={endText} maxLength={10} placeholder="dd/mm/yyyy"
                onChange={handleEndInput} onClick={handleInputClick}
                style={inputStyle(!!endErr)}
                onFocus={(e) => { if (!endErr) e.target.style.borderColor='var(--ob-blue)'; e.target.style.boxShadow='0 0 0 4px rgba(10,78,228,0.16)'; }}
                onBlur={(e) => { e.target.style.borderColor=endErr?'var(--ob-danger)':'var(--ob-border)'; e.target.style.boxShadow='none'; }}
              />
              {endErr && <div style={{ fontSize: 11, color: 'var(--ob-danger)', marginTop: 4 }}>{endErr}</div>}
            </div>
          </>
        ) : (
          <div style={{ flex: 1 }}>
            <input
              type="text" value={startText} maxLength={10} placeholder="dd/mm/yyyy"
              onChange={handleStartInput} onClick={handleInputClick}
              style={inputStyle(!!startErr)}
              onFocus={(e) => { if (!startErr) e.target.style.borderColor='var(--ob-blue)'; e.target.style.boxShadow='0 0 0 4px rgba(10,78,228,0.16)'; }}
              onBlur={(e) => { e.target.style.borderColor=startErr?'var(--ob-danger)':'var(--ob-border)'; e.target.style.boxShadow='none'; }}
            />
            {startErr && <div style={{ fontSize: 11, color: 'var(--ob-danger)', marginTop: 4 }}>{startErr}</div>}
          </div>
        )}
      </div>
      
      {open && (
        <div onClick={(e) => e.stopPropagation()} style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 8, background: 'var(--ob-surface)', border: '1px solid var(--ob-border)',
          borderRadius: 12, padding: 16, boxShadow: '0 8px 24px rgba(20,20,20,0.12)', zIndex: 1000, minWidth: 300,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: 'var(--ob-blue)', borderRadius: 6 }}>←</button>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{monthNames[month.getMonth()]} {month.getFullYear()}</span>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: 'var(--ob-blue)', borderRadius: 6 }}>→</button>
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
                  padding: '6px 0', borderRadius: 6, border: 'none', textAlign: 'center',
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

Object.assign(window, { Logo, Icons, Brands, BrandTile, Button, Input, Badge, Card, Avatar, Datepicker });
