'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { buttonClass, Button, StatusBadge, Loading, LoadError, getJSON, money, shortDate, usePageTitle } from '@/components/ui';
import { useToast } from '@/components/toast';

const segments = [
  ['all', 'All'],
  ['pending', 'Pending'],
  ['shipped', 'Shipped'],
  ['delivered', 'Delivered'],
  ['canceled', 'Canceled'],
];

function OrdersList() {
  usePageTitle('Orders');
  const router = useRouter();
  const params = useSearchParams();
  const { announce } = useToast();
  const status = params.get('status') || 'all';
  const q = params.get('q') || '';
  const sort = params.get('sort') === 'asc' ? 'asc' : 'desc';
  const size = Number(params.get('size')) || 25;
  const page = Number(params.get('page')) || 1;
  const [query, setQuery] = useState(q);
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const setParam = (changes) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) (v ? p.set(k, v) : p.delete(k));
    router.replace(`/orders${p.size ? `?${p}` : ''}`);
  };

  useEffect(() => {
    const t = setTimeout(() => { if (query !== q) setParam({ q: query, page: '' }); }, 300);
    return () => clearTimeout(t);
  });

  useEffect(() => {
    let live = true;
    setData(null);
    setFailed(false);
    getJSON(`/api/orders?${new URLSearchParams({ status, q, sort, size, page })}`)
      .then((d) => { if (live) { setData(d); announce(`${d.total} orders`); } })
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [status, q, sort, size, page, announce, attempt]);

  const from = data ? (data.page - 1) * data.size + 1 : 0;
  const to = data ? Math.min(data.page * data.size, data.total) : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Orders</h1>
        <a href="/api/orders/export" className={buttonClass('secondary')}>Export</a>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-center">
        <div role="tablist" aria-label="Order status" className="flex flex-wrap gap-1">
          {segments.map(([value, label]) => (
            <button
              key={value}
              role="tab"
              type="button"
              aria-selected={status === value}
              onClick={() => setParam({ status: value === 'all' ? '' : value, page: '' })}
              className={`h-8 rounded-md px-3 text-sm ${status === value ? 'bg-neutral-tint font-semibold' : 'hover:bg-neutral-tint'}`}
            >
              {label} <span className="text-muted">{data ? data.counts[value] : '…'}</span>
            </button>
          ))}
        </div>
        <input
          type="search"
          aria-label="Search orders"
          placeholder="Search by order number or customer"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-8 w-full rounded-md border border-border bg-surface px-2 text-sm lg:ml-auto lg:w-72"
        />
      </div>

      {failed ? (
        <div className="py-8"><LoadError what="Orders" onRetry={() => setAttempt((n) => n + 1)} /></div>
      ) : !data ? (
        <div className="py-8"><Loading label="Loading orders" /></div>
      ) : data.total === 0 ? (
        <div className="py-16 text-center">
          <h2 className="text-base font-semibold">No orders yet</h2>
          <p className="mt-1 text-sm text-muted">Orders appear here when customers check out in Acme Store. Turn on storefront sync to import them.</p>
          <Link href="/settings/integrations" className={`${buttonClass('primary')} mt-4`}>Set up storefront sync</Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-muted">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-medium">Order</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Customer</th>
                  <th scope="col" className="py-2 pr-4 font-medium" aria-sort={sort === 'asc' ? 'ascending' : 'descending'}>
                    <button type="button" className="font-medium" onClick={() => setParam({ sort: sort === 'asc' ? '' : 'asc' })}>
                      Date {sort === 'asc' ? '↑' : '↓'}
                    </button>
                  </th>
                  <th scope="col" className="py-2 pr-4 font-medium">Status</th>
                  <th scope="col" className="py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o.id} className="border-b border-border hover:bg-neutral-tint">
                    <td className="py-2 pr-4"><Link href={`/orders/${o.id}`} className="font-medium text-accent hover:underline">{o.number}</Link></td>
                    <td className="py-2 pr-4">{o.customer}</td>
                    <td className="py-2 pr-4">{shortDate(o.date)}</td>
                    <td className="py-2 pr-4"><StatusBadge status={o.status} /></td>
                    <td className="py-2 text-right tabular-nums">{money(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <span>{from}–{to} of {data.total}</span>
            <label className="flex items-center gap-2">
              Rows per page
              <select value={size} onChange={(e) => setParam({ size: e.target.value === '25' ? '' : e.target.value, page: '' })} className="h-8 rounded-md border border-border bg-surface px-2">
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </label>
            <div className="ml-auto flex gap-2">
              <Button disabled={page <= 1} onClick={() => setParam({ page: page - 1 > 1 ? String(page - 1) : '' })}>Previous</Button>
              <Button disabled={to >= data.total} onClick={() => setParam({ page: String(page + 1) })}>Next</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<Loading label="Loading orders" />}>
      <OrdersList />
    </Suspense>
  );
}
