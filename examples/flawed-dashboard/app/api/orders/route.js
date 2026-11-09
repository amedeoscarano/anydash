import { db, delay } from '@/lib/data';

export async function GET(request) {
  const p = new URL(request.url).searchParams;
  const q = (p.get('q') || '').trim().toLowerCase();
  const status = p.get('status') || 'all';
  const sort = p.get('sort') === 'asc' ? 'asc' : 'desc';
  const size = [25, 50].includes(Number(p.get('size'))) ? Number(p.get('size')) : 25;
  const page = Math.max(1, Number(p.get('page')) || 1);
  await delay(400);
  const matchesQuery = db.orders.filter((o) => !q || String(o.id).includes(q.replace('#', '')) || o.customer.toLowerCase().includes(q));
  const counts = { all: matchesQuery.length };
  for (const s of ['pending', 'shipped', 'delivered', 'canceled']) counts[s] = matchesQuery.filter((o) => o.status === s).length;
  const rows = matchesQuery
    .filter((o) => status === 'all' || o.status === status)
    .sort((a, b) => (sort === 'asc' ? 1 : -1) * a.date.localeCompare(b.date));
  return Response.json({
    total: rows.length,
    page,
    size,
    counts,
    orders: rows.slice((page - 1) * size, page * size).map(({ items, history, ...o }) => o),
  });
}
