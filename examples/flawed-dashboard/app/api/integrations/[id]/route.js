import { db, delay } from '@/lib/data';

// Test hook: `?fail=1` or the header `x-fail: 1` makes this request fail, so live checks can exercise error handling.
export async function PATCH(request, { params }) {
  const { id } = await params;
  await delay(300);
  if (new URL(request.url).searchParams.get('fail') === '1' || request.headers.get('x-fail') === '1')
    return Response.json({ error: 'Integration service unavailable' }, { status: 503 });
  const item = db.integrations.find((x) => x.id === id);
  if (!item) return Response.json({ error: 'Unknown integration' }, { status: 404 });
  item.enabled = Boolean((await request.json()).enabled);
  return Response.json(item);
}
