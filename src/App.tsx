import { useRef, useState } from 'react';
import type { DirectoryGateway, NewPost, Post, User } from './directory';
import { PostsPanel } from './PostsPanel';
import { UserDirectory } from './UserDirectory';

export default function App({ gateway }: { gateway: DirectoryGateway }) {
  const [selectedUser, setSelectedUser] = useState<User>();

  const nextLocalId = useRef(-1);
  const [localPosts, setLocalPosts] = useState<Post[]>([]);

  async function publish(post: NewPost) {
    await gateway.createPost(post);
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
        <UserDirectory loadUsers={gateway.getUsers} selectedId={selectedUser?.id} onSelect={setSelectedUser} />
        {selectedUser ? (
          <PostsPanel
            key={selectedUser.id}
            user={selectedUser}
            loadPosts={gateway.getPosts}
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
