import { FileUpload } from '@onblide/ui';

export const Dropzone = () => (
  <div style={{ padding: 16, width: 340 }}>
    <FileUpload label="Anexos" hint="PDF ou imagem, até 5 MB" accept=".pdf,image/*" acceptLabel="PDF ou imagem" />
  </div>
);

export const Botao = () => (
  <div style={{ padding: 16, width: 340 }}>
    <FileUpload variant="button" buttonLabel="Anexar arquivo" />
  </div>
);

export const Imagem = () => (
  <div style={{ padding: 16, width: 340 }}>
    <FileUpload variant="image" />
  </div>
);

export const ComArquivos = () => (
  <div style={{ padding: 16, width: 340 }}>
    <FileUpload
      defaultFiles={[
        { name: 'contrato.pdf', size: 204800 },
        { name: 'falha-no-envio.pdf', size: 1024, status: 'error', error: 'Falha no envio', retry: true },
      ]}
    />
  </div>
);
