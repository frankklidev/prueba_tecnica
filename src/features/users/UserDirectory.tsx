import { useState } from 'react';
import type { DirectoryGateway, User } from '../../directory';
import { LoadError } from '../../shared/LoadError';
import { useResource } from '../../shared/useResource';

interface UserDirectoryProps {
  loadUsers: DirectoryGateway['getUsers'];
  selectedId?: number;
  onSelect: (user: User) => void;
}

function normalizeName(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

export function UserDirectory({ loadUsers, selectedId, onSelect }: UserDirectoryProps) {
  const { resource, retry } = useResource(loadUsers);
  const [query, setQuery] = useState('');
  const users = resource.status === 'success' ? resource.data : [];
  const normalizedQuery = normalizeName(query);
  const matches = users.filter(({ name }) => normalizeName(name).includes(normalizedQuery));

  return (
    <section className="directory panel" aria-labelledby="directory-title">
      <h2 id="directory-title">Usuarios</h2>
      <label htmlFor="search">Buscar por nombre</label>
      <input
        id="search"
        type="search"
        placeholder="Ej. Leanne"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {resource.status === 'loading' && <p role="status">Cargando usuarios…</p>}
      {resource.status === 'error' && (
        <LoadError message="No se pudieron cargar los usuarios." onRetry={retry} />
      )}
      {resource.status === 'success' && (
        <>
          <p role="status" className="muted">
            {matches.length === 0 ? 'No hay usuarios que coincidan.' : `${matches.length} de ${users.length} usuarios`}
          </p>
          {matches.length > 0 && (
            <ul className="users">
              {matches.map((user) => (
                <li key={user.id}>
                  <button type="button" aria-pressed={selectedId === user.id} onClick={() => onSelect(user)}>
                    <span className="avatar" aria-hidden="true">
                      {user.name.split(' ').slice(0, 2).map((part) => part[0]).join('')}
                    </span>
                    <span className="user-text"><strong>{user.name}</strong><small>{user.email}</small></span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
