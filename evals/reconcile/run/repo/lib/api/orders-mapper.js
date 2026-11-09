// Maps their order shape (OpenAPI 0.3.0) to ours (lib/models/order.js) and back.
import { ORDER_STATUSES } from '../models/order.js';

/** Their statuses; our select must only offer these. */
export const THEIR_STATUSES = ['pending', 'shipped', 'delivered', 'canceled', 'returned'];
const WRITABLE = ['status', 'note'];

/**
 * @typedef {{ id: number, number: string, customer?: string, email?: string, date?: string,
 *   status: string, total: number, note?: string, updatedAt?: string }} TheirOrder
 * @param {TheirOrder} t
 */
export function toOurs(t) {
  return {
    id: t.id,
    orderNumber: t.number,
    customerName: t.customer ?? '',
    customerEmail: t.email ?? '',
    placedAt: t.date ? new Date(t.date) : null,
    status: t.status, // unknown values kept as is, never coerced
    statusKnown: ORDER_STATUSES.includes(t.status),
    totalAmount: t.total / 100,
    note: t.note ?? '',
    version: t.updatedAt ?? null,
  };
}

/** Returns only changed writable fields. Throws on a status their API rejects. */
export function toTheirs(ours, original) {
  const out = {};
  for (const k of WRITABLE) if (ours[k] !== original[k]) out[k] = ours[k];
  if ('status' in out && !THEIR_STATUSES.includes(out.status)) throw new Error(`status "${out.status}" is not accepted by the API`);
  return out;
}
