// Order edit form (framework-free render function used by the fixture admin).
import { ORDER_STATUSES, PRIORITIES } from '../lib/models/order.js';

export function orderForm(order) {
  return `
<form data-save="page">
  <label>Status
    <select name="status">${ORDER_STATUSES.map((s) => `<option value="${s}">${s}</option>`).join('')}</select>
  </label>
  <label>Priority
    <select name="priority">${PRIORITIES.map((p) => `<option value="${p}">${p}</option>`).join('')}</select>
  </label>
  <label>Note <textarea name="note"></textarea></label>
  <button type="submit">Save</button>
</form>`;
}
