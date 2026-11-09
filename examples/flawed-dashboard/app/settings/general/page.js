'use client';
import { useEffect, useRef, useState } from 'react';
import { Button, getJSON, Loading, LoadError, Section, Switch, usePageTitle } from '@/components/ui';
import { useToast } from '@/components/toast';

const field = 'h-8 w-full rounded-md border border-border bg-surface px-2 text-sm';
const timezones = ['Europe/Rome', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo'];
// Each section saves only its own fields.
const sections = { store: ['storeName', 'timezone'], shipping: ['packageWeight', 'requireSignature'] };
const pick = (obj, keys) => Object.fromEntries(keys.map((k) => [k, obj[k]]));

function SectionActions({ dirty, saving, onDiscard }) {
  return (
    <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-4">
      <span className="mr-auto text-sm text-muted" role="status">{dirty ? 'Unsaved changes' : ''}</span>
      <Button disabled={!dirty || saving} onClick={onDiscard}>Discard</Button>
      <Button type="submit" variant="primary" disabled={!dirty || saving}>{saving ? 'Saving…' : 'Save'}</Button>
    </div>
  );
}

export default function GeneralSettings() {
  usePageTitle('General settings');
  const { toast } = useToast();
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState(null);
  const [drafts, setDrafts] = useState(0);
  const [saving, setSaving] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const confirmRef = useRef(null);

  useEffect(() => {
    setFailed(false);
    getJSON('/api/settings').then((d) => { setSaved(d.general); setForm(d.general); setDrafts(d.drafts); }).catch(() => setFailed(true));
  }, [attempt]);

  if (failed) return <><h1 className="text-xl font-semibold">General</h1><div className="mt-6"><LoadError what="General settings" onRetry={() => setAttempt((n) => n + 1)} /></div></>;
  if (!form) return <><h1 className="text-xl font-semibold">General</h1><div className="mt-6"><Loading label="Loading settings" /></div></>;

  const isDirty = (section) => JSON.stringify(pick(form, sections[section])) !== JSON.stringify(pick(saved, sections[section]));
  const set = (k) => (v) => setForm({ ...form, [k]: v });
  const discard = (section) => setForm({ ...form, ...pick(saved, sections[section]) });

  async function save(section, title) {
    setSaving(section);
    const r = await fetch('/api/settings', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ general: { ...saved, ...pick(form, sections[section]) } }) });
    const d = await r.json();
    setSaving(null);
    if (!r.ok) return toast(d.error, { tone: 'error' });
    setSaved(d.general);
    setForm((f) => ({ ...f, ...pick(d.general, sections[section]) }));
    toast(`${title} saved`);
  }
  const submit = (section, title) => (e) => { e.preventDefault(); if (isDirty(section)) save(section, title); };

  async function deleteDrafts() {
    confirmRef.current.close();
    const r = await fetch('/api/settings', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ deleteDrafts: true }) });
    if (!r.ok) return toast('Could not delete draft orders', { tone: 'error', action: { label: 'Retry', onClick: deleteDrafts } });
    setDrafts(0);
    toast('Draft orders deleted');
  }

  return (
    <div>
      <h1 className="mb-8 text-xl font-semibold">General</h1>

      <Section title="Store details" description="How your store appears on packing slips and in emails to customers.">
        <form noValidate onSubmit={submit('store', 'Store details')}>
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="storeName" className="text-sm font-medium">Store name</label>
            <input id="storeName" className={`${field} mt-1`} maxLength={60} aria-describedby="storeName-help" value={form.storeName} onChange={(e) => set('storeName')(e.target.value)} />
            <p id="storeName-help" className="mt-1 text-sm text-muted">Up to 60 characters.</p>
          </div>
          <div>
            <label htmlFor="timezone" className="text-sm font-medium">Time zone</label>
            <select id="timezone" className={`${field} mt-1`} aria-describedby="timezone-help" value={form.timezone} onChange={(e) => set('timezone')(e.target.value)}>
              {timezones.map((t) => <option key={t}>{t}</option>)}
            </select>
            <p id="timezone-help" className="mt-1 text-sm text-muted">Used for order dates and the daily summary.</p>
          </div>
        </div>
        <SectionActions dirty={isDirty('store')} saving={saving === 'store'} onDiscard={() => discard('store')} />
        </form>
      </Section>

      <Section title="Shipping defaults" description="Applied to new orders when the order does not say otherwise.">
        <form noValidate onSubmit={submit('shipping', 'Shipping defaults')}>
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="packageWeight" className="text-sm font-medium">Default package weight</label>
            <input id="packageWeight" type="text" className={`${field} mt-1 max-w-40`} aria-describedby="packageWeight-help" value={form.packageWeight} onChange={(e) => set('packageWeight')(e.target.value)} />
            <p id="packageWeight-help" className="mt-1 text-sm text-muted">Used to buy labels when an order has no weight.</p>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p id="signature-label" className="text-sm font-medium">Require signature on delivery</p>
              <p id="signature-help" className="mt-1 text-sm text-muted">Carriers charge an extra fee for each signed delivery.</p>
            </div>
            <Switch checked={form.requireSignature} onChange={set('requireSignature')} label="Require signature on delivery" describedBy="signature-help" />
          </div>
        </div>
        <SectionActions dirty={isDirty('shipping')} saving={saving === 'shipping'} onDiscard={() => discard('shipping')} />
        </form>
      </Section>

      <Section title="Danger zone" description="Actions here affect all orders in the store.">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Draft orders</p>
            <p className="mt-1 text-sm text-muted">{drafts} draft {drafts === 1 ? 'order' : 'orders'}</p>
          </div>
          <Button variant="critical" disabled={drafts === 0} title="Deletes every draft order permanently. You cannot undo this." onClick={() => confirmRef.current.showModal()}>
            Delete drafts
          </Button>
        </div>
      </Section>

      <dialog ref={confirmRef} aria-labelledby="confirm-title" className="m-auto w-96 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-surface p-4 text-fg">
        <h2 id="confirm-title" className="text-base font-semibold">Delete {drafts} draft orders?</h2>
        <p className="mt-2 text-sm">The drafts are deleted permanently. You cannot undo this.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => confirmRef.current.close()}>Cancel</Button>
          <Button variant="danger" onClick={deleteDrafts}>Delete drafts</Button>
        </div>
      </dialog>
    </div>
  );
}
