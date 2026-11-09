import { db } from '@/lib/data';

export function GET() {
  const lines = ['order,customer,date,status,total'];
  for (const o of db.orders) lines.push([o.number, o.customer, o.date, o.status, (o.total / 100).toFixed(2)].join(','));
  return new Response(lines.join('\n') + '\n', {
    headers: { 'content-type': 'text/csv', 'content-disposition': 'attachment; filename="orders.csv"' },
  });
}
