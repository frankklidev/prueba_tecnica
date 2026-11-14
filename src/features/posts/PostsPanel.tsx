import { useCallback, useState } from 'react';
import type { DirectoryGateway, NewPost, Post, User } from '../../directory';
import { LoadError } from '../../shared/LoadError';
import { Pagination } from './Pagination';
import { PostForm } from './PostForm';
import { useResource } from '../../shared/useResource';

const POSTS_PER_PAGE = 5;

interface PostsPanelProps {
  user: User;
  loadPosts: DirectoryGateway['getPosts'];
  localPosts: Post[];
  onPublish: (post: NewPost) => Promise<void>;
}

export function PostsPanel({ user, loadPosts, localPosts, onPublish }: PostsPanelProps) {
  const load = useCallback((signal: AbortSignal) => loadPosts(user.id, signal), [loadPosts, user.id]);
  const { resource, retry } = useResource(load);

  const [pagination, setPagination] = useState<{ page: number; newestLocalId?: number }>({ page: 1 });
  const newestLocalId = localPosts[0]?.id;
  const posts = [...localPosts, ...(resource.status === 'success' ? resource.data : [])];

  const pageCount = Math.ceil(posts.length / POSTS_PER_PAGE);
  const page = pagination.newestLocalId === newestLocalId
    ? Math.min(pagination.page, Math.max(1, pageCount))
    : 1;
  const start = (page - 1) * POSTS_PER_PAGE;
  const visiblePosts = posts.slice(start, start + POSTS_PER_PAGE);

  function goToPage(nextPage: number) {
    setPagination({ page: nextPage, newestLocalId });
  }

  return (
    <section className="panel posts" aria-labelledby="posts-title">
      <h2 id="posts-title">Publicaciones de {user.name}</h2>
      <Pagination page={page} pageCount={pageCount} onPageChange={goToPage} />
      <PostForm onPublish={(fields) => onPublish({ ...fields, userId: user.id })} />
      {resource.status === 'loading' && <p role="status">Cargando publicaciones…</p>}
      {resource.status === 'error' && (
        <LoadError message="No se pudieron cargar las publicaciones." onRetry={retry} />
      )}
      {posts.length > 0 && (
        <ul className="post-list" aria-label="Publicaciones">
          {visiblePosts.map((post) => (
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
