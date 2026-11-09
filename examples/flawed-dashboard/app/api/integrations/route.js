import { db, delay } from '@/lib/data';

export async function GET() {
  await delay(300);
  return Response.json(db.integrations);
}
