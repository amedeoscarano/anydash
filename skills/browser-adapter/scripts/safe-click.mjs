#!/usr/bin/env node
// Read-only guard for live third-party portals: decides if an element may be clicked
// from its ARIA role and accessible name. Usage: scripts/safe-click.mjs <role> <name>
// Exit 0 = allowed, 1 = denied (reason on stderr).
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Roles that only navigate or open views.
const ALLOWED_ROLES = new Set(['link', 'tab', 'button', 'menuitem', 'treeitem']);

// Verbs that change state or cost money (EN + IT). Matched as whole words.
export const DENY_WORDS = [
  // EN
  'save', 'create', 'add', 'new', 'delete', 'remove', 'archive', 'unarchive', 'publish', 'unpublish',
  'install', 'uninstall', 'connect', 'disconnect', 'enable', 'disable', 'activate', 'deactivate',
  'pause', 'resume', 'purge', 'upgrade', 'downgrade', 'buy', 'purchase', 'pay', 'checkout', 'subscribe',
  'ship', 'print', 'book', 'send', 'resend', 'invite', 'roll', 'rotate', 'revoke', 'regenerate',
  'import', 'export', 'download', 'upload', 'reveal', 'show key', 'show token', 'view token', 'view key',
  'copy', 'confirm', 'submit', 'apply', 'reset', 'restore', 'duplicate', 'edit', 'update', 'approve',
  'fulfill', 'fulfil', 'refund', 'void', 'capture', 'merge', 'transfer', 'migrate', 'deploy', 'run',
  'start', 'stop', 'retry', 'sync', 'refresh', 'clear', 'empty', 'mark', 'assign', 'accept', 'decline',
  'log out', 'logout', 'sign out', 'signout', 'leave', 'close account', 'cancel order', 'cancel subscription',
  // IT
  'salva', 'crea', 'aggiungi', 'nuovo', 'nuova', 'elimina', 'rimuovi', 'archivia', 'pubblica', 'installa',
  'disinstalla', 'connetti', 'collega', 'disconnetti', 'scollega', 'abilita', 'disabilita', 'attiva',
  'disattiva', 'pausa', 'sospendi', 'svuota', 'aggiorna', 'acquista', 'compra', 'paga', 'spedisci',
  'stampa', 'prenota', 'invia', 'invita', 'ruota', 'revoca', 'importa', 'esporta', 'scarica', 'carica',
  'mostra chiave', 'copia', 'conferma', 'applica', 'reimposta', 'ripristina', 'duplica', 'modifica',
  'approva', 'evadi', 'rimborsa', 'esci', 'disconnettiti', 'accetta', 'rifiuta', 'sincronizza',
];

// Links and tabs navigate; only these words make a link unsafe (e.g. "Address book" stays allowed).
export const LINK_DENY_WORDS = [
  'log out', 'logout', 'sign out', 'signout', 'delete', 'remove', 'cancel', 'unsubscribe', 'download', 'export',
  'reveal', 'esci', 'elimina', 'rimuovi', 'annulla', 'scarica', 'esporta', 'install', 'installa', 'upgrade',
  'buy', 'pay', 'checkout', 'acquista', 'paga',
];

const norm =(s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

export function check(role, name) {
  const r = norm(role || '');
  const n = norm(name || '');
  if (!ALLOWED_ROLES.has(r)) return { ok: false, reason: `role "${r}" is not a navigation role` };
  if (!n) return { ok: false, reason: 'empty accessible name: purpose unknown' };
  // Bare dismiss controls close a view without changing data.
  if (['cancel', 'annulla', 'close', 'chiudi', 'dismiss', 'x', 'back', 'indietro'].includes(n)) return { ok: true };
  const words = r === 'link' || r === 'tab' || r === 'treeitem' ? LINK_DENY_WORDS : DENY_WORDS;
  for (const w of words) {
    const re = new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\p{L}])`, 'u');
    if (re.test(n)) return { ok: false, reason: `name contains denied word "${w}"` };
  }
  return { ok: true };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  const [role, ...rest] = process.argv.slice(2);
  const res = check(role, rest.join(' '));
  if (!res.ok) { console.error(`DENY: ${res.reason}`); process.exit(1); }
  console.log('ALLOW');
}
