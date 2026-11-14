import { useRef, useState } from 'react';
import { createPost, type NewPost, type Post, type User } from './api';
import { PostsPanel } from './PostsPanel';
import { UserDirectory } from './UserDirectory';

export default function App() {
  const [selectedUser, setSelectedUser] = useState<User>();

  const nextLocalId = useRef(-1);
  const [localPosts, setLocalPosts] = useState<Post[]>([]);

  async function publish(post: NewPost) {
    await createPost(post);
    // The API can return the same ID for every simulated creation.
    const localPost = { ...post, id: nextLocalId.current-- };
    setLocalPosts((previous) => [localPost, ...previous]);
  }

  return (
    <main className="shell">
      <header className="page-header">
        <h1>Directorio de usuarios</h1>
        <p>Busca un usuario para explorar sus publicaciones.</p>
      </header>
      <div className="layout">
        <UserDirectory selectedId={selectedUser?.id} onSelect={setSelectedUser} />
        {selectedUser ? (
          <PostsPanel
            key={selectedUser.id}
            user={selectedUser}
            localPosts={localPosts.filter((post) => post.userId === selectedUser.id)}
            onPublish={publish}
          />
        ) : (
          <section className="panel empty">
            <h2>Publicaciones</h2>
            <p>Selecciona un usuario para ver sus publicaciones.</p>
          </section>
        )}
      </div>
    </main>
  );
}
