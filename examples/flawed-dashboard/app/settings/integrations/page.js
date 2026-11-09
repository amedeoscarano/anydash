'use client';
import { useEffect, useState } from 'react';
import { getJSON, Loading, LoadError, Switch, usePageTitle } from '@/components/ui';
import { useToast } from '@/components/toast';

function IntegrationCard({ item, onToggle }) {
  const [on, setOn] = useState(item.enabled);
  return (
    <li className="flex items-start justify-between gap-4 border-b border-border py-4 last:border-b-0">
      <div>
        <h2 id={`${item.id}-name`} className="text-sm font-medium">{item.name}</h2>
        <p id={`${item.id}-help`} className="mt-1 text-sm text-muted">{item.description}</p>
      </div>
      <Switch checked={on} label={item.name} describedBy={`${item.id}-help`} onChange={(next) => { setOn(next); onToggle(item, next); }} />
    </li>
  );
}

export default function IntegrationsSettings() {
  usePageTitle('Integrations');
  const { toast } = useToast();
  const [items, setItems] = useState(null);

  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setFailed(false);
    getJSON('/api/integrations').then(setItems).catch(() => setFailed(true));
  }, [attempt]);

  async function toggle(item, enabled) {
    const previous = items;
    setItems((list) => list.map((x) => (x.id === item.id ? { ...x, enabled } : x)));
    const query = new URLSearchParams(window.location.search).get('fail') === '1' ? '?fail=1' : '';
    try {
      const r = await fetch(`/api/integrations/${item.id}${query}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ enabled }) });
      if (!r.ok) throw new Error((await r.json()).error);
      toast(`${item.name} turned ${enabled ? 'on' : 'off'}`);
    } catch {
      setItems(previous);
      toast(`Could not turn ${item.name} ${enabled ? 'on' : 'off'}`, { tone: 'error', action: { label: 'Retry', onClick: () => toggle(item, enabled) } });
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Integrations</h1>
      <p className="mt-1 text-sm text-muted">Changes apply as soon as you switch them.</p>
      <div className="mt-8 rounded-lg border border-border bg-surface px-4">
        {failed ? <div className="py-4"><LoadError what="Integrations" onRetry={() => setAttempt((n) => n + 1)} /></div> : !items ? <div className="py-4"><Loading label="Loading integrations" /></div> : (
          <ul>{items.map((i) => <IntegrationCard key={i.id} item={i} onToggle={toggle} />)}</ul>
        )}
      </div>
    </div>
  );
}
