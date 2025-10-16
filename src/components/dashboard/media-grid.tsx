'use client';

import { TweetCard, type SerializableTweet } from './tweet-card';

export function MediaGrid({ tweets }: { tweets: SerializableTweet[] }) {
  if (!tweets.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 p-12 text-center text-sm text-neutral-400">
        <p>Aucun like contenant un média pour le moment.</p>
        <p className="mt-2 text-xs">Lancez une synchronisation ou ajustez vos filtres.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}
    </div>
  );
}
