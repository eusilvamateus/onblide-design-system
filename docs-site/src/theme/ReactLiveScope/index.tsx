import React, { useEffect, useRef, useState } from 'react';
import * as OnblideUI from '@onblide/ui';

// Tudo que os exemplos ao vivo podem usar sem importar: os componentes do pacote e os hooks do React.
const ReactLiveScope = { React, useState, useEffect, useRef, ...OnblideUI };

export default ReactLiveScope;
