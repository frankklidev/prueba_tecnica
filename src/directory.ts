export interface User {
  id: number;
  name: string;
  email: string;
}

export interface PostDraft {
  title: string;
  body: string;
}

export interface NewPost extends PostDraft {
  userId: number;
}

export interface Post extends NewPost {
  id: number;
}

export interface DirectoryGateway {
  getUsers(signal: AbortSignal): Promise<User[]>;
  getPosts(userId: number, signal: AbortSignal): Promise<Post[]>;
  createPost(post: NewPost): Promise<void>;
}
