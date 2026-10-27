import { test } from 'node:test';
import assert from 'node:assert/strict';
import { check } from './safe-click.mjs';

const allow = (role, name) => assert.equal(check(role, name).ok, true, `${role} "${name}" should be allowed`);
const deny = (role, name) => assert.equal(check(role, name).ok, false, `${role} "${name}" should be denied`);

test('navigation is allowed', () => {
  allow('link', 'Orders');
  allow('link', 'Address book');
  allow('link', 'Shipping and delivery');
  allow('tab', 'All');
  allow('button', 'Settings');
  allow('button', 'More actions');
  allow('button', 'Cancel');
  allow('button', 'Chiudi');
  allow('link', 'Impostazioni');
});

test('state-changing buttons are denied, EN and IT', () => {
  for (const n of ['Save', 'Add product', 'Create order', 'Delete', 'Print label', 'Book pickup', 'Purge cache',
    'Upgrade plan', 'Roll API key', 'Salva', 'Aggiungi prodotto', 'Stampa etichetta', 'Prenota ritiro', 'Invia', 'Modifica'])
    deny('button', n);
});

test('dangerous links are denied', () => {
  deny('link', 'Log out');
  deny('link', 'Export');
  deny('link', 'Esci');
});

test('form controls are never clickable', () => {
  for (const r of ['switch', 'checkbox', 'radio', 'combobox', 'listbox', 'option', 'spinbutton', 'textbox', 'slider'])
    deny(r, 'Anything');
});

test('unnamed elements are denied', () => deny('button', ''));

test('whole-word matching', () => {
  allow('link', 'Shipping');
  allow('button', 'Address');
  allow('link', 'Installed apps');
});
