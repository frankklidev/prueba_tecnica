import { useCallback } from 'react';
import { getPosts, type User } from './api';
import { LoadError } from './LoadError';
import { useResource } from './useResource';

export function PostsPanel({ user }: { user: User }) {
  const load = useCallback((signal: AbortSignal) => getPosts(user.id, signal), [user.id]);
  const { resource, retry } = useResource(load);

  return (
    <section className="panel posts" aria-labelledby="posts-title">
      <h2 id="posts-title">Publicaciones de {user.name}</h2>
      {resource.status === 'loading' && <p role="status">Cargando publicaciones…</p>}
      {resource.status === 'error' && (
        <LoadError message="No se pudieron cargar las publicaciones." onRetry={retry} />
      )}
      {resource.status === 'success' && (
        resource.data.length === 0 ? <p>Este usuario todavía no tiene publicaciones.</p> : (
          <ul className="post-list">
            {resource.data.map((post) => (
              <li key={post.id}>
                <article><h3>{post.title}</h3><p>{post.body}</p></article>
              </li>
            ))}
          </ul>
        )
      )}
    </section>
  );
}
