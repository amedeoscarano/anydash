'use client';
import { useEffect, useState } from 'react';
import { getJSON, Loading, LoadError, SaveBar, Section, usePageTitle } from '@/components/ui';
import { useToast } from '@/components/toast';

export default function BrandingSettings() {
  usePageTitle('Branding settings');
  const { toast } = useToast();
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setFailed(false);
    getJSON('/api/settings').then((d) => { setSaved(d.branding); setForm(d.branding); }).catch(() => setFailed(true));
  }, [attempt]);

  if (failed) return <><h1 className="text-xl font-semibold">Branding</h1><div className="mt-6"><LoadError what="Branding settings" onRetry={() => setAttempt((n) => n + 1)} /></div></>;
  if (!form) return <><h1 className="text-xl font-semibold">Branding</h1><div className="mt-6"><Loading label="Loading branding" /></div></>;

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  async function save() {
    setSaving(true);
    const r = await fetch('/api/settings', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ branding: form }) });
    setSaving(false);
    if (!r.ok) return toast('Could not save branding', { tone: 'error', action: { label: 'Retry', onClick: save } });
    const d = await r.json();
    setSaved(d.branding);
    setForm(d.branding);
    toast('Branding saved');
  }

  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); if (dirty) save(); }}>
      <h1 className="mb-8 text-xl font-semibold">Branding</h1>
      <Section title="Customer emails" description="How order and shipping emails look to your customers.">
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="color" className="text-sm font-medium">Brand colour</label>
            <div className="mt-1 flex items-center gap-2">
              <input id="color" type="color" aria-describedby="color-help" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-8 w-12 rounded-md border border-border bg-surface" />
              <span className="font-mono text-sm">{form.color}</span>
            </div>
            <p id="color-help" className="mt-1 text-sm text-muted">Used for buttons and links in emails.</p>
          </div>
          <div>
            <label htmlFor="footer" className="text-sm font-medium">Email footer</label>
            <textarea id="footer" rows={3} maxLength={200} aria-describedby="footer-help" value={form.footer} onChange={(e) => setForm({ ...form, footer: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-surface p-2 text-sm" />
            <p id="footer-help" className="mt-1 text-sm text-muted">Up to 200 characters, shown at the end of every email.</p>
          </div>
        </div>
      </Section>
      <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={() => setForm(saved)} />
    </form>
  );
}
