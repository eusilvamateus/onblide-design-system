/* @ds-bundle: {"format":3,"namespace":"OnblideDesignSystem_019e06","components":[],"sourceHashes":{"slides/deck-stage.js":"aa08491f8fd6","ui_kits/web_app/Chrome.jsx":"f955caedf262","ui_kits/web_app/Components.jsx":"ad29188d90e7","ui_kits/web_app/Primitives.jsx":"87ca058a39f4","ui_kits/web_app/Screens.jsx":"63fd3faf9e4e","ui_kits/web_app/tweaks-panel.jsx":"a1107c630a56"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.OnblideDesignSystem_019e06 = window.OnblideDesignSystem_019e06 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// slides/deck-stage.js
try { (() => {
/**
 * <deck-stage> — reusable web component for HTML decks.
 *
 * Handles:
 *  (a) speaker notes — reads <script type="application/json" id="speaker-notes">
 *      and posts {slideIndexChanged: N} to the parent window on nav.
 *  (b) keyboard navigation — ←/→, PgUp/PgDn, Space, Home/End, number keys.
 *  (c) press R to reset to slide 0 (with a tasteful keyboard hint).
 *  (d) bottom-center overlay showing slide count + hints, fades out on idle.
 *  (e) auto-scaling — inner canvas is a fixed design size (default 1920×1080)
 *      scaled with `transform: scale()` to fit the viewport, letterboxed.
 *      Set the `noscale` attribute to render at authored size (1:1) — the
 *      PPTX exporter sets this so its DOM capture sees unscaled geometry.
 *  (f) print — `@media print` lays every slide out as its own page at the
 *      design size, so the browser's Print → Save as PDF produces a clean
 *      one-page-per-slide PDF with no extra setup.
 *  (g) thumbnail rail — resizable left-hand column of per-slide thumbnails
 *      (static clones). Click to navigate; ↑/↓ with a thumbnail focused to
 *      step between slides; drag to reorder; right-click for
 *      Skip / Move up / Move down / Delete (opens a Cancel/Delete confirm
 *      dialog). Drag the rail's right edge to resize; width persists to
 *      localStorage. Skipped slides carry `data-deck-skip`, are dimmed in
 *      the rail, omitted from prev/next navigation, and hidden at print.
 *      The rail is suppressed in presenting mode, on `noscale`, and via
 *      the `no-rail` attribute. Rail mutations dispatch a `deckchange`
 *      CustomEvent on the element: detail = {action, from, to, slide}.
 *
 * Slides are HIDDEN, not unmounted. Non-active slides stay in the DOM with
 * `visibility: hidden` + `opacity: 0`, so their state (videos, iframes,
 * form inputs, React trees) is preserved across navigation.
 *
 * Lifecycle event — the component dispatches a `slidechange` CustomEvent on
 * itself whenever the active slide changes (including the initial mount).
 * The event bubbles and composes out of shadow DOM, so you can listen on
 * the <deck-stage> element or on document:
 *
 *   document.querySelector('deck-stage').addEventListener('slidechange', (e) => {
 *     e.detail.index         // new 0-based index
 *     e.detail.previousIndex // previous index, or -1 on init
 *     e.detail.total         // total slide count
 *     e.detail.slide         // the new active slide element
 *     e.detail.previousSlide // the prior slide element, or null on init
 *     e.detail.reason        // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
 *   });
 *
 * Persistence: none at the deck level. The host app keeps the current slide
 * in its own URL (?slide=) and re-delivers it via location.hash on load, so a
 * bare load with no hash always starts at slide 1.
 *
 * Usage:
 *   <style>deck-stage:not(:defined){visibility:hidden}</style>
 *   <deck-stage width="1920" height="1080">
 *     <section data-label="Title">...</section>
 *     <section data-label="Agenda">...</section>
 *   </deck-stage>
 *   <script src="deck-stage.js"></script>
 *
 * The :not(:defined) rule prevents a flash of the first slide at its
 * authored styles before this script runs and attaches the shadow root.
 *
 * Slides are the direct element children of <deck-stage>. Each slide is
 * automatically tagged with:
 *   - data-screen-label="NN Label"   (1-indexed, for comment flow)
 *   - data-om-validate="no_overflowing_text,no_overlapping_text,slide_sized_text"
 */

(() => {
  const DESIGN_W_DEFAULT = 1920;
  const DESIGN_H_DEFAULT = 1080;
  const OVERLAY_HIDE_MS = 1800;
  const VALIDATE_ATTR = 'no_overflowing_text,no_overlapping_text,slide_sized_text';
  const pad2 = n => String(n).padStart(2, '0');
  const stylesheet = `
    :host {
      position: fixed;
      inset: 0;
      display: block;
      background: #000;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
      overflow: hidden;
    }

    .stage {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .canvas {
      position: relative;
      transform-origin: center center;
      flex-shrink: 0;
      background: #fff;
      will-change: transform;
    }

    /* Slides live in light DOM (via <slot>) so authored CSS still applies.
       We absolutely position each slotted child to stack them. */
    ::slotted(*) {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      box-sizing: border-box !important;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
    }
    ::slotted([data-deck-active]) {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
    }

    /* Tap zones for mobile — back/forward thirds like Stories.
       Transparent, no visible UI, don't block the overlay. */
    .tapzones {
      position: fixed;
      inset: 0;
      display: flex;
      z-index: 2147482000;
      pointer-events: none;
    }
    .tapzone {
      flex: 1;
      pointer-events: auto;
      -webkit-tap-highlight-color: transparent;
    }
    /* Only activate tap zones on coarse pointers (touch devices). */
    @media (hover: hover) and (pointer: fine) {
      .tapzones { display: none; }
    }

    .overlay {
      position: fixed;
      left: 50%;
      bottom: 22px;
      transform: translate(-50%, 6px) scale(0.92);
      filter: blur(6px);
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      background: #000;
      color: #fff;
      border-radius: 999px;
      font-size: 12px;
      font-feature-settings: "tnum" 1;
      letter-spacing: 0.01em;
      opacity: 0;
      pointer-events: none;
      transition: opacity 260ms ease, transform 260ms cubic-bezier(.2,.8,.2,1), filter 260ms ease;
      transform-origin: center bottom;
      z-index: 2147483000;
      user-select: none;
    }
    .overlay[data-visible] {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, 0) scale(1);
      filter: blur(0);
    }

    .btn {
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
      border: 0;
      margin: 0;
      padding: 0;
      color: inherit;
      font: inherit;
      cursor: default;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      min-width: 28px;
      border-radius: 999px;
      color: rgba(255,255,255,0.72);
      transition: background 140ms ease, color 140ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    .btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
    .btn:active { background: rgba(255,255,255,0.18); }
    .btn:focus { outline: none; }
    .btn:focus-visible { outline: none; }
    .btn::-moz-focus-inner { border: 0; }
    .btn svg { width: 14px; height: 14px; display: block; }
    .btn.reset {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.02em;
      padding: 0 10px 0 12px;
      gap: 6px;
      color: rgba(255,255,255,0.72);
    }
    .btn.reset .kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      font-size: 10px;
      line-height: 1;
      color: rgba(255,255,255,0.88);
      background: rgba(255,255,255,0.12);
      border-radius: 4px;
    }

    .count {
      font-variant-numeric: tabular-nums;
      color: #fff;
      font-weight: 500;
      padding: 0 8px;
      min-width: 42px;
      text-align: center;
      font-size: 12px;
    }
    .count .sep { color: rgba(255,255,255,0.45); margin: 0 3px; font-weight: 400; }
    .count .total { color: rgba(255,255,255,0.55); }

    .divider {
      width: 1px;
      height: 14px;
      background: rgba(255,255,255,0.18);
      margin: 0 2px;
    }

    /* ── Thumbnail rail ──────────────────────────────────────────────────
       Fixed column on the left; each thumbnail is a static deep-clone of
       the light-DOM slide scaled into a 16:9 (or design-aspect) frame. The
       stage re-fits around it (see _fit); hidden during present / noscale
       / print so capture geometry and fullscreen output are unchanged. */
    .rail {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--deck-rail-w, 188px);
      background: #141414;
      border-right: 1px solid rgba(255,255,255,0.08);
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px 10px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 2147482500;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.18) transparent;
    }
    .rail::-webkit-scrollbar { width: 8px; }
    .rail::-webkit-scrollbar-track { background: transparent; margin: 2px; }
    .rail::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.18);
      border-radius: 4px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    .rail::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.28);
      border: 2px solid transparent;
      background-clip: content-box;
    }
    :host([no-rail]) .rail,
    :host([noscale]) .rail { display: none; }
    .rail[data-presenting] { display: none; }
    /* User-driven show/hide (the TweaksPanel toggle) slides instead of
       popping. Transitions are gated on :host([data-rail-anim]) — set only
       for the 200ms around the toggle — so window-resize and rail-width
       drag (which also call _fit) don't lag behind the cursor. */
    .rail[data-user-hidden] { transform: translateX(-100%); }
    :host([data-rail-anim]) .rail { transition: transform 200ms cubic-bezier(.3,.7,.4,1); }
    :host([data-rail-anim]) .stage { transition: left 200ms cubic-bezier(.3,.7,.4,1); }
    :host([data-rail-anim]) .canvas { transition: transform 200ms cubic-bezier(.3,.7,.4,1); }
    /* transition shorthand replaces rather than merges — repeat the base
       .overlay opacity/transform/filter transitions so visibility changes
       during the 200ms toggle window still fade instead of popping. */
    :host([data-rail-anim]) .overlay {
      transition: margin-left 200ms cubic-bezier(.3,.7,.4,1),
                  opacity 260ms ease,
                  transform 260ms cubic-bezier(.2,.8,.2,1),
                  filter 260ms ease;
    }
    :host([data-rail-anim]) .tapzones { transition: left 200ms cubic-bezier(.3,.7,.4,1); }

    .thumb {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }
    .thumb .num {
      width: 16px;
      flex-shrink: 0;
      font-size: 11px;
      font-weight: 500;
      text-align: right;
      color: rgba(255,255,255,0.55);
      padding-top: 2px;
      font-variant-numeric: tabular-nums;
    }
    .thumb .frame {
      position: relative;
      flex: 1;
      min-width: 0;
      aspect-ratio: var(--deck-aspect);
      background: #fff;
      border-radius: 4px;
      outline: 2px solid transparent;
      outline-offset: 0;
      overflow: hidden;
      transition: outline-color 120ms ease;
    }
    .thumb:hover .frame { outline-color: rgba(255,255,255,0.25); }
    .thumb { outline: none; }
    .thumb:focus-visible .frame { outline-color: rgba(255,255,255,0.5); }
    .thumb[data-current] .num { color: #fff; }
    .thumb[data-current] .frame { outline-color: #D97757; }
    .thumb[data-dragging] { opacity: 0.35; }
    .thumb::before {
      content: '';
      position: absolute;
      left: 24px;
      right: 0;
      height: 3px;
      border-radius: 2px;
      background: #D97757;
      opacity: 0;
      pointer-events: none;
    }
    .thumb[data-drop="before"]::before { top: -8px; opacity: 1; }
    .thumb[data-drop="after"]::before { bottom: -8px; opacity: 1; }
    .thumb[data-skip] .frame { opacity: 0.35; }
    .thumb[data-skip] .frame::after {
      content: 'Skipped';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.45);
      color: #fff;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.04em;
    }

    .ctxmenu {
      position: fixed;
      min-width: 150px;
      padding: 4px;
      background: #242424;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 7px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45);
      z-index: 2147483100;
      display: none;
      font-size: 12px;
    }
    .ctxmenu[data-open] { display: block; }
    .ctxmenu button {
      display: block;
      width: 100%;
      appearance: none;
      border: 0;
      background: transparent;
      color: #e8e8e8;
      font: inherit;
      text-align: left;
      padding: 6px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
    .ctxmenu button:hover:not(:disabled) { background: rgba(255,255,255,0.08); }
    .ctxmenu button:disabled { opacity: 0.35; cursor: default; }
    .ctxmenu hr {
      border: 0;
      border-top: 1px solid rgba(255,255,255,0.1);
      margin: 4px 2px;
    }

    .rail-resize {
      position: fixed;
      left: calc(var(--deck-rail-w, 188px) - 3px);
      top: 0;
      bottom: 0;
      width: 6px;
      cursor: col-resize;
      z-index: 2147482600;
      touch-action: none;
    }
    .rail-resize:hover,
    .rail-resize[data-dragging] { background: rgba(255,255,255,0.12); }
    :host([no-rail]) .rail-resize,
    :host([noscale]) .rail-resize,
    .rail[data-presenting] + .rail-resize,
    .rail[data-user-hidden] + .rail-resize { display: none; }

    /* Delete-confirm popup — matches the SPA's ConfirmDialog layout
       (title + message body, depressed footer with Cancel / Delete). */
    .confirm-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 2147483200;
      display: none;
      align-items: center;
      justify-content: center;
    }
    .confirm-backdrop[data-open] { display: flex; }
    .confirm {
      width: 320px;
      max-width: calc(100vw - 32px);
      background: #2a2a2a;
      color: #e8e8e8;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.5);
      overflow: hidden;
      font-family: inherit;
      animation: deck-confirm-in 0.18s ease;
    }
    @keyframes deck-confirm-in {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .confirm .body { padding: 20px 20px 16px; }
    .confirm .title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .confirm .msg { font-size: 13px; line-height: 1.5; color: rgba(255,255,255,0.65); }
    .confirm .footer {
      padding: 14px 20px;
      background: #1f1f1f;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .confirm button {
      appearance: none;
      font: inherit;
      font-size: 13px;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
    }
    .confirm .cancel {
      background: transparent;
      border: 0;
      color: rgba(255,255,255,0.8);
    }
    .confirm .cancel:hover { background: rgba(255,255,255,0.08); }
    .confirm .danger {
      background: #c96442;
      border: 1px solid rgba(0,0,0,0.15);
      color: #fff;
      box-shadow: 0 1px 3px rgba(166,50,68,0.3), 0 2px 6px rgba(166,50,68,0.18);
    }
    .confirm .danger:hover { background: #b5563a; }

    /* ── Print: one page per slide, no chrome ────────────────────────────
       The screen layout stacks every slide at inset:0 inside a scaled
       canvas; for print we want them in document flow at the authored
       design size so the browser paginates one slide per sheet. The
       @page size is set from the width/height attributes via the inline
       <style id="deck-stage-print-page"> that connectedCallback injects
       into <head> (the @page at-rule has no effect inside shadow DOM). */
    @media print {
      :host {
        position: static;
        inset: auto;
        background: none;
        overflow: visible;
        color: inherit;
      }
      .stage { position: static; display: block; }
      .canvas {
        transform: none !important;
        width: auto !important;
        height: auto !important;
        background: none;
        will-change: auto;
      }
      ::slotted(*) {
        position: relative !important;
        inset: auto !important;
        width: var(--deck-design-w) !important;
        height: var(--deck-design-h) !important;
        box-sizing: border-box !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto;
        break-after: page;
        page-break-after: always;
        break-inside: avoid;
        overflow: hidden;
      }
      /* :last-child alone isn't enough once data-deck-skip hides the
         trailing slide(s) — the last *visible* slide still carries
         break-after:page and prints a blank sheet. _markLastVisible()
         maintains data-deck-last-visible on the last non-skipped slide. */
      ::slotted(*:last-child),
      ::slotted([data-deck-last-visible]) {
        break-after: auto;
        page-break-after: auto;
      }
      ::slotted([data-deck-skip]) { display: none !important; }
      .overlay, .tapzones, .rail, .rail-resize, .ctxmenu, .confirm-backdrop { display: none !important; }
    }
  `;
  class DeckStage extends HTMLElement {
    static get observedAttributes() {
      return ['width', 'height', 'noscale', 'no-rail'];
    }
    constructor() {
      super();
      this._root = this.attachShadow({
        mode: 'open'
      });
      this._index = 0;
      this._slides = [];
      this._notes = [];
      this._hideTimer = null;
      this._mouseIdleTimer = null;
      this._menuIndex = -1;
      this._onKey = this._onKey.bind(this);
      this._onResize = this._onResize.bind(this);
      this._onSlotChange = this._onSlotChange.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onTapBack = this._onTapBack.bind(this);
      this._onTapForward = this._onTapForward.bind(this);
      this._onMessage = this._onMessage.bind(this);
      // Capture-phase close so a click anywhere dismisses the menu, but
      // ignore clicks that land inside the menu itself — otherwise the
      // capture handler runs before the menu's own (bubble) handler and
      // clears _menuIndex out from under it.
      this._onDocClick = e => {
        if (this._menu && e.composedPath && e.composedPath().includes(this._menu)) return;
        this._closeMenu();
      };
    }
    get designWidth() {
      return parseInt(this.getAttribute('width'), 10) || DESIGN_W_DEFAULT;
    }
    get designHeight() {
      return parseInt(this.getAttribute('height'), 10) || DESIGN_H_DEFAULT;
    }
    connectedCallback() {
      // Presenter-view popup loads deckUrl?_snthumb=...#N for its prev/cur/
      // next thumbnails — the rail has no business rendering inside those
      // (wrong scale, and it offsets the stage so the thumb shows a gutter).
      if (/[?&]_snthumb=/.test(location.search)) this.setAttribute('no-rail', '');
      this._render();
      this._loadNotes();
      this._syncPrintPageRule();
      window.addEventListener('keydown', this._onKey);
      window.addEventListener('resize', this._onResize);
      window.addEventListener('mousemove', this._onMouseMove, {
        passive: true
      });
      window.addEventListener('message', this._onMessage);
      window.addEventListener('click', this._onDocClick, true);
      // Rail is off until the host posts __omelette_rail_enabled (feature-
      // flagged during soft-launch). Observers and thumbnail DOM are not
      // created until then, so flag-off decks pay only the parse cost of
      // the rail code, not its runtime.
      this._railEnabled = false;
      // Initial collection + layout happens via slotchange, which fires on mount.
    }
    _enableRail() {
      if (this._railEnabled) return;
      this._railEnabled = true;
      // Per-viewer preference — restored alongside rail width. Default on;
      // only a stored '0' (from the TweaksPanel toggle) hides it.
      this._railVisible = true;
      try {
        if (localStorage.getItem('deck-stage.railVisible') === '0') this._railVisible = false;
      } catch (e) {}
      // Live thumbnail updates: watch the light-DOM slides for content
      // edits and re-clone just the affected thumb(s), debounced. Ignore
      // the data-deck-* / data-screen-label / data-om-validate attributes
      // this component itself writes so nav and skip don't trigger
      // spurious refreshes.
      const OWN_ATTRS = /^data-(deck-|screen-label$|om-validate$)/;
      this._liveDirty = new Set();
      this._liveObserver = new MutationObserver(records => {
        for (const r of records) {
          if (r.type === 'attributes' && OWN_ATTRS.test(r.attributeName || '')) continue;
          let n = r.target;
          while (n && n.parentElement !== this) n = n.parentElement;
          if (n && this._slideSet && this._slideSet.has(n)) this._liveDirty.add(n);
        }
        if (this._liveDirty.size && !this._liveTimer) {
          this._liveTimer = setTimeout(() => {
            this._liveTimer = null;
            this._liveDirty.forEach(s => this._refreshThumb(s));
            this._liveDirty.clear();
          }, 200);
        }
      });
      this._liveObserver.observe(this, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
      });
      // Lazy thumbnail materialization — clone the slide only when its
      // frame scrolls into (or near) the rail viewport. rootMargin gives
      // ~4 thumbs of pre-load so fast scrolling doesn't flash blanks.
      this._railObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && e.target.__deckThumb) {
            this._materialize(e.target.__deckThumb);
          }
        });
      }, {
        root: this._rail,
        rootMargin: '400px 0px'
      });
      // Tweaks typically change CSS vars / attrs OUTSIDE <deck-stage>
      // (on <html>, <body>, a wrapper div, or a <style> tag), which
      // _liveObserver can't see. Re-snapshot author CSS (constructable
      // sheet is shared by reference, so one replaceSync updates every
      // thumb shadow root) and re-sync each thumb host's attrs + custom
      // properties. In-slide DOM mutations are _liveObserver's job.
      // Debounced so slider drags don't thrash.
      this._onTweakChange = () => {
        clearTimeout(this._tweakTimer);
        this._tweakTimer = setTimeout(() => {
          this._snapshotAuthorCss();
          // One getComputedStyle for the whole batch — each
          // getPropertyValue read below reuses the same computed style
          // as long as nothing invalidates layout between thumbs.
          const cs = getComputedStyle(this);
          (this._thumbs || []).forEach(t => {
            if (t.host) this._syncThumbHostAttrs(t.host, cs);
          });
        }, 120);
      };
      window.addEventListener('tweakchange', this._onTweakChange);
      this._snapshotAuthorCss();
      // Build the rail now that it's enabled — slotchange already fired,
      // so _renderRail's early-return skipped the initial build.
      this._syncRailHidden();
      this._renderRail();
      this._fit();
    }

    /** Snapshot document stylesheets into a constructable sheet that each
     *  thumbnail's nested shadow root adopts — so author CSS styles the
     *  cloned slide content without touching this component's chrome.
     *  Cross-origin sheets throw on .cssRules — skip them. Re-callable:
     *  the existing constructable sheet is reused via replaceSync so every
     *  already-adopted shadow root picks up the fresh CSS without re-adopt. */
    _snapshotAuthorCss() {
      // :root in an adopted sheet inside a shadow root matches nothing
      // (only the document root qualifies), so author rules like
      // `:root[data-voice="modern"] .serif` never reach the clones.
      // Rewrite :root → :host and mirror <html>'s data-*/class/lang onto
      // each thumb host (see _syncThumbHostAttrs) so the same selectors
      // match inside the thumbnail's shadow tree.
      const authorCss = Array.from(document.styleSheets).map(sh => {
        try {
          return Array.from(sh.cssRules).map(r => r.cssText).join('\n');
        } catch (e) {
          return '';
        }
      }).join('\n')
      // The shadow host is featureless outside the functional :host(...)
      // form, so any compound on :root — [attr], .class, #id, :pseudo —
      // must become :host(<compound>) not :host<compound>. Same for the
      // html type selector (Tailwind class-strategy dark mode emits
      // html.dark; Pico uses html[data-theme]), which has nothing to
      // match inside the thumb's shadow tree.
      .replace(/:root((?:\[[^\]]*\]|[.#][-\w]+|:[-\w]+(?:\([^)]*\))?)+)/g, ':host($1)').replace(/:root\b/g, ':host').replace(/(^|[\s,>~+(}])html((?:\[[^\]]*\]|[.#][-\w]+|:[-\w]+(?:\([^)]*\))?)+)(?![-\w])/g, '$1:host($2)').replace(/(^|[\s,>~+(}])html(?![-\w])/g, '$1:host');
      // Every custom property the author references. _syncThumbHostAttrs
      // mirrors each one's *computed* value at <deck-stage> onto the
      // thumb host so the live value wins over the :host default above
      // regardless of which ancestor the tweak wrote to (<html>, <body>,
      // a wrapper div, or the deck-stage element itself all inherit
      // down to getComputedStyle(this)).
      this._authorVars = new Set(authorCss.match(/--[\w-]+/g) || []);
      try {
        if (!this._adoptedSheet) this._adoptedSheet = new CSSStyleSheet();
        this._adoptedSheet.replaceSync(authorCss);
      } catch (e) {
        this._adoptedSheet = null;
        this._authorCss = authorCss;
      }
    }
    _syncThumbHostAttrs(host, cs) {
      const de = document.documentElement;
      // setAttribute overwrites but can't delete — an attr removed from
      // <html> (toggleAttribute off, classList emptied) would linger on
      // the host and :host([data-*]) / :host(.foo) rules would keep
      // matching. Remove stale mirrored attrs first; iterate backward
      // because removeAttribute mutates the live NamedNodeMap.
      for (let i = host.attributes.length - 1; i >= 0; i--) {
        const n = host.attributes[i].name;
        if ((n.startsWith('data-') || n === 'class' || n === 'lang') && !de.hasAttribute(n)) {
          host.removeAttribute(n);
        }
      }
      for (const a of de.attributes) {
        if (a.name.startsWith('data-') || a.name === 'class' || a.name === 'lang') {
          host.setAttribute(a.name, a.value);
        }
      }
      // The :root→:host rewrite in _snapshotAuthorCss pins each custom
      // property to its stylesheet default on the thumb host, shadowing
      // the live value that would otherwise inherit. Tweaks can write the
      // live value on any ancestor — <html>, <body>, a wrapper div, the
      // deck-stage element — so read it as the *computed* value at
      // <deck-stage> (which sees the whole inheritance chain) rather than
      // trying to guess which element the author wrote to. Inline on the
      // host beats the :host{} rule. remove-stale covers vars dropped
      // from the stylesheet between snapshots.
      const vars = this._authorVars || new Set();
      for (let i = host.style.length - 1; i >= 0; i--) {
        const p = host.style[i];
        if (p.startsWith('--') && !vars.has(p)) host.style.removeProperty(p);
      }
      const live = cs || getComputedStyle(this);
      vars.forEach(p => {
        const v = live.getPropertyValue(p);
        if (v) host.style.setProperty(p, v.trim());else host.style.removeProperty(p);
      });
    }
    disconnectedCallback() {
      window.removeEventListener('keydown', this._onKey);
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('message', this._onMessage);
      window.removeEventListener('click', this._onDocClick, true);
      if (this._hideTimer) clearTimeout(this._hideTimer);
      if (this._mouseIdleTimer) clearTimeout(this._mouseIdleTimer);
      if (this._liveTimer) clearTimeout(this._liveTimer);
      if (this._tweakTimer) clearTimeout(this._tweakTimer);
      if (this._railAnimTimer) clearTimeout(this._railAnimTimer);
      if (this._scaleRaf) cancelAnimationFrame(this._scaleRaf);
      if (this._liveObserver) this._liveObserver.disconnect();
      if (this._railObserver) this._railObserver.disconnect();
      if (this._onTweakChange) window.removeEventListener('tweakchange', this._onTweakChange);
    }
    attributeChangedCallback() {
      if (this._canvas) {
        this._canvas.style.width = this.designWidth + 'px';
        this._canvas.style.height = this.designHeight + 'px';
        this._canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
        this._canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
        if (this._rail) {
          this._rail.style.setProperty('--deck-aspect', this.designWidth + '/' + this.designHeight);
        }
        this._fit();
        this._scaleThumbs();
        this._syncPrintPageRule();
      }
    }
    _render() {
      const style = document.createElement('style');
      style.textContent = stylesheet;
      const stage = document.createElement('div');
      stage.className = 'stage';
      const canvas = document.createElement('div');
      canvas.className = 'canvas';
      canvas.style.width = this.designWidth + 'px';
      canvas.style.height = this.designHeight + 'px';
      canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
      canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
      const slot = document.createElement('slot');
      slot.addEventListener('slotchange', this._onSlotChange);
      canvas.appendChild(slot);
      stage.appendChild(canvas);

      // Tap zones (mobile): left third = back, right third = forward.
      const tapzones = document.createElement('div');
      tapzones.className = 'tapzones export-hidden';
      tapzones.setAttribute('aria-hidden', 'true');
      tapzones.setAttribute('data-noncommentable', '');
      const tzBack = document.createElement('div');
      tzBack.className = 'tapzone tapzone--back';
      const tzMid = document.createElement('div');
      tzMid.className = 'tapzone tapzone--mid';
      tzMid.style.pointerEvents = 'none';
      const tzFwd = document.createElement('div');
      tzFwd.className = 'tapzone tapzone--fwd';
      tzBack.addEventListener('click', this._onTapBack);
      tzFwd.addEventListener('click', this._onTapForward);
      tapzones.append(tzBack, tzMid, tzFwd);

      // Overlay: compact, solid black, with clickable controls.
      const overlay = document.createElement('div');
      overlay.className = 'overlay export-hidden';
      overlay.setAttribute('role', 'toolbar');
      overlay.setAttribute('aria-label', 'Deck controls');
      overlay.setAttribute('data-noncommentable', '');
      overlay.innerHTML = `
        <button class="btn prev" type="button" aria-label="Previous slide" title="Previous (←)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>
        </button>
        <span class="count" aria-live="polite"><span class="current">1</span><span class="sep">/</span><span class="total">1</span></span>
        <button class="btn next" type="button" aria-label="Next slide" title="Next (→)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>
        </button>
        <span class="divider"></span>
        <button class="btn reset" type="button" aria-label="Reset to first slide" title="Reset (R)">Reset<span class="kbd">R</span></button>
      `;
      overlay.querySelector('.prev').addEventListener('click', () => this._advance(-1, 'click'));
      overlay.querySelector('.next').addEventListener('click', () => this._advance(1, 'click'));
      overlay.querySelector('.reset').addEventListener('click', () => this._go(0, 'click'));

      // Thumbnail rail + context menu. Thumbnails are populated in
      // _renderRail() after _collectSlides().
      const rail = document.createElement('div');
      rail.className = 'rail export-hidden';
      rail.setAttribute('data-noncommentable', '');
      rail.style.setProperty('--deck-aspect', this.designWidth + '/' + this.designHeight);
      // Edge auto-scroll while dragging a thumb near the rail's top/bottom
      // so off-screen drop targets are reachable. Native dragover fires
      // continuously while the pointer is stationary, so a per-event nudge
      // (ramped by edge proximity) is enough — no rAF loop needed.
      rail.addEventListener('dragover', e => {
        if (this._dragFrom == null) return;
        const r = rail.getBoundingClientRect();
        const EDGE = 40;
        const dt = e.clientY - r.top;
        const db = r.bottom - e.clientY;
        if (dt < EDGE) rail.scrollTop -= Math.ceil((EDGE - dt) / 3);else if (db < EDGE) rail.scrollTop += Math.ceil((EDGE - db) / 3);
      });
      const menu = document.createElement('div');
      menu.className = 'ctxmenu export-hidden';
      menu.setAttribute('data-noncommentable', '');
      menu.innerHTML = `
        <button type="button" data-act="skip">Skip slide</button>
        <button type="button" data-act="up">Move up</button>
        <button type="button" data-act="down">Move down</button>
        <hr>
        <button type="button" data-act="delete">Delete slide</button>
      `;
      menu.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (!act) return;
        const i = this._menuIndex;
        this._closeMenu();
        if (act === 'skip') this._toggleSkip(i);else if (act === 'up') this._moveSlide(i, i - 1);else if (act === 'down') this._moveSlide(i, i + 1);else if (act === 'delete') this._openConfirm(i);
      });
      menu.addEventListener('contextmenu', e => e.preventDefault());

      // Rail resize handle — drag to set --deck-rail-w, persisted to
      // localStorage so the width survives reloads.
      const resize = document.createElement('div');
      resize.className = 'rail-resize export-hidden';
      resize.setAttribute('data-noncommentable', '');
      resize.addEventListener('pointerdown', e => {
        e.preventDefault();
        resize.setPointerCapture(e.pointerId);
        resize.setAttribute('data-dragging', '');
        const move = ev => this._setRailWidth(ev.clientX);
        const up = () => {
          resize.removeEventListener('pointermove', move);
          resize.removeEventListener('pointerup', up);
          resize.removeEventListener('pointercancel', up);
          resize.removeAttribute('data-dragging');
          try {
            localStorage.setItem('deck-stage.railWidth', String(this._railPx));
          } catch (err) {}
        };
        resize.addEventListener('pointermove', move);
        resize.addEventListener('pointerup', up);
        resize.addEventListener('pointercancel', up);
      });

      // Delete-confirm dialog — mirrors the SPA's ConfirmDialog layout.
      const confirm = document.createElement('div');
      confirm.className = 'confirm-backdrop export-hidden';
      confirm.setAttribute('data-noncommentable', '');
      confirm.innerHTML = `
        <div class="confirm" role="dialog" aria-modal="true">
          <div class="body">
            <div class="title">Delete slide?</div>
            <div class="msg">This slide will be removed from the deck.</div>
          </div>
          <div class="footer">
            <button type="button" class="cancel">Cancel</button>
            <button type="button" class="danger">Delete</button>
          </div>
        </div>
      `;
      confirm.addEventListener('click', e => {
        if (e.target === confirm) this._closeConfirm();
      });
      confirm.querySelector('.cancel').addEventListener('click', () => this._closeConfirm());
      confirm.querySelector('.danger').addEventListener('click', () => {
        const i = this._confirmIndex;
        this._closeConfirm();
        this._deleteSlide(i);
      });
      this._root.append(style, rail, resize, stage, tapzones, overlay, menu, confirm);
      this._canvas = canvas;
      this._slot = slot;
      this._overlay = overlay;
      this._tapzones = tapzones;
      this._rail = rail;
      this._resize = resize;
      this._menu = menu;
      this._confirm = confirm;
      this._countEl = overlay.querySelector('.current');
      this._totalEl = overlay.querySelector('.total');

      // Restore persisted rail width.
      let rw = 188;
      try {
        const s = localStorage.getItem('deck-stage.railWidth');
        if (s) rw = parseInt(s, 10) || rw;
      } catch (err) {}
      this._setRailWidth(rw);
      this._syncRailHidden();
    }
    _setRailWidth(px) {
      const w = Math.max(120, Math.min(360, Math.round(px)));
      this._railPx = w;
      this.style.setProperty('--deck-rail-w', w + 'px');
      this._fit();
      // _scaleThumbs forces a sync layout (frame.offsetWidth) then writes
      // N transforms. During a resize drag this runs per-pointermove;
      // coalesce to one per frame.
      if (!this._scaleRaf) {
        this._scaleRaf = requestAnimationFrame(() => {
          this._scaleRaf = null;
          this._scaleThumbs();
        });
      }
    }

    /** @page must live in the document stylesheet — it's a no-op inside
     *  shadow DOM. Inject/update a single <head> style tag so the print
     *  sheet matches the design size and Save-as-PDF yields one slide per
     *  page with no margins. */
    _syncPrintPageRule() {
      const id = 'deck-stage-print-page';
      let tag = document.getElementById(id);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = id;
        document.head.appendChild(tag);
      }
      tag.textContent = '@page { size: ' + this.designWidth + 'px ' + this.designHeight + 'px; margin: 0; } ' + '@media print { html, body { margin: 0 !important; padding: 0 !important; background: none !important; overflow: visible !important; height: auto !important; } ' + '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }';
    }
    _onSlotChange() {
      // Rail mutations (delete/move) already reconcile synchronously and
      // emit slidechange with reason 'api'; skip the async slotchange that
      // would otherwise re-broadcast with reason 'init'.
      if (this._squelchSlotChange) {
        this._squelchSlotChange = false;
        return;
      }
      this._collectSlides();
      this._restoreIndex();
      this._applyIndex({
        showOverlay: false,
        broadcast: true,
        reason: 'init'
      });
      this._fit();
    }
    _collectSlides() {
      const assigned = this._slot.assignedElements({
        flatten: true
      });
      this._slides = assigned.filter(el => {
        // Skip template/style/script nodes even if someone slots them.
        const tag = el.tagName;
        return tag !== 'TEMPLATE' && tag !== 'SCRIPT' && tag !== 'STYLE';
      });
      this._slideSet = new Set(this._slides);
      this._slides.forEach((slide, i) => {
        const n = i + 1;
        // Determine a label for comment flow: prefer explicit data-label,
        // then an existing data-screen-label, then first heading, else "Slide".
        let label = slide.getAttribute('data-label');
        if (!label) {
          const existing = slide.getAttribute('data-screen-label');
          if (existing) {
            // Strip any leading number the author may have included.
            label = existing.replace(/^\s*\d+\s*/, '').trim() || existing;
          }
        }
        if (!label) {
          const h = slide.querySelector('h1, h2, h3, [data-title]');
          if (h) label = (h.textContent || '').trim().slice(0, 40);
        }
        if (!label) label = 'Slide';
        slide.setAttribute('data-screen-label', `${pad2(n)} ${label}`);

        // Validation attribute for comment flow / auto-checks.
        if (!slide.hasAttribute('data-om-validate')) {
          slide.setAttribute('data-om-validate', VALIDATE_ATTR);
        }
        slide.setAttribute('data-deck-slide', String(i));
      });
      if (this._totalEl) this._totalEl.textContent = String(this._slides.length || 1);
      if (this._index >= this._slides.length) this._index = Math.max(0, this._slides.length - 1);
      this._markLastVisible();
      this._renderRail();
    }

    /** Tag the last non-skipped slide so print CSS can drop its
     *  break-after (see the @media print comment above — :last-child
     *  alone matches a hidden skipped slide). */
    _markLastVisible() {
      let last = null;
      this._slides.forEach(s => {
        s.removeAttribute('data-deck-last-visible');
        if (!s.hasAttribute('data-deck-skip')) last = s;
      });
      if (last) last.setAttribute('data-deck-last-visible', '');
    }
    _loadNotes() {
      const tag = document.getElementById('speaker-notes');
      if (!tag) {
        this._notes = [];
        return;
      }
      try {
        const parsed = JSON.parse(tag.textContent || '[]');
        if (Array.isArray(parsed)) this._notes = parsed;
      } catch (e) {
        console.warn('[deck-stage] Failed to parse #speaker-notes JSON:', e);
        this._notes = [];
      }
    }
    _restoreIndex() {
      // The host's ?slide= param is delivered as a #<int> hash (1-indexed) on
      // the iframe src. No hash → slide 1; the deck itself keeps no position
      // state across loads.
      const h = (location.hash || '').match(/^#(\d+)$/);
      if (h) {
        const n = parseInt(h[1], 10) - 1;
        if (n >= 0 && n < this._slides.length) this._index = n;
      }
    }
    _applyIndex({
      showOverlay = true,
      broadcast = true,
      reason = 'init'
    } = {}) {
      if (!this._slides.length) return;
      const prev = this._prevIndex == null ? -1 : this._prevIndex;
      const curr = this._index;
      // Keep the iframe's own hash in sync so an in-iframe location.reload()
      // (reload banner path in viewer-handle.ts) lands on the current slide,
      // not the stale deep-link hash from initial load.
      try {
        history.replaceState(null, '', '#' + (curr + 1));
      } catch (e) {}
      this._slides.forEach((s, i) => {
        if (i === curr) s.setAttribute('data-deck-active', '');else s.removeAttribute('data-deck-active');
      });
      if (this._countEl) this._countEl.textContent = String(curr + 1);
      // Follow-scroll on every navigation (init deep-link, keyboard, click,
      // tap, external goTo) — the only time we *don't* want the rail to
      // track current is after a rail-internal mutation, where _renderRail
      // has already restored the user's scroll position and yanking back to
      // current would undo it.
      this._syncRail(reason !== 'mutation');
      if (broadcast) {
        // (1) Legacy: host-window postMessage for speaker-notes renderers.
        try {
          window.postMessage({
            slideIndexChanged: curr,
            deckTotal: this._slides.length,
            deckSkipped: this._skippedIndices()
          }, '*');
        } catch (e) {}

        // (2) In-page CustomEvent on the <deck-stage> element itself.
        //     Bubbles and composes out of shadow DOM so slide code can listen:
        //       document.querySelector('deck-stage').addEventListener('slidechange', e => {
        //         e.detail.index, e.detail.previousIndex, e.detail.total, e.detail.slide, e.detail.reason
        //       });
        const detail = {
          index: curr,
          previousIndex: prev,
          total: this._slides.length,
          slide: this._slides[curr] || null,
          previousSlide: prev >= 0 ? this._slides[prev] || null : null,
          reason: reason // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
        };
        this.dispatchEvent(new CustomEvent('slidechange', {
          detail,
          bubbles: true,
          composed: true
        }));
      }
      this._prevIndex = curr;
      if (showOverlay) this._flashOverlay();
    }
    _flashOverlay() {
      // Host posts __omelette_presenting while in fullscreen/tab presentation
      // mode — suppress the nav footer entirely (both hover and slide-change
      // flash) so the audience sees clean slides.
      if (!this._overlay || this._presenting) return;
      this._overlay.setAttribute('data-visible', '');
      if (this._hideTimer) clearTimeout(this._hideTimer);
      this._hideTimer = setTimeout(() => {
        this._overlay.removeAttribute('data-visible');
      }, OVERLAY_HIDE_MS);
    }
    _railWidth() {
      // State-based, no offsetWidth: the first _fit() can run before the
      // rail has had layout on some load paths, and a 0 there paints the
      // slide full-width for one frame before the post-slotchange _fit()
      // corrects it.
      if (!this._railEnabled || !this._railVisible || this.hasAttribute('no-rail') || this.hasAttribute('noscale') || this._presenting) return 0;
      return this._railPx || 0;
    }
    _fit() {
      if (!this._canvas) return;
      const stage = this._canvas.parentElement;
      // PPTX export sets noscale so the DOM capture sees authored-size
      // geometry — the scaled canvas is in shadow DOM, so the exporter's
      // resetTransformSelector can't reach .canvas.style.transform directly.
      if (this.hasAttribute('noscale')) {
        this._canvas.style.transform = 'none';
        if (stage) stage.style.left = '0';
        if (this._overlay) this._overlay.style.marginLeft = '0';
        if (this._tapzones) this._tapzones.style.left = '0';
        return;
      }
      const rw = this._railWidth();
      if (stage) stage.style.left = rw + 'px';
      // Overlay is centred on the viewport via left:50% + translate(-50%);
      // marginLeft shifts the centre by rw/2 so it lands in the middle of
      // the [rw, innerWidth] stage region. Tapzones just inset from rw.
      if (this._overlay) this._overlay.style.marginLeft = rw / 2 + 'px';
      if (this._tapzones) this._tapzones.style.left = rw + 'px';
      const vw = window.innerWidth - rw;
      const vh = window.innerHeight;
      const s = Math.min(vw / this.designWidth, vh / this.designHeight);
      this._canvas.style.transform = `scale(${s})`;
    }
    _onResize() {
      this._fit();
    }
    _onMouseMove() {
      // Keep overlay visible while mouse moves; hide after idle.
      this._flashOverlay();
    }
    _onMessage(e) {
      const d = e.data;
      if (d && typeof d.__omelette_presenting === 'boolean') {
        this._presenting = d.__omelette_presenting;
        if (this._presenting && this._overlay) {
          this._overlay.removeAttribute('data-visible');
          if (this._hideTimer) clearTimeout(this._hideTimer);
        }
        this._syncRailHidden();
        this._closeMenu();
        this._closeConfirm();
        this._fit();
        this._scaleThumbs();
      }
      // Per-viewer show/hide, driven by the TweaksPanel's auto-injected
      // "Thumbnail rail" toggle (or any author script). Independent of
      // whether the Tweaks panel itself is open — closing the panel
      // doesn't change rail visibility. Persists alongside rail width.
      if (d && d.type === '__deck_rail_visible' && typeof d.on === 'boolean') {
        if (d.on === this._railVisible) return;
        this._railVisible = d.on;
        try {
          localStorage.setItem('deck-stage.railVisible', d.on ? '1' : '0');
        } catch (e) {}
        // Arm the transition, commit it, then flip state — otherwise the
        // browser coalesces both writes and nothing animates on show.
        this.setAttribute('data-rail-anim', '');
        void (this._rail && this._rail.offsetHeight);
        this._syncRailHidden();
        this._fit();
        this._scaleThumbs();
        clearTimeout(this._railAnimTimer);
        this._railAnimTimer = setTimeout(() => this.removeAttribute('data-rail-anim'), 220);
      }
      if (d && d.type === '__omelette_rail_enabled') this._enableRail();
    }
    _syncRailHidden() {
      if (!this._rail) return;
      // data-presenting is the hard hide (display:none) for flag-off and
      // presentation mode — instant, no transition. data-user-hidden is
      // the soft hide (translateX(-100%)) for the viewer's rail toggle,
      // so show/hide slides under :host([data-rail-anim]).
      const hard = !this._railEnabled || this._presenting;
      if (hard) this._rail.setAttribute('data-presenting', '');else this._rail.removeAttribute('data-presenting');
      if (!this._railVisible) this._rail.setAttribute('data-user-hidden', '');else this._rail.removeAttribute('data-user-hidden');
      // translateX hide leaves thumbs (tabIndex=0) in the tab order —
      // inert keeps them unfocusable while the rail is off-screen.
      this._rail.inert = hard || !this._railVisible;
    }
    _onTapBack(e) {
      e.preventDefault();
      this._advance(-1, 'tap');
    }
    _onTapForward(e) {
      e.preventDefault();
      this._advance(1, 'tap');
    }
    _onKey(e) {
      // Ignore when the user is typing.
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      // Confirm dialog swallows nav keys while open; Escape cancels. Enter
      // is left to the focused button's native activation so Tab→Cancel
      // →Enter activates Cancel, not the window-level confirm path.
      if (this._confirm && this._confirm.hasAttribute('data-open')) {
        if (e.key === 'Escape') {
          this._closeConfirm();
          e.preventDefault();
        }
        return;
      }
      if (e.key === 'Escape' && this._menu && this._menu.hasAttribute('data-open')) {
        this._closeMenu();
        e.preventDefault();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key;
      let handled = true;
      if (key === 'ArrowRight' || key === 'PageDown' || key === ' ' || key === 'Spacebar') {
        this._advance(1, 'keyboard');
      } else if (key === 'ArrowLeft' || key === 'PageUp') {
        this._advance(-1, 'keyboard');
      } else if (key === 'Home') {
        this._go(0, 'keyboard');
      } else if (key === 'End') {
        this._go(this._slides.length - 1, 'keyboard');
      } else if (key === 'r' || key === 'R') {
        this._go(0, 'keyboard');
      } else if (/^[0-9]$/.test(key)) {
        // 1..9 jump to that slide; 0 jumps to 10.
        const n = key === '0' ? 9 : parseInt(key, 10) - 1;
        if (n < this._slides.length) this._go(n, 'keyboard');
      } else {
        handled = false;
      }
      if (handled) {
        e.preventDefault();
        this._flashOverlay();
      }
    }
    _go(i, reason = 'api') {
      if (!this._slides.length) return;
      const clamped = Math.max(0, Math.min(this._slides.length - 1, i));
      if (clamped === this._index) {
        this._flashOverlay();
        return;
      }
      this._index = clamped;
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason
      });
    }

    /** Step forward/back skipping any slide marked data-deck-skip. Falls
     *  back to _go's clamp-at-ends behaviour (flash overlay) when there's
     *  nothing further in that direction. */
    _advance(dir, reason) {
      if (!this._slides.length) return;
      let i = this._index + dir;
      while (i >= 0 && i < this._slides.length && this._slides[i].hasAttribute('data-deck-skip')) {
        i += dir;
      }
      if (i < 0 || i >= this._slides.length) {
        this._flashOverlay();
        return;
      }
      this._go(i, reason);
    }

    // ── Thumbnail rail ────────────────────────────────────────────────────
    //
    // Thumbs are keyed by slide element and reused across _renderRail()
    // calls, so a reorder/delete is an O(changed) DOM shuffle instead of an
    // O(N) teardown-and-re-clone. Each thumb starts as a lightweight shell
    // (num + empty frame); the clone is materialized lazily by an
    // IntersectionObserver when the frame scrolls into (or near) view, so
    // only visible-ish slides pay the clone + image-decode cost.

    _renderRail() {
      if (!this._rail || !this._railEnabled) {
        this._thumbs = [];
        return;
      }
      // FLIP: record each *materialized* thumb's top before the reconcile.
      // Off-screen (non-materialized) thumbs don't need the animation and
      // skipping their getBoundingClientRect saves a forced layout per
      // off-screen thumb on large decks.
      const prevTops = new Map();
      (this._thumbs || []).forEach(({
        thumb,
        slide,
        host
      }) => {
        if (host) prevTops.set(slide, thumb.getBoundingClientRect().top);
      });
      const st = this._rail.scrollTop;

      // Reconcile: reuse thumbs that already exist for a slide, create
      // shells for new slides, drop thumbs for removed slides.
      const bySlide = new Map();
      (this._thumbs || []).forEach(t => bySlide.set(t.slide, t));
      const next = [];
      this._slides.forEach(slide => {
        let t = bySlide.get(slide);
        if (t) bySlide.delete(slide);else t = this._makeThumb(slide);
        next.push(t);
      });
      // Orphans — slides removed since last render.
      bySlide.forEach(t => {
        if (this._railObserver) this._railObserver.unobserve(t.frame);
        t.thumb.remove();
      });
      // Put thumbs into document order to match _slides. insertBefore on
      // an already-correctly-placed node is a no-op, so this is cheap
      // when nothing moved.
      next.forEach((t, i) => {
        const want = t.thumb;
        const at = this._rail.children[i];
        if (at !== want) this._rail.insertBefore(want, at || null);
        t.i = i;
        t.num.textContent = String(i + 1);
        if (t.slide.hasAttribute('data-deck-skip')) t.thumb.setAttribute('data-skip', '');else t.thumb.removeAttribute('data-skip');
      });
      this._thumbs = next;
      this._rail.scrollTop = st;
      if (prevTops.size) {
        const moved = [];
        this._thumbs.forEach(({
          thumb,
          slide
        }) => {
          const old = prevTops.get(slide);
          if (old == null) return;
          const dy = old - thumb.getBoundingClientRect().top;
          if (Math.abs(dy) < 1) return;
          thumb.style.transition = 'none';
          thumb.style.transform = `translateY(${dy}px)`;
          moved.push(thumb);
        });
        if (moved.length) {
          // Commit the inverted positions before flipping the transition
          // on — otherwise the browser coalesces both style writes and
          // nothing animates.
          void this._rail.offsetHeight;
          moved.forEach(t => {
            t.style.transition = 'transform 180ms cubic-bezier(.2,.7,.3,1)';
            t.style.transform = '';
          });
          setTimeout(() => moved.forEach(t => {
            t.style.transition = '';
          }), 220);
        }
      }
      requestAnimationFrame(() => this._scaleThumbs());
      this._syncRail(false);
    }

    /** Create a lightweight thumb shell for one slide. The clone is
     *  materialized later by the IntersectionObserver. Event handlers
     *  look up the thumb's *current* index (via _thumbs.indexOf) so the
     *  same element can be reused across reorders. */
    _makeThumb(slide) {
      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      thumb.tabIndex = 0;
      const num = document.createElement('div');
      num.className = 'num';
      const frame = document.createElement('div');
      frame.className = 'frame';
      thumb.append(num, frame);
      const entry = {
        thumb,
        num,
        frame,
        slide,
        clone: null,
        host: null,
        i: -1
      };
      // entry.i is refreshed on every _renderRail reconcile pass, so
      // handlers read the thumb's current position without an O(N) scan.
      const idx = () => entry.i;
      thumb.addEventListener('click', () => this._go(idx(), 'click'));
      // ↑/↓ step through the rail when a thumb has focus. _go clamps at the
      // ends and _applyIndex→_syncRail scrolls the new current thumb into
      // view; we move focus to it (preventScroll — _syncRail already
      // scrolled) so a held key walks the whole list. stopPropagation keeps
      // this out of the window-level _onKey nav handler.
      thumb.addEventListener('keydown', e => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        e.preventDefault();
        e.stopPropagation();
        this._go(idx() + (e.key === 'ArrowDown' ? 1 : -1), 'keyboard');
        const cur = this._thumbs && this._thumbs[this._index];
        if (cur) cur.thumb.focus({
          preventScroll: true
        });
      });
      thumb.addEventListener('contextmenu', e => {
        e.preventDefault();
        this._openMenu(idx(), e.clientX, e.clientY);
      });
      thumb.draggable = true;
      thumb.addEventListener('dragstart', e => {
        this._dragFrom = idx();
        thumb.setAttribute('data-dragging', '');
        e.dataTransfer.effectAllowed = 'move';
        try {
          e.dataTransfer.setData('text/plain', String(this._dragFrom));
        } catch (err) {}
      });
      thumb.addEventListener('dragend', () => {
        thumb.removeAttribute('data-dragging');
        this._clearDrop();
        this._dragFrom = null;
      });
      thumb.addEventListener('dragover', e => {
        if (this._dragFrom == null) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const r = thumb.getBoundingClientRect();
        this._setDrop(idx(), e.clientY < r.top + r.height / 2 ? 'before' : 'after');
      });
      thumb.addEventListener('drop', e => {
        if (this._dragFrom == null) return;
        e.preventDefault();
        const i = idx();
        const r = thumb.getBoundingClientRect();
        let to = e.clientY >= r.top + r.height / 2 ? i + 1 : i;
        if (this._dragFrom < to) to--;
        const from = this._dragFrom;
        this._clearDrop();
        this._dragFrom = null;
        if (to !== from) this._moveSlide(from, to);
      });
      if (this._railObserver) this._railObserver.observe(frame);
      frame.__deckThumb = entry;
      return entry;
    }

    /** Lazily build the clone for a thumb that has scrolled into view. */
    _materialize(entry) {
      if (entry.host) return;
      const dw = this.designWidth,
        dh = this.designHeight;
      let clone = entry.slide.cloneNode(true);
      clone.removeAttribute('id');
      clone.removeAttribute('data-deck-active');
      clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      // Neuter heavy media; replace <video> with its poster so the box
      // keeps a visual. <iframe>/<audio> become empty placeholders.
      clone.querySelectorAll('iframe, audio, object, embed').forEach(el => {
        el.removeAttribute('src');
        el.removeAttribute('srcdoc');
        el.removeAttribute('data');
        el.innerHTML = '';
      });
      clone.querySelectorAll('video').forEach(el => {
        if (!el.poster) {
          el.removeAttribute('src');
          el.innerHTML = '';
          return;
        }
        const img = document.createElement('img');
        img.src = el.poster;
        img.alt = '';
        img.style.cssText = el.style.cssText + ';object-fit:cover;width:100%;height:100%;';
        img.className = el.className;
        el.replaceWith(img);
      });
      // Images: defer decode and let the browser pick the smallest
      // srcset candidate for the ~140px thumb. Same-URL clones reuse the
      // slide's decoded bitmap (URL-keyed cache), so the remaining cost
      // is paint/composite — lazy+async keeps that off the main thread.
      clone.querySelectorAll('img').forEach(el => {
        el.loading = 'lazy';
        el.decoding = 'async';
        if (el.srcset) el.sizes = (this._railPx || 188) + 'px';
      });
      // Custom elements inside the slide would have their
      // connectedCallback fire when the clone is appended. Replace them
      // with inert boxes so a component-heavy deck doesn't run N copies
      // of each component's mount logic in the rail. Children are
      // preserved so layout-wrapper elements (<my-column><h2>…</h2>)
      // still show their authored content; the querySelectorAll NodeList
      // is static, so nested custom elements in the moved subtree are
      // still visited on later iterations.
      const neuter = el => {
        const box = document.createElement('div');
        box.style.cssText = (el.getAttribute('style') || '') + ';background:rgba(0,0,0,0.06);border:1px dashed rgba(0,0,0,0.15);';
        box.className = el.className;
        // Preserve theming/i18n hooks so [data-*] / :lang() / [dir]
        // descendant selectors still match the neutered root.
        for (const a of el.attributes) {
          const n = a.name;
          if (n.startsWith('data-') || n.startsWith('aria-') || n === 'lang' || n === 'dir' || n === 'role' || n === 'title') {
            box.setAttribute(n, a.value);
          }
        }
        while (el.firstChild) box.appendChild(el.firstChild);
        return box;
      };
      // querySelectorAll('*') returns descendants only — a custom-element
      // slide root (<my-slide>…</my-slide>) would slip through and upgrade
      // on append. Swap the root first.
      if (clone.tagName.includes('-')) clone = neuter(clone);
      clone.querySelectorAll('*').forEach(el => {
        if (el.tagName.includes('-')) el.replaceWith(neuter(el));
      });
      clone.style.cssText += ';position:absolute;top:0;left:0;transform-origin:0 0;' + 'pointer-events:none;width:' + dw + 'px;height:' + dh + 'px;' + 'box-sizing:border-box;overflow:hidden;visibility:visible;opacity:1;';
      const host = document.createElement('div');
      host.style.cssText = 'position:absolute;inset:0;';
      this._syncThumbHostAttrs(host);
      const sr = host.attachShadow({
        mode: 'open'
      });
      if (this._adoptedSheet) sr.adoptedStyleSheets = [this._adoptedSheet];else {
        const st = document.createElement('style');
        st.textContent = this._authorCss || '';
        sr.appendChild(st);
      }
      sr.appendChild(clone);
      entry.frame.appendChild(host);
      entry.host = host;
      entry.clone = clone;
      if (this._thumbScale) clone.style.transform = 'scale(' + this._thumbScale + ')';
      // Once materialized the IO callback is a no-op early-return —
      // unobserve so scroll doesn't keep firing it.
      if (this._railObserver) this._railObserver.unobserve(entry.frame);
    }

    /** Re-clone a single thumb (live-update path). No-op if the thumb
     *  hasn't been materialized yet — it'll pick up current content when
     *  it scrolls into view. */
    _refreshThumb(slide) {
      const entry = (this._thumbs || []).find(t => t.slide === slide);
      if (!entry || !entry.host) return;
      entry.host.remove();
      entry.host = entry.clone = null;
      this._materialize(entry);
    }
    _scaleThumbs() {
      if (!this._thumbs || !this._thumbs.length) return;
      // Every frame is the same width; if it reads 0 the rail is
      // display:none (noscale / no-rail / presenting / print) — leave the
      // clones as-is and re-run when the rail is revealed.
      const fw = this._thumbs[0].frame.offsetWidth;
      if (!fw) return;
      this._thumbScale = fw / this.designWidth;
      this._thumbs.forEach(({
        clone
      }) => {
        if (clone) clone.style.transform = 'scale(' + this._thumbScale + ')';
      });
    }
    _setDrop(i, where) {
      // dragover fires at pointer-event rate; touch only the previous
      // and new target rather than sweeping all N thumbs.
      const t = this._thumbs && this._thumbs[i];
      if (this._dropOn && this._dropOn !== t) {
        this._dropOn.thumb.removeAttribute('data-drop');
      }
      if (t) t.thumb.setAttribute('data-drop', where);
      this._dropOn = t || null;
    }
    _clearDrop() {
      if (this._dropOn) this._dropOn.thumb.removeAttribute('data-drop');
      this._dropOn = null;
    }
    _syncRail(follow) {
      if (!this._thumbs) return;
      this._thumbs.forEach(({
        thumb
      }, i) => {
        if (i === this._index) {
          thumb.setAttribute('data-current', '');
          if (follow && typeof thumb.scrollIntoView === 'function') {
            thumb.scrollIntoView({
              block: 'nearest'
            });
          }
        } else {
          thumb.removeAttribute('data-current');
        }
      });
    }
    _openMenu(i, x, y) {
      if (!this._menu) return;
      this._menuIndex = i;
      const slide = this._slides[i];
      const skip = slide && slide.hasAttribute('data-deck-skip');
      this._menu.querySelector('[data-act="skip"]').textContent = skip ? 'Unskip slide' : 'Skip slide';
      this._menu.querySelector('[data-act="up"]').disabled = i <= 0;
      this._menu.querySelector('[data-act="down"]').disabled = i >= this._slides.length - 1;
      this._menu.querySelector('[data-act="delete"]').disabled = this._slides.length <= 1;
      // Place, then clamp to viewport after it's measurable.
      this._menu.style.left = x + 'px';
      this._menu.style.top = y + 'px';
      this._menu.setAttribute('data-open', '');
      const r = this._menu.getBoundingClientRect();
      const nx = Math.min(x, window.innerWidth - r.width - 4);
      const ny = Math.min(y, window.innerHeight - r.height - 4);
      this._menu.style.left = Math.max(4, nx) + 'px';
      this._menu.style.top = Math.max(4, ny) + 'px';
    }
    _closeMenu() {
      if (this._menu) this._menu.removeAttribute('data-open');
      this._menuIndex = -1;
    }
    _openConfirm(i) {
      if (!this._confirm) return;
      this._confirmIndex = i;
      this._confirm.querySelector('.title').textContent = 'Delete slide ' + (i + 1) + '?';
      this._confirm.setAttribute('data-open', '');
      const btn = this._confirm.querySelector('.danger');
      if (btn && btn.focus) btn.focus();
    }
    _closeConfirm() {
      if (this._confirm) this._confirm.removeAttribute('data-open');
      this._confirmIndex = -1;
    }
    _emitDeckChange(detail) {
      this.dispatchEvent(new CustomEvent('deckchange', {
        detail,
        bubbles: true,
        composed: true
      }));
    }
    _deleteSlide(i) {
      const slide = this._slides[i];
      if (!slide || this._slides.length <= 1) return;
      const wasCurrent = i === this._index;
      if (i < this._index || wasCurrent && i === this._slides.length - 1) this._index--;
      this._squelchSlotChange = true;
      slide.remove();
      this._emitDeckChange({
        action: 'delete',
        from: i,
        slide
      });
      this._collectSlides();
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason: 'mutation'
      });
    }
    _toggleSkip(i) {
      const slide = this._slides[i];
      if (!slide) return;
      const on = !slide.hasAttribute('data-deck-skip');
      if (on) slide.setAttribute('data-deck-skip', '');else slide.removeAttribute('data-deck-skip');
      if (this._thumbs && this._thumbs[i]) {
        if (on) this._thumbs[i].thumb.setAttribute('data-skip', '');else this._thumbs[i].thumb.removeAttribute('data-skip');
      }
      this._markLastVisible();
      this._emitDeckChange({
        action: on ? 'skip' : 'unskip',
        from: i,
        slide
      });
      // Re-broadcast so the presenter popup's prev/next thumbnails re-pick
      // the nearest non-skipped slide without waiting for a nav event.
      try {
        window.postMessage({
          slideIndexChanged: this._index,
          deckTotal: this._slides.length,
          deckSkipped: this._skippedIndices()
        }, '*');
      } catch (e) {}
    }
    _skippedIndices() {
      const out = [];
      for (let i = 0; i < this._slides.length; i++) {
        if (this._slides[i].hasAttribute('data-deck-skip')) out.push(i);
      }
      return out;
    }
    _moveSlide(i, j) {
      if (j < 0 || j >= this._slides.length || j === i) return;
      const slide = this._slides[i];
      const ref = j < i ? this._slides[j] : this._slides[j].nextSibling;
      // Track the active slide across the reorder so the same content
      // stays on screen.
      const cur = this._index;
      if (cur === i) this._index = j;else if (i < cur && j >= cur) this._index = cur - 1;else if (i > cur && j <= cur) this._index = cur + 1;
      this._squelchSlotChange = true;
      this.insertBefore(slide, ref);
      this._emitDeckChange({
        action: 'move',
        from: i,
        to: j,
        slide
      });
      this._collectSlides();
      this._applyIndex({
        showOverlay: false,
        broadcast: true,
        reason: 'mutation'
      });
    }

    // Public API ------------------------------------------------------------

    /** Current slide index (0-based). */
    get index() {
      return this._index;
    }
    /** Total slide count. */
    get length() {
      return this._slides.length;
    }
    /** Programmatically navigate. */
    goTo(i) {
      this._go(i, 'api');
    }
    next() {
      this._advance(1, 'api');
    }
    prev() {
      this._advance(-1, 'api');
    }
    reset() {
      this._go(0, 'api');
    }
  }
  if (!customElements.get('deck-stage')) {
    customElements.define('deck-stage', DeckStage);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "slides/deck-stage.js", error: String((e && e.message) || e) }); }

// ui_kits/web_app/Chrome.jsx
try { (() => {
/* global React, Logo, Icons, Avatar, Dropdown, Tooltip, SideNav, SearchInput */
const {
  useState
} = React;
const Sidebar = ({
  active = 'home',
  onNav
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const items = [{
    id: 'home',
    label: 'Início',
    icon: 'house'
  }, {
    id: 'tasks',
    label: 'Tarefas',
    icon: 'kanban',
    badge: 2
  }, {
    id: 'docs',
    label: 'Documentos',
    icon: 'folder'
  }, {
    id: 'metrics',
    label: 'Métricas',
    icon: 'chart-bar'
  }, {
    id: 'integrations',
    label: 'Integrações',
    icon: 'grid-four'
  }, {
    id: 'agenda',
    label: 'Agenda',
    icon: 'calendar'
  }, {
    section: 'Config'
  }, {
    id: 'settings',
    label: 'Ajustes',
    icon: 'gear'
  }, {
    id: 'help',
    label: 'Ajuda',
    icon: 'chat-circle'
  }];
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: collapsed ? 72 : 240,
      flexShrink: 0,
      height: '100%',
      transition: 'width 0.2s var(--ob-ease)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(SideNav, {
    items: items,
    active: active,
    onNav: onNav,
    collapsed: collapsed,
    onToggle: () => setCollapsed(c => !c),
    flush: true,
    workspaceName: "Workspace pessoal",
    userInitials: "OB"
  }));
};
const Topbar = ({
  title,
  action
}) => {
  const [searchQ, setSearchQ] = useState('');
  const allSuggestions = ['Mapa de jornada do usuário', 'API de pagamentos', 'Wireframes do dashboard', 'Landing page v2', 'Pesquisa com usuários', 'Plano editorial Q3', 'Auditoria de tipografia', 'Onboarding refeito'];
  const results = searchQ.length > 1 ? allSuggestions.filter(s => s.toLowerCase().includes(searchQ.toLowerCase())).slice(0, 4) : [];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 32px',
      borderBottom: '1px solid var(--ob-border)',
      background: 'var(--ob-surface)',
      minHeight: 64
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)',
      letterSpacing: '-0.01em'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(SearchInput, {
    value: searchQ,
    onChange: setSearchQ,
    placeholder: "Buscar tarefas, docs\u2026",
    results: results,
    onSelect: r => {
      setSearchQ(typeof r === 'string' ? r : r.label);
    },
    width: 260
  }), /*#__PURE__*/React.createElement(Dropdown, {
    align: "right",
    trigger: /*#__PURE__*/React.createElement("button", {
      style: {
        width: 38,
        height: 38,
        borderRadius: 10,
        border: '1.5px solid var(--ob-border)',
        background: 'var(--ob-surface)',
        color: 'var(--ob-fg)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "ph ph-bell",
      style: {
        fontSize: 18
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 8,
        right: 9,
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: 'var(--ob-orange)',
        border: '2px solid var(--ob-surface)'
      }
    })),
    items: [{
      label: 'Cliente Soluções respondeu',
      icon: /*#__PURE__*/React.createElement("i", {
        className: "ph ph-chat-circle",
        style: {
          fontSize: 16
        }
      }),
      onClick: () => {}
    }, {
      label: 'Deploy concluído',
      icon: /*#__PURE__*/React.createElement("i", {
        className: "ph ph-check-circle",
        style: {
          fontSize: 16
        }
      }),
      onClick: () => {}
    }, {
      label: '2 tarefas vencem hoje',
      icon: /*#__PURE__*/React.createElement("i", {
        className: "ph ph-calendar",
        style: {
          fontSize: 16
        }
      }),
      onClick: () => {}
    }, {
      divider: true
    }, {
      label: 'Ver todas',
      icon: /*#__PURE__*/React.createElement("i", {
        className: "ph ph-arrow-right",
        style: {
          fontSize: 16
        }
      }),
      onClick: () => {}
    }]
  }), action));
};
Object.assign(window, {
  Sidebar,
  Topbar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web_app/Chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web_app/Components.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React, Icons */
const {
  useState,
  useEffect,
  useRef
} = React;

// ============================================================
// Onblide Web App — extended component set
// All components use semantic CSS tokens (var(--ob-*)) so they
// respond to light/dark theme automatically.
// ============================================================

// ── RADIO ───────────────────────────────────────────────
const Radio = ({
  name,
  value,
  checked,
  onChange,
  label,
  disabled = false,
  description
}) => /*#__PURE__*/React.createElement("label", {
  style: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    position: 'relative',
    flex: 'none',
    marginTop: 1
  }
}, /*#__PURE__*/React.createElement("input", {
  type: "radio",
  name: name,
  value: value,
  checked: checked,
  disabled: disabled,
  onChange: () => onChange?.(value),
  style: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0
  }
}), /*#__PURE__*/React.createElement("span", {
  style: {
    display: 'block',
    width: 18,
    height: 18,
    borderRadius: '50%',
    border: `1.5px solid ${checked ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
    background: 'var(--ob-surface)',
    transition: 'border-color 160ms'
  }
}, checked && /*#__PURE__*/React.createElement("span", {
  style: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--ob-blue)'
  }
}))), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 14,
    color: 'var(--ob-fg-strong)',
    fontWeight: 500,
    lineHeight: 1.3,
    display: 'block'
  }
}, label), description && /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 12,
    color: 'var(--ob-fg-soft)',
    marginTop: 2,
    display: 'block'
  }
}, description)));
const RadioGroup = ({
  options,
  value,
  onChange,
  name = 'radio-group'
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  }
}, options.map(opt => /*#__PURE__*/React.createElement(Radio, {
  key: opt.value,
  name: name,
  value: opt.value,
  label: opt.label,
  description: opt.description,
  disabled: opt.disabled,
  checked: value === opt.value,
  onChange: onChange
})));

// ── TOGGLE (switch) ──────────────────────────────────────
const Toggle = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md'
}) => {
  const w = size === 'sm' ? 32 : 40,
    h = size === 'sm' ? 18 : 22,
    knob = h - 4;
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => !disabled && onChange?.(!checked),
    style: {
      width: w,
      height: h,
      borderRadius: 999,
      flex: 'none',
      position: 'relative',
      background: checked ? 'var(--ob-blue)' : 'var(--ob-border)',
      transition: 'background 200ms var(--ob-ease)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2,
      left: checked ? w - knob - 2 : 2,
      width: knob,
      height: knob,
      borderRadius: '50%',
      background: '#fff',
      transition: 'left 200ms var(--ob-ease)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'var(--ob-fg-strong)',
      fontWeight: 500
    }
  }, label));
};

// ── CHECKBOX ─────────────────────────────────────────────
const Checkbox = ({
  checked,
  onChange,
  label,
  disabled = false,
  indeterminate = false,
  description
}) => /*#__PURE__*/React.createElement("label", {
  style: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1
  }
}, /*#__PURE__*/React.createElement("span", {
  onClick: () => !disabled && onChange?.(!checked),
  style: {
    flex: 'none',
    marginTop: 1,
    width: 18,
    height: 18,
    borderRadius: 6,
    border: `1.5px solid ${checked || indeterminate ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
    background: checked || indeterminate ? 'var(--ob-blue)' : 'var(--ob-surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 160ms var(--ob-ease)'
  }
}, checked && !indeterminate && /*#__PURE__*/React.createElement(Icons.check, {
  size: 12,
  style: {
    color: '#fff',
    lineHeight: 1
  }
}), indeterminate && /*#__PURE__*/React.createElement("span", {
  style: {
    width: 9,
    height: 2,
    background: '#fff',
    borderRadius: 1
  }
})), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 14,
    color: 'var(--ob-fg-strong)',
    fontWeight: 500,
    lineHeight: 1.3,
    display: 'block'
  }
}, label), description && /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 12,
    color: 'var(--ob-fg-soft)',
    marginTop: 2,
    display: 'block'
  }
}, description)));

// ── LINK ─────────────────────────────────────────────────
const Link = ({
  href = '#',
  children,
  variant = 'default',
  external = false,
  onClick
}) => {
  const [hover, setHover] = useState(false);
  const variants = {
    default: {
      color: 'var(--ob-blue)',
      textDecoration: hover ? 'underline' : 'none'
    },
    subtle: {
      color: 'var(--ob-fg)',
      textDecoration: hover ? 'underline' : 'none'
    },
    quiet: {
      color: 'var(--ob-fg-soft)',
      textDecoration: hover ? 'underline' : 'none'
    }
  };
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    onClick: onClick,
    target: external ? '_blank' : undefined,
    rel: external ? 'noopener noreferrer' : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontFamily: 'inherit',
      fontWeight: 500,
      fontSize: 14,
      cursor: 'pointer',
      transition: 'color 120ms',
      ...variants[variant]
    }
  }, children, external && /*#__PURE__*/React.createElement(Icons.arrowSquareOut, {
    size: 13
  }));
};

// ── SKELETON ─────────────────────────────────────────────
const Skeleton = ({
  width = '100%',
  height = 16,
  radius = 6,
  circle = false,
  style = {}
}) => /*#__PURE__*/React.createElement("span", {
  style: {
    display: 'block',
    width: circle ? height : width,
    height,
    borderRadius: circle ? '50%' : radius,
    background: 'linear-gradient(90deg, var(--ob-bg-alt) 25%, var(--ob-border) 50%, var(--ob-bg-alt) 75%)',
    backgroundSize: '200% 100%',
    animation: 'ob-shimmer 1.4s ease-in-out infinite',
    ...style
  }
});

// inject shimmer keyframes once
if (typeof document !== 'undefined' && !document.getElementById('ob-skeleton-kf')) {
  const st = document.createElement('style');
  st.id = 'ob-skeleton-kf';
  st.textContent = '@keyframes ob-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }';
  document.head.appendChild(st);
}

// ── PAGINATION ───────────────────────────────────────────
const Pagination = ({
  page = 1,
  total = 10,
  onChange,
  siblings = 1
}) => {
  const range = (s, e) => Array.from({
    length: e - s + 1
  }, (_, i) => s + i);
  let pages = [];
  const left = Math.max(2, page - siblings);
  const right = Math.min(total - 1, page + siblings);
  pages.push(1);
  if (left > 2) pages.push('…');
  pages.push(...range(left, right));
  if (right < total - 1) pages.push('…');
  if (total > 1) pages.push(total);
  pages = [...new Set(pages)];
  const Arrow = ({
    dir,
    disabled
  }) => /*#__PURE__*/React.createElement("button", {
    disabled: disabled,
    onClick: () => onChange?.(dir === 'prev' ? page - 1 : page + 1),
    style: {
      width: 34,
      height: 34,
      borderRadius: 'var(--ob-r-sm)',
      border: '1px solid var(--ob-border)',
      background: 'var(--ob-surface)',
      color: disabled ? 'var(--ob-fg-mute)' : 'var(--ob-fg)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 120ms'
    }
  }, dir === 'prev' ? /*#__PURE__*/React.createElement(Icons.caretL, {
    size: 16
  }) : /*#__PURE__*/React.createElement(Icons.caretR, {
    size: 16
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Arrow, {
    dir: "prev",
    disabled: page === 1
  }), pages.map((p, i) => p === '…' ? /*#__PURE__*/React.createElement("span", {
    key: `e${i}`,
    style: {
      width: 34,
      textAlign: 'center',
      color: 'var(--ob-fg-mute)'
    }
  }, "\u2026") : /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => onChange?.(p),
    style: {
      minWidth: 34,
      height: 34,
      padding: '0 8px',
      borderRadius: 'var(--ob-r-sm)',
      border: `1px solid ${p === page ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
      background: p === page ? 'var(--ob-blue)' : 'var(--ob-surface)',
      color: p === page ? '#fff' : 'var(--ob-fg)',
      fontFamily: 'inherit',
      fontSize: 14,
      fontWeight: p === page ? 600 : 500,
      cursor: 'pointer',
      transition: 'all 120ms'
    }
  }, p)), /*#__PURE__*/React.createElement(Arrow, {
    dir: "next",
    disabled: page === total
  }));
};

// ── DROPDOWN (menu) ──────────────────────────────────────
// ── FLOATING PANEL ───────────────────────────────────────
// Shared suspended-list surface for Dropdown, Select and SearchInput.
// Owns position, surface, border, radius (--ob-r-surface), shadow
// (--ob-shadow-lg) and z-index so no consumer reinvents the floating list.
const FloatingPanel = ({
  align = 'stretch',
  maxHeight,
  padding = 4,
  minWidth,
  style = {},
  children
}) => {
  const pos = align === 'right' ? {
    right: 0
  } : align === 'left' ? {
    left: 0
  } : {
    left: 0,
    right: 0
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 'calc(100% + 6px)',
      zIndex: 1200,
      background: 'var(--ob-surface)',
      border: '1px solid var(--ob-border)',
      borderRadius: 'var(--ob-r-surface)',
      boxShadow: 'var(--ob-shadow-lg)',
      padding,
      overflow: maxHeight ? 'hidden auto' : 'hidden',
      ...pos,
      ...(maxHeight ? {
        maxHeight
      } : {}),
      ...(minWidth ? {
        minWidth
      } : {}),
      ...style
    }
  }, children);
};
const Dropdown = ({
  trigger,
  items,
  align = 'left'
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, [open]);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: 'relative',
      display: 'inline-block'
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: e => {
      e.stopPropagation();
      setOpen(!open);
    }
  }, trigger), open && /*#__PURE__*/React.createElement(FloatingPanel, {
    align: align,
    minWidth: 180,
    padding: 6
  }, items.map((it, i) => it.divider ? /*#__PURE__*/React.createElement("div", {
    key: `d${i}`,
    style: {
      height: 1,
      background: 'var(--ob-border)',
      margin: '6px 0'
    }
  }) : /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => {
      it.onClick?.();
      setOpen(false);
    },
    disabled: it.disabled,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: '100%',
      padding: '9px 10px',
      border: 'none',
      borderRadius: 'var(--ob-r-sm)',
      background: 'transparent',
      cursor: it.disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'inherit',
      fontSize: 14,
      fontWeight: 500,
      textAlign: 'left',
      color: it.danger ? 'var(--ob-danger)' : 'var(--ob-fg-strong)',
      opacity: it.disabled ? 0.5 : 1,
      transition: 'background 120ms'
    },
    onMouseEnter: e => {
      if (!it.disabled) e.currentTarget.style.background = 'var(--ob-bg-alt)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'transparent';
    }
  }, it.icon && /*#__PURE__*/React.createElement("span", {
    style: {
      color: it.danger ? 'var(--ob-danger)' : 'var(--ob-fg-soft)',
      display: 'flex'
    }
  }, it.icon), it.label))));
};

// ── MODAL ────────────────────────────────────────────────
const MODAL_WIDTHS = {
  sm: 360,
  md: 440,
  lg: 720,
  full: '92vw'
};
const Modal = ({
  open,
  onClose,
  title,
  children,
  footer,
  width,
  size = 'md'
}) => {
  const resolvedWidth = width ?? MODAL_WIDTHS[size] ?? MODAL_WIDTHS.md;
  useEffect(() => {
    if (!open) return;
    const h = e => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(20,20,20,var(--ob-opacity-scrim))',
      backdropFilter: 'blur(2px)',
      padding: 24,
      animation: 'ob-fade 160ms ease-out'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: resolvedWidth,
      maxWidth: '100%',
      background: 'var(--ob-surface)',
      borderRadius: 'var(--ob-r-overlay)',
      boxShadow: 'var(--ob-shadow-lg)',
      overflow: 'hidden',
      animation: 'ob-pop 200ms var(--ob-ease-spring)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
      padding: '20px 24px 0'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)'
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      flex: 'none',
      width: 30,
      height: 30,
      borderRadius: 'var(--ob-r-sm)',
      border: 'none',
      background: 'transparent',
      color: 'var(--ob-fg-soft)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = 'var(--ob-bg-alt)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'transparent';
    }
  }, /*#__PURE__*/React.createElement(Icons.x, {
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 24px 20px',
      fontSize: 14,
      lineHeight: 1.6,
      color: 'var(--ob-fg)'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 8,
      padding: '16px 24px',
      borderTop: '1px solid var(--ob-border)',
      background: 'var(--ob-bg-alt)'
    }
  }, footer)));
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
const Tooltip = ({
  children,
  variant = 'text',
  placement = 'top',
  label,
  shortcut,
  image,
  title,
  subtitle,
  delay = 120,
  maxWidth = 240
}) => {
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const show = () => {
    timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };
  const inverted = variant === 'inverted';
  const bg = inverted ? 'var(--ob-surface)' : 'var(--ob-ink-strong)';
  const fg = inverted ? 'var(--ob-fg-strong)' : '#fff';
  const subFg = inverted ? 'var(--ob-fg-soft)' : 'rgba(255,255,255,0.7)';
  const bordered = inverted ? '1px solid var(--ob-border)' : 'none';

  // popup position
  const pos = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: 8
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: 8
    },
    left: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginRight: 8
    },
    right: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: 8
    }
  }[placement];

  // arrow position
  const arrowBase = {
    position: 'absolute',
    width: 8,
    height: 8,
    background: bg,
    transform: 'rotate(45deg)',
    border: bordered
  };
  const arrowPos = {
    top: {
      bottom: -4,
      left: '50%',
      marginLeft: -4,
      borderTop: 'none',
      borderLeft: 'none'
    },
    bottom: {
      top: -4,
      left: '50%',
      marginLeft: -4,
      borderBottom: 'none',
      borderRight: 'none'
    },
    left: {
      right: -4,
      top: '50%',
      marginTop: -4,
      borderBottom: 'none',
      borderLeft: 'none'
    },
    right: {
      left: -4,
      top: '50%',
      marginTop: -4,
      borderTop: 'none',
      borderRight: 'none'
    }
  }[placement];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex'
    },
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide
  }, children, open && /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: 'absolute',
      zIndex: 1500,
      ...pos,
      background: bg,
      color: fg,
      border: bordered,
      borderRadius: variant === 'image' ? 12 : 8,
      boxShadow: inverted ? 'var(--ob-shadow-md)' : '0 4px 12px rgba(0,0,0,0.18)',
      padding: variant === 'image' ? 6 : '8px 11px',
      fontSize: 13,
      lineHeight: 1.4,
      fontWeight: 500,
      whiteSpace: variant === 'image' ? 'normal' : 'nowrap',
      maxWidth: variant === 'image' ? 200 : maxWidth,
      pointerEvents: 'none',
      animation: 'ob-tip 140ms var(--ob-ease-out)'
    }
  }, variant === 'image' ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      width: 188
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      width: '100%',
      height: 110,
      borderRadius: 8,
      overflow: 'hidden',
      background: 'var(--ob-bg-alt)'
    }
  }, image && /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: title || '',
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    }
  })), title && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: fg,
      marginTop: 8,
      padding: '0 4px',
      whiteSpace: 'normal'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 12,
      color: subFg,
      marginTop: 2,
      padding: '0 4px 4px',
      whiteSpace: 'normal'
    }
  }, subtitle)) : /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", null, label), shortcut && /*#__PURE__*/React.createElement("kbd", {
    style: {
      fontFamily: 'var(--ob-font-mono)',
      fontSize: 11,
      fontWeight: 600,
      padding: '2px 6px',
      borderRadius: 5,
      background: inverted ? 'var(--ob-bg-alt)' : 'rgba(255,255,255,0.16)',
      color: inverted ? 'var(--ob-fg-soft)' : 'rgba(255,255,255,0.9)'
    }
  }, shortcut)), variant !== 'image' && /*#__PURE__*/React.createElement("span", {
    style: {
      ...arrowBase,
      ...arrowPos
    }
  })));
};
if (typeof document !== 'undefined' && !document.getElementById('ob-tip-kf')) {
  const st = document.createElement('style');
  st.id = 'ob-tip-kf';
  st.textContent = '@keyframes ob-tip { from { opacity: 0; } }';
  document.head.appendChild(st);
}

// ── PhIcon (local helper — requires @phosphor-icons/web CSS) ────
const Ph = ({
  n,
  size = 18,
  c,
  style
}) => /*#__PURE__*/React.createElement("i", {
  className: `ph ph-${n}`,
  "aria-hidden": "true",
  style: {
    fontSize: size,
    color: c || 'currentColor',
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style
  }
});

// ── CHIP ─────────────────────────────────────────────────
const Chip = ({
  label,
  selected = false,
  onToggle,
  removable = false,
  onRemove,
  icon,
  size = 'md',
  disabled = false
}) => {
  const fs = size === 'sm' ? 12 : 13;
  const pad = size === 'sm' ? '5px 10px' : '7px 14px';
  const gap = size === 'sm' ? 5 : 6;
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap,
    padding: removable ? size === 'sm' ? '5px 6px 5px 10px' : '7px 8px 7px 14px' : pad,
    borderRadius: 999,
    fontSize: fs,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s',
    userSelect: 'none',
    opacity: disabled ? 0.45 : 1,
    border: '1.5px solid',
    outline: 'none',
    fontFamily: 'var(--ob-font)'
  };
  const stateStyle = selected ? {
    background: 'var(--ob-blue)',
    color: '#fff',
    borderColor: 'var(--ob-blue)'
  } : {
    background: 'var(--ob-surface)',
    color: 'var(--ob-fg-strong)',
    borderColor: 'var(--ob-border)'
  };
  return /*#__PURE__*/React.createElement("span", {
    role: "button",
    tabIndex: disabled ? -1 : 0,
    "aria-pressed": selected,
    onClick: () => !disabled && onToggle?.(),
    onKeyDown: e => !disabled && (e.key === 'Enter' || e.key === ' ') && onToggle?.(),
    style: {
      ...base,
      ...stateStyle
    }
  }, icon && /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${icon}`,
    style: {
      fontSize: size === 'sm' ? 13 : 15,
      lineHeight: 1
    }
  }), label, removable && /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      !disabled && onRemove?.();
    },
    "aria-label": `Remover ${label}`,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size === 'sm' ? 16 : 18,
      height: size === 'sm' ? 16 : 18,
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      background: selected ? 'rgba(255,255,255,0.25)' : 'var(--ob-bg-warm)',
      color: selected ? '#fff' : 'var(--ob-fg-soft)',
      fontSize: size === 'sm' ? 10 : 11,
      fontWeight: 700,
      lineHeight: 1,
      flexShrink: 0
    }
  }, "\u2715"));
};
const Drawer = ({
  open,
  onClose,
  title,
  children,
  side = 'right',
  width = 400,
  footer
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  const transform = side === 'right' ? open ? 'translateX(0)' : 'translateX(100%)' : open ? 'translateX(0)' : 'translateX(-100%)';
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(20,20,20,var(--ob-opacity-scrim))',
      backdropFilter: 'blur(2px)',
      zIndex: 8000,
      opacity: open ? 1 : 0,
      pointerEvents: open ? 'all' : 'none',
      transition: 'opacity 0.22s ease'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 0,
      bottom: 0,
      [side]: 0,
      width,
      maxWidth: '100%',
      background: 'var(--ob-surface)',
      borderLeft: side === 'right' ? '1px solid var(--ob-border)' : 'none',
      borderRight: side === 'left' ? '1px solid var(--ob-border)' : 'none',
      zIndex: 8001,
      display: 'flex',
      flexDirection: 'column',
      transform,
      transition: 'transform 0.25s var(--ob-ease)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 24px',
      borderBottom: '1px solid var(--ob-border)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)'
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: 32,
      height: 32,
      borderRadius: 'var(--ob-r-sm)',
      border: 'none',
      background: 'none',
      color: 'var(--ob-fg-mute)',
      cursor: 'pointer',
      fontSize: 18,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '20px 24px'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 24px',
      borderTop: '1px solid var(--ob-border)',
      background: 'var(--ob-bg-alt)',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 10,
      flexShrink: 0
    }
  }, footer))), document.body);
};
const OB_TONES = {
  info: {
    fg: 'var(--ob-blue)',
    bg: 'var(--ob-blue-100)',
    strong: 'var(--ob-blue-700)',
    icon: 'info'
  },
  success: {
    fg: 'var(--ob-green)',
    bg: 'var(--ob-green-100)',
    strong: 'var(--ob-green-700)',
    icon: 'check-circle'
  },
  warning: {
    fg: 'var(--ob-orange)',
    bg: 'var(--ob-orange-100)',
    strong: 'var(--ob-orange-700)',
    icon: 'warning'
  },
  danger: {
    fg: 'var(--ob-danger)',
    bg: 'var(--ob-danger-bg)',
    strong: 'var(--ob-danger)',
    icon: 'warning-circle'
  }
};

// ── CODE INPUT (OTP / verificação) ──────────────────────
const CodeInput = ({
  length = 6,
  value = '',
  onChange,
  status = 'default'
}) => {
  const refs = useRef([]);
  const vals = value.split('');
  const set = (i, ch) => {
    const next = value.split('');
    next[i] = ch;
    onChange?.(next.join('').slice(0, length));
    if (ch && i < length - 1) refs.current[i + 1]?.focus();
  };
  const keyDown = (i, e) => {
    if (e.key === 'Backspace' && !vals[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
  };
  const paste = e => {
    e.preventDefault();
    const digits = (e.clipboardData.getData('text').match(/\d/g) || []).slice(0, length);
    onChange?.(digits.join(''));
    refs.current[Math.min(digits.length, length - 1)]?.focus();
  };
  if (typeof document !== 'undefined' && !document.getElementById('ob-shake-kf')) {
    const st = document.createElement('style');
    st.id = 'ob-shake-kf';
    st.textContent = '@keyframes ob-shake{10%,90%{transform:translateX(-1px)}20%,80%{transform:translateX(2px)}30%,50%,70%{transform:translateX(-4px)}40%,60%{transform:translateX(4px)}}';
    document.head.appendChild(st);
  }
  const borderFor = filled => status === 'error' ? 'var(--ob-danger)' : status === 'success' ? 'var(--ob-green)' : filled ? 'var(--ob-blue)' : 'var(--ob-border)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      gap: 10,
      animation: status === 'error' ? 'ob-shake 0.4s' : 'none'
    },
    onPaste: paste
  }, Array.from({
    length
  }).map((_, i) => /*#__PURE__*/React.createElement("input", {
    key: i,
    ref: el => refs.current[i] = el,
    inputMode: "numeric",
    maxLength: 1,
    value: vals[i] || '',
    onChange: e => set(i, e.target.value.replace(/\D/g, '')),
    onKeyDown: e => keyDown(i, e),
    style: {
      width: 48,
      height: 56,
      textAlign: 'center',
      fontFamily: 'var(--ob-font)',
      fontSize: 22,
      fontWeight: 700,
      borderRadius: 'var(--ob-r-md)',
      caretColor: 'var(--ob-blue)',
      outline: 'none',
      color: status === 'error' ? 'var(--ob-danger)' : status === 'success' ? 'var(--ob-green-700)' : 'var(--ob-fg-strong)',
      background: 'var(--ob-surface)',
      border: `2px solid ${borderFor(!!vals[i])}`,
      transition: 'border-color 0.15s, box-shadow 0.15s'
    },
    onFocus: e => {
      if (status === 'default') e.target.style.boxShadow = '0 0 0 4px var(--ob-focus-ring)';
    },
    onBlur: e => e.target.style.boxShadow = 'none'
  })));
};

// ── SEARCH INPUT ────────────────────────────────────────
const SearchInput = ({
  value = '',
  onChange,
  loading = false,
  placeholder = 'Buscar…',
  results = [],
  onSelect,
  width = 320
}) => {
  const [focus, setFocus] = useState(false);
  const showDrop = focus && results.length > 0;
  if (typeof document !== 'undefined' && !document.getElementById('ob-spin-kf')) {
    const st = document.createElement('style');
    st.id = 'ob-spin-kf';
    st.textContent = '@keyframes ob-spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(st);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width
    }
  }, /*#__PURE__*/React.createElement(FieldShell, {
    focused: focus
  }, /*#__PURE__*/React.createElement(Ph, {
    n: "magnifying-glass",
    size: 18,
    c: "var(--ob-fg-mute)"
  }), /*#__PURE__*/React.createElement("input", {
    value: value,
    onChange: e => onChange?.(e.target.value),
    placeholder: placeholder,
    onFocus: () => setFocus(true),
    onBlur: () => setTimeout(() => setFocus(false), 150),
    style: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'none',
      fontFamily: 'var(--ob-font)',
      fontSize: 14.5,
      color: 'var(--ob-fg-strong)'
    }
  }), loading && /*#__PURE__*/React.createElement("i", {
    className: "ph ph-circle-notch",
    style: {
      fontSize: 17,
      color: 'var(--ob-blue)',
      animation: 'ob-spin 0.8s linear infinite',
      flex: 'none'
    }
  }), !loading && value && /*#__PURE__*/React.createElement("button", {
    onClick: () => onChange?.(''),
    "aria-label": "Limpar",
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: 'var(--ob-fg-mute)',
      display: 'flex',
      padding: 2,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(Ph, {
    n: "x-circle",
    size: 17
  }))), showDrop && /*#__PURE__*/React.createElement(FloatingPanel, {
    padding: 0
  }, results.map((r, i) => {
    const lbl = typeof r === 'string' ? r : r.label;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      onMouseDown: () => {
        onSelect?.(r);
        onChange?.(lbl);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '11px 14px',
        border: 'none',
        borderBottom: i < results.length - 1 ? '1px solid var(--ob-line-soft)' : 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontFamily: 'var(--ob-font)',
        fontSize: 14,
        color: 'var(--ob-fg)',
        textAlign: 'left'
      },
      onMouseEnter: e => e.currentTarget.style.background = 'var(--ob-bg-warm)',
      onMouseLeave: e => e.currentTarget.style.background = 'transparent'
    }, /*#__PURE__*/React.createElement(Ph, {
      n: "arrow-elbow-down-right",
      size: 14,
      c: "var(--ob-fg-mute)"
    }), lbl);
  })));
};

// ── ALERT ───────────────────────────────────────────────
const Alert = ({
  tone = 'info',
  title,
  children,
  dismissible = false,
  onClose,
  action,
  onAction
}) => {
  const t = OB_TONES[tone] || OB_TONES.info;
  return /*#__PURE__*/React.createElement("div", {
    role: "alert",
    style: {
      display: 'flex',
      gap: 13,
      width: '100%',
      padding: '14px 16px',
      background: t.bg,
      border: `1px solid color-mix(in srgb, ${t.fg} 28%, transparent)`,
      borderRadius: 'var(--ob-r-md)',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement(Ph, {
    n: t.icon,
    size: 20,
    c: t.fg
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--ob-fg-strong)',
      marginBottom: children ? 3 : 0
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: 'var(--ob-fg)',
      lineHeight: 1.5
    }
  }, children), action && /*#__PURE__*/React.createElement("button", {
    onClick: onAction,
    style: {
      marginTop: 10,
      border: 'none',
      background: 'none',
      padding: 0,
      cursor: 'pointer',
      color: t.strong,
      fontWeight: 700,
      fontSize: 13,
      fontFamily: 'var(--ob-font)'
    }
  }, action, " \u2192")), dismissible && onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Fechar",
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: 'var(--ob-fg-soft)',
      display: 'flex',
      padding: 2,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(Ph, {
    n: "x",
    size: 15
  })));
};

// ── TOAST ───────────────────────────────────────────────
const Toast = ({
  tone = 'info',
  title,
  body,
  action,
  onAction,
  onClose,
  icon = true
}) => {
  const t = OB_TONES[tone] || OB_TONES.info;
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    "aria-live": "polite",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      maxWidth: 400,
      padding: 14,
      boxSizing: 'border-box',
      background: 'var(--ob-surface)',
      border: '1px solid var(--ob-border)',
      borderRadius: 'var(--ob-r-surface)',
      boxShadow: 'var(--ob-shadow-lg)'
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      width: 30,
      height: 30,
      borderRadius: 'var(--ob-r-sm)',
      background: t.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Ph, {
    n: t.icon,
    size: 17,
    c: t.fg
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--ob-fg-strong)',
      lineHeight: 1.4
    }
  }, title), body && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--ob-fg-soft)',
      marginTop: 3,
      lineHeight: 1.5
    }
  }, body), action && /*#__PURE__*/React.createElement("button", {
    onClick: onAction,
    style: {
      marginTop: 8,
      border: 'none',
      background: 'none',
      padding: 0,
      cursor: 'pointer',
      color: t.strong,
      fontWeight: 700,
      fontSize: 13,
      fontFamily: 'var(--ob-font)'
    }
  }, action)), onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Fechar",
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: 'var(--ob-fg-mute)',
      display: 'flex',
      padding: 2,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Ph, {
    n: "x",
    size: 16
  })));
};

// ── PROGRESS BAR ────────────────────────────────────────
const ProgressBar = ({
  value = 0,
  tone = 'info',
  size = 'md',
  indeterminate = false,
  showLabel = false,
  segments,
  currentSegment = 0
}) => {
  const t = OB_TONES[tone] || OB_TONES.info;
  const h = size === 'sm' ? 6 : size === 'lg' ? 14 : 10;
  if (typeof document !== 'undefined' && !document.getElementById('ob-indet-kf')) {
    const st = document.createElement('style');
    st.id = 'ob-indet-kf';
    st.textContent = '@keyframes ob-indet{0%{left:-40%;width:40%}50%{width:55%}100%{left:100%;width:40%}}';
    document.head.appendChild(st);
  }
  if (segments) return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      width: '100%'
    }
  }, Array.from({
    length: segments
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      height: h,
      borderRadius: 999,
      background: i < currentSegment ? t.fg : 'var(--ob-border)'
    }
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: h,
      background: 'var(--ob-bg-warm)',
      borderRadius: 999,
      overflow: 'hidden',
      position: 'relative'
    }
  }, indeterminate ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      height: '100%',
      background: t.fg,
      borderRadius: 999,
      animation: 'ob-indet 1.4s ease-in-out infinite'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${Math.min(100, Math.max(0, value))}%`,
      height: '100%',
      background: t.fg,
      borderRadius: 999,
      transition: 'width 0.4s cubic-bezier(.4,0,.2,1)'
    }
  })), showLabel && !indeterminate && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--ob-font-mono)',
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--ob-fg-strong)',
      width: 36,
      textAlign: 'right',
      flex: 'none'
    }
  }, Math.round(value), "%"));
};

// ── SIDE NAV ────────────────────────────────────────────
const SideNav = ({
  items = [],
  active,
  onNav,
  collapsed = false,
  onToggle,
  flush = false,
  workspaceName = 'Workspace',
  userInitials = 'OB'
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    width: flush ? '100%' : collapsed ? 72 : 240,
    minWidth: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
    height: flush ? '100%' : undefined,
    background: 'var(--ob-surface)',
    border: flush ? 'none' : '1px solid var(--ob-border)',
    borderRight: flush ? '1px solid var(--ob-border)' : undefined,
    borderRadius: flush ? 0 : 'var(--ob-r-lg)',
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  }
}, collapsed ? /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    justifyContent: 'center',
    padding: '4px 0 14px'
  }
}, /*#__PURE__*/React.createElement("button", {
  onClick: onToggle,
  title: "Expandir",
  style: {
    width: 36,
    height: 36,
    borderRadius: 'var(--ob-r-md)',
    border: '1.5px solid var(--ob-border)',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--ob-fg-soft)'
  },
  onMouseEnter: e => {
    e.currentTarget.style.background = 'var(--ob-bg-warm)';
    e.currentTarget.style.color = 'var(--ob-blue)';
  },
  onMouseLeave: e => {
    e.currentTarget.style.background = 'transparent';
    e.currentTarget.style.color = 'var(--ob-fg-soft)';
  }
}, /*#__PURE__*/React.createElement(Ph, {
  n: "caret-line-right",
  size: 18
}))) : /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 4px 14px 8px'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 9
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    width: 28,
    height: 28,
    borderRadius: 'var(--ob-r-sm)',
    background: 'var(--ob-blue)',
    color: '#fff',
    fontWeight: 800,
    fontSize: 15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 'none'
  }
}, "O"), /*#__PURE__*/React.createElement("span", {
  style: {
    fontWeight: 700,
    fontSize: 16,
    color: 'var(--ob-fg-strong)',
    letterSpacing: '-0.02em'
  }
}, "Onblide")), onToggle && /*#__PURE__*/React.createElement("button", {
  onClick: onToggle,
  title: "Recolher",
  style: {
    width: 30,
    height: 30,
    borderRadius: 'var(--ob-r-md)',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--ob-fg-soft)'
  },
  onMouseEnter: e => {
    e.currentTarget.style.background = 'var(--ob-bg-warm)';
    e.currentTarget.style.color = 'var(--ob-fg-strong)';
  },
  onMouseLeave: e => {
    e.currentTarget.style.background = 'transparent';
    e.currentTarget.style.color = 'var(--ob-fg-soft)';
  }
}, /*#__PURE__*/React.createElement(Ph, {
  n: "caret-line-left",
  size: 18
}))), !collapsed && /*#__PURE__*/React.createElement("p", {
  style: {
    fontFamily: 'var(--ob-font-mono)',
    fontSize: 10,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--ob-fg-mute)',
    margin: '0 10px 6px'
  }
}, "Menu"), items.map((it, i) => {
  if (it.section) return !collapsed ? /*#__PURE__*/React.createElement("p", {
    key: i,
    style: {
      fontFamily: 'var(--ob-font-mono)',
      fontSize: 10,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--ob-fg-mute)',
      margin: '12px 10px 4px'
    }
  }, it.section) : null;
  const on = active === it.id;
  return /*#__PURE__*/React.createElement("button", {
    key: it.id || i,
    onClick: () => onNav?.(it.id),
    title: collapsed ? it.label : undefined,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      justifyContent: collapsed ? 'center' : 'flex-start',
      height: 42,
      padding: collapsed ? 0 : '0 12px',
      borderRadius: 'var(--ob-r-md)',
      border: 'none',
      cursor: 'pointer',
      position: 'relative',
      background: on ? 'var(--ob-blue-100)' : 'transparent',
      color: on ? 'var(--ob-blue-700)' : 'var(--ob-fg-soft)',
      fontFamily: 'var(--ob-font)',
      fontSize: 14,
      fontWeight: on ? 600 : 500,
      transition: 'background 0.12s'
    },
    onMouseEnter: e => {
      if (!on) e.currentTarget.style.background = 'var(--ob-bg-warm)';
    },
    onMouseLeave: e => {
      if (!on) e.currentTarget.style.background = 'transparent';
    }
  }, on && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 0,
      top: 10,
      bottom: 10,
      width: 3,
      borderRadius: 3,
      background: 'var(--ob-blue)'
    }
  }), it.icon && /*#__PURE__*/React.createElement(Ph, {
    n: it.icon,
    size: 20
  }), !collapsed && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: 'left'
    }
  }, it.label), !collapsed && it.badge != null && /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 20,
      height: 20,
      padding: '0 6px',
      borderRadius: 999,
      background: 'var(--ob-orange)',
      color: '#fff',
      fontSize: 11,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, it.badge), collapsed && it.badge != null && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 7,
      right: 9,
      width: 8,
      height: 8,
      borderRadius: 999,
      background: 'var(--ob-orange)',
      border: '2px solid var(--ob-surface)'
    }
  }));
}), /*#__PURE__*/React.createElement("div", {
  style: {
    marginTop: 'auto',
    borderTop: '1px solid var(--ob-line-soft)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: collapsed ? '10px 0 2px' : '10px 8px 2px',
    justifyContent: collapsed ? 'center' : 'flex-start'
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    width: 30,
    height: 30,
    borderRadius: 999,
    background: 'var(--ob-blue)',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 'none'
  }
}, userInitials), !collapsed && /*#__PURE__*/React.createElement("div", {
  style: {
    minWidth: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--ob-fg-strong)',
    lineHeight: 1.2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }
}, "Onblide"), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    color: 'var(--ob-fg-mute)'
  }
}, workspaceName))));

// ── SELECT ───────────────────────────────────────────────
const Select = ({
  options = [],
  value = null,
  onChange,
  multi = false,
  label,
  placeholder = 'Selecione…',
  disabled = false,
  error,
  width
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  // normalise value
  const selected = multi ? Array.isArray(value) ? value : [] : value;
  const filtered = options.filter(o => (typeof o === 'string' ? o : o.label).toLowerCase().includes(query.toLowerCase()));
  useEffect(() => {
    if (open) setHighlighted(0);
  }, [open, query]);
  useEffect(() => {
    const handler = e => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const getLabel = o => typeof o === 'string' ? o : o.label;
  const toggle = opt => {
    const lbl = getLabel(opt);
    if (multi) {
      const next = selected.includes(lbl) ? selected.filter(s => s !== lbl) : [...selected, lbl];
      onChange?.(next);
    } else {
      onChange?.(lbl);
      setOpen(false);
      setQuery('');
    }
  };
  const removeChip = lbl => onChange?.(selected.filter(s => s !== lbl));
  const onKeyDown = e => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, filtered.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    }
    if (e.key === 'Enter' && filtered[highlighted]) {
      e.preventDefault();
      toggle(filtered[highlighted]);
    }
    if (e.key === 'Backspace' && multi && !query && selected.length) {
      onChange?.(selected.slice(0, -1));
    }
  };
  const displayValue = !multi && selected && !open ? selected : '';
  return /*#__PURE__*/React.createElement("div", {
    ref: rootRef,
    style: {
      position: 'relative',
      width: width || '100%',
      fontFamily: 'var(--ob-font)'
    }
  }, label && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--ob-fg-strong)',
      marginBottom: 6
    }
  }, label), /*#__PURE__*/React.createElement(FieldShell, {
    focused: open,
    error: !!error,
    disabled: disabled,
    padding: multi && selected.length ? '6px 10px' : '0 12px',
    onClick: () => {
      if (!disabled) {
        setOpen(o => !o);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    },
    style: {
      flexWrap: 'wrap',
      gap: 6,
      cursor: disabled ? 'not-allowed' : 'pointer'
    }
  }, multi && selected.map(s => /*#__PURE__*/React.createElement(Chip, {
    key: s,
    label: s,
    size: "sm",
    selected: true,
    removable: true,
    onToggle: () => {},
    onRemove: () => removeChip(s)
  })), /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    value: open ? query : displayValue,
    placeholder: !multi || !selected.length ? placeholder : '',
    disabled: disabled,
    onChange: e => {
      setQuery(e.target.value);
      if (!open) setOpen(true);
    },
    onKeyDown: onKeyDown,
    onFocus: () => {
      if (!disabled) setOpen(true);
    },
    style: {
      flex: 1,
      minWidth: 60,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontSize: 14,
      color: 'var(--ob-fg-strong)',
      cursor: disabled ? 'not-allowed' : 'text',
      padding: multi && selected.length ? '0' : '0 2px',
      height: multi && selected.length ? 26 : 40
    }
  }), /*#__PURE__*/React.createElement(Ph, {
    n: "caret-down",
    size: 16,
    c: "var(--ob-fg-mute)",
    style: {
      flex: 'none',
      transform: open ? 'rotate(180deg)' : 'none',
      transition: 'transform 0.15s'
    }
  })), open && /*#__PURE__*/React.createElement(FloatingPanel, {
    maxHeight: 240,
    padding: 4
  }, filtered.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px',
      fontSize: 13,
      color: 'var(--ob-fg-mute)',
      textAlign: 'center'
    }
  }, "Nenhuma op\xE7\xE3o encontrada"), filtered.map((opt, i) => {
    const lbl = getLabel(opt);
    const isSelected = multi ? selected.includes(lbl) : selected === lbl;
    const isHigh = i === highlighted;
    return /*#__PURE__*/React.createElement("div", {
      key: lbl,
      onMouseDown: e => {
        e.preventDefault();
        toggle(opt);
      },
      onMouseEnter: () => setHighlighted(i),
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: '9px 12px',
        borderRadius: 'var(--ob-r-sm)',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: isSelected && !multi ? 600 : 400,
        color: isSelected && !multi ? 'var(--ob-blue-700)' : 'var(--ob-fg)',
        background: isHigh ? 'var(--ob-bg-warm)' : isSelected && !multi ? 'var(--ob-blue-100)' : 'transparent',
        transition: 'background 0.1s'
      }
    }, multi ?
    /*#__PURE__*/
    /* Multi list item — real Checkbox */
    React.createElement(Checkbox, {
      checked: isSelected,
      onChange: () => {},
      label: lbl
    }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, lbl), isSelected && /*#__PURE__*/React.createElement(Ph, {
      n: "check",
      size: 15,
      c: "var(--ob-blue)"
    })));
  })), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ob-danger)',
      marginTop: 5,
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Ph, {
    n: "warning-circle",
    size: 13,
    c: "var(--ob-danger)"
  }), error));
};

// ── TOAST STACK (global singleton) ────────────────────────
// position: 'top-left' | 'top-center' | 'top-right' |
//           'bottom-left' | 'bottom-center' | 'bottom-right'
const OB_TOAST_POS = {
  'top-left': {
    top: 24,
    left: 24,
    align: 'flex-start'
  },
  'top-center': {
    top: 24,
    left: '50%',
    align: 'center',
    cx: true
  },
  'top-right': {
    top: 24,
    right: 24,
    align: 'flex-end'
  },
  'bottom-left': {
    bottom: 24,
    left: 24,
    align: 'flex-start'
  },
  'bottom-center': {
    bottom: 24,
    left: '50%',
    align: 'center',
    cx: true
  },
  'bottom-right': {
    bottom: 24,
    right: 24,
    align: 'flex-end'
  }
};
const ToastStack = ({
  position = 'bottom-right'
}) => {
  const [toasts, setToasts] = useState([]);
  const dismiss = React.useCallback(id => {
    setToasts(ts => ts.map(t => t.id === id ? {
      ...t,
      leaving: true
    } : t));
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 200);
  }, []);
  useEffect(() => {
    const handler = e => {
      const id = Date.now() + Math.random();
      setToasts(ts => [...ts.slice(-2), {
        ...e.detail,
        id,
        leaving: false
      }]);
      setTimeout(() => dismiss(id), 4800);
    };
    window.addEventListener('ob-toast', handler);
    return () => window.removeEventListener('ob-toast', handler);
  }, [dismiss]);
  if (!toasts.length) return null;
  const pos = OB_TOAST_POS[position] || OB_TOAST_POS['bottom-right'];
  const isTop = position.startsWith('top');
  const animIn = isTop ? 'ob-toast-in-top' : 'ob-toast-in-bottom';
  const animOut = isTop ? 'ob-toast-out-top' : 'ob-toast-out-bottom';
  const {
    align,
    cx,
    ...anchor
  } = pos;
  return /*#__PURE__*/React.createElement("div", {
    id: "ob-toast-stack",
    "data-pos": position,
    style: {
      position: 'fixed',
      zIndex: 9999,
      ...anchor,
      transform: cx ? 'translateX(-50%)' : undefined,
      display: 'flex',
      flexDirection: isTop ? 'column-reverse' : 'column',
      gap: 10,
      alignItems: align,
      pointerEvents: 'none',
      width: 'min(400px, calc(100vw - 32px))'
    }
  }, toasts.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    style: {
      width: '100%',
      pointerEvents: 'all',
      animation: `${t.leaving ? animOut : animIn} 0.2s cubic-bezier(0.16,1,0.3,1) both`
    }
  }, /*#__PURE__*/React.createElement(Toast, _extends({}, t, {
    onClose: () => dismiss(t.id)
  })))));
};
if (typeof document !== 'undefined' && !document.getElementById('ob-toast-kf')) {
  const st = document.createElement('style');
  st.id = 'ob-toast-kf';
  st.textContent = ['@keyframes ob-toast-in-top{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}', '@keyframes ob-toast-out-top{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-16px)}}', '@keyframes ob-toast-in-bottom{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}', '@keyframes ob-toast-out-bottom{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(16px)}}'].join('');
  document.head.appendChild(st);
}
if (typeof document !== 'undefined' && !document.getElementById('ob-toast-pos')) {
  const sp = document.createElement('style');
  sp.id = 'ob-toast-pos';
  // Mobile: keep the top/bottom intent (thumb reach for bottom, passive for top),
  // collapse horizontal to full-width center. Per Mobbin: both anchors are valid;
  // bottom is ideal when the toast carries an action.
  sp.textContent = ['@media(max-width:600px){', '#ob-toast-stack{left:50%!important;right:auto!important;transform:translateX(-50%)!important;width:calc(100vw - 24px)!important;align-items:stretch!important}', '#ob-toast-stack[data-pos^="top"]{top:16px!important;bottom:auto!important;flex-direction:column-reverse!important}', '#ob-toast-stack[data-pos^="bottom"]{bottom:16px!important;top:auto!important;flex-direction:column!important}', '}'].join('');
  document.head.appendChild(sp);
}
window.obToast = detail => window.dispatchEvent(new CustomEvent('ob-toast', {
  detail
}));

// ── TABS ─────────────────────────────────────────────────
const Tabs = ({
  tabs = [],
  active,
  onChange,
  variant = 'line',
  size = 'md'
}) => {
  const isLine = variant === 'line';
  const pad = size === 'sm' ? '7px 14px' : '10px 18px';
  const fs = size === 'sm' ? 13 : 14;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, isLine && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 1,
      background: 'var(--ob-border)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      gap: isLine ? 0 : 4,
      background: isLine ? 'none' : 'var(--ob-bg-alt)',
      border: isLine ? 'none' : '1px solid var(--ob-border)',
      borderRadius: isLine ? 0 : 'var(--ob-r-sm)',
      padding: isLine ? 0 : 3,
      position: 'relative'
    }
  }, tabs.map(tab => {
    const isActive = tab.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: tab.id,
      onClick: () => onChange?.(tab.id),
      disabled: tab.disabled,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: pad,
        border: 'none',
        cursor: tab.disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--ob-font)',
        fontSize: fs,
        fontWeight: 600,
        borderRadius: isLine ? 0 : 'var(--ob-r-sm)',
        transition: 'all 0.15s',
        position: 'relative',
        background: isLine ? 'none' : isActive ? 'var(--ob-surface)' : 'none',
        color: isActive ? 'var(--ob-fg-strong)' : 'var(--ob-fg-mute)',
        opacity: tab.disabled ? 0.45 : 1,
        boxShadow: !isLine && isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
      }
    }, tab.icon && /*#__PURE__*/React.createElement(Ph, {
      n: tab.icon,
      size: 15
    }), tab.label, tab.badge != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        padding: '1px 6px',
        borderRadius: 999,
        background: isActive ? 'var(--ob-blue)' : 'var(--ob-bg-warm)',
        color: isActive ? '#fff' : 'var(--ob-fg-soft)'
      }
    }, tab.badge), isLine && isActive && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        bottom: -1,
        left: 0,
        right: 0,
        height: 2,
        background: 'var(--ob-blue)',
        borderRadius: '2px 2px 0 0'
      }
    }));
  })));
};

// ── TABLE ─────────────────────────────────────────────────
const Table = ({
  columns = [],
  rows = [],
  selectable = false,
  onSelect,
  loading = false,
  emptyState,
  onSort,
  sort
}) => {
  const {
    useState: useS
  } = React;
  const [selected, setSelected] = useS([]);
  const toggleAll = () => {
    const next = selected.length === rows.length ? [] : rows.map((_, i) => i);
    setSelected(next);
    onSelect?.(next.map(i => rows[i]));
  };
  const toggleRow = i => {
    const next = selected.includes(i) ? selected.filter(x => x !== i) : [...selected, i];
    setSelected(next);
    onSelect?.(next.map(j => rows[j]));
  };
  const allChecked = rows.length > 0 && selected.length === rows.length;
  const partChecked = selected.length > 0 && selected.length < rows.length;
  const thStyle = {
    padding: '10px 14px',
    textAlign: 'left',
    fontFamily: 'var(--ob-font-mono)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--ob-fg-mute)',
    borderBottom: '1.5px solid var(--ob-border)',
    background: 'var(--ob-surface)',
    whiteSpace: 'nowrap',
    userSelect: 'none'
  };
  const tdStyle = {
    padding: '12px 14px',
    fontSize: 14,
    color: 'var(--ob-fg)',
    borderBottom: '1px solid var(--ob-line-soft)',
    verticalAlign: 'middle'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      overflowX: 'auto',
      borderRadius: 'var(--ob-r-md)',
      border: '1px solid var(--ob-border)'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      background: 'var(--ob-surface)'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, selectable && /*#__PURE__*/React.createElement("th", {
    style: {
      ...thStyle,
      width: 44,
      padding: '10px 14px'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: allChecked,
    ref: el => {
      if (el) el.indeterminate = partChecked;
    },
    onChange: toggleAll,
    style: {
      accentColor: 'var(--ob-blue)',
      width: 15,
      height: 15,
      cursor: 'pointer'
    }
  })), columns.map(col => /*#__PURE__*/React.createElement("th", {
    key: col.key,
    style: {
      ...thStyle,
      cursor: col.sortable ? 'pointer' : 'default',
      width: col.width
    },
    onClick: () => col.sortable && onSort?.(col.key)
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, col.label, col.sortable && /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: sort?.key === col.key ? 1 : 0.35,
      color: 'var(--ob-blue)'
    }
  }, sort?.key === col.key ? sort.dir === 'asc' ? '↑' : '↓' : '↕')))))), /*#__PURE__*/React.createElement("tbody", null, loading ? Array.from({
    length: 4
  }).map((_, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, selectable && /*#__PURE__*/React.createElement("td", {
    style: tdStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 15,
      height: 15,
      borderRadius: 3,
      background: 'var(--ob-bg-alt)'
    }
  })), columns.map(col => /*#__PURE__*/React.createElement("td", {
    key: col.key,
    style: tdStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 14,
      borderRadius: 4,
      background: 'var(--ob-bg-alt)',
      width: `${60 + Math.random() * 30}%`,
      animation: 'ob-pulse 1.4s ease-in-out infinite'
    }
  }))))) : rows.length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: columns.length + (selectable ? 1 : 0),
    style: {
      ...tdStyle,
      textAlign: 'center',
      padding: '40px 14px',
      color: 'var(--ob-fg-mute)'
    }
  }, emptyState || 'Nenhum resultado encontrado.')) : rows.map((row, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    style: {
      background: selected.includes(i) ? 'var(--ob-blue-100)' : 'none',
      transition: 'background 0.1s'
    },
    onMouseEnter: e => {
      if (!selected.includes(i)) e.currentTarget.style.background = 'var(--ob-bg-warm)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = selected.includes(i) ? 'var(--ob-blue-100)' : 'none';
    }
  }, selectable && /*#__PURE__*/React.createElement("td", {
    style: tdStyle
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: selected.includes(i),
    onChange: () => toggleRow(i),
    style: {
      accentColor: 'var(--ob-blue)',
      width: 15,
      height: 15,
      cursor: 'pointer'
    }
  })), columns.map(col => /*#__PURE__*/React.createElement("td", {
    key: col.key,
    style: {
      ...tdStyle,
      fontWeight: col.bold ? 600 : 400,
      color: col.bold ? 'var(--ob-fg-strong)' : 'var(--ob-fg)'
    }
  }, col.render ? col.render(row[col.key], row) : row[col.key])))))));
};
Object.assign(window, {
  Radio,
  RadioGroup,
  Toggle,
  Checkbox,
  Link,
  Skeleton,
  Pagination,
  Dropdown,
  FloatingPanel,
  Modal,
  Drawer,
  Tooltip,
  Ph,
  OB_TONES,
  CodeInput,
  SearchInput,
  Alert,
  Toast,
  ProgressBar,
  SideNav,
  ToastStack,
  Select,
  Tabs,
  Table,
  Chip
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web_app/Components.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web_app/Primitives.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */
const {
  useState
} = React;

// ============================================================
// Onblide Web App — shared UI primitives
// ============================================================

const Logo = ({
  size = 28
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  }
}, /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 56 56"
}, /*#__PURE__*/React.createElement("rect", {
  width: "56",
  height: "56",
  rx: "14",
  fill: "#0a4ee4"
}), /*#__PURE__*/React.createElement("rect", {
  x: "10",
  y: "10",
  width: "20",
  height: "20",
  rx: "6",
  fill: "#f2f0e8"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "38",
  cy: "38",
  r: "10",
  fill: "#eb7c2d"
})), /*#__PURE__*/React.createElement("span", {
  style: {
    fontWeight: 800,
    fontSize: size * 0.72,
    letterSpacing: '-0.03em',
    color: 'var(--ob-fg-strong)'
  }
}, "on", /*#__PURE__*/React.createElement("span", {
  style: {
    color: 'var(--ob-blue)'
  }
}, "blide")));

// ── Phosphor Icons (real library via @phosphor-icons/web) ──────────────────
// Renders authentic Phosphor glyphs from the webfont CSS loaded in index.html.
// Usage identical to before: <Icons.house size={18}/> etc.
const PhIcon = ({
  name,
  size = 20,
  style = {}
}) => /*#__PURE__*/React.createElement("i", {
  className: `ph ph-${name}`,
  style: {
    fontSize: size,
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style
  },
  "aria-hidden": "true"
});
const Icons = {
  search: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "magnifying-glass",
    size: p.size,
    style: p.style
  }),
  house: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "house",
    size: p.size,
    style: p.style
  }),
  user: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "user",
    size: p.size,
    style: p.style
  }),
  chart: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "chart-line",
    size: p.size,
    style: p.style
  }),
  gear: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "gear",
    size: p.size,
    style: p.style
  }),
  bell: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "bell",
    size: p.size,
    style: p.style
  }),
  plus: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "plus",
    size: p.size,
    style: p.style
  }),
  check: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "check",
    size: p.size,
    style: p.style
  }),
  x: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "x",
    size: p.size,
    style: p.style
  }),
  arrowR: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "arrow-right",
    size: p.size,
    style: p.style
  }),
  caretD: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "caret-down",
    size: p.size,
    style: p.style
  }),
  caretL: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "caret-left",
    size: p.size,
    style: p.style
  }),
  caretR: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "caret-right",
    size: p.size,
    style: p.style
  }),
  folder: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "folder",
    size: p.size,
    style: p.style
  }),
  file: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "file",
    size: p.size,
    style: p.style
  }),
  calendar: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "calendar",
    size: p.size,
    style: p.style
  }),
  kanban: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "kanban",
    size: p.size,
    style: p.style
  }),
  bolt: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "lightning",
    size: p.size,
    style: p.style
  }),
  chat: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "chat-text",
    size: p.size,
    style: p.style
  }),
  logout: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "sign-out",
    size: p.size,
    style: p.style
  }),
  star: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "star",
    size: p.size,
    style: p.style
  }),
  heart: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "heart",
    size: p.size,
    style: p.style
  }),
  more: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "dots-three",
    size: p.size,
    style: p.style
  }),
  grid: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "squares-four",
    size: p.size,
    style: p.style
  }),
  sync: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "arrows-clockwise",
    size: p.size,
    style: p.style
  }),
  link: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "link",
    size: p.size,
    style: p.style
  }),
  info: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "info",
    size: p.size,
    style: p.style
  }),
  arrowSquareOut: (p = {}) => /*#__PURE__*/React.createElement(PhIcon, {
    name: "arrow-square-out",
    size: p.size,
    style: p.style
  })
};

// ============================================================
// Brand logos — faithful SVG reproductions in authentic brand colors.
// NOTE: @phosphor-icons/web (webfont) does not include brand logo glyphs —
// those only exist in the React package. Until the React package is added,
// these SVG marks (drawn in the Phosphor glyph style) are the correct approach.
// ============================================================
const Brands = {
  spotify: {
    name: 'Spotify',
    hex: '#1DB954',
    cat: 'Mídia',
    desc: 'Sincronize playlists e mostre o que você está ouvindo.',
    mark: s => /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "11",
      fill: "#1DB954"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M6 11 C10 8.2 14 8.2 18 11",
      stroke: "#000",
      strokeWidth: "1.9",
      fill: "none",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M6.8 13.6 C10 11.4 14 11.4 17.2 13.6",
      stroke: "#000",
      strokeWidth: "1.7",
      fill: "none",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M7.7 16 C10.3 14.4 13.7 14.4 16.3 16",
      stroke: "#000",
      strokeWidth: "1.5",
      fill: "none",
      strokeLinecap: "round"
    }))
  },
  slack: {
    name: 'Slack',
    hex: '#611f69',
    cat: 'Comunicação',
    desc: 'Receba notificações de tarefas e menções no seu canal.',
    mark: s => /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "10",
      width: "8",
      height: "4",
      rx: "2",
      fill: "#36C5F0"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "10",
      y: "13",
      width: "4",
      height: "8",
      rx: "2",
      fill: "#2EB67D"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "13",
      y: "10",
      width: "8",
      height: "4",
      rx: "2",
      fill: "#ECB22E"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "10",
      y: "3",
      width: "4",
      height: "8",
      rx: "2",
      fill: "#E01E5A"
    }))
  },
  notion: {
    name: 'Notion',
    hex: '#000000',
    cat: 'Produtividade',
    desc: 'Exporte documentos e tarefas para suas páginas do Notion.',
    mark: s => /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "2",
      width: "20",
      height: "20",
      rx: "4.5",
      fill: "#000"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8 16.5 V8 M8 8 L15.5 16.5 M15.5 16.5 V8",
      stroke: "#fff",
      strokeWidth: "1.7",
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  },
  figma: {
    name: 'Figma',
    hex: '#A259FF',
    cat: 'Design',
    desc: 'Importe frames e mantenha os tokens em sincronia.',
    mark: s => /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M12 2 H8.5 A3.5 3.5 0 0 0 8.5 9 H12 Z",
      fill: "#F24E1E"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 2 H15.5 A3.5 3.5 0 0 1 15.5 9 H12 Z",
      fill: "#FF7262"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 9 H8.5 A3.5 3.5 0 0 0 8.5 16 H12 Z",
      fill: "#A259FF"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "15.5",
      cy: "12.5",
      r: "3.5",
      fill: "#1ABCFE"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 16 H8.5 A3.5 3.5 0 0 0 8.5 23 H12 Z",
      fill: "#0ACF83"
    }))
  },
  github: {
    name: 'GitHub',
    hex: '#181717',
    cat: 'Desenvolvimento',
    desc: 'Vincule commits e pull requests às tarefas do board.',
    mark: s => /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24"
    }, /*#__PURE__*/React.createElement("path", {
      fill: "#181717",
      fillRule: "evenodd",
      d: "M12 2.2C6.5 2.2 2 6.7 2 12.2c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.5 4.9.4.3.7.9.7 1.8v2.6c0 .3.2.6.7.5 3.9-1.3 6.8-5.1 6.8-9.5 0-5.5-4.5-10-10-10Z"
    }))
  },
  dropbox: {
    name: 'Dropbox',
    hex: '#0061FF',
    cat: 'Armazenamento',
    desc: 'Anexe arquivos da sua conta diretamente nas tarefas.',
    mark: s => /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24"
    }, /*#__PURE__*/React.createElement("g", {
      fill: "#0061FF"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M6.4 2 L1 5.4 L6.4 8.8 L11.8 5.4 Z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M17.2 2 L11.8 5.4 L17.2 8.8 L22.6 5.4 Z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M1 12.2 L6.4 8.8 L11.8 12.2 L6.4 15.6 Z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M22.6 12.2 L17.2 8.8 L11.8 12.2 L17.2 15.6 Z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M6.4 16.7 L11.8 13.3 L17.2 16.7 L11.8 20.1 Z"
    })))
  },
  discord: {
    name: 'Discord',
    hex: '#5865F2',
    cat: 'Comunicação',
    desc: 'Avise sua comunidade quando algo importante acontecer.',
    mark: s => /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24"
    }, /*#__PURE__*/React.createElement("path", {
      fill: "#5865F2",
      fillRule: "evenodd",
      d: "M19.5 5.6a16 16 0 0 0-4-1.3l-.3.5a14 14 0 0 0-4.4 0l-.3-.5a16 16 0 0 0-4 1.3C2 9.8 1.4 13.9 1.7 17.9a16 16 0 0 0 4.9 2.5 12 12 0 0 0 1-1.7c-.6-.2-1.1-.5-1.6-.8l.4-.3a11 11 0 0 0 9.2 0l.4.3c-.5.3-1 .6-1.6.8a12 12 0 0 0 1 1.7 16 16 0 0 0 4.9-2.5c.4-4.6-.7-8.7-2.2-12.3ZM8.4 15.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm7.2 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z"
    }))
  }
};

// Tile that frames a brand mark — keeps a constant light backing in
// both themes so dark marks (GitHub, Notion) stay legible.
const BrandTile = ({
  brand,
  size = 44
}) => {
  const b = Brands[brand];
  if (!b) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: 11,
      background: '#ffffff',
      border: '1px solid rgba(0,0,0,0.08)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 'none'
    }
  }, b.mark(Math.round(size * 0.56)));
};

// Buttons
const Button = ({
  kind = 'primary',
  size = 'md',
  icon,
  children,
  onClick,
  style = {}
}) => {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    fontFamily: 'inherit',
    fontWeight: 600,
    border: 'none',
    borderRadius: 'var(--ob-r-control)',
    cursor: 'pointer',
    transition: 'all 160ms cubic-bezier(0.2,0.7,0.2,1)',
    fontSize: size === 'sm' ? 13 : size === 'lg' ? 15 : 14,
    padding: size === 'sm' ? '7px 12px' : size === 'lg' ? '14px 22px' : '10px 18px'
  };
  const kinds = {
    primary: {
      background: 'var(--ob-blue)',
      color: '#fff'
    },
    secondary: {
      background: 'var(--ob-surface)',
      color: 'var(--ob-fg-strong)',
      border: '1.5px solid var(--ob-border)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--ob-blue)'
    },
    cream: {
      background: 'var(--ob-bg-warm)',
      color: 'var(--ob-fg-strong)'
    },
    danger: {
      background: 'var(--ob-danger)',
      color: '#fff'
    }
  };
  return /*#__PURE__*/React.createElement("button", {
    style: {
      ...base,
      ...kinds[kind],
      ...style
    },
    onClick: onClick,
    onMouseEnter: e => {
      if (kind === 'primary') e.currentTarget.style.boxShadow = '0 8px 24px rgba(10,78,228,0.28)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.boxShadow = 'none';
    }
  }, icon, children);
};

// ── FIELD SHELL ──────────────────────────────────────────
// Shared text-field surface. Owns border, radius, focus ring, error and
// disabled states so Input, SearchInput, Select and Datepicker never reinvent
// them. Tokens: --ob-r-control (radius) · --ob-focus-ring (focus) · --ob-danger.
const FieldShell = ({
  focused = false,
  error = false,
  disabled = false,
  minHeight = 44,
  padding = '0 14px',
  onClick,
  style = {},
  children
}) => {
  const borderColor = error ? 'var(--ob-danger)' : focused ? 'var(--ob-blue)' : 'var(--ob-border)';
  const ring = !focused ? 'none' : error ? '0 0 0 4px color-mix(in srgb, var(--ob-danger) 22%, transparent)' : '0 0 0 4px var(--ob-focus-ring)';
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      minHeight,
      padding,
      background: disabled ? 'var(--ob-bg-alt)' : 'var(--ob-surface)',
      border: `1.5px solid ${borderColor}`,
      borderRadius: 'var(--ob-r-control)',
      boxShadow: ring,
      transition: 'border-color .15s, box-shadow .15s',
      opacity: disabled ? 0.6 : 1,
      boxSizing: 'border-box',
      ...style
    }
  }, children);
};

// Form input — composes FieldShell
const Input = ({
  label,
  hint,
  error,
  icon,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--ob-fg-strong)'
    }
  }, label), /*#__PURE__*/React.createElement(FieldShell, {
    focused: focused,
    error: !!error
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      color: 'var(--ob-fg-mute)',
      flex: 'none'
    }
  }, icon), /*#__PURE__*/React.createElement("input", _extends({}, rest, {
    onFocus: e => {
      setFocused(true);
      rest.onFocus?.(e);
    },
    onBlur: e => {
      setFocused(false);
      rest.onBlur?.(e);
    },
    style: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'inherit',
      fontSize: 14,
      color: 'var(--ob-fg-strong)',
      padding: '10px 0'
    }
  }))), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: error ? 'var(--ob-danger)' : 'var(--ob-fg-mute)'
    }
  }, error || hint));
};

// Badge — variant: subtle (default) | solid | outline | numeric
const Badge = ({
  tone = 'blue',
  variant = 'subtle',
  dot = true,
  size = 'md',
  children
}) => {
  const T = {
    blue: {
      bg: 'var(--ob-blue-100)',
      fg: 'var(--ob-blue-700)',
      dot: 'var(--ob-blue)',
      solid: 'var(--ob-blue)',
      border: 'color-mix(in srgb, var(--ob-blue) 35%, transparent)'
    },
    green: {
      bg: 'var(--ob-green-100)',
      fg: 'var(--ob-green-700)',
      dot: 'var(--ob-green)',
      solid: 'var(--ob-green)',
      border: 'color-mix(in srgb, var(--ob-green) 35%, transparent)'
    },
    orange: {
      bg: 'color-mix(in srgb, var(--ob-orange) 15%, var(--ob-surface))',
      fg: '#9a4000',
      dot: 'var(--ob-orange)',
      solid: 'var(--ob-orange)',
      border: 'color-mix(in srgb, var(--ob-orange) 45%, transparent)'
    },
    red: {
      bg: 'var(--ob-danger-bg)',
      fg: 'var(--ob-danger)',
      dot: 'var(--ob-danger)',
      solid: 'var(--ob-danger)',
      border: 'color-mix(in srgb, var(--ob-danger) 40%, transparent)'
    },
    grey: {
      bg: 'var(--ob-bg-warm)',
      fg: 'var(--ob-fg-soft)',
      dot: 'var(--ob-fg-mute)',
      solid: 'var(--ob-fg-mute)',
      border: 'var(--ob-border)'
    }
  };
  const t = T[tone] || T.blue;
  const fs = size === 'sm' ? 11 : 12;
  const px = size === 'sm' ? '2px 8px' : '4px 10px';
  const styles = {
    subtle: {
      background: t.bg,
      color: t.fg,
      border: 'none'
    },
    solid: {
      background: t.solid,
      color: '#fff',
      border: 'none'
    },
    outline: {
      background: 'transparent',
      color: t.fg,
      border: `1.5px solid ${t.border}`
    },
    numeric: {
      background: t.solid,
      color: '#fff',
      border: 'none',
      minWidth: 18,
      height: 18,
      padding: '0 5px',
      justifyContent: 'center'
    }
  };
  const s = styles[variant] || styles.subtle;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: variant === 'numeric' ? s.padding : px,
      borderRadius: 999,
      fontSize: fs,
      fontWeight: 700,
      lineHeight: 1,
      ...s
    }
  }, variant !== 'numeric' && dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: variant === 'solid' ? 'rgba(255,255,255,0.7)' : t.dot,
      flexShrink: 0
    }
  }), children);
};

// Card
const Card = ({
  children,
  style = {},
  padding = 20,
  elevation = 'border'
}) => {
  const ev = elevation === 'shadow' ? {
    boxShadow: 'var(--ob-shadow-md)'
  } : {
    border: '1px solid var(--ob-border)'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--ob-surface)',
      borderRadius: 'var(--ob-r-surface)',
      padding,
      ...ev,
      ...style
    }
  }, children);
};

// Avatar
const Avatar = ({
  name = 'OB',
  size = 32,
  color = 'var(--ob-blue)'
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    width: size,
    height: size,
    borderRadius: '50%',
    background: color,
    color: '#fff',
    fontSize: size * 0.4,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 'none'
  }
}, name.slice(0, 2).toUpperCase());

// ── Datepicker helpers ────────────────────────────────────
const dpFmt = d => {
  if (!d) return '';
  if (typeof d === 'string') {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};
const dpParse = str => {
  if (!str || !/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return null;
  const [dd, mm, yyyy] = str.split('/').map(Number);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const d = new Date(yyyy, mm - 1, dd);
  return d.getDate() === dd && d.getMonth() === mm - 1 && d.getFullYear() === yyyy ? d : null;
};
const dpMask = val => {
  const digits = val.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};
const dpToIso = d => d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : null;

// Datepicker — manual entry + calendar
const Datepicker = ({
  singleDate = false,
  clearLabel = 'Limpar',
  defaultValues = {
    startDate: null,
    endDate: null
  },
  endDateLabel = 'até',
  onChange,
  onClear,
  resetOnSubmit = false,
  showSubmitButton = true,
  startDateLabel = 'de',
  onSubmit,
  submitLabel = 'Confirmar',
  values = {
    startDate: null,
    endDate: null
  },
  minBookingDate = null,
  maxBookingDays,
  label,
  hint,
  error
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
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const daysInMonth = d => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const days = Array.from({
    length: daysInMonth(month)
  }, (_, i) => i + 1);
  const blanks = Array.from({
    length: firstDay
  }, (_, i) => i);

  // validate & apply typed start date
  const handleStartInput = e => {
    const masked = dpMask(e.target.value);
    setStartText(masked);
    if (masked.length < 10) {
      setStartErr('');
      return;
    }
    const d = dpParse(masked);
    if (!d) {
      setStartErr('Data inválida');
      return;
    }
    if (minBookingDate && d < minBookingDate) {
      setStartErr(`Mín: ${dpFmt(minBookingDate)}`);
      return;
    }
    setStartErr('');
    const iso = dpToIso(d);
    const newVals = {
      ...localValues,
      startDate: iso,
      endDate: null
    };
    setLocalValues(newVals);
    setEndText('');
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    onChange?.(newVals);
  };

  // validate & apply typed end date
  const handleEndInput = e => {
    const masked = dpMask(e.target.value);
    setEndText(masked);
    if (masked.length < 10) {
      setEndErr('');
      return;
    }
    const d = dpParse(masked);
    if (!d) {
      setEndErr('Data inválida');
      return;
    }
    if (localValues.startDate && dpToIso(d) < localValues.startDate) {
      setEndErr('Deve ser após data inicial');
      return;
    }
    setEndErr('');
    const iso = dpToIso(d);
    const newVals = {
      ...localValues,
      endDate: iso
    };
    setLocalValues(newVals);
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    onChange?.(newVals);
  };
  const isInRange = day => {
    const dIso = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (!localValues.startDate || !localValues.endDate) return false;
    return dIso > localValues.startDate && dIso < localValues.endDate;
  };
  const handleDayClick = day => {
    const d = new Date(month.getFullYear(), month.getMonth(), day);
    const iso = dpToIso(d);
    if (singleDate) {
      const newVals = {
        startDate: iso,
        endDate: iso
      };
      setLocalValues(newVals);
      setStartText(dpFmt(d));
      setStartErr('');
      onChange?.(newVals);
      setOpen(false);
    } else {
      if (!localValues.startDate || localValues.startDate && localValues.endDate || iso < localValues.startDate) {
        const newVals = {
          startDate: iso,
          endDate: null
        };
        setLocalValues(newVals);
        setStartText(dpFmt(d));
        setEndText('');
        setStartErr('');
        setEndErr('');
        onChange?.(newVals);
      } else {
        const newVals = {
          ...localValues,
          endDate: iso
        };
        setLocalValues(newVals);
        setEndText(dpFmt(d));
        setEndErr('');
        onChange?.(newVals);
        setOpen(false);
      }
    }
  };
  const handleClear = () => {
    const newVals = {
      startDate: null,
      endDate: null
    };
    setLocalValues(newVals);
    setStartText('');
    setEndText('');
    setStartErr('');
    setEndErr('');
    onClear?.();
    onChange?.(newVals);
  };
  const handleSubmit = () => {
    onSubmit?.(localValues.startDate, localValues.endDate);
    if (resetOnSubmit) handleClear();
    setOpen(false);
  };
  const prevMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1));
  const nextMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1));
  const handleInputClick = e => {
    e.stopPropagation();
    setOpen(true);
  };
  const dpInputStyle = {
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'inherit',
    fontSize: 14,
    color: 'var(--ob-fg-strong)',
    padding: '10px 0'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      position: 'relative'
    },
    onClick: e => e.stopPropagation()
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--ob-fg-strong)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'flex-start'
    }
  }, !singleDate ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--ob-fg-soft)',
      marginBottom: 4
    }
  }, startDateLabel), /*#__PURE__*/React.createElement(FieldShell, {
    focused: startFocus,
    error: !!startErr,
    onClick: handleInputClick
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: startText,
    maxLength: 10,
    placeholder: "dd/mm/yyyy",
    onChange: handleStartInput,
    onClick: handleInputClick,
    onFocus: () => setStartFocus(true),
    onBlur: () => setStartFocus(false),
    style: dpInputStyle
  })), startErr && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--ob-danger)',
      marginTop: 4
    }
  }, startErr)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--ob-fg-soft)',
      marginBottom: 4
    }
  }, endDateLabel), /*#__PURE__*/React.createElement(FieldShell, {
    focused: endFocus,
    error: !!endErr,
    onClick: handleInputClick
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: endText,
    maxLength: 10,
    placeholder: "dd/mm/yyyy",
    onChange: handleEndInput,
    onClick: handleInputClick,
    onFocus: () => setEndFocus(true),
    onBlur: () => setEndFocus(false),
    style: dpInputStyle
  })), endErr && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--ob-danger)',
      marginTop: 4
    }
  }, endErr))) : /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(FieldShell, {
    focused: startFocus,
    error: !!startErr,
    onClick: handleInputClick
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: startText,
    maxLength: 10,
    placeholder: "dd/mm/yyyy",
    onChange: handleStartInput,
    onClick: handleInputClick,
    onFocus: () => setStartFocus(true),
    onBlur: () => setStartFocus(false),
    style: dpInputStyle
  })), startErr && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--ob-danger)',
      marginTop: 4
    }
  }, startErr))), open && /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: 8,
      background: 'var(--ob-surface)',
      border: '1px solid var(--ob-border)',
      borderRadius: 'var(--ob-r-surface)',
      padding: 16,
      boxShadow: 'var(--ob-shadow-lg)',
      zIndex: 1000,
      minWidth: 300
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: prevMonth,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px 8px',
      color: 'var(--ob-blue)',
      borderRadius: 'var(--ob-r-xs)'
    }
  }, "\u2190"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--ob-fg-strong)'
    }
  }, monthNames[month.getMonth()], " ", month.getFullYear()), /*#__PURE__*/React.createElement("button", {
    onClick: nextMonth,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px 8px',
      color: 'var(--ob-blue)',
      borderRadius: 'var(--ob-r-xs)'
    }
  }, "\u2192")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 2,
      marginBottom: 10
    }
  }, ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      textAlign: 'center',
      fontSize: 10,
      fontWeight: 600,
      color: 'var(--ob-fg-mute)',
      padding: '4px 0'
    }
  }, d)), blanks.map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: `b-${i}`
  })), days.map(day => {
    const iso = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isStart = iso === localValues.startDate;
    const isEnd = iso === localValues.endDate;
    const inRange = isInRange(day);
    return /*#__PURE__*/React.createElement("button", {
      key: day,
      onClick: () => handleDayClick(day),
      style: {
        padding: '6px 0',
        borderRadius: 'var(--ob-r-xs)',
        border: 'none',
        textAlign: 'center',
        background: isStart || isEnd ? 'var(--ob-blue)' : inRange ? 'var(--ob-blue-100)' : 'var(--ob-surface)',
        color: isStart || isEnd ? '#fff' : 'var(--ob-fg-strong)',
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 100ms'
      }
    }, day);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      borderTop: '1px solid var(--ob-border)',
      paddingTop: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    kind: "ghost",
    onClick: handleClear,
    style: {
      flex: 1,
      fontSize: 12
    }
  }, clearLabel), showSubmitButton && /*#__PURE__*/React.createElement(Button, {
    kind: "primary",
    onClick: handleSubmit,
    style: {
      flex: 1,
      fontSize: 12
    }
  }, submitLabel))), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: error ? 'var(--ob-danger)' : 'var(--ob-fg-mute)',
      marginTop: 4
    }
  }, error || hint));
};

// ── SLIDER ──────────────────────────────────────────────────
const Slider = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  hint,
  error,
  disabled = false,
  showValue = true,
  marks = false,
  tone = 'default',
  range = false
}) => {
  const {
    useRef
  } = React;
  const trackRef = useRef(null);
  const draggingRef = useRef(null); // null | 'lo' | 'hi'
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const lo = range ? value?.[0] ?? min : value ?? min;
  const hi = range ? value?.[1] ?? max : null;
  const toneColor = tone === 'success' ? 'var(--ob-green)' : tone === 'warning' ? 'var(--ob-orange)' : tone === 'danger' ? 'var(--ob-danger)' : 'var(--ob-blue)';
  const toneRing = tone === 'success' ? 'rgba(119,158,61,.28)' : tone === 'warning' ? 'rgba(235,124,45,.28)' : tone === 'danger' ? 'rgba(214,54,54,.28)' : 'var(--ob-focus-ring)';
  const clamp = v => Math.min(max, Math.max(min, v));
  const snap = v => Math.round((v - min) / step) * step + min;
  const pct = v => (v - min) / (max - min) * 100;
  const fmt = v => Number.isInteger(v) ? v : v.toFixed(1);
  const valFromX = clientX => {
    const rect = trackRef.current.getBoundingClientRect();
    return clamp(snap(min + (clientX - rect.left) / rect.width * (max - min)));
  };
  const applyVal = (which, v) => {
    const cb = onChangeRef.current;
    if (!cb) return;
    if (!range) {
      cb(v);
      return;
    }
    if (which === 'lo') cb([Math.min(v, hi), hi]);else cb([lo, Math.max(v, lo)]);
  };

  // Drag: add/remove document listeners — survives re-renders
  const startDrag = (which, e) => {
    if (disabled) return;
    e.preventDefault();
    draggingRef.current = which;
    applyVal(which, valFromX(e.clientX));
    const onMove = ev => {
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
  const onKeyThumb = which => e => {
    if (disabled) return;
    const delta = e.shiftKey ? step * 10 : step;
    const cur = which === 'hi' ? hi : lo;
    let next = cur;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = clamp(cur + delta);else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = clamp(cur - delta);else if (e.key === 'Home') next = min;else if (e.key === 'End') next = max;else return;
    e.preventDefault();
    applyVal(which, next);
  };
  const [loFocus, setLoFocus] = useState(false);
  const [hiFocus, setHiFocus] = useState(false);
  const thumbStyle = (val, focused) => ({
    position: 'absolute',
    top: '50%',
    left: `${pct(val)}%`,
    transform: 'translate(-50%, -50%)',
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: 'var(--ob-surface)',
    border: `2px solid ${error ? 'var(--ob-danger)' : toneColor}`,
    boxShadow: focused ? `0 0 0 4px ${error ? 'rgba(214,54,54,.22)' : toneRing}, var(--ob-shadow-sm)` : 'var(--ob-shadow-sm)',
    cursor: disabled ? 'not-allowed' : 'grab',
    transition: 'box-shadow .15s',
    zIndex: 2,
    outline: 'none',
    opacity: disabled ? 0.5 : 1,
    boxSizing: 'border-box',
    touchAction: 'none',
    userSelect: 'none'
  });
  const fillLeft = range ? pct(lo) : 0;
  const fillRight = range ? 100 - pct(hi) : 100 - pct(lo);
  const stepCount = Math.round((max - min) / step);
  const markPositions = marks && stepCount <= 20 ? Array.from({
    length: stepCount + 1
  }, (_, i) => min + i * step) : [];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      opacity: disabled ? 0.6 : 1
    }
  }, (label || showValue) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--ob-fg-strong)'
    }
  }, label), showValue && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      fontFamily: 'var(--ob-font-mono)',
      color: error ? 'var(--ob-danger)' : toneColor
    }
  }, range ? `${fmt(lo)} – ${fmt(hi)}` : fmt(lo))), /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    style: {
      position: 'relative',
      height: 20,
      cursor: disabled ? 'not-allowed' : 'pointer',
      touchAction: 'none',
      userSelect: 'none'
    },
    onClick: e => {
      // Suppress click if we just finished a drag
      if (disabled || draggingRef.current) return;
      const v = valFromX(e.clientX);
      if (!range) {
        onChange?.(v);
        return;
      }
      const mid = (lo + hi) / 2;
      onChange?.(v <= mid ? [clamp(snap(v)), hi] : [lo, clamp(snap(v))]);
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: 5,
      transform: 'translateY(-50%)',
      background: 'var(--ob-bg-alt)',
      borderRadius: 999,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: `${fillLeft}%`,
      right: `${fillRight}%`,
      background: error ? 'var(--ob-danger)' : toneColor,
      borderRadius: 999
    }
  })), markPositions.map(v => /*#__PURE__*/React.createElement("div", {
    key: v,
    style: {
      position: 'absolute',
      top: '50%',
      left: `${pct(v)}%`,
      width: 4,
      height: 4,
      borderRadius: '50%',
      background: v <= lo ? 'var(--ob-surface)' : 'var(--ob-fg-mute)',
      transform: 'translate(-50%, -50%)',
      opacity: .7,
      zIndex: 1,
      pointerEvents: 'none'
    }
  })), /*#__PURE__*/React.createElement("div", {
    role: "slider",
    tabIndex: disabled ? -1 : 0,
    "aria-valuemin": min,
    "aria-valuemax": max,
    "aria-valuenow": lo,
    onPointerDown: e => {
      e.stopPropagation();
      startDrag('lo', e);
    },
    onKeyDown: onKeyThumb('lo'),
    onFocus: () => setLoFocus(true),
    onBlur: () => setLoFocus(false),
    style: thumbStyle(lo, loFocus)
  }), range && /*#__PURE__*/React.createElement("div", {
    role: "slider",
    tabIndex: disabled ? -1 : 0,
    "aria-valuemin": min,
    "aria-valuemax": max,
    "aria-valuenow": hi,
    onPointerDown: e => {
      e.stopPropagation();
      startDrag('hi', e);
    },
    onKeyDown: onKeyThumb('hi'),
    onFocus: () => setHiFocus(true),
    onBlur: () => setHiFocus(false),
    style: thumbStyle(hi, hiFocus)
  })), marks && markPositions.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'var(--ob-fg-mute)',
      fontFamily: 'var(--ob-font-mono)'
    }
  }, min), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'var(--ob-fg-mute)',
      fontFamily: 'var(--ob-font-mono)'
    }
  }, max)), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: error ? 'var(--ob-danger)' : 'var(--ob-fg-mute)'
    }
  }, error || hint));
};
Object.assign(window, {
  Logo,
  Icons,
  Brands,
  BrandTile,
  Button,
  Input,
  Badge,
  Card,
  Avatar,
  Datepicker,
  FieldShell,
  Slider
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web_app/Primitives.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web_app/Screens.jsx
try { (() => {
/* global React, Card, Badge, Button, Avatar, Icons, Input, Datepicker, Brands, BrandTile,
   Radio, RadioGroup, Toggle, Checkbox, Link, Skeleton, Pagination, Dropdown, Modal, Tooltip,
   Alert, ProgressBar, CodeInput, Tabs, Table */
const {
  useState,
  useEffect
} = React;

// ============================================================
// Onblide Web App — screen views
// Every design-system component lives natively here, doing real
// product work — no showcase, no labels pointing at itself.
// ============================================================

const Kebab = () => /*#__PURE__*/React.createElement(Icons.more, {
  size: 18
});
const Caret = () => /*#__PURE__*/React.createElement(Icons.caretD, {
  size: 14
});

// ============================================================
// HOME / DASHBOARD
//   · Checkbox  → toggling today's tasks done/undone
//   · Link      → "Ver tudo"
//   · Tooltip   → explaining each metric
//   · Dropdown  → per-task row actions
//   · Modal     → "Nova tarefa" creation form
// ============================================================
const HomeScreen = () => {
  const [tasks, setTasks] = useState([{
    t: 'Revisar deck do trimestre',
    done: true,
    tone: 'blue',
    tag: 'Documento'
  }, {
    t: 'Alinhar com cliente Soluções',
    done: false,
    tone: 'orange',
    tag: 'Reunião'
  }, {
    t: 'Publicar artigo do blog',
    done: false,
    tone: 'green',
    tag: 'Conteúdo'
  }, {
    t: 'Atualizar CRM da semana',
    done: false,
    tone: 'grey',
    tag: 'Admin'
  }]);
  const [newOpen, setNewOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [overdueAlert, setOverdueAlert] = useState(true);
  const toggle = i => {
    const was = tasks[i].done;
    setTasks(ts => ts.map((t, j) => j === i ? {
      ...t,
      done: !t.done
    } : t));
    if (!was) window.obToast?.({
      tone: 'success',
      title: 'Concluída',
      body: tasks[i].t
    });
  };
  const addTask = () => {
    if (!draft.trim()) return;
    setTasks(ts => [...ts, {
      t: draft.trim(),
      done: false,
      tone: 'blue',
      tag: 'Nova'
    }]);
    window.obToast?.({
      tone: 'success',
      title: 'Tarefa criada',
      body: draft.trim()
    });
    setDraft('');
    setNewOpen(false);
  };
  const metrics = [{
    lbl: 'Em andamento',
    val: '12',
    delta: '+3',
    tone: 'blue',
    tip: 'Tarefas iniciadas e ainda não concluídas.'
  }, {
    lbl: 'Concluídas',
    val: '48',
    delta: '+8',
    tone: 'green',
    tip: 'Total concluído nos últimos 30 dias.'
  }, {
    lbl: 'Atrasadas',
    val: '2',
    delta: '−1',
    tone: 'orange',
    tip: 'Passaram do prazo definido.'
  }, {
    lbl: 'Foco',
    val: '6h',
    delta: '2h restantes',
    tone: 'grey',
    tip: 'Tempo de foco planejado para a semana.'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 32,
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--ob-blue)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em'
    }
  }, "QUI \xB7 8 MAI"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '6px 0 0',
      fontSize: 36,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)',
      letterSpacing: '-0.02em'
    }
  }, "Bom dia, ", /*#__PURE__*/React.createElement("em", {
    style: {
      fontFamily: "'Playfair Display', serif",
      fontStyle: 'italic',
      fontWeight: 500,
      color: 'var(--ob-blue)'
    }
  }, "Onblide"), "."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      color: 'var(--ob-fg-soft)'
    }
  }, "Voc\xEA tem ", tasks.filter(t => !t.done).length, " tarefas pendentes e 2 reuni\xF5es.")), /*#__PURE__*/React.createElement(Button, {
    kind: "primary",
    icon: /*#__PURE__*/React.createElement(Icons.plus, {
      size: 16
    }),
    onClick: () => setNewOpen(true)
  }, "Nova tarefa")), overdueAlert && /*#__PURE__*/React.createElement(Alert, {
    tone: "warning",
    title: "2 tarefas com prazo hoje",
    dismissible: true,
    onClose: () => setOverdueAlert(false),
    action: "Ver tarefas",
    onAction: () => setOverdueAlert(false)
  }, "\"Alinhar com cliente Solu\xE7\xF5es\" e \"Atualizar CRM da semana\" vencem hoje."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 14
    }
  }, metrics.map((m, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    elevation: "border",
    padding: 18
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Tooltip, {
    label: m.tip,
    placement: "top",
    maxWidth: 200
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 12,
      color: 'var(--ob-fg-soft)',
      cursor: 'default'
    }
  }, m.lbl, /*#__PURE__*/React.createElement(Icons.info, {
    size: 13,
    style: {
      color: 'var(--ob-fg-mute)',
      display: 'flex'
    }
  }))), /*#__PURE__*/React.createElement(Dropdown, {
    align: "right",
    trigger: /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--ob-fg-mute)',
        cursor: 'pointer',
        display: 'flex',
        padding: 2
      }
    }, /*#__PURE__*/React.createElement(Kebab, null)),
    items: [{
      label: 'Ver detalhes',
      icon: /*#__PURE__*/React.createElement(Icons.chart, {
        size: 16
      }),
      onClick: () => {}
    }, {
      label: 'Fixar no topo',
      icon: /*#__PURE__*/React.createElement(Icons.star, {
        size: 16
      }),
      onClick: () => {}
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 32,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)',
      letterSpacing: '-0.02em',
      lineHeight: 1
    }
  }, m.val), /*#__PURE__*/React.createElement(Badge, {
    tone: m.tone
  }, m.delta))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Card, {
    elevation: "border",
    padding: 0
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 20px',
      borderBottom: '1px solid var(--ob-border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)'
    }
  }, "Tarefas de hoje"), /*#__PURE__*/React.createElement(Link, {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Ver tudo \u2192")), tasks.map((row, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      borderBottom: i < tasks.length - 1 ? '1px solid var(--ob-line-soft)' : 'none'
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    checked: row.done,
    onChange: () => toggle(i)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 14,
      color: row.done ? 'var(--ob-fg-mute)' : 'var(--ob-fg-strong)',
      textDecoration: row.done ? 'line-through' : 'none'
    }
  }, row.t), /*#__PURE__*/React.createElement(Badge, {
    tone: row.tone
  }, row.tag), /*#__PURE__*/React.createElement(Dropdown, {
    align: "right",
    trigger: /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--ob-fg-mute)',
        cursor: 'pointer',
        display: 'flex',
        padding: 2
      }
    }, /*#__PURE__*/React.createElement(Kebab, null)),
    items: [{
      label: 'Editar',
      icon: /*#__PURE__*/React.createElement(Icons.file, {
        size: 16
      }),
      onClick: () => {}
    }, {
      label: 'Adiar 1 dia',
      icon: /*#__PURE__*/React.createElement(Icons.calendar, {
        size: 16
      }),
      onClick: () => {}
    }, {
      divider: true
    }, {
      label: 'Remover',
      icon: /*#__PURE__*/React.createElement(Icons.x, {
        size: 16
      }),
      danger: true,
      onClick: () => setTasks(ts => ts.filter((_, j) => j !== i))
    }]
  })))), /*#__PURE__*/React.createElement(Card, {
    elevation: "border",
    padding: 0
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 20px',
      borderBottom: '1px solid var(--ob-border)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)'
    }
  }, "Agenda")), [{
    time: '10:00',
    title: 'Stand-up',
    dur: '30 min',
    accent: 'var(--ob-blue)',
    who: 'Equipe de produto'
  }, {
    time: '13:30',
    title: 'Cliente Soluções',
    dur: '1h',
    accent: 'var(--ob-orange)',
    who: 'Maria · João'
  }, {
    time: '16:00',
    title: 'Revisão de design',
    dur: '45 min',
    accent: 'var(--ob-green)',
    who: 'Design + Eng'
  }].map((e, i) => /*#__PURE__*/React.createElement(Tooltip, {
    key: i,
    label: e.who,
    placement: "left"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 20px',
      display: 'flex',
      gap: 12,
      borderBottom: i < 2 ? '1px solid var(--ob-line-soft)' : 'none',
      cursor: 'default',
      width: '100%',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 4,
      borderRadius: 2,
      background: e.accent,
      flex: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ob-fg-soft)'
    }
  }, e.time, " \xB7 ", e.dur), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--ob-fg-strong)',
      marginTop: 2
    }
  }, e.title))))))), /*#__PURE__*/React.createElement(Modal, {
    open: newOpen,
    onClose: () => setNewOpen(false),
    title: "Nova tarefa",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      kind: "secondary",
      onClick: () => setNewOpen(false)
    }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
      kind: "primary",
      onClick: addTask
    }, "Criar tarefa"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "T\xEDtulo da tarefa",
    placeholder: "Ex: Revisar proposta",
    value: draft,
    onChange: e => setDraft(e.target.value),
    autoFocus: true
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Respons\xE1vel",
    placeholder: "Atribuir a\u2026",
    defaultValue: "Onblide"
  }))));
};

// ============================================================
// TASKS / KANBAN
//   · Datepicker → period filter
//   · Checkbox   → mark card complete
//   · Dropdown   → per-card actions (edit / duplicate / delete)
//   · Modal      → delete confirmation
//   · Tooltip    → assignee name on avatar
// ============================================================
const TasksScreen = () => {
  const [filterDates, setFilterDates] = useState({
    startDate: null,
    endDate: null
  });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const cols = [{
    id: 'todo',
    title: 'A fazer',
    accent: 'var(--ob-fg-mute)'
  }, {
    id: 'doing',
    title: 'Em andamento',
    accent: 'var(--ob-blue)'
  }, {
    id: 'review',
    title: 'Revisão',
    accent: 'var(--ob-orange)'
  }, {
    id: 'done',
    title: 'Concluído',
    accent: 'var(--ob-green)'
  }];
  const initial = {
    todo: [{
      t: 'Mapa de jornada',
      tag: 'Pesquisa',
      tone: 'blue',
      who: 'Onblide'
    }, {
      t: 'Checklist de QA',
      tag: 'Dev',
      tone: 'grey',
      who: 'Lucas M.'
    }, {
      t: 'Pauta da newsletter',
      tag: 'Conteúdo',
      tone: 'green',
      who: 'Rita T.'
    }, {
      t: 'Briefing financeiro',
      tag: 'Admin',
      tone: 'orange',
      who: 'Ana C.'
    }],
    doing: [{
      t: 'Wireframes do dashboard',
      tag: 'Design',
      tone: 'blue',
      who: 'Onblide'
    }, {
      t: 'API de pagamentos',
      tag: 'Dev',
      tone: 'grey',
      who: 'Lucas M.'
    }, {
      t: 'Roteiro do vídeo',
      tag: 'Conteúdo',
      tone: 'green',
      who: 'Rita T.'
    }],
    review: [{
      t: 'Landing v2',
      tag: 'Design',
      tone: 'blue',
      who: 'Onblide'
    }, {
      t: 'Termos de uso',
      tag: 'Legal',
      tone: 'orange',
      who: 'Ana C.'
    }],
    done: [{
      t: 'Auditoria de tipografia',
      tag: 'Design',
      tone: 'blue',
      who: 'Onblide'
    }, {
      t: 'Migração do banco',
      tag: 'Dev',
      tone: 'grey',
      who: 'Lucas M.'
    }, {
      t: 'Onboarding refeito',
      tag: 'UX',
      tone: 'blue',
      who: 'Rita T.'
    }, {
      t: 'Pesquisa com usuários',
      tag: 'Pesquisa',
      tone: 'green',
      who: 'Ana C.'
    }, {
      t: 'Plano editorial Q3',
      tag: 'Conteúdo',
      tone: 'green',
      who: 'Rita T.'
    }]
  };
  const [board, setBoard] = useState(initial);
  const [doneCards, setDoneCards] = useState({});
  const avatarColor = who => ({
    'Onblide': 'var(--ob-blue)',
    'Lucas M.': 'var(--ob-orange)',
    'Rita T.': 'var(--ob-green)',
    'Ana C.': 'var(--ob-fg)'
  })[who] || 'var(--ob-blue)';
  const initials = who => who.split(' ').map(w => w[0]).join('').slice(0, 2);
  const removeCard = (colId, idx) => {
    setBoard(b => ({
      ...b,
      [colId]: b[colId].filter((_, j) => j !== idx)
    }));
    setConfirmDelete(null);
  };
  const duplicateCard = (colId, idx) => {
    setBoard(b => {
      const col = [...b[colId]];
      col.splice(idx + 1, 0, {
        ...col[idx]
      });
      return {
        ...b,
        [colId]: col
      };
    });
  };
  const total = Object.values(board).reduce((s, c) => s + c.length, 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 28,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)',
      letterSpacing: '-0.02em'
    }
  }, "Tarefas"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      color: 'var(--ob-fg-soft)',
      fontSize: 14
    }
  }, total, " tarefas \xB7 4 colunas")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    kind: "secondary",
    icon: /*#__PURE__*/React.createElement(Icons.calendar, {
      size: 16
    })
  }, "Semana"), /*#__PURE__*/React.createElement(Button, {
    kind: "primary",
    icon: /*#__PURE__*/React.createElement(Icons.plus, {
      size: 16
    })
  }, "Adicionar"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 24,
      maxWidth: 420
    }
  }, /*#__PURE__*/React.createElement(Datepicker, {
    label: "Filtrar por per\xEDodo",
    singleDate: false,
    startDateLabel: "de",
    endDateLabel: "at\xE9",
    clearLabel: "Limpar",
    submitLabel: "Aplicar filtro",
    values: filterDates,
    onChange: setFilterDates,
    onClear: () => setFilterDates({
      startDate: null,
      endDate: null
    }),
    onSubmit: (start, end) => setFilterDates({
      startDate: start,
      endDate: end
    })
  }), filterDates.startDate && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "blue"
  }, filterDates.startDate, filterDates.endDate ? ` → ${filterDates.endDate}` : ' → ?'), /*#__PURE__*/React.createElement(Link, {
    href: "#",
    variant: "quiet",
    onClick: e => {
      e.preventDefault();
      setFilterDates({
        startDate: null,
        endDate: null
      });
    }
  }, "Limpar filtro \xD7"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 14
    }
  }, cols.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    style: {
      background: 'var(--ob-bg-warm)',
      borderRadius: 12,
      padding: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '4px 6px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: c.accent
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)'
    }
  }, c.title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--ob-fg-soft)'
    }
  }, board[c.id].length)), board[c.id].map((card, i) => {
    const key = `${c.id}-${i}-${card.t}`;
    const isDone = doneCards[key];
    return /*#__PURE__*/React.createElement(Card, {
      key: key,
      elevation: "border",
      padding: 14
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 1
      }
    }, /*#__PURE__*/React.createElement(Checkbox, {
      checked: !!isDone,
      onChange: v => setDoneCards(s => ({
        ...s,
        [key]: v
      }))
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        fontSize: 14,
        fontWeight: 500,
        color: isDone ? 'var(--ob-fg-mute)' : 'var(--ob-fg-strong)',
        textDecoration: isDone ? 'line-through' : 'none'
      }
    }, card.t), /*#__PURE__*/React.createElement(Dropdown, {
      align: "right",
      trigger: /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--ob-fg-mute)',
          cursor: 'pointer',
          display: 'flex'
        }
      }, /*#__PURE__*/React.createElement(Kebab, null)),
      items: [{
        label: 'Editar',
        icon: /*#__PURE__*/React.createElement(Icons.file, {
          size: 16
        }),
        onClick: () => {}
      }, {
        label: 'Duplicar',
        icon: /*#__PURE__*/React.createElement(Icons.folder, {
          size: 16
        }),
        onClick: () => duplicateCard(c.id, i)
      }, {
        divider: true
      }, {
        label: 'Excluir',
        icon: /*#__PURE__*/React.createElement(Icons.x, {
          size: 16
        }),
        danger: true,
        onClick: () => setConfirmDelete({
          colId: c.id,
          idx: i,
          name: card.t
        })
      }]
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: card.tone
    }, card.tag), /*#__PURE__*/React.createElement(Tooltip, {
      label: card.who,
      placement: "top"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        cursor: 'default'
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: initials(card.who),
      size: 22,
      color: avatarColor(card.who)
    })))));
  })))), /*#__PURE__*/React.createElement(Modal, {
    open: !!confirmDelete,
    onClose: () => setConfirmDelete(null),
    title: "Excluir tarefa?",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      kind: "secondary",
      onClick: () => setConfirmDelete(null)
    }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
      kind: "danger",
      onClick: () => removeCard(confirmDelete.colId, confirmDelete.idx)
    }, "Excluir"))
  }, "A tarefa ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--ob-fg-strong)'
    }
  }, "\"", confirmDelete?.name, "\""), " ser\xE1 removida permanentemente. Esta a\xE7\xE3o n\xE3o pode ser desfeita."));
};

// ============================================================
// METRICS
//   · Datepicker → date-range selector (drives "loading")
//   · Dropdown   → export menu
//   · Skeleton   → loading state while data refreshes
//   · Tooltip    → metric definition
//   · Pagination → "Top páginas" table pager
// ============================================================
const MetricsScreen = () => {
  const [range, setRange] = useState({
    startDate: null,
    endDate: null
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({
    key: 'views',
    dir: 'desc'
  });

  // initial load + reload whenever the range is applied
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, [range.startDate, range.endDate]);
  const Sparkline = ({
    pts,
    color
  }) => {
    const max = Math.max(...pts),
      min = Math.min(...pts);
    const w = 280,
      h = 70,
      pad = 6;
    const path = pts.map((p, i) => {
      const x = pad + i / (pts.length - 1) * (w - 2 * pad);
      const y = h - pad - (p - min) / (max - min || 1) * (h - 2 * pad);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    return /*#__PURE__*/React.createElement("svg", {
      width: w,
      height: h,
      style: {
        display: 'block',
        width: '100%'
      },
      viewBox: `0 0 ${w} ${h}`,
      preserveAspectRatio: "none"
    }, /*#__PURE__*/React.createElement("path", {
      d: path,
      fill: "none",
      stroke: color,
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: `${path} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`,
      fill: color,
      opacity: "0.12"
    }));
  };
  const Bars = ({
    data,
    color
  }) => {
    const max = Math.max(...data);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
        height: 120
      }
    }, data.map((v, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        height: `${v / max * 100}%`,
        background: color,
        borderRadius: '6px 6px 0 0',
        minHeight: 4
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: 'var(--ob-fg-mute)'
      }
    }, ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][i]))));
  };
  const cards = [{
    lbl: 'Sessões',
    val: '2.847',
    delta: '↑ 18,2%',
    tone: 'var(--ob-green)',
    pts: [20, 22, 28, 25, 30, 33, 38, 42, 40, 46, 52, 58],
    tip: 'Visitas únicas no período selecionado.'
  }, {
    lbl: 'Conversão',
    val: '4,8%',
    delta: '↓ 0,3%',
    tone: 'var(--ob-orange)',
    pts: [5.1, 4.9, 5, 4.8, 4.6, 4.5, 4.7, 4.6, 4.4, 4.5, 4.7, 4.8],
    tip: 'Percentual de sessões que viraram cadastro.'
  }, {
    lbl: 'Receita',
    val: 'R$ 38,4k',
    delta: '↑ R$ 5,2k',
    tone: 'var(--ob-blue)',
    pts: [28, 30, 29, 32, 31, 33, 35, 34, 36, 37, 38, 38.4],
    tip: 'Receita reconhecida no período.'
  }];
  const pages = [{
    path: '/',
    views: '8.241',
    rate: '62%'
  }, {
    path: '/precos',
    views: '4.018',
    rate: '48%'
  }, {
    path: '/blog/design-system',
    views: '3.527',
    rate: '71%'
  }, {
    path: '/sobre',
    views: '2.106',
    rate: '39%'
  }, {
    path: '/contato',
    views: '1.842',
    rate: '55%'
  }, {
    path: '/carreiras',
    views: '1.330',
    rate: '44%'
  }, {
    path: '/docs/datepicker',
    views: '1.205',
    rate: '68%'
  }, {
    path: '/produto',
    views: '980',
    rate: '51%'
  }, {
    path: '/changelog',
    views: '742',
    rate: '60%'
  }, {
    path: '/status',
    views: '512',
    rate: '33%'
  }];
  const perPage = 4;
  const totalPages = Math.ceil(pages.length / perPage);
  const pageRows = pages.slice((page - 1) * perPage, page * perPage);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 32,
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 28,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)',
      letterSpacing: '-0.02em'
    }
  }, "M\xE9tricas"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      color: 'var(--ob-fg-soft)',
      fontSize: 14
    }
  }, range.startDate ? `${range.startDate}${range.endDate ? ` → ${range.endDate}` : ''}` : 'Últimos 30 dias')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 320
    }
  }, /*#__PURE__*/React.createElement(Datepicker, {
    singleDate: false,
    startDateLabel: "de",
    endDateLabel: "at\xE9",
    clearLabel: "Limpar",
    submitLabel: "Aplicar",
    values: range,
    onChange: setRange,
    onClear: () => setRange({
      startDate: null,
      endDate: null
    }),
    onSubmit: (s, e) => setRange({
      startDate: s,
      endDate: e
    })
  })), /*#__PURE__*/React.createElement(Dropdown, {
    align: "right",
    trigger: /*#__PURE__*/React.createElement(Button, {
      kind: "secondary",
      icon: /*#__PURE__*/React.createElement(Caret, null)
    }, "Exportar"),
    items: [{
      label: 'Baixar CSV',
      icon: /*#__PURE__*/React.createElement(Icons.file, {
        size: 16
      }),
      onClick: () => {}
    }, {
      label: 'Baixar PDF',
      icon: /*#__PURE__*/React.createElement(Icons.file, {
        size: 16
      }),
      onClick: () => {}
    }, {
      divider: true
    }, {
      label: 'Agendar relatório',
      icon: /*#__PURE__*/React.createElement(Icons.calendar, {
        size: 16
      }),
      onClick: () => {}
    }]
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 14
    }
  }, loading ? [0, 1, 2].map(i => /*#__PURE__*/React.createElement(Card, {
    key: i,
    padding: 20
  }, /*#__PURE__*/React.createElement(Skeleton, {
    width: "40%",
    height: 13,
    style: {
      marginBottom: 12
    }
  }), /*#__PURE__*/React.createElement(Skeleton, {
    width: "55%",
    height: 30,
    style: {
      marginBottom: 10
    }
  }), /*#__PURE__*/React.createElement(Skeleton, {
    width: "35%",
    height: 13,
    style: {
      marginBottom: 16
    }
  }), /*#__PURE__*/React.createElement(Skeleton, {
    width: "100%",
    height: 70,
    radius: 8
  }))) : cards.map((c, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    padding: 20
  }, /*#__PURE__*/React.createElement(Tooltip, {
    label: c.tip,
    placement: "top",
    maxWidth: 210
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 13,
      color: 'var(--ob-fg-soft)',
      marginBottom: 6,
      cursor: 'default'
    }
  }, c.lbl, /*#__PURE__*/React.createElement(Icons.info, {
    size: 13,
    style: {
      color: 'var(--ob-fg-mute)'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 32,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)',
      letterSpacing: '-0.02em'
    }
  }, c.val), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      color: c.tone,
      fontSize: 13,
      fontWeight: 600,
      marginTop: 4
    }
  }, c.delta, " vs per\xEDodo anterior"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Sparkline, {
    pts: c.pts,
    color: c.tone
  }))))), /*#__PURE__*/React.createElement(Card, {
    padding: 24
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)'
    }
  }, "Atividade da semana"), /*#__PURE__*/React.createElement(Dropdown, {
    align: "right",
    trigger: /*#__PURE__*/React.createElement(Button, {
      kind: "secondary",
      size: "sm",
      icon: /*#__PURE__*/React.createElement(Caret, null)
    }, "Esta semana"),
    items: [{
      label: 'Esta semana',
      onClick: () => {}
    }, {
      label: 'Semana anterior',
      onClick: () => {}
    }, {
      label: 'Últimos 30 dias',
      onClick: () => {}
    }]
  })), loading ? /*#__PURE__*/React.createElement(Skeleton, {
    width: "100%",
    height: 120,
    radius: 8
  }) : /*#__PURE__*/React.createElement(Bars, {
    data: [42, 58, 72, 65, 88, 35, 24],
    color: "var(--ob-blue)"
  })), !loading && /*#__PURE__*/React.createElement(Card, {
    padding: 24
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 18px',
      fontSize: 18,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)'
    }
  }, "Metas da semana"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, [{
    label: 'Sessões',
    current: 2847,
    goal: 3500,
    tone: 'info'
  }, {
    label: 'Conversões',
    current: 136,
    goal: 200,
    tone: 'success'
  }, {
    label: 'Receita',
    current: 38400,
    goal: 50000,
    tone: 'info',
    fmt: v => `R$ ${(v / 1000).toFixed(0)}k`
  }].map((g, i) => {
    const pct = Math.round(g.current / g.goal * 100);
    return /*#__PURE__*/React.createElement("div", {
      key: i
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--ob-fg-strong)'
      }
    }, g.label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--ob-fg-soft)'
      }
    }, g.fmt ? g.fmt(g.current) : g.current.toLocaleString('pt-BR'), " / ", g.fmt ? g.fmt(g.goal) : g.goal.toLocaleString('pt-BR'))), /*#__PURE__*/React.createElement(ProgressBar, {
      value: pct,
      tone: g.tone,
      size: "md",
      showLabel: true
    }));
  }))), /*#__PURE__*/React.createElement(Card, {
    padding: 0
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 24px',
      borderBottom: '1px solid var(--ob-border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)'
    }
  }, "Top p\xE1ginas"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--ob-fg-soft)'
    }
  }, pages.length, " p\xE1ginas")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 0,
      borderRadius: '0 0 var(--ob-r-lg) var(--ob-r-lg)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(Table, {
    loading: loading,
    sort: sort,
    onSort: key => setSort(s => ({
      key,
      dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc'
    })),
    columns: [{
      key: 'path',
      label: 'Página',
      bold: true
    }, {
      key: 'views',
      label: 'Visualizações',
      sortable: true
    }, {
      key: 'rate',
      label: 'Conversão',
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: parseInt(v) > 55 ? 'green' : 'grey'
      }, v)
    }],
    rows: pageRows,
    emptyState: "Nenhuma p\xE1gina encontrada."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 24px',
      borderTop: '1px solid var(--ob-border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--ob-fg-soft)'
    }
  }, "P\xE1gina ", page, " de ", totalPages), /*#__PURE__*/React.createElement(Pagination, {
    page: page,
    total: totalPages,
    onChange: setPage
  }))));
};

// ============================================================
// SETTINGS
//   Tabs switch real content:
//   · Conta         → Input + Avatar + Link
//   · Notificações  → RadioGroup (frequency) + Checkbox (channels) + Toggle
//   · Cobrança      → RadioGroup (plan) + Modal (confirm change)
//   · Workspace     → Input + Toggle preferences
// ============================================================
const SettingsScreen = () => {
  const [tab, setTab] = useState('account');
  const tabs = [{
    id: 'account',
    label: 'Conta'
  }, {
    id: 'workspace',
    label: 'Workspace'
  }, {
    id: 'notifications',
    label: 'Notificações'
  }, {
    id: 'billing',
    label: 'Cobrança'
  }];

  // notifications state
  const [freq, setFreq] = useState('daily');
  const [channels, setChannels] = useState({
    email: true,
    push: false,
    slack: true
  });
  const [sounds, setSounds] = useState(true);
  // workspace prefs
  const [prefs, setPrefs] = useState({
    dark: false,
    digest: true,
    beta: false
  });
  // billing
  const [plan, setPlan] = useState('pro');
  const [pendingPlan, setPendingPlan] = useState(null);
  const [twoFAStep, setTwoFAStep] = useState('off'); // 'off' | 'verify' | 'active'
  const [twoFACode, setTwoFACode] = useState('');
  const [emailAlertVisible, setEmailAlertVisible] = useState(true);
  const allCh = channels.email && channels.push && channels.slack;
  const someCh = (channels.email || channels.push || channels.slack) && !allCh;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 32,
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 28,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)',
      letterSpacing: '-0.02em'
    }
  }, "Ajustes"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      color: 'var(--ob-fg-soft)',
      fontSize: 14
    }
  }, "Gerencie sua conta e prefer\xEAncias.")), /*#__PURE__*/React.createElement(Tabs, {
    tabs: tabs,
    active: tab,
    onChange: setTab,
    variant: "line"
  }), tab === 'account' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, emailAlertVisible && /*#__PURE__*/React.createElement(Alert, {
    tone: "warning",
    title: "E-mail n\xE3o verificado",
    dismissible: true,
    onClose: () => setEmailAlertVisible(false),
    action: "Reenviar link",
    onAction: () => {
      setEmailAlertVisible(false);
      window.obToast?.({
        tone: 'info',
        title: 'Link reenviado',
        body: 'Verifique contato@onblide.com.'
      });
    }
  }, "Confirme seu e-mail para ativar notifica\xE7\xF5es e recupera\xE7\xE3o de conta."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: 24
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 16px',
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)'
    }
  }, "Perfil"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "OB",
    size: 56,
    color: "#0a4ee4"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: 'var(--ob-fg-strong)'
    }
  }, "Onblide"), /*#__PURE__*/React.createElement(Link, {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Alterar foto"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Nome de exibi\xE7\xE3o",
    defaultValue: "Onblide"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "E-mail",
    defaultValue: "contato@onblide.com",
    hint: "Usado para login e recupera\xE7\xE3o."
  }))), /*#__PURE__*/React.createElement(Card, {
    padding: 24
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 16px',
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)'
    }
  }, "Seguran\xE7a"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Senha atual",
    type: "password",
    defaultValue: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Nova senha",
    type: "password",
    placeholder: "M\xEDnimo 8 caracteres"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      fontSize: 13,
      color: 'var(--ob-fg-soft)'
    }
  }, "Precisa de ajuda? Leia o ", /*#__PURE__*/React.createElement(Link, {
    href: "#",
    onClick: e => e.preventDefault()
  }, "guia de seguran\xE7a"), "."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      paddingTop: 14,
      borderTop: '1px solid var(--ob-line-soft)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--ob-fg-strong)'
    }
  }, "Autentica\xE7\xE3o em 2 fatores"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ob-fg-soft)',
      marginTop: 2
    }
  }, twoFAStep === 'active' ? 'Ativo · via app autenticador' : 'Aumenta a segurança da conta')), twoFAStep === 'active' ? /*#__PURE__*/React.createElement(Badge, {
    tone: "green"
  }, "Ativo") : /*#__PURE__*/React.createElement(Button, {
    kind: "secondary",
    size: "sm",
    onClick: () => setTwoFAStep('verify')
  }, "Ativar 2FA")), twoFAStep === 'verify' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Alert, {
    tone: "info"
  }, "Abra o autenticador e insira o c\xF3digo de 6 d\xEDgitos para confirmar."), /*#__PURE__*/React.createElement(CodeInput, {
    length: 6,
    value: twoFACode,
    status: twoFACode.length === 6 ? 'success' : 'default',
    onChange: v => {
      setTwoFACode(v);
      if (v.length === 6) setTimeout(() => {
        setTwoFAStep('active');
        setTwoFACode('');
        window.obToast?.({
          tone: 'success',
          title: '2FA ativado',
          body: 'Conta mais segura.'
        });
      }, 450);
    }
  }), /*#__PURE__*/React.createElement(Button, {
    kind: "secondary",
    size: "sm",
    onClick: () => {
      setTwoFAStep('off');
      setTwoFACode('');
    }
  }, "Cancelar")))))), tab === 'workspace' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: 24
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 16px',
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)'
    }
  }, "Workspace"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Nome do workspace",
    defaultValue: "Onblide"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "URL",
    defaultValue: "onblide.app/w/onblide",
    hint: "Identificador p\xFAblico do workspace."
  }))), /*#__PURE__*/React.createElement(Card, {
    padding: 24
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 16px',
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)'
    }
  }, "Prefer\xEAncias"), [{
    key: 'dark',
    lbl: 'Tema escuro',
    desc: 'Reduz brilho à noite'
  }, {
    key: 'digest',
    lbl: 'Resumo diário',
    desc: 'Enviado às 8h'
  }, {
    key: 'beta',
    lbl: 'Beta features',
    desc: 'Veja recursos antes'
  }].map((row, i) => /*#__PURE__*/React.createElement("div", {
    key: row.key,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 0',
      borderBottom: i < 2 ? '1px solid var(--ob-line-soft)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--ob-fg-strong)'
    }
  }, row.lbl), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ob-fg-soft)',
      marginTop: 2
    }
  }, row.desc)), /*#__PURE__*/React.createElement(Toggle, {
    checked: prefs[row.key],
    onChange: v => setPrefs(p => ({
      ...p,
      [row.key]: v
    }))
  }))))), tab === 'notifications' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: 24
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 6px',
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)'
    }
  }, "Frequ\xEAncia"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 16px',
      fontSize: 13,
      color: 'var(--ob-fg-soft)'
    }
  }, "Com que frequ\xEAncia avisamos voc\xEA."), /*#__PURE__*/React.createElement(RadioGroup, {
    name: "freq",
    value: freq,
    onChange: setFreq,
    options: [{
      value: 'realtime',
      label: 'Tempo real',
      description: 'Assim que algo acontece'
    }, {
      value: 'daily',
      label: 'Resumo diário',
      description: 'Uma vez por dia, às 8h'
    }, {
      value: 'weekly',
      label: 'Resumo semanal',
      description: 'Toda segunda de manhã'
    }]
  })), /*#__PURE__*/React.createElement(Card, {
    padding: 24
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 16px',
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)'
    }
  }, "Canais"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    checked: allCh,
    indeterminate: someCh,
    onChange: v => setChannels({
      email: v,
      push: v,
      slack: v
    }),
    label: "Todos os canais"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingLeft: 28,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    checked: channels.email,
    onChange: v => setChannels(s => ({
      ...s,
      email: v
    })),
    label: "E-mail"
  }), /*#__PURE__*/React.createElement(Checkbox, {
    checked: channels.push,
    onChange: v => setChannels(s => ({
      ...s,
      push: v
    })),
    label: "Push no navegador"
  }), /*#__PURE__*/React.createElement(Checkbox, {
    checked: channels.slack,
    onChange: v => setChannels(s => ({
      ...s,
      slack: v
    })),
    label: "Slack"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      paddingTop: 16,
      borderTop: '1px solid var(--ob-line-soft)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--ob-fg-strong)'
    }
  }, "Sons do app"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ob-fg-soft)',
      marginTop: 2
    }
  }, "Tocar ao receber notifica\xE7\xE3o")), /*#__PURE__*/React.createElement(Toggle, {
    checked: sounds,
    onChange: setSounds
  })))), tab === 'billing' && /*#__PURE__*/React.createElement(Card, {
    padding: 24
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)'
    }
  }, "Plano"), /*#__PURE__*/React.createElement(Badge, {
    tone: "blue"
  }, "Atual: ", plan === 'free' ? 'Free' : plan === 'pro' ? 'Pro' : 'Team')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 12
    }
  }, [{
    id: 'free',
    name: 'Free',
    price: 'R$ 0',
    desc: '1 projeto · recursos básicos'
  }, {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 49',
    desc: 'Projetos ilimitados · suporte'
  }, {
    id: 'team',
    name: 'Team',
    price: 'R$ 129',
    desc: 'Colaboração · permissões'
  }].map(p => /*#__PURE__*/React.createElement("label", {
    key: p.id,
    onClick: () => p.id !== plan && setPendingPlan(p.id),
    style: {
      border: `1.5px solid ${plan === p.id ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
      borderRadius: 12,
      padding: 16,
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      background: plan === p.id ? 'var(--ob-blue-050)' : 'var(--ob-surface)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(Radio, {
    name: "plan",
    value: p.id,
    checked: plan === p.id,
    onChange: () => p.id !== plan && setPendingPlan(p.id),
    label: p.name
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)',
      letterSpacing: '-0.02em'
    }
  }, p.price, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 500,
      color: 'var(--ob-fg-soft)'
    }
  }, "/m\xEAs")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ob-fg-soft)',
      lineHeight: 1.5
    }
  }, p.desc)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      fontSize: 13,
      color: 'var(--ob-fg-soft)'
    }
  }, "Veja a compara\xE7\xE3o completa na ", /*#__PURE__*/React.createElement(Link, {
    href: "#",
    external: true,
    onClick: e => e.preventDefault()
  }, "p\xE1gina de planos"), "."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      paddingTop: 16,
      borderTop: '1px solid var(--ob-line-soft)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--ob-fg-strong)'
    }
  }, "Armazenamento"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--ob-fg-soft)'
    }
  }, "8,2 GB de ", plan === 'free' ? '5 GB' : plan === 'pro' ? '50 GB' : '500 GB')), /*#__PURE__*/React.createElement(ProgressBar, {
    value: plan === 'free' ? 100 : plan === 'pro' ? 16 : 2,
    tone: plan === 'free' ? 'danger' : 'info',
    size: "md",
    showLabel: true
  }), plan === 'free' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Alert, {
    tone: "danger",
    title: "Limite atingido"
  }, "Fa\xE7a upgrade para continuar recebendo arquivos e dados."))), /*#__PURE__*/React.createElement(Modal, {
    open: !!pendingPlan,
    onClose: () => setPendingPlan(null),
    title: "Alterar plano?",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      kind: "secondary",
      onClick: () => setPendingPlan(null)
    }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
      kind: "primary",
      onClick: () => {
        setPlan(pendingPlan);
        setPendingPlan(null);
      }
    }, "Confirmar"))
  }, "Voc\xEA est\xE1 mudando para o plano ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--ob-fg-strong)'
    }
  }, pendingPlan === 'free' ? 'Free' : pendingPlan === 'pro' ? 'Pro' : 'Team'), ". A cobran\xE7a ser\xE1 ajustada no pr\xF3ximo ciclo.")));
};

// ============================================================
// INTEGRATIONS HUB
//   Spotify is the featured, already-connected integration.
//   · BrandTile → authentic brand logos
//   · Toggle    → enable/disable a connected service
//   · Badge     → connection status
//   · Dropdown  → per-integration actions (sync / configure / disconnect)
//   · Modal     → connect consent + disconnect confirmation
//   · Tooltip   → last-sync detail
//   · Link      → docs
// ============================================================
const IntegrationsScreen = () => {
  // which services are connected
  const [conn, setConn] = useState({
    spotify: true,
    slack: true,
    github: false,
    notion: false,
    figma: true,
    dropbox: false,
    discord: false
  });
  // enabled toggle per connected service
  const [enabled, setEnabled] = useState({
    spotify: true,
    slack: true,
    figma: false
  });
  const [connectTarget, setConnectTarget] = useState(null); // brand key pending connect
  const [disconnectTarget, setDisconnectTarget] = useState(null);
  const [filter, setFilter] = useState('Todos');
  const order = ['slack', 'notion', 'figma', 'github', 'dropbox', 'discord'];
  const cats = ['Todos', 'Comunicação', 'Produtividade', 'Desenvolvimento', 'Armazenamento', 'Design'];
  const connectedCount = Object.values(conn).filter(Boolean).length;
  const doConnect = key => {
    setConn(c => ({
      ...c,
      [key]: true
    }));
    setEnabled(e => ({
      ...e,
      [key]: true
    }));
    setConnectTarget(null);
    window.obToast?.({
      tone: 'success',
      title: `${Brands[key].name} conectado`,
      body: 'Sincronização iniciada.'
    });
  };
  const doDisconnect = key => {
    setConn(c => ({
      ...c,
      [key]: false
    }));
    setEnabled(e => {
      const n = {
        ...e
      };
      delete n[key];
      return n;
    });
    setDisconnectTarget(null);
    window.obToast?.({
      tone: 'warning',
      title: `${Brands[key].name} desconectado`
    });
  };
  const list = order.filter(k => filter === 'Todos' || Brands[k].cat === filter);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 32,
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 28,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)',
      letterSpacing: '-0.02em'
    }
  }, "Integra\xE7\xF5es"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      color: 'var(--ob-fg-soft)',
      fontSize: 14
    }
  }, connectedCount, " conectadas \xB7 conecte suas ferramentas favoritas ao Onblide.")), /*#__PURE__*/React.createElement(Button, {
    kind: "secondary",
    icon: /*#__PURE__*/React.createElement(Icons.link, {
      size: 16
    })
  }, "Solicitar integra\xE7\xE3o")), /*#__PURE__*/React.createElement(Card, {
    padding: 0,
    elevation: "shadow",
    style: {
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      padding: 24,
      background: 'linear-gradient(90deg, rgba(29,185,84,0.10), transparent 60%)'
    }
  }, /*#__PURE__*/React.createElement(BrandTile, {
    brand: "spotify",
    size: 64
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 20,
      fontWeight: 700,
      color: 'var(--ob-fg-strong)'
    }
  }, "Spotify"), /*#__PURE__*/React.createElement(Badge, {
    tone: "green"
  }, "Conectado")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '5px 0 0',
      fontSize: 13,
      color: 'var(--ob-fg-soft)'
    }
  }, Brands.spotify.desc)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--ob-fg-strong)'
    }
  }, enabled.spotify ? 'Ativo' : 'Pausado'), /*#__PURE__*/React.createElement(Toggle, {
    checked: !!enabled.spotify,
    onChange: v => setEnabled(e => ({
      ...e,
      spotify: v
    }))
  })), /*#__PURE__*/React.createElement(Dropdown, {
    align: "right",
    trigger: /*#__PURE__*/React.createElement("button", {
      style: {
        width: 38,
        height: 38,
        borderRadius: 10,
        border: '1.5px solid var(--ob-border)',
        background: 'var(--ob-surface)',
        color: 'var(--ob-fg)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icons.more, {
      size: 18
    })),
    items: [{
      label: 'Sincronizar agora',
      icon: /*#__PURE__*/React.createElement(Icons.sync, {
        size: 16
      }),
      onClick: () => {}
    }, {
      label: 'Configurar',
      icon: /*#__PURE__*/React.createElement(Icons.gear, {
        size: 16
      }),
      onClick: () => {}
    }, {
      divider: true
    }, {
      label: 'Desconectar',
      icon: /*#__PURE__*/React.createElement(Icons.x, {
        size: 16
      }),
      danger: true,
      onClick: () => setDisconnectTarget('spotify')
    }]
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 28,
      padding: '14px 24px',
      borderTop: '1px solid var(--ob-border)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "OB",
    size: 26,
    color: "#1DB954"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--ob-fg-strong)',
      lineHeight: 1.2
    }
  }, "onblide@spotify.com"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--ob-fg-soft)'
    }
  }, "Conta vinculada"))), /*#__PURE__*/React.createElement(Tooltip, {
    label: "\xDAltima sincroniza\xE7\xE3o h\xE1 4 minutos",
    placement: "top"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      fontSize: 12,
      color: 'var(--ob-fg-soft)',
      cursor: 'default'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ob-green)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Icons.sync, {
    size: 15
  })), "42 playlists sincronizadas")), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      fontSize: 12,
      color: 'var(--ob-fg-soft)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ob-blue)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Icons.check, {
    size: 15
  })), "Permiss\xF5es: leitura de biblioteca"), /*#__PURE__*/React.createElement(Link, {
    href: "#",
    variant: "quiet",
    onClick: e => e.preventDefault(),
    style: {
      marginLeft: 'auto'
    }
  }, "Ver documenta\xE7\xE3o \u2192"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, cats.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    onClick: () => setFilter(c),
    style: {
      padding: '7px 14px',
      borderRadius: 999,
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: 13,
      fontWeight: 600,
      border: `1.5px solid ${filter === c ? 'var(--ob-blue)' : 'var(--ob-border)'}`,
      background: filter === c ? 'var(--ob-blue)' : 'var(--ob-surface)',
      color: filter === c ? '#fff' : 'var(--ob-fg)'
    }
  }, c))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: 14
    }
  }, list.map(key => {
    const b = Brands[key];
    const isConn = conn[key];
    return /*#__PURE__*/React.createElement(Card, {
      key: key,
      padding: 20,
      elevation: "border",
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 13
      }
    }, /*#__PURE__*/React.createElement(BrandTile, {
      brand: key,
      size: 46
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        fontWeight: 700,
        color: 'var(--ob-fg-strong)'
      }
    }, b.name), isConn && /*#__PURE__*/React.createElement(Badge, {
      tone: "green"
    }, "Conectado")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--ob-fg-mute)',
        marginTop: 3
      }
    }, b.cat)), isConn && /*#__PURE__*/React.createElement(Dropdown, {
      align: "right",
      trigger: /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--ob-fg-mute)',
          cursor: 'pointer',
          display: 'flex',
          padding: 2
        }
      }, /*#__PURE__*/React.createElement(Icons.more, {
        size: 18
      })),
      items: [{
        label: 'Sincronizar agora',
        icon: /*#__PURE__*/React.createElement(Icons.sync, {
          size: 16
        }),
        onClick: () => {}
      }, {
        label: 'Configurar',
        icon: /*#__PURE__*/React.createElement(Icons.gear, {
          size: 16
        }),
        onClick: () => {}
      }, {
        divider: true
      }, {
        label: 'Desconectar',
        icon: /*#__PURE__*/React.createElement(Icons.x, {
          size: 16
        }),
        danger: true,
        onClick: () => setDisconnectTarget(key)
      }]
    })), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 13,
        color: 'var(--ob-fg-soft)',
        lineHeight: 1.5,
        minHeight: 38
      }
    }, b.desc), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 4,
        borderTop: '1px solid var(--ob-line-soft)'
      }
    }, isConn ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: enabled[key] ? 'var(--ob-fg-strong)' : 'var(--ob-fg-soft)'
      }
    }, enabled[key] ? 'Ativo' : 'Pausado'), /*#__PURE__*/React.createElement(Toggle, {
      checked: !!enabled[key],
      onChange: v => setEnabled(e => ({
        ...e,
        [key]: v
      }))
    })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--ob-fg-mute)'
      }
    }, "N\xE3o conectado"), /*#__PURE__*/React.createElement(Button, {
      kind: "secondary",
      size: "sm",
      icon: /*#__PURE__*/React.createElement(Icons.plus, {
        size: 14
      }),
      onClick: () => setConnectTarget(key)
    }, "Conectar"))));
  })), /*#__PURE__*/React.createElement(Modal, {
    open: !!connectTarget,
    onClose: () => setConnectTarget(null),
    title: connectTarget ? `Conectar ${Brands[connectTarget].name}` : '',
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      kind: "secondary",
      onClick: () => setConnectTarget(null)
    }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
      kind: "primary",
      onClick: () => doConnect(connectTarget)
    }, "Autorizar e conectar"))
  }, connectTarget && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(BrandTile, {
    brand: connectTarget,
    size: 48
  }), /*#__PURE__*/React.createElement(Icons.link, {
    size: 18
  }), /*#__PURE__*/React.createElement(Logo, {
    size: 24
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      color: 'var(--ob-fg)',
      lineHeight: 1.55
    }
  }, "O Onblide poder\xE1 acessar dados do seu ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--ob-fg-strong)'
    }
  }, Brands[connectTarget].name), " para ", Brands[connectTarget].desc.toLowerCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      background: 'var(--ob-bg-warm)',
      borderRadius: 10,
      padding: 14
    }
  }, ['Ler informações do seu perfil', 'Acessar conteúdo relacionado', 'Receber atualizações em tempo real'].map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      fontSize: 13,
      color: 'var(--ob-fg)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ob-green)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Icons.check, {
    size: 15
  })), p))))), /*#__PURE__*/React.createElement(Modal, {
    open: !!disconnectTarget,
    onClose: () => setDisconnectTarget(null),
    title: "Desconectar integra\xE7\xE3o?",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      kind: "secondary",
      onClick: () => setDisconnectTarget(null)
    }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
      kind: "danger",
      onClick: () => doDisconnect(disconnectTarget)
    }, "Desconectar"))
  }, disconnectTarget && /*#__PURE__*/React.createElement("span", null, "O ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--ob-fg-strong)'
    }
  }, Brands[disconnectTarget].name), " ser\xE1 desvinculado e a sincroniza\xE7\xE3o de dados ser\xE1 interrompida. Voc\xEA pode reconectar a qualquer momento.")));
};
Object.assign(window, {
  HomeScreen,
  TasksScreen,
  MetricsScreen,
  SettingsScreen,
  IntegrationsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web_app/Screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web_app/tweaks-panel.jsx
try { (() => {
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;width:100%;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  noDeckControls = false,
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  // Auto-inject a rail toggle when a <deck-stage> is on the page. The
  // toggle drives the deck's per-viewer _railVisible via window message;
  // state is mirrored from the same localStorage key the deck reads so
  // the control reflects reality across reloads. The mechanism is the
  // message — authors who want custom placement can post it directly
  // and pass noDeckControls to suppress this one.
  const hasDeckStage = React.useMemo(() => typeof document !== 'undefined' && !!document.querySelector('deck-stage'), []);
  // Hide the toggle until the host has actually enabled the rail (the
  // __omelette_rail_enabled window message, posted only when the
  // omelette_deck_rail_enabled flag is on for this user). The initial read
  // covers TweaksPanel mounting after the message already arrived; the
  // listener covers the common case of mounting first.
  const [railEnabled, setRailEnabled] = React.useState(() => hasDeckStage && !!document.querySelector('deck-stage')?._railEnabled);
  React.useEffect(() => {
    if (!hasDeckStage || railEnabled) return undefined;
    const onMsg = e => {
      if (e.data && e.data.type === '__omelette_rail_enabled') setRailEnabled(true);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [hasDeckStage, railEnabled]);
  const [railVisible, setRailVisible] = React.useState(() => {
    try {
      return localStorage.getItem('deck-stage.railVisible') !== '0';
    } catch (e) {
      return true;
    }
  });
  const toggleRail = on => {
    setRailVisible(on);
    window.postMessage({
      type: '__deck_rail_visible',
      on
    }, '*');
  };
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-noncommentable": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children, hasDeckStage && railEnabled && !noDeckControls && /*#__PURE__*/React.createElement(TweakSection, {
    label: "Deck"
  }, /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Thumbnail rail",
    value: railVisible,
    onChange: toggleRail
  })))));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "twk-row twk-row-h"
    }, /*#__PURE__*/React.createElement("div", {
      className: "twk-lbl"
    }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map((c, j) => /*#__PURE__*/React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web_app/tweaks-panel.jsx", error: String((e && e.message) || e) }); }

})();
