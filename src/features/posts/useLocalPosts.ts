import { useRef, useState } from 'react';
import type { DirectoryGateway, NewPost, Post } from '../../directory';

const EMPTY_POSTS: Post[] = [];

export function useLocalPosts(createPost: DirectoryGateway['createPost']) {
  const nextId = useRef(-1);
  const [postsByUser, setPostsByUser] = useState<Partial<Record<number, Post[]>>>({});

  async function publish(draft: NewPost) {
    await createPost(draft);

    // JSONPlaceholder can return the same ID for multiple successful POSTs.
    const post = { ...draft, id: nextId.current-- };
    setPostsByUser((previous) => ({
      ...previous,
      [post.userId]: [post, ...(previous[post.userId] ?? EMPTY_POSTS)],
    }));
  }

  function postsFor(userId: number) {
    return postsByUser[userId] ?? EMPTY_POSTS;
  }

  return { postsFor, publish };
}
