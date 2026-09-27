import MDXComponents from '@theme-original/MDXComponents';
import { Criterios, Evite, Faca, FacaEvite, Nota } from '@site/src/components/Guia';
import PropsTable from '@site/src/components/PropsTable';
import Playground from '@site/src/components/Playground';

// Componentes disponíveis em todo MDX sem import (páginas geradas e guias).
export default {
  ...MDXComponents,
  FacaEvite,
  Faca,
  Evite,
  Nota,
  Criterios,
  PropsTable,
  Playground,
};
