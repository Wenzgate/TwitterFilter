'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const runSync = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sync', {
        method: 'POST'
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }
      router.refresh();
    } catch (error) {
      console.error('Sync failed', error);
      alert('La synchronisation a échoué. Consultez les logs pour plus de détails.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={runSync}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-md border border-brand/60 bg-brand/20 px-3 py-2 text-sm font-medium text-brand-foreground transition hover:bg-brand/30 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? 'Synchronisation…' : 'Synchroniser maintenant'}
    </button>
  );
}
