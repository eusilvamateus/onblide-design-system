import React from 'react';
import { Ph } from '../../iconography/Ph/Ph';
import { ProgressBar } from '../../feedback/ProgressBar/ProgressBar';
import { Button } from '../../actions/Button/Button';
import { List, ListItem } from '../../data-display/List/List';

const numberFormat = (n: number, decimals: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: decimals }).format(n);
const fileSize = (b: number) => (b < 1024 ? `${b} B` : b < 1048576 ? `${numberFormat(b / 1024, 0)} KB` : `${numberFormat(b / 1048576, 1)} MB`);
const fileIcon = (name: string, type = ''): string =>
  /pdf/.test(type) || /\.pdf$/i.test(name) ? 'file-pdf'
    : /^image\//.test(type) || /\.(png|jpe?g|gif|webp|svg)$/i.test(name) ? 'file-image'
    : /zip/.test(type) || /\.(zip|rar)$/i.test(name) ? 'file-zip'
    : /\.(docx?|txt)$/i.test(name) ? 'file-doc'
    : /\.(mp4|mov)$/i.test(name) ? 'file-video' : 'file';
const fileAccepts = (file: File, accept?: string) =>
  !accept || accept.split(',').map((s) => s.trim().toLowerCase()).some((a) =>
    a.startsWith('.') ? file.name.toLowerCase().endsWith(a) : a.endsWith('/*') ? (file.type || '').startsWith(a.slice(0, -1)) : file.type === a);

/** Simulação de envio para uso sem backend (demos, previews); nomes com "falha" no meio erram de propósito. */
const simulateUpload = (file: { name: string }, onProgress: (p: number) => void) => new Promise<void>((resolve, reject) => {
  let p = 0;
  const t = setInterval(() => {
    p += 8 + Math.random() * 14;
    if (/falha/i.test(file.name) && p > 55) { clearInterval(t); reject(new Error('Falha na conexão')); return; }
    if (p >= 100) { clearInterval(t); onProgress(100); resolve(); } else onProgress(Math.round(p));
  }, 180);
});
const srOnly: React.CSSProperties = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' };

export type FileUploadVariant = 'dropzone' | 'button' | 'image';
export type UploadFileStatus = 'uploading' | 'done' | 'error';
export interface UploadFile {
  id: string; name: string; size: number; type?: string; url?: string | null;
  status: UploadFileStatus; progress?: number; error?: string; retry?: boolean; file?: File;
}

export interface FileUploadProps {
  variant?: FileUploadVariant;
  multiple?: boolean;
  /** Extensões (`.pdf`) ou tipos MIME (`image/*`) aceitos. */
  accept?: string;
  /** Texto do erro de tipo não aceito, ex.: "Use PDF ou imagem". */
  acceptLabel?: string;
  /** Tamanho máximo por arquivo, em bytes. */
  maxSize?: number;
  maxFiles?: number;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  defaultFiles?: Partial<UploadFile>[];
  /** Envio de verdade; por padrão simula progresso para uso em demos. */
  upload?: (file: { name: string; size: number; type?: string }, onProgress: (p: number) => void) => Promise<void>;
  onChange?: (files: UploadFile[]) => void;
  /** Força o estado de arraste (demos); por padrão é interno. */
  dragging?: boolean;
  /** Rótulo do botão na variante `button`. */
  buttonLabel?: string;
}

/** Envio de arquivos por arrastar/soltar ou seletor do sistema, com fila de progresso e erro por arquivo. */
export const FileUpload: React.FC<FileUploadProps> = ({
  variant = 'dropzone', multiple = true, accept, acceptLabel, maxSize, maxFiles, label, hint, error,
  disabled = false, defaultFiles = [], upload = simulateUpload, onChange, dragging, buttonLabel = 'Anexar arquivos',
}) => {
  const [files, setFiles] = React.useState<UploadFile[]>(() => defaultFiles.map((f, i) => ({ id: `d${i}`, status: 'done', progress: 100, name: '', size: 0, ...f } as UploadFile)));
  const [drag, setDrag] = React.useState(false);
  const [live, setLive] = React.useState('');
  const isDrag = !disabled && (dragging ?? drag);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const seq = React.useRef(0);
  const first = React.useRef(true);
  const uid = React.useId();
  React.useEffect(() => { if (first.current) { first.current = false; return; } onChange?.(files); }, [files]);

  const update = (id: string, patch: Partial<UploadFile>) => setFiles((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const run = (item: UploadFile) => upload(item.file || { name: item.name, size: item.size, type: item.type }, (p) => update(item.id, { progress: p })).then(
    () => { update(item.id, { status: 'done', progress: 100 }); setLive(`${item.name} enviado`); },
    (e: Error) => { update(item.id, { status: 'error', error: e?.message || 'Falha no envio', retry: true }); setLive(`Falha ao enviar ${item.name}`); },
  );
  const add = (list: FileList | File[] | null) => {
    const arr = Array.from(list || []);
    if (!arr.length || disabled) return;
    const single = variant === 'image' || !multiple;
    const room = maxFiles && !single ? maxFiles - files.length : Infinity;
    const items: UploadFile[] = arr.slice(0, single ? 1 : arr.length).map((file, k) => {
      const base = { id: `f${++seq.current}`, file, name: file.name, size: file.size, type: file.type, url: /^image\//.test(file.type) ? URL.createObjectURL(file) : null };
      if (k >= room) return { ...base, status: 'error', error: `Limite de ${maxFiles} arquivos` };
      if (!fileAccepts(file, accept)) return { ...base, status: 'error', error: `Tipo não aceito${acceptLabel ? `. Use ${acceptLabel}` : ''}` };
      if (maxSize && file.size > maxSize) return { ...base, status: 'error', error: `Maior que ${fileSize(maxSize)}` };
      return { ...base, status: 'uploading', progress: 0 };
    });
    setFiles(single ? items : (prev) => [...prev, ...items]);
    items.filter((i) => i.status === 'uploading').forEach(run);
  };
  const retry = (f: UploadFile) => { update(f.id, { status: 'uploading', progress: 0, error: undefined }); run(f); };
  const remove = (f: UploadFile) => setFiles((fs) => fs.filter((x) => x.id !== f.id));
  const pick = () => { if (!disabled) inputRef.current?.click(); };
  const dropProps = {
    onDragEnter: (e: React.DragEvent) => { e.preventDefault(); if (!disabled) setDrag(true); },
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); if (!disabled) e.dataTransfer.dropEffect = 'copy'; },
    onDragLeave: (e: React.DragEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDrag(false); },
    onDrop: (e: React.DragEvent) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); },
  };
  const keyPick = (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } };
  const hintEl = (hint || error) && <span id={`${uid}-h`} style={{ fontSize: 12, color: error ? 'var(--ob-danger)' : 'var(--ob-fg-soft)' }}>{error || hint}</span>;

  const desc = (f: UploadFile) => f.status === 'uploading'
    ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}><span style={{ flex: 1, minWidth: 0 }}><ProgressBar value={f.progress ?? 0} size="sm" /></span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{f.progress}%</span></span>
    : f.status === 'error' ? <span style={{ color: 'var(--ob-danger)' }}>{f.error}</span> : fileSize(f.size);
  const actions = (f: UploadFile) => f.status === 'uploading'
    ? <Button kind="ghost" size="sm" aria-label={`Cancelar envio de ${f.name}`} onClick={() => remove(f)} icon={<Ph n="x" size={16} />} />
    : <>
      {f.retry && f.status === 'error' && <Button kind="ghost" size="sm" onClick={() => retry(f)} icon={<Ph n="arrow-clockwise" size={16} />}>Tentar de novo</Button>}
      <Button kind="ghost" size="sm" aria-label={`Remover ${f.name}`} onClick={() => remove(f)} icon={<Ph n="trash" size={16} />} />
    </>;
  const fileList = files.length > 0 && variant !== 'image' && (
    <div style={{ border: '1px solid var(--ob-border)', borderRadius: 'var(--ob-r-surface)', background: 'var(--ob-surface)', overflow: 'hidden' }}>
      <List dividers ariaLabel="Arquivos enviados">
        {files.map((f) => (
          <ListItem key={f.id} style={{ padding: '10px 8px 10px 12px' }}
            leading={<Ph n={f.status === 'error' ? 'warning-circle' : fileIcon(f.name, f.type)} size={20} c={f.status === 'error' ? 'var(--ob-danger)' : 'currentColor'} />}
            title={f.name} description={desc(f)} trailing={actions(f)} />
        ))}
      </List>
    </div>
  );
  const input = (
    <input ref={inputRef} type="file" multiple={variant !== 'image' && multiple} accept={accept} disabled={disabled} tabIndex={-1} aria-hidden="true" style={{ display: 'none' }}
      onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
  );

  let body: React.ReactNode;
  if (variant === 'image') {
    const img = files[0];
    body = (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div role="button" tabIndex={disabled ? -1 : 0} aria-label={img ? 'Trocar imagem' : 'Escolher imagem'} aria-disabled={disabled || undefined}
          aria-describedby={hintEl ? `${uid}-h` : undefined} onClick={pick} onKeyDown={keyPick} {...dropProps}
          style={{
            position: 'relative', width: 96, height: 96, flex: 'none', borderRadius: 'var(--ob-r-surface)',
            border: img?.url ? '1px solid var(--ob-border)' : `1.5px dashed ${isDrag ? 'var(--ob-blue)' : error ? 'var(--ob-danger)' : 'var(--ob-border)'}`,
            background: isDrag ? 'var(--ob-blue-050)' : 'var(--ob-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, outline: 'none',
          }}>
          {img?.url ? <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Ph n={isDrag ? 'download-simple' : 'image'} size={28} c={isDrag ? 'var(--ob-blue)' : 'var(--ob-fg-mute)'} />}
          {img?.status === 'uploading' && <span style={{ position: 'absolute', left: 8, right: 8, bottom: 8 }}><ProgressBar value={img.progress ?? 0} size="sm" /></span>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button kind="secondary" size="sm" onClick={pick} disabled={disabled}>{img ? 'Trocar' : 'Escolher imagem'}</Button>
            {img && <Button kind="ghost" size="sm" onClick={() => remove(img)} disabled={disabled}>Remover</Button>}
          </div>
          {img?.status === 'error' ? <span style={{ fontSize: 12, color: 'var(--ob-danger)' }}>{img.error}</span> : hintEl}
        </div>
      </div>
    );
  } else if (variant === 'button') {
    body = (
      <div {...dropProps} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: 6, margin: -6, borderRadius: 'var(--ob-r-control)', border: `1.5px dashed ${isDrag ? 'var(--ob-blue)' : 'transparent'}`, background: isDrag ? 'var(--ob-blue-050)' : 'transparent' }}>
        <Button kind="secondary" onClick={pick} disabled={disabled} aria-describedby={hintEl ? `${uid}-h` : undefined} icon={<Ph n="paperclip" size={16} />}>{buttonLabel}</Button>
        {hintEl}
      </div>
    );
  } else {
    body = (
      <div role="button" tabIndex={disabled ? -1 : 0} aria-disabled={disabled || undefined} aria-describedby={hintEl ? `${uid}-h` : undefined} onClick={pick} onKeyDown={keyPick} {...dropProps}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '28px 20px', textAlign: 'center',
          border: `1.5px dashed ${isDrag ? 'var(--ob-blue)' : error ? 'var(--ob-danger)' : 'var(--ob-border)'}`, borderRadius: 'var(--ob-r-surface)',
          background: isDrag ? 'var(--ob-blue-050)' : disabled ? 'var(--ob-bg-alt)' : 'var(--ob-surface)', cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1, transition: 'background .15s, border-color .15s', outline: 'none',
        }}>
        <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--ob-blue-050)', color: 'var(--ob-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ph n={isDrag ? 'download-simple' : 'upload-simple'} size={20} c="currentColor" />
        </span>
        <span style={{ fontSize: 14, lineHeight: '20px', color: 'var(--ob-fg-strong)' }}>
          {isDrag ? 'Solte para enviar' : <>Arraste arquivos ou <span style={{ color: 'var(--ob-blue)', fontWeight: 600 }}>escolha no computador</span></>}
        </span>
        {hintEl}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'var(--ob-font)' }}>
      {label && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ob-fg-strong)' }}>{label}</span>}
      {body}{input}{fileList}
      <span aria-live="polite" style={srOnly}>{live}</span>
    </div>
  );
};
