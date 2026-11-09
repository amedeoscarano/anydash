'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getJSON, LoadError, usePageTitle } from '@/components/ui';
import { useToast } from '@/components/toast';

const figures = [
  { key: 'open', label: 'Open orders', href: '/orders?status=pending' },
  { key: 'shipped', label: 'Shipped, in transit', href: '/orders?status=shipped' },
];

export default function HomePage() {
  usePageTitle('Home');
  const { announce } = useToast();
  const [stats, setStats] = useState({ open: 0, shipped: 0 });
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setFailed(false);
    getJSON('/api/stats').then((d) => { setStats(d); announce('Figures loaded'); }).catch(() => setFailed(true));
  }, [announce, attempt]);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-xl font-semibold">Home</h1>
      {failed ? <div className="mt-6"><LoadError what="Order figures" onRetry={() => setAttempt((n) => n + 1)} /></div> : (
      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {figures.map((f) => (
          <li key={f.key} className="rounded-lg border border-border bg-surface p-4">
            <Link href={f.href} className="block">
              <span className="text-sm text-muted">{f.label}</span>
              <span className="mt-1 block text-xl font-semibold">{stats[f.key]}</span>
            </Link>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}
