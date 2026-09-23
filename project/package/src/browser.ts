// Built as a standalone IIFE (see tsup.config.ts). Re-exporting everything
// from `index` and assigning it onto `window` reproduces exactly what
// `Object.assign(window, { Checkbox, Modal, ... })` does today in
// Components.jsx/Primitives.jsx — so ds/components/*.html pages that
// reference `Checkbox`, `Button`, etc. as bare globals keep working once
// their <script type="text/babel" src="..."> tag is swapped for this file.
import * as OnblideUI from './index';

Object.assign(window, OnblideUI);
