import { useCallback } from 'react';
import { getPosts, type NewPost, type Post, type User } from './api';
import { LoadError } from './LoadError';
import { PostForm } from './PostForm';
import { useResource } from './useResource';

interface PostsPanelProps {
  user: User;
  localPosts: Post[];
  onPublish: (post: NewPost) => Promise<void>;
}

export function PostsPanel({ user, localPosts, onPublish }: PostsPanelProps) {
  const load = useCallback((signal: AbortSignal) => getPosts(user.id, signal), [user.id]);
  const { resource, retry } = useResource(load);

  const posts = [...localPosts, ...(resource.status === 'success' ? resource.data : [])];

  return (
    <section className="panel posts" aria-labelledby="posts-title">
      <h2 id="posts-title">Publicaciones de {user.name}</h2>
      <PostForm onPublish={(fields) => onPublish({ ...fields, userId: user.id })} />
      {resource.status === 'loading' && <p role="status">Cargando publicaciones…</p>}
      {resource.status === 'error' && (
        <LoadError message="No se pudieron cargar las publicaciones." onRetry={retry} />
      )}
      {posts.length > 0 && (
        <ul className="post-list" aria-label="Publicaciones">
          {posts.map((post) => (
            <li key={post.id}>
              <article><h3>{post.title}</h3><p>{post.body}</p></article>
            </li>
          ))}
        </ul>
      )}
      {resource.status === 'success' && posts.length === 0 && (
        <p>Este usuario todavía no tiene publicaciones.</p>
      )}
    </section>
  );
}
