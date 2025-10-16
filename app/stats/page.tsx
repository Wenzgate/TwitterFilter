import { redirect } from 'next/navigation';
import { authInstance } from '@/lib/auth';
import { StatsService } from '@/application/stats-service';
import { prisma } from '@/server/prisma';
import { LikesTimelineChart } from '@/components/stats/likes-timeline-chart';
import { TopAuthorsChart } from '@/components/stats/top-authors-chart';
import { TopHashtagsChart } from '@/components/stats/top-hashtags-chart';
import { isAuthDisabled } from '@/server/auth-config';

export default async function StatsPage() {
  const session = await authInstance();
  if (!session && !isAuthDisabled()) {
    redirect('/api/auth/signin?callbackUrl=%2Fstats');
  }

  const statsService = new StatsService(prisma);
  const stats = await statsService.getStats();

  return (
    <section className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-neutral-100">Statistiques</h1>
        <p className="text-sm text-neutral-400">
          Analysez vos likes contenant des médias : top auteurs, hashtags et progression des likes.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
          <h2 className="mb-4 text-lg font-medium text-neutral-200">Top 10 des auteurs (likes cumulés)</h2>
          <TopAuthorsChart data={stats.topAuthors} />
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
          <h2 className="mb-4 text-lg font-medium text-neutral-200">Top 20 hashtags</h2>
          <TopHashtagsChart data={stats.topHashtags} />
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
        <h2 className="mb-4 text-lg font-medium text-neutral-200">Timeline cumulée des likes</h2>
        <LikesTimelineChart data={stats.timeline} />
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 text-sm text-neutral-300">
        <h2 className="mb-2 text-lg font-medium text-neutral-200">Distribution des médias</h2>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.mediaDistribution.map((item) => (
            <li key={item.type} className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-4">
              <p className="text-xs uppercase text-neutral-500">{item.type}</p>
              <p className="text-2xl font-semibold text-neutral-100">{item.count}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
