'use client';
import Link from 'next/link';
import { buttonClass } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted">The page may have moved, or the order number is wrong.</p>
      <Link href="/orders" className={`${buttonClass('primary')} mt-4`}>Go to orders</Link>
    </div>
  );
}
