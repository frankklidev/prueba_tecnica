import type { DirectoryGateway, Post, User } from '../directory';

const API_URL = 'https://jsonplaceholder.typicode.com';

async function request(path: string, options: RequestInit) {
  const response = await fetch(`${API_URL}${path}`, options);
  if (!response.ok) throw new Error(`JSONPlaceholder respondió con HTTP ${response.status}`);
  return response;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isUser(value: unknown): value is User {
  return isRecord(value) && typeof value.id === 'number' &&
    typeof value.name === 'string' && typeof value.email === 'string';
}

function isPost(value: unknown): value is Post {
  return isRecord(value) && typeof value.id === 'number' &&
    typeof value.userId === 'number' && typeof value.title === 'string' &&
    typeof value.body === 'string';
}

async function readCollection<T>(
  path: string,
  signal: AbortSignal,
  isItem: (value: unknown) => value is T,
): Promise<T[]> {
  const response = await request(path, { signal });
  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.every(isItem)) {
    throw new Error(`Respuesta inesperada de JSONPlaceholder para ${path}`);
  }
  return data;
}

export const jsonPlaceholder: DirectoryGateway = {
  getUsers: (signal) => readCollection('/users', signal, isUser),

  getPosts: (userId, signal) => readCollection(
    `/users/${userId}/posts`,
    signal,
    (value): value is Post => isPost(value) && value.userId === userId,
  ),

  async createPost(post) {
    await request('/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
  },
};
