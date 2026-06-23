import { Hono } from 'hono';
import type { OnAppInstallRequest, TriggerResponse } from '@devvit/web/shared';
import { context } from '@devvit/web/server';
import { createPost } from '../core/post';

export const triggers = new Hono();

triggers.post('/on-app-install', async (c) => {
  try {
    const post = await createPost();
    const input = await c.req.json<OnAppInstallRequest>();

    return c.json<TriggerResponse>(
      {
        status: 'success',
        message: `Bubble Burst installed in r/${context.subredditName}. Post id: ${post.id} (${input.type})`,
      },
      200
    );
  } catch (error) {
    console.error('onAppInstall failed:', error);
    return c.json<TriggerResponse>(
      { status: 'error', message: 'Failed to create install post' },
      400
    );
  }
});
