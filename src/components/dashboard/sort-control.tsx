'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const options = [
  { value: 'date_desc', label: 'Plus récents' },
  { value: 'date_asc', label: 'Plus anciens' },
  { value: 'likes_desc', label: 'Plus likés' },
  { value: 'likes_asc', label: 'Moins likés' },
  { value: 'retweets_desc', label: 'Plus RT' },
  { value: 'retweets_asc', label: 'Moins RT' }
];

export function SortControl() {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <select
      className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
      value={params.get('sort') ?? 'date_desc'}
      onChange={(event) => {
        const search = new URLSearchParams(params.toString());
        search.set('sort', event.target.value);
        router.push(`/dashboard?${search.toString()}`);
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
