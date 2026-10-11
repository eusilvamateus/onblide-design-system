import MDXComponents from '@theme-original/MDXComponents';
import { Criterios, Evite, Faca, FacaEvite, Nota } from '@site/src/components/Guia';
import PropsTable from '@site/src/components/PropsTable';
import Playground from '@site/src/components/Playground';
import TabelaMarkdown from '@site/src/components/TabelaMarkdown';

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
  table: TabelaMarkdown,
};
