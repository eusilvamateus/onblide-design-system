/* global React */
const { useState } = React;

// ============================================================
// Onblide Web App — shared UI primitives
// ============================================================

// Brand logo — horizontal lockup (symbol + wordmark), artwork inlined so it
// stays self-contained in the standalone bundle. Fills follow the active
// theme through --ob-* tokens; `size` is the rendered height in px.
const Logo = ({ size = 28 }) => (
  <svg height={size} viewBox="0 0 2048 313.44" role="img" aria-label="Onblide"
       style={{ display: 'block', width: 'auto' }}>
    <path fill="var(--ob-orange)" d="M1987.58,167.4l-86.77.55c-2.19.01-3.95,1.82-3.92,4.02l.44,29.1c.03,2.16,1.78,3.89,3.93,3.9l75.19.3c11.7.05,22.71-.23,33.75-3.32,17.83-4.99,31.02-18.25,35.24-36.56,7.55-32.75-1.23-70.16-32.68-83.14-10.92-4.51-22.53-6.52-34.57-6.44l-77.96.49c-36.43.23-65.18,27.74-65.2,64.65l-.04,75.1c-.02,35.96,29.94,64.57,66.78,64.67l127.75.36c2.19,0,3.96-1.77,3.96-3.97l-.04-29.45c0-2.18-1.75-3.94-3.92-3.95l-125.87-.82c-17.73-.11-30.36-13.82-30.31-30.96l.17-68.46c.04-16.09,12.36-29.11,28.93-29.12l82.37-.04c16.82,0,25.03,13.46,24.81,28.14-.2,13.62-7.5,24.87-22.04,24.96Z"/>
    <path fill="var(--ob-orange)" d="M1440.12,243.07c-14.85-2.6-24.93-13.25-24.94-28.9l-.17-208.82c0-3.35-3.04-5.37-5.86-5.29l-25.76.76c-4.64.14-8.33,3.96-8.32,8.62l.56,210.95c.09,33.46,29.21,58.66,62.79,60.58,4.91.28,9.04-3.71,9.01-8.65l-.1-20.81c-.02-4.2-3.08-7.71-7.2-8.43Z"/>
    <rect fill="var(--ob-orange)" x="1486.02" y="74.72" width="39.9" height="206.69" rx="3.96" ry="3.96"/>
    <path fill="var(--ob-orange)" d="M1751.91,76.06c0,2.68-2.6,4.57-5.14,3.76-6.91-2.19-13.52-4.04-20.77-4l-89.78.49c-.1,0-.21,0-.31.01-34.28,2.12-62.34,27.17-62.32,61.92l.04,80.27c1.8,34.96,27.98,61.8,63.23,61.93l87.46.32c12.55.05,24.93-4.06,35.62-10.29,19.22-11.21,30.35-31.69,30.39-54.69l.34-210.82c0-2.19-1.76-3.97-3.94-3.97l-30.65-.02c-2.18,0-3.94,1.76-3.95,3.95l-.22,71.15ZM1751.63,214.34c-.01,14.83-11.57,28.11-27.31,28.15l-83.01.18c-16.25.04-29.38-11.94-29.38-28.48v-71.68c0-15.42,12.53-28.19,27.95-28.21l87.09-.1c11.93-.01,24.73,8.83,24.72,21.32l-.06,78.81Z"/>
    <path fill="var(--ob-orange)" d="M1265.57,76.35c-.13-.01-.27-.02-.4-.02l-82.74-1.23c-10.03-.15-19.36,1.39-28.33,4.09-2.52.76-5.04-1.12-5.06-3.76l-.47-70.72c-.01-2.13-1.71-3.87-3.83-3.93L1117.52,0c-2.42-.07-4.76.47-6.17,1.92-.97,1-1.76,3.19-1.75,5.85l.58,206.89c.1,36.14,26.75,63.42,62.46,65.55.11,0,.21,0,.32,0l93.47-.16c.12,0,.24,0,.36-.01,34.1-2.44,59.94-28.53,59.92-62.46l-.04-77.68c-.02-34.87-27.08-60.26-61.11-63.56ZM1260.67,242.51l-84.1-.04c-16.44,0-27.35-13.73-27.38-29.11l-.16-78.82c-.02-11.25,8.43-20.42,20.27-20.43l89.31-.06c16.28-.01,29.35,11.89,29.42,28.59l.27,70.05c.06,15.37-10.76,29.83-27.62,29.82Z"/>
    <path fill="var(--ob-fg-strong)" d="M1000.72,77.03c-.12,0-.24-.01-.37-.01l-91.12-.14c-35.16,1.79-62.75,28.43-62.83,64.14l-.3,135.62c0,2.17,1.74,3.95,3.9,3.97l30.56.32c2.19.02,3.98-1.75,3.99-3.95l.19-130.57c.03-17.78,11.52-31.93,29.9-31.92l81.54.04c16.96,0,28.39,13.07,28.45,29.09l.52,133.14c0,2.18,1.77,3.94,3.94,3.95l31.06.02c2.19,0,3.96-1.79,3.95-3.99l-.84-137.75c-1.87-34.45-29.02-59.53-62.55-61.96Z"/>
    <path fill="var(--ob-fg-strong)" d="M730.8,76l-81.42.28c-36.39.13-65.56,27.48-65.57,64.32l-.03,75.62c-.01,35.84,27.1,61.89,62.78,64.02l89.24.28c35.67.11,65.11-29.43,65.07-66.16l-.08-73.61c-.04-36.72-30.12-64.89-69.98-64.75ZM732.75,242.68l-81.24-.08c-16.83-.02-29.52-13.47-29.51-29.99l.02-68.48c0-16.42,12.74-29.85,29.53-29.86l81.87-.05c16.11,0,28.92,12.51,28.94,28.79l.08,70.83c.02,16.22-12.74,28.85-29.68,28.84Z"/>
    <path fill="var(--ob-blue)" d="M369.5,1.88l-61.66-.08c-2.13,0-3.86,1.73-3.86,3.87l.04,39.82c0,2.13,1.72,3.86,3.85,3.86l58.32.09c23.07.68,41.94,17.96,42.07,42.03l.68,129.22c0,.13,0,.27-.01.4-1.9,25.38-19.34,44.14-44.65,44.14h-126.57c-2.13.02-3.86-1.72-3.85-3.86l.22-123.87c0-5.44,1.61-10.91,7.91-12.21,6.99-1.44,14.25-14.11,14.29-21.1l.53-98.63c.01-2.15-1.72-3.89-3.85-3.89l-166.28.1C39.73,1.81.62,39.06.46,86.45L0,222.76c-.17,49.18,36.29,87.69,85.15,90.13l70.09.33c2.14.01,3.87-1.73,3.87-3.87l-.05-40.23c0-2.13-1.72-3.86-3.84-3.86l-66.81-.15c-24.25-.33-44.2-18.73-44.21-44.2l-.04-126.11c0-24.75,19.93-44.84,44.58-44.93l127.09-.44c2.14,0,3.87,1.73,3.87,3.87l-.09,50.97c-.07,5.02-12.21,10.56-12.21,10.56-6.47,3.79-9.74,10.01-9.74,17.8l-.03,176.96c0,2.14,1.74,3.88,3.87,3.87l167.48-.85c47.55-.24,81.92-39.4,84.16-86.97l-.36-137.8c-.12-46.74-37.16-83.34-83-85.94-.09,0-.19,0-.28,0Z"/>
  </svg>
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

const BADGE_TONES = {
  blue:   { bg: 'var(--ob-blue-100)',    fg: 'var(--ob-blue-700)',    dot: 'var(--ob-blue)',    solid: 'var(--ob-blue)',    border: 'color-mix(in srgb, var(--ob-blue) 35%, transparent)' },
  green:  { bg: 'var(--ob-green-100)',   fg: 'var(--ob-green-700)',   dot: 'var(--ob-green)',   solid: 'var(--ob-green)',   border: 'color-mix(in srgb, var(--ob-green) 35%, transparent)' },
  orange: { bg: 'color-mix(in srgb, var(--ob-orange) 15%, var(--ob-surface))', fg: '#9a4000', dot: 'var(--ob-orange)', solid: 'var(--ob-orange)', border: 'color-mix(in srgb, var(--ob-orange) 45%, transparent)' },
  red:    { bg: 'var(--ob-danger-bg)',   fg: 'var(--ob-danger)',      dot: 'var(--ob-danger)',  solid: 'var(--ob-danger)',  border: 'color-mix(in srgb, var(--ob-danger) 40%, transparent)' },
  grey:   { bg: 'var(--ob-bg-warm)',     fg: 'var(--ob-fg-soft)',     dot: 'var(--ob-fg-mute)', solid: 'var(--ob-fg-mute)', border: 'var(--ob-border)' },
};

// StatusDot — decorativo; comunica o tom junto de um rótulo visível.
const StatusDot = ({ tone = 'blue' }) => {
  const color = (BADGE_TONES[tone] || BADGE_TONES.blue).dot;
  return <span aria-hidden="true" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }}/>;
};

// Badge — variant: subtle (default) | solid | outline | numeric
const Badge = ({ tone = 'blue', variant = 'subtle', dot = true, size = 'md', children }) => {
  const t = BADGE_TONES[tone] || BADGE_TONES.blue;
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

// ── DEADLINE CALENDAR ───────────────────────────────────────
// Read-only operational calendar for lead-time phases. Dates use yyyy-mm-dd.
const DeadlineCalendar = ({
  referenceDate,
  production = null,
  delivery = null,
  estimatedDate = '',
  holidays = [],
  holidayCoverage = 'national',
  deliveryPending = false,
}) => {
  const parse = (value) => {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12) : null;
  };
  const iso = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const monthKey = (date) => date.getFullYear() * 12 + date.getMonth();
  const reference = parse(referenceDate) || new Date();
  const finish = parse(estimatedDate) || parse(production?.endDate) || reference;
  const minMonth = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const maxMonth = new Date(finish.getFullYear(), finish.getMonth(), 1);
  const [month, setMonth] = useState(minMonth);
  React.useEffect(() => setMonth(minMonth), [referenceDate]);
  const activeMonth = monthKey(month) < monthKey(minMonth) ? minMonth : monthKey(month) > monthKey(maxMonth) ? maxMonth : month;
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const weekdayNames = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const holidayMap = Object.fromEntries((holidays || []).map((holiday) => [holiday.date, holiday]));
  const inPhase = (date, phase) => phase?.startDate && phase?.endDate && date >= phase.startDate && date <= phase.endDate;
  const firstDay = new Date(activeMonth.getFullYear(), activeMonth.getMonth(), 1).getDay();
  const days = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 0).getDate();
  const buttonStyle = (disabled) => ({
    width: 28, height: 28, display: 'grid', placeItems: 'center', padding: 0,
    border: '1px solid var(--ob-border)', borderRadius: 'var(--ob-r-sm)', background: 'var(--ob-surface)',
    color: 'var(--ob-fg-strong)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .45 : 1,
  });
  const legend = (color, label, border) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--ob-fg-soft)', fontSize: 10 }}><i style={{ width: 8, height: 8, borderRadius: 3, background: color || 'transparent', border: border || 'none' }} />{label}</span>;

  return (
    <section aria-label="Calendário de prazos" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 12, border: '1px solid var(--ob-border)', borderRadius: 'var(--ob-r-surface)', background: 'var(--ob-surface)' }}>
      <strong style={{ color: 'var(--ob-fg-strong)', fontSize: 12 }}><i className="ph ph-calendar-blank" aria-hidden="true" /> Calendário de prazos</strong>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <button type="button" aria-label="Mês anterior" disabled={monthKey(activeMonth) <= monthKey(minMonth)} onClick={() => setMonth(new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1))} style={buttonStyle(monthKey(activeMonth) <= monthKey(minMonth))}><i className="ph ph-caret-left" aria-hidden="true" /></button>
        <strong aria-live="polite" style={{ minWidth: 142, color: 'var(--ob-fg-strong)', fontSize: 12, textAlign: 'center' }}>{monthNames[activeMonth.getMonth()]} de {activeMonth.getFullYear()}</strong>
        <button type="button" aria-label="Próximo mês" disabled={monthKey(activeMonth) >= monthKey(maxMonth)} onClick={() => setMonth(new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1))} style={buttonStyle(monthKey(activeMonth) >= monthKey(maxMonth))}><i className="ph ph-caret-right" aria-hidden="true" /></button>
      </div>
      <div aria-hidden="true" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 3 }}>{weekdayNames.map((name, index) => <span key={`${name}-${index}`} style={{ color: 'var(--ob-fg-mute)', fontFamily: 'var(--ob-font-mono)', fontSize: 9, fontWeight: 700, textAlign: 'center' }}>{name}</span>)}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 3 }}>
        {Array.from({ length: firstDay }).map((_, index) => <span key={`blank-${index}`} aria-hidden="true" style={{ minHeight: 28 }} />)}
        {Array.from({ length: days }, (_, index) => index + 1).map((day) => {
          const date = new Date(activeMonth.getFullYear(), activeMonth.getMonth(), day, 12);
          const key = iso(date); const holiday = holidayMap[key]; const weekend = date.getDay() === 0 || date.getDay() === 6;
          const productionDay = !weekend && !holiday && inPhase(key, production);
          const deliveryDay = !weekend && !holiday && inPhase(key, delivery);
          const estimated = key === estimatedDate;
          return <span key={key} title={holiday ? `Feriado nacional: ${holiday.name}` : estimated ? 'Data estimada de entrega' : undefined} aria-label={`${day} de ${monthNames[activeMonth.getMonth()]}${holiday ? ` · Feriado nacional: ${holiday.name}` : ''}${estimated ? ' · Data estimada de entrega' : ''}`} style={{ minHeight: 28, display: 'grid', placeItems: 'center', position: 'relative', borderRadius: 6, background: holiday ? 'var(--ob-warning-bg)' : deliveryDay ? 'var(--ob-success-bg)' : productionDay ? 'var(--ob-blue-100)' : weekend ? 'var(--ob-bg-alt)' : 'transparent', color: holiday ? 'var(--ob-orange-700)' : deliveryDay ? 'var(--ob-green-700)' : productionDay ? 'var(--ob-blue-700)' : weekend ? 'var(--ob-fg-mute)' : 'var(--ob-fg)', boxShadow: estimated ? 'inset 0 0 0 2px var(--ob-green-700)' : key === referenceDate ? 'inset 0 0 0 1px var(--ob-blue)' : 'none', fontSize: 11, fontWeight: estimated ? 800 : 600, cursor: holiday ? 'help' : 'default' }}>{day}{estimated && <i aria-hidden="true" style={{ width: 5, height: 5, position: 'absolute', right: 3, bottom: 3, borderRadius: '50%', background: 'var(--ob-green-700)' }} />}</span>;
        })}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 9px' }}>{legend('var(--ob-blue-100)', 'Produção')}{legend('var(--ob-success-bg)', 'Transporte')}{legend(null, 'Entrega prevista', '2px solid var(--ob-green-700)')}{legend('var(--ob-warning-bg)', 'Feriado')}</div>
      <p style={{ margin: 0, color: holidayCoverage === 'national' ? 'var(--ob-fg-soft)' : 'var(--ob-orange-700)', fontSize: 10, lineHeight: 1.4 }}>{deliveryPending ? 'Selecione uma opção de frete para visualizar a data estimada de entrega.' : !estimatedDate ? 'Retirada combinada: sem prazo de transporte.' : holidayCoverage === 'national' ? 'Previsão considera fins de semana e feriados nacionais.' : 'Feriados nacionais indisponíveis; a previsão considera somente fins de semana.'}</p>
    </section>
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

Object.assign(window, { Logo, Icons, Brands, BrandTile, Button, Input, StatusDot, Badge, Card, Avatar, Datepicker, FieldShell, Slider, DeadlineCalendar, Spinner, ProgressCircle });
