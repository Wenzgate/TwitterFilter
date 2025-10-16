'use client';

import { clsx } from 'clsx';
import { useRouter, useSearchParams } from 'next/navigation';

export function Pagination({ total, pageSize }: { total: number; pageSize: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const page = Number(params.get('page') ?? '1');
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) {
    return null;
  }

  const goTo = (next: number) => {
    const search = new URLSearchParams(params.toString());
    search.set('page', String(next));
    router.push(`/dashboard?${search.toString()}`);
  };

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 10);

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-neutral-300">
      <button
        className="rounded border border-neutral-700 px-3 py-1 hover:border-brand disabled:cursor-not-allowed disabled:opacity-50"
        disabled={page === 1}
        onClick={() => goTo(Math.max(1, page - 1))}
      >
        Précédent
      </button>
      {pages.map((number) => (
        <button
          key={number}
          onClick={() => goTo(number)}
          className={clsx(
            'rounded px-3 py-1 transition',
            page === number
              ? 'bg-brand text-brand-foreground'
              : 'border border-neutral-700 hover:border-brand'
          )}
        >
          {number}
        </button>
      ))}
      <button
        className="rounded border border-neutral-700 px-3 py-1 hover:border-brand disabled:cursor-not-allowed disabled:opacity-50"
        disabled={page === totalPages}
        onClick={() => goTo(Math.min(totalPages, page + 1))}
      >
        Suivant
      </button>
    </div>
  );
}
