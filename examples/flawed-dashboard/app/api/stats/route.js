import { db, delay } from '@/lib/data';

export async function GET() {
  await delay(900);
  const by = (s) => db.orders.filter((o) => o.status === s).length;
  return Response.json({ open: by('pending'), shipped: by('shipped') });
}
