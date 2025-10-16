import { NextRequest } from 'next/server';
import { authInstance, getSessionToken, getDecryptedAccessToken } from '@/lib/auth';
import { prisma } from '@/server/prisma';
import { SyncService } from '@/application/sync/sync-service';
import { TwitterClient } from '@/infrastructure/twitter/client';
import { withSyncLock } from '@/server/sync-lock';
import { logger } from '@/server/logger';
import { isAuthDisabled } from '@/server/auth-config';

export async function POST(request: NextRequest) {
  const cronSecret = request.headers.get('x-cron-secret');
  const isCron = Boolean(cronSecret && cronSecret === process.env.CRON_SECRET);

  const session = await authInstance();
  const token = await getSessionToken(request);

  if (!session && !isCron && !isAuthDisabled()) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session?.user?.id ?? request.nextUrl.searchParams.get('userId') ?? process.env.DEV_USER_ID;
  if (!userId) {
    return new Response('Missing userId', { status: 400 });
  }

  const accessToken = isCron
    ? process.env.CRON_ACCESS_TOKEN
    : getDecryptedAccessToken((token?.accessToken as string | undefined) ?? null);

  if (!accessToken && !isAuthDisabled()) {
    return new Response('Missing access token', { status: 401 });
  }

  const twitter = new TwitterClient({ accessToken: accessToken ?? '' });
  const service = new SyncService(prisma, twitter);

  try {
    const result = await withSyncLock(() => service.syncLikes({ userId }));
    logger.info({ result }, 'Sync completed');
    return Response.json({ status: 'ok', ...result });
  } catch (error) {
    if ((error as Error).message === 'Sync already running') {
      return new Response('Sync already running', { status: 429 });
    }
    logger.error({ error }, 'Sync failed');
    return new Response('Sync failed', { status: 500 });
  }
}
