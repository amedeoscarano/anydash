import { db, delay } from '@/lib/data';

export async function GET() {
  await delay(300);
  return Response.json(db.notifications);
}

export async function PATCH(request) {
  const { id, email, sms } = await request.json();
  const n = db.notifications.find((x) => x.id === id);
  if (!n) return Response.json({ error: 'Unknown notification' }, { status: 404 });
  Object.assign(n, { email: Boolean(email), sms: Boolean(sms) });
  return Response.json(n);
}
