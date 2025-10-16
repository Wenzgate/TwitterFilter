'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';

const mediaTypes = [
  { value: 'any', label: 'Tous' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Vidéos' },
  { value: 'gif', label: 'GIFs' }
] as const;

type Filters = {
  type: string;
  author: string;
  from: string;
  to: string;
  q: string;
};

export function FiltersBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [filters, setFilters] = useState<Filters>({
    type: params.get('type') ?? 'any',
    author: params.get('author') ?? '',
    from: params.get('from') ?? '',
    to: params.get('to') ?? '',
    q: params.get('q') ?? ''
  });

  useEffect(() => {
    setFilters({
      type: params.get('type') ?? 'any',
      author: params.get('author') ?? '',
      from: params.get('from') ?? '',
      to: params.get('to') ?? '',
      q: params.get('q') ?? ''
    });
  }, [params]);

  const updateUrl = (next: Partial<Filters>) => {
    const search = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (!value) {
        search.delete(key);
      } else {
        search.set(key, value);
      }
    });
    search.set('page', '1');
    router.push(`/dashboard?${search.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 shadow-lg md:flex-row md:items-end md:justify-between">
      <div className="flex flex-wrap gap-3">
        {mediaTypes.map((media) => (
          <button
            key={media.value}
            onClick={() => updateUrl({ type: media.value })}
            className={clsx(
              'rounded-full border px-3 py-1 text-sm transition',
              filters.type === media.value
                ? 'border-brand bg-brand/20 text-brand-foreground'
                : 'border-neutral-700 text-neutral-300 hover:border-brand/60'
            )}
          >
            {media.label}
          </button>
        ))}
      </div>
      <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
        <input
          className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
          placeholder="Recherche mots-clés, hashtags, @auteur"
          value={filters.q}
          onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
          onBlur={(event) => updateUrl({ q: event.target.value })}
        />
        <input
          type="text"
          className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 md:w-36"
          placeholder="@auteur"
          value={filters.author}
          onChange={(event) => setFilters((prev) => ({ ...prev, author: event.target.value }))}
          onBlur={(event) => updateUrl({ author: event.target.value })}
        />
        <div className="flex gap-2">
          <input
            type="date"
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
            value={filters.from}
            onChange={(event) => updateUrl({ from: event.target.value })}
          />
          <input
            type="date"
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
            value={filters.to}
            onChange={(event) => updateUrl({ to: event.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
