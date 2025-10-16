import { authInstance } from '@/lib/auth';
import { prisma } from '@/server/prisma';
import { StatsService } from '@/application/stats-service';
import { isAuthDisabled } from '@/server/auth-config';

export async function GET() {
  const session = await authInstance();
  if (!session && !isAuthDisabled()) {
    return new Response('Unauthorized', { status: 401 });
  }

  const service = new StatsService(prisma);
  const stats = await service.getStats();

  return Response.json(stats, { headers: { 'cache-control': 'private, max-age=180' } });
}
