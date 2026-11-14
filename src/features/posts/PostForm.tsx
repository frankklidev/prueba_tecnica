import { useRef, useState, type FormEvent } from 'react';
import type { PostDraft } from '../../directory';
const emptyFields: PostDraft = { title: '', body: '' };

export function PostForm({ onPublish }: { onPublish: (fields: PostDraft) => Promise<void> }) {
  const [fields, setFields] = useState(emptyFields);
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'error' | 'success'>('idle');
  const titleInput = useRef<HTMLInputElement>(null);
  const bodyInput = useRef<HTMLTextAreaElement>(null);
  const pending = useRef(false);
  const titleInvalid = submitted && !fields.title.trim();
  const bodyInvalid = submitted && !fields.body.trim();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;

    const title = fields.title.trim();
    const body = fields.body.trim();
    setSubmitted(true);
    if (!title || !body) {
      setStatus('idle');
      (title ? bodyInput : titleInput).current?.focus();
      return;
    }

    pending.current = true;
    setStatus('saving');
    try {
      await onPublish({ title, body });
      setFields(emptyFields);
      setSubmitted(false);
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      pending.current = false;
    }
  }

  return (
    <form className="post-form" onSubmit={handleSubmit} noValidate aria-labelledby="form-title">
      <h3 id="form-title">Nueva publicación</h3>
      <fieldset disabled={status === 'saving'}>
        <div>
          <label htmlFor="post-title">Título</label>
          <input
            id="post-title"
            ref={titleInput}
            required
            value={fields.title}
            onChange={(event) => setFields({ ...fields, title: event.target.value })}
            aria-invalid={titleInvalid}
            aria-describedby={titleInvalid ? 'title-error' : undefined}
          />
          {titleInvalid && <p className="field-error" id="title-error">Escribe un título.</p>}
        </div>
        <div>
          <label htmlFor="post-body">Texto</label>
          <textarea
            id="post-body"
            ref={bodyInput}
            required
            rows={3}
            value={fields.body}
            onChange={(event) => setFields({ ...fields, body: event.target.value })}
            aria-invalid={bodyInvalid}
            aria-describedby={bodyInvalid ? 'body-error' : undefined}
          />
          {bodyInvalid && <p className="field-error" id="body-error">Escribe el texto de la publicación.</p>}
        </div>
        <button className="primary" type="submit">Publicar</button>
      </fieldset>
      {status === 'saving' && <p role="status">Publicando…</p>}
      {status === 'success' && <p role="status" className="success">Publicación creada.</p>}
      {status === 'error' && <p role="alert">No se pudo publicar. Vuelve a intentarlo.</p>}
    </form>
  );
}
