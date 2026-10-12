import { FileUpload } from '@onblide/ui';

const foto = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23F4A261'/%3E%3Ccircle cx='32' cy='25' r='11' fill='%23FFF'/%3E%3Cpath d='M10 64c2-16 12-22 22-22s20 6 22 22z' fill='%23FFF'/%3E%3C/svg%3E";

const caixa = { padding: 16, width: 420 };

export const Dropzone = () => (
  <div style={caixa}>
    <FileUpload label="Anexos" hint="PDF ou imagem, até 5 MB" accept=".pdf,image/*" acceptLabel="PDF ou imagem" />
  </div>
);

export const Botao = () => (
  <div style={caixa}>
    <FileUpload variant="button" buttonLabel="Anexar arquivo" />
  </div>
);

export const Imagem = () => (
  <div style={caixa}>
    <FileUpload variant="image" label="Logo da empresa" hint="PNG ou JPG, até 2 MB" accept="image/*" />
  </div>
);

export const FotoDePerfil = () => (
  <div style={caixa}>
    <FileUpload variant="image" shape="circle" label="Foto de perfil" hint="PNG, JPEG ou WebP. Até 2 MB." accept="image/*" acceptLabel="PNG, JPEG ou WebP" />
  </div>
);

export const FotoAtual = () => (
  <div style={caixa}>
    <FileUpload variant="image" shape="circle" label="Foto de perfil" hint="Passe o mouse na foto para trocar." defaultFiles={[{ name: 'perfil.png', size: 1000, url: foto }]} />
  </div>
);

export const Enviando = () => (
  <div style={caixa}>
    <FileUpload variant="image" shape="circle" label="Foto de perfil" defaultFiles={[{ name: 'perfil.png', size: 1000, url: foto, status: 'uploading', progress: 62 }]} />
  </div>
);

export const EnviandoSemProgresso = () => (
  <div style={caixa}>
    <FileUpload variant="image" shape="circle" label="Foto de perfil" indeterminate defaultFiles={[{ name: 'perfil.png', size: 1000, url: foto, status: 'uploading' }]} />
  </div>
);

export const Arrastando = () => (
  <div style={caixa}>
    <FileUpload variant="image" shape="circle" label="Foto de perfil" dragging />
  </div>
);

export const ComErro = () => (
  <div style={caixa}>
    <FileUpload variant="image" shape="circle" label="Foto de perfil" defaultFiles={[{ name: 'perfil.png', size: 1000, url: foto, status: 'error', error: 'Maior que 2 MB' }]} />
  </div>
);

export const ComArquivos = () => (
  <div style={caixa}>
    <FileUpload
      defaultFiles={[
        { name: 'foto-da-equipe.png', size: 2048, url: foto },
        { name: 'contrato.pdf', size: 204800 },
        { name: 'falha-no-envio.pdf', size: 1024, status: 'error', error: 'Falha no envio', retry: true },
      ]}
    />
  </div>
);

export const Desabilitado = () => (
  <div style={caixa}>
    <FileUpload variant="image" shape="circle" label="Foto de perfil" disabled />
  </div>
);
