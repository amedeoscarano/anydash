'use client';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from '@/components/icons';
import { StatusBadge, Loading, LoadError, money, shortDate, usePageTitle } from '@/components/ui';
import { useToast } from '@/components/toast';

function Card({ title, children }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ label, children }) {
  return (
    <div className="py-2">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

export default function OrderPage() {
  const { id } = useParams();
  const { announce } = useToast();
  const [order, setOrder] = useState(null);
  const [missing, setMissing] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  usePageTitle(order ? `Order ${order.number}` : 'Order');

  useEffect(() => {
    setOrder(null);
    setFailed(false);
    fetch(`/api/orders/${id}`).then(async (r) => {
      if (r.status === 404) return setMissing(true);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setOrder(d);
      announce(`Order ${d.number} loaded`);
    }).catch(() => setFailed(true));
  }, [id, announce, attempt]);

  if (missing) notFound();

  const stepper = 'flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-neutral-tint aria-disabled:pointer-events-none aria-disabled:opacity-50';

  return (
    <div className="mx-auto max-w-6xl">
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href="/orders" className="text-muted hover:underline">Orders</Link>
        <span className="px-2 text-muted" aria-hidden="true">/</span>
        <span aria-current="page">{order ? `Order ${order.number}` : '…'}</span>
      </nav>

      {failed ? (
        <div className="mt-6"><LoadError what="This order" onRetry={() => setAttempt((n) => n + 1)} /></div>
      ) : !order ? (
        <div className="mt-6"><Loading label="Loading order" /></div>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-4">
            <h1 className="text-xl font-semibold">Order {order.number}</h1>
            <StatusBadge status={order.status} />
            <div className="ml-auto flex gap-2">
              <Link href={order.previousId ? `/orders/${order.previousId}` : '#'} aria-disabled={!order.previousId} aria-label="Previous order" className={stepper}><ChevronLeft /></Link>
              <Link href={order.nextId ? `/orders/${order.nextId}` : '#'} aria-disabled={!order.nextId} aria-label="Next order" className={stepper}><ChevronRight /></Link>
            </div>
          </div>
          <p className="mt-1 text-sm text-muted">
            Placed {shortDate(order.date)} · {money(order.total)}
            {order.carrierReference && <> · Carrier reference <span className="font-mono text-fg">{order.carrierReference}</span></>}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-4 md:col-span-2">
              <Card title="Items">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted">
                    <tr><th scope="col" className="pb-2 font-medium">Product</th><th scope="col" className="pb-2 font-medium">SKU</th><th scope="col" className="pb-2 text-right font-medium">Quantity</th><th scope="col" className="pb-2 text-right font-medium">Price</th></tr>
                  </thead>
                  <tbody>
                    {order.items.map((it) => (
                      <tr key={it.sku} className="border-t border-border">
                        <td className="py-2">{it.name}</td><td className="py-2">{it.sku}</td>
                        <td className="py-2 text-right tabular-nums">{it.qty}</td><td className="py-2 text-right tabular-nums">{money(it.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
              <Card title="History">
                <ol className="flex flex-col gap-4">
                  {[...order.history].reverse().map((h) => (
                    <li key={h.at} className="text-sm">
                      <p>{h.text}</p>
                      <p className="text-muted">{h.by} · {shortDate(h.at)}</p>
                    </li>
                  ))}
                </ol>
              </Card>
            </div>
            <div className="flex flex-col gap-4">
              <Card title="Customer">
                <dl>
                  <Row label="Name">{order.customer}</Row>
                  <Row label="Email">{order.email}</Row>
                </dl>
              </Card>
              <Card title="Shipment">
                <dl>
                  <Row label="Order ID">{order.id}</Row>
                  <Row label="Label">{order.carrierReference ? 'Printed' : 'Not printed yet'}</Row>
                </dl>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
