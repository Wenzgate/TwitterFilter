import { redirect } from 'next/navigation';
import { authInstance } from '@/lib/auth';
import { likesQuerySchema, LikesService } from '@/application/likes-service';
import { prisma } from '@/server/prisma';
import { FiltersBar } from '@/components/dashboard/filter-bar';
import { SortControl } from '@/components/dashboard/sort-control';
import { MediaGrid } from '@/components/dashboard/media-grid';
import { Pagination } from '@/components/dashboard/pagination';
import { SyncButton } from '@/components/dashboard/sync-button';
import type { SerializableTweet } from '@/components/dashboard/tweet-card';
import { isAuthDisabled } from '@/server/auth-config';

type SearchParams = Record<string, string | string[] | undefined>;

function extract(param: string | string[] | undefined) {
  if (Array.isArray(param)) {
    return param[0];
  }
  return param;
}

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await authInstance();
  if (!session && !isAuthDisabled()) {
    redirect('/api/auth/signin?callbackUrl=%2Fdashboard');
  }

  const parsed = likesQuerySchema.parse({
    sort: extract(searchParams.sort),
    type: extract(searchParams.type),
    q: extract(searchParams.q),
    author: extract(searchParams.author),
    from: extract(searchParams.from),
    to: extract(searchParams.to),
    page: extract(searchParams.page),
    pageSize: extract(searchParams.pageSize)
  });

  const service = new LikesService(prisma);
  const data = await service.list(parsed);
  const serialized: SerializableTweet[] = data.items.map((tweet) => ({
    ...tweet,
    createdAt: tweet.createdAt.toISOString()
  }));

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-100">Vos likes avec médias</h1>
          <p className="text-sm text-neutral-400">Filtrez vos likes par auteur, média, mots-clés ou période.</p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <SortControl />
          <SyncButton />
        </div>
      </div>
      <FiltersBar />
      <MediaGrid tweets={serialized} />
      <Pagination total={data.total} pageSize={data.pageSize} />
    </section>
  );
}
