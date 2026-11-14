import { useState } from 'react';
import type { User } from './api';
import { PostsPanel } from './PostsPanel';
import { UserDirectory } from './UserDirectory';

export default function App() {
  const [selectedUser, setSelectedUser] = useState<User>();

  return (
    <main className="shell">
      <header className="page-header">
        <h1>Directorio de usuarios</h1>
        <p>Busca un usuario para explorar sus publicaciones.</p>
      </header>
      <div className="layout">
        <UserDirectory selectedId={selectedUser?.id} onSelect={setSelectedUser} />
        {selectedUser ? <PostsPanel key={selectedUser.id} user={selectedUser} /> : (
          <section className="panel empty">
            <h2>Publicaciones</h2>
            <p>Selecciona un usuario para ver sus publicaciones.</p>
          </section>
        )}
      </div>
    </main>
  );
}
