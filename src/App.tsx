import { useState } from 'react';
import type { DirectoryGateway, User } from './directory';
import { useLocalPosts } from './features/posts/useLocalPosts';
import { PostsPanel } from './features/posts/PostsPanel';
import { UserDirectory } from './features/users/UserDirectory';

export default function App({ gateway }: { gateway: DirectoryGateway }) {
  const [selectedUser, setSelectedUser] = useState<User>();

  const { postsFor, publish } = useLocalPosts(gateway.createPost);

  return (
    <main className="shell">
      <header className="page-header">
        <h1>Directorio de usuarios</h1>
        <p>Busca un usuario para explorar sus publicaciones.</p>
      </header>
      <div className="layout">
        <UserDirectory loadUsers={gateway.getUsers} selectedId={selectedUser?.id} onSelect={setSelectedUser} />
        {selectedUser ? (
          <PostsPanel
            key={selectedUser.id}
            user={selectedUser}
            loadPosts={gateway.getPosts}
            localPosts={postsFor(selectedUser.id)}
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
