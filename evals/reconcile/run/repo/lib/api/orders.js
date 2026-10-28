// Orders API adapter. Base URL from config or ORDERS_API_BASE_URL; never hard-coded.

export class ApiError extends Error {
  /** @param {number} status @param {any} body */
  constructor(status, body) {
    super(`orders api: HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/** @param {{ baseUrl?: string, fetch?: typeof fetch }} [config] */
export function ordersApi(config = {}) {
  const baseUrl = config.baseUrl ?? process.env.ORDERS_API_BASE_URL;
  if (!baseUrl) throw new Error('ORDERS_API_BASE_URL is not set');
  const f = config.fetch ?? fetch;

  async function call(method, path, { body, headers } = {}) {
    const res = await f(new URL(path, baseUrl).toString(), {
      method,
      headers: { accept: 'application/json', ...(body ? { 'content-type': 'application/json' } : {}), ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(res.status, data);
    return data;
  }

  return {
    /** @param {{status?: string, q?: string, sort?: 'asc'|'desc', size?: 25|50, page?: number}} [opts] */
    listOrders(opts = {}) {
      const qs = new URLSearchParams(Object.entries(opts).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)]));
      return call('GET', `/api/orders${qs.size ? `?${qs}` : ''}`);
    },
    /** @param {number} id */
    getOrder(id) {
      return call('GET', `/api/orders/${encodeURIComponent(id)}`);
    },
    /** @param {number} id @param {object} patch @param {string} [version] updatedAt sent as If-Match */
    patchOrder(id, patch, version) {
      return call('PATCH', `/api/orders/${encodeURIComponent(id)}`, { body: patch, headers: version ? { 'if-match': version } : {} });
    },
  };
}
