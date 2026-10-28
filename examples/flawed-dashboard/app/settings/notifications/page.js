'use client';
import { useEffect, useState } from 'react';
import { Button, getJSON, Loading, LoadError, usePageTitle } from '@/components/ui';
import { useToast } from '@/components/toast';

function NotificationRow({ item, onSaved }) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item);

  async function save() {
    const r = await fetch('/api/notifications', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(draft) });
    if (!r.ok) return toast(`Could not save ${item.name}`, { tone: 'error', action: { label: 'Retry', onClick: save } });
    onSaved(await r.json());
    setEditing(false);
    toast(`${item.name} saved`);
  }

  return (
    <li className="border-b border-border py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium">{item.name}</h2>
          <p className="mt-1 text-sm text-muted">{item.description}</p>
        </div>
        {!editing && <Button aria-label={`Edit ${item.name}`} onClick={() => { setDraft(item); setEditing(true); }}>Edit</Button>}
      </div>
      {editing && (
        <fieldset className="mt-4">
          <legend className="text-sm font-medium">Send by</legend>
          <div className="mt-2 flex gap-4">
            {['email', 'sms'].map((k) => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.checked })} />
                {k === 'email' ? 'Email' : 'SMS'}
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="primary" onClick={save}>Save</Button>
            <Button onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </fieldset>
      )}
    </li>
  );
}

export default function NotificationSettings() {
  usePageTitle('Notification settings');
  const [items, setItems] = useState(null);

  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setFailed(false);
    getJSON('/api/notifications').then(setItems).catch(() => setFailed(true));
  }, [attempt]);

  return (
    <div>
      <h1 className="text-xl font-semibold">Notifications</h1>
      <p className="mt-1 text-sm text-muted">Messages sent to customers about their orders.</p>
      <div className="mt-8 rounded-lg border border-border bg-surface px-4">
        {failed ? <div className="py-4"><LoadError what="Notifications" onRetry={() => setAttempt((n) => n + 1)} /></div> : !items ? <div className="py-4"><Loading label="Loading notifications" /></div> : (
          <ul>
            {items.map((n) => <NotificationRow key={n.id} item={n} onSaved={(u) => setItems(items.map((x) => (x.id === u.id ? u : x)))} />)}
          </ul>
        )}
      </div>
    </div>
  );
}
