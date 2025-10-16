import { NextRequest } from 'next/server';
import { LikesService } from '@/application/likes-service';
import { prisma } from '@/server/prisma';
import { authInstance } from '@/lib/auth';
import { isAuthDisabled } from '@/server/auth-config';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await authInstance();
  if (!session && !isAuthDisabled()) {
    return new Response('Unauthorized', { status: 401 });
  }

  const service = new LikesService(prisma);
  const tweet = await service.get(params.id);

  if (!tweet) {
    return new Response('Not found', { status: 404 });
  }

  return Response.json({ ...tweet, createdAt: tweet.createdAt.toISOString() }, {
    headers: { 'cache-control': 'private, max-age=120' }
  });
}
