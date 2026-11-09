import { db } from '@/lib/data';

const appearances = ['system', 'light', 'dark'];

export async function GET() {
  return Response.json(db.user);
}

export async function PATCH(request) {
  const body = await request.json().catch(() => ({}));
  if (!appearances.includes(body.appearance)) return Response.json({ error: 'Appearance must be system, light or dark' }, { status: 422 });
  db.user = { ...db.user, appearance: body.appearance };
  return Response.json(db.user);
}
