// In-memory fake data. Resets when the server restarts.
const customers = ['Test Customer A', 'Test Customer B', 'Test Customer C', 'Test Customer D'];
const statuses = ['pending', 'shipped', 'delivered', 'shipped', 'canceled', 'pending'];

function seed() {
  const orders = Array.from({ length: 12 }, (_, i) => {
    const id = 1001 + i;
    const customer = customers[i % customers.length];
    return {
      id,
      number: `#${id}`,
      customer,
      email: `customer-${String.fromCharCode(97 + (i % customers.length))}@example.com`,
      date: new Date(Date.UTC(2026, 9, 1 + i, 9 + (i % 8))).toISOString(),
      status: statuses[i % statuses.length],
      total: 2450 + i * 1375,
      items: [
        { sku: `TSHIRT-${(i % 3) + 1}`, name: 'Cotton T-shirt', qty: 1 + (i % 3), price: 1500 },
        { sku: 'MUG-01', name: 'Ceramic mug', qty: 1, price: 950 },
      ],
      history: [
        { at: new Date(Date.UTC(2026, 9, 1 + i, 9)).toISOString(), by: 'Acme Store', text: 'Order placed' },
        { at: new Date(Date.UTC(2026, 9, 1 + i, 11)).toISOString(), by: 'Test admin', text: 'Payment captured' },
      ],
    };
  });
  return {
    orders,
    drafts: 3,
    // Personal preferences of the signed-in demo user, not store settings.
    // shortcut: single demo user, key by session user id once there is auth.
    user: { name: 'Test admin', email: 'admin@example.com', appearance: 'system' },
    settings: {
      general: { storeName: 'Acme Store', timezone: 'Europe/Rome', packageWeight: '2 kg', requireSignature: false },
      branding: { color: '#2563eb', footer: 'Thanks for shopping at Acme Store.' },
    },
    notifications: [
      { id: 'shipped', name: 'Order shipped', description: 'Sent when a label is printed for an order.', email: true, sms: false },
      { id: 'exception', name: 'Delivery exception', description: 'Sent when the carrier reports a problem with a delivery.', email: true, sms: true },
      { id: 'summary', name: 'Daily summary', description: 'One email each morning with yesterday’s orders.', email: false, sms: false },
    ],
    integrations: [
      { id: 'storefront', name: 'Storefront sync', description: 'Imports new orders from the Acme Store storefront every 5 minutes.', enabled: true },
      { id: 'labels', name: 'Label printer', description: 'Sends shipping labels to the warehouse printer when you print them.', enabled: false },
      { id: 'rates', name: 'Carrier rates', description: 'Shows live carrier rates at checkout.', enabled: true },
    ],
  };
}

export const db = (globalThis.__flawedDashboardDb ??= seed());

export function carrierReference(order) {
  return `1Z999AA1${String(order.id).padStart(8, '0')}ACMESTOREPARCEL${order.id}WAREHOUSEMILAN${order.items.length}`;
}

export const delay = (ms) => new Promise((r) => setTimeout(r, ms));
