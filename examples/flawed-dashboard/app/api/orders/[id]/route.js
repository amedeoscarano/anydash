import { db, carrierReference, delay } from '@/lib/data';

export async function GET(_request, { params }) {
  const { id } = await params;
  await delay(300);
  const sorted = [...db.orders].sort((a, b) => b.date.localeCompare(a.date));
  const i = sorted.findIndex((o) => String(o.id) === id);
  if (i === -1) return Response.json({ error: 'Order not found' }, { status: 404 });
  const order = sorted[i];
  return Response.json({
    ...order,
    carrierReference: order.status === 'pending' || order.status === 'canceled' ? null : carrierReference(order),
    previousId: sorted[i - 1]?.id ?? null,
    nextId: sorted[i + 1]?.id ?? null,
  });
}
