const API_URL = 'https://jsonplaceholder.typicode.com';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export type NewPost = Omit<Post, 'id'>;

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export function getUsers(signal: AbortSignal) {
  return request<User[]>('/users', { signal });
}

export function getPosts(userId: number, signal: AbortSignal) {
  return request<Post[]>(`/users/${userId}/posts`, { signal });
}

export function createPost(post: NewPost) {
  return request<Post>('/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  });
}
