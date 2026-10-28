import { db, delay } from '@/lib/data';

export async function GET() {
  await delay(300);
  return Response.json({ ...db.settings, drafts: db.drafts });
}

export async function PUT(request) {
  const body = await request.json();
  if (body.general) {
    if (!String(body.general.storeName || '').trim()) return Response.json({ error: 'Store name is required' }, { status: 422 });
    db.settings.general = { ...db.settings.general, ...body.general };
  }
  if (body.branding) db.settings.branding = { ...db.settings.branding, ...body.branding };
  if (body.deleteDrafts) db.drafts = 0;
  return Response.json({ ...db.settings, drafts: db.drafts });
}
