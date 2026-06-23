import { Hono } from 'hono';
import { context } from '@devvit/web/server';
import { createPost } from '../core/post';

export const menu = new Hono();

menu.post('/post-create', async (c) => {
  try {
    const post = await createPost();
    return c.json(
      {
        status: 'success',
        message: `Bubble Burst post created in r/${context.subredditName} (${post.id})`,
      },
      200
    );
  } catch (error) {
    console.error('Menu post-create failed:', error);
    return c.json({ status: 'error', message: 'Failed to create post' }, 400);
  }
});
