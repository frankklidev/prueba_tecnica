import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import App from './App';
import { jsonPlaceholder } from './infrastructure/jsonPlaceholder';

const users = [
  { id: 1, name: 'Leanne Graham', email: 'leanne@example.com' },
  { id: 2, name: 'Ervin Howell', email: 'ervin@example.com' },
];
const fetchMock = vi.fn<typeof fetch>();

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status });
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockImplementation(async (input, options) => {
    const { pathname } = new URL(String(input));
    if (pathname === '/users') return json(users);
    if (pathname === '/users/1/posts') {
      return json([{ id: 1, userId: 1, title: 'Publicación original', body: 'Texto original' }]);
    }
    if (pathname === '/users/2/posts') return json([]);
    if (pathname === '/posts' && options?.method === 'POST') return json({ id: 101 }, 201);
    throw new Error(`Ruta inesperada: ${pathname}`);
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function selectUser(name = /leanne graham/i) {
  const user = userEvent.setup();
  await user.click(await screen.findByRole('button', { name }));
  return user;
}

test('muestra la carga y filtra usuarios por nombre sin distinguir acentos ni mayúsculas', async () => {
  render(<App gateway={jsonPlaceholder} />);
  expect(screen.getByRole('status')).toHaveTextContent('Cargando usuarios');
  await screen.findByRole('button', { name: /ervin/i });
  const user = userEvent.setup();
  await user.type(screen.getByRole('searchbox', { name: 'Buscar por nombre' }), ' LÉANNE ');
  expect(screen.getByRole('button', { name: /leanne/i })).toBeVisible();
  expect(screen.queryByRole('button', { name: /ervin/i })).not.toBeInTheDocument();
});

test('carga las publicaciones del usuario elegido', async () => {
  render(<App gateway={jsonPlaceholder} />);
  await selectUser();
  expect(await screen.findByRole('heading', { name: 'Publicación original' })).toBeVisible();
  expect(fetchMock).toHaveBeenCalledWith(
    'https://jsonplaceholder.typicode.com/users/1/posts',
    expect.objectContaining({ signal: expect.any(AbortSignal) }),
  );
});

test('rechaza espacios en blanco y enfoca el primer campo inválido', async () => {
  render(<App gateway={jsonPlaceholder} />);
  const user = await selectUser();
  const title = screen.getByRole('textbox', { name: 'Título' });
  await user.type(title, '   ');
  await user.click(screen.getByRole('button', { name: 'Publicar' }));
  expect(title).toHaveFocus();
  expect(title).toHaveAccessibleDescription('Escribe un título.');
  expect(screen.getByRole('textbox', { name: 'Texto' })).toHaveAccessibleDescription(
    'Escribe el texto de la publicación.',
  );
  expect(fetchMock.mock.calls.some(([, options]) => options?.method === 'POST')).toBe(false);
});

test('publica, actualiza la lista y mantiene la nueva entrada al volver al usuario', async () => {
  render(<App gateway={jsonPlaceholder} />);
  const user = await selectUser();
  await user.type(screen.getByRole('textbox', { name: 'Título' }), ' Mi publicación ');
  await user.type(screen.getByRole('textbox', { name: 'Texto' }), ' Hola desde React ');
  await user.click(screen.getByRole('button', { name: 'Publicar' }));
  expect(await screen.findByRole('heading', { name: 'Mi publicación' })).toBeVisible();
  expect(fetchMock).toHaveBeenCalledWith(
    'https://jsonplaceholder.typicode.com/posts',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ title: 'Mi publicación', body: 'Hola desde React', userId: 1 }),
    }),
  );
  await user.click(screen.getByRole('button', { name: /ervin/i }));
  expect(await screen.findByText('Este usuario todavía no tiene publicaciones.')).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Mi publicación' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /leanne/i }));
  expect(screen.getByRole('heading', { name: 'Mi publicación' })).toBeVisible();
});

test('informa un error HTTP al cargar usuarios y permite reintentar', async () => {
  fetchMock.mockResolvedValueOnce(json({}, 503));
  render(<App gateway={jsonPlaceholder} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar los usuarios.');
  await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByRole('button', { name: /leanne/i })).toBeVisible();
});

test('conserva el contenido del formulario si falla el envío', async () => {
  render(<App gateway={jsonPlaceholder} />);
  const user = await selectUser();
  await screen.findByRole('heading', { name: 'Publicación original' });
  fetchMock.mockResolvedValueOnce(json({}, 500));
  const title = screen.getByRole('textbox', { name: 'Título' });
  await user.type(title, 'Borrador');
  await user.type(screen.getByRole('textbox', { name: 'Texto' }), 'Texto pendiente');
  await user.click(screen.getByRole('button', { name: 'Publicar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo publicar.');
  expect(title).toHaveValue('Borrador');
  expect(screen.queryByRole('heading', { name: 'Borrador' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Publicar' }));
  await waitFor(() => expect(title).toHaveValue(''));
  expect(screen.getByRole('heading', { name: 'Borrador' })).toBeVisible();
});

test('pagina las publicaciones y vuelve a la primera página al publicar', async () => {
  const defaultFetch = fetchMock.getMockImplementation()!;
  fetchMock.mockImplementation((input, options) => {
    if (String(input).endsWith('/users/1/posts')) {
      return Promise.resolve(json(Array.from({ length: 6 }, (_, index) => ({
        id: index + 1,
        userId: 1,
        title: `Entrada ${index + 1}`,
        body: 'Texto de la entrada',
      }))));
    }
    return defaultFetch(input, options);
  });

  render(<App gateway={jsonPlaceholder} />);
  const user = await selectUser();
  await screen.findByRole('heading', { name: 'Entrada 1' });
  const previous = screen.getByRole('button', { name: 'Anterior' });
  const next = screen.getByRole('button', { name: 'Siguiente' });
  expect(previous).toBeDisabled();
  expect(screen.getAllByRole('article')).toHaveLength(5);

  await user.click(next);
  expect(screen.getByText('Página 2 de 2')).toBeVisible();
  expect(next).toBeDisabled();
  expect(screen.getAllByRole('article')).toHaveLength(1);
  expect(screen.getByRole('heading', { name: 'Entrada 6' })).toBeVisible();

  await user.click(previous);
  expect(screen.getByText('Página 1 de 2')).toBeVisible();
  await user.click(next);
  await user.type(screen.getByRole('textbox', { name: 'Título' }), 'Entrada nueva');
  await user.type(screen.getByRole('textbox', { name: 'Texto' }), 'Texto de prueba');
  await user.click(screen.getByRole('button', { name: 'Publicar' }));
  expect(await screen.findByRole('heading', { name: 'Entrada nueva' })).toBeVisible();
  expect(screen.getByText('Página 1 de 2')).toBeVisible();
  expect(screen.getAllByRole('article')).toHaveLength(5);
});
