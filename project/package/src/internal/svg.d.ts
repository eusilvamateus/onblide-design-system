// Arquivos .svg importados entram no build como texto (loader do tsup).
declare module '*.svg' {
  const conteudo: string;
  export default conteudo;
}
