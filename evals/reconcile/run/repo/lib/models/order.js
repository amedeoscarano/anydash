/**
 * Our order model (plain JS with JSDoc, no TypeScript).
 * @typedef {'pending'|'shipped'|'delivered'|'on_hold'} OrderStatus
 * @typedef {Object} Order
 * @property {number} id
 * @property {string} orderNumber
 * @property {string} customerName
 * @property {string} customerEmail
 * @property {Date} placedAt
 * @property {OrderStatus} status
 * @property {number} totalAmount  Major units (for example 24.5), shown with a currency.
 * @property {'low'|'normal'|'high'} priority
 * @property {string} note
 */
export const ORDER_STATUSES = ['pending', 'shipped', 'delivered', 'on_hold'];
export const PRIORITIES = ['low', 'normal', 'high'];
