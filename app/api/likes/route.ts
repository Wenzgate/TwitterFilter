import { NextRequest } from 'next/server';
import { likesQuerySchema, LikesService } from '@/application/likes-service';
import { prisma } from '@/server/prisma';
import { authInstance } from '@/lib/auth';
import { isAuthDisabled } from '@/server/auth-config';

export async function GET(request: NextRequest) {
  const session = await authInstance();
  if (!session && !isAuthDisabled()) {
    return new Response('Unauthorized', { status: 401 });
  }

  const parsed = likesQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) {
    return new Response(JSON.stringify({ errors: parsed.error.flatten() }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  const service = new LikesService(prisma);
  const result = await service.list(parsed.data);

  return Response.json(result, { headers: { 'cache-control': 'private, max-age=60' } });
}
