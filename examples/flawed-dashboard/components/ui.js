'use client';
import { useEffect } from 'react';

const variants = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover border border-accent',
  secondary: 'bg-surface text-fg border border-border hover:bg-neutral-tint',
  critical: 'bg-surface text-critical border border-border hover:bg-critical-tint',
  danger: 'bg-critical text-on-accent border border-critical',
  ghost: 'text-fg hover:bg-neutral-tint border border-transparent',
};

export function buttonClass(variant = 'secondary') {
  return `inline-flex items-center justify-center gap-2 rounded-md px-3 h-8 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`;
}

export function Button({ variant, className = '', ...props }) {
  return <button type="button" className={`${buttonClass(variant)} ${className}`} {...props} />;
}

const tones = {
  pending: 'bg-warning-tint text-warning',
  shipped: 'bg-info-tint text-info',
  delivered: 'bg-success-tint text-success',
  canceled: 'bg-neutral-tint text-muted',
};
const statusLabel = { pending: 'Pending', shipped: 'Shipped', delivered: 'Delivered', canceled: 'Canceled' };

export function StatusBadge({ status }) {
  return <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium leading-none ${tones[status]}`}>{statusLabel[status]}</span>;
}

export function Switch({ checked, onChange, label, describedBy, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent disabled:opacity-50 ${checked ? 'bg-accent' : 'bg-border'}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

export function Section({ title, description, children }) {
  return (
    <section className="grid grid-cols-1 gap-4 border-b border-border py-8 first:pt-0 md:grid-cols-3">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      <div className="rounded-lg border border-border bg-surface p-4 md:col-span-2">{children}</div>
    </section>
  );
}

export function SaveBar({ dirty, saving, onSave, onDiscard }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex items-center justify-end gap-2 border-t border-border bg-surface px-4 py-3 md:-mx-8 md:px-8">
      <span className="mr-auto text-sm text-muted" role="status">{dirty ? 'Unsaved changes' : ''}</span>
      <Button variant="secondary" disabled={!dirty || saving} onClick={onDiscard}>Discard</Button>
      <Button variant="primary" disabled={!dirty || saving} onClick={onSave}>{saving ? 'Saving…' : 'Save'}</Button>
    </div>
  );
}

export function Loading({ label }) {
  return (
    <div role="status" className="space-y-2" aria-label={label}>
      <div className="h-4 w-1/3 animate-pulse rounded-md bg-neutral-tint" />
      <div className="h-4 w-2/3 animate-pulse rounded-md bg-neutral-tint" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

// Region error with Retry; the rest of the page stays usable.
export function LoadError({ what, onRetry }) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-surface p-4 text-sm">
      <p className="flex-1">{what} could not be loaded.</p>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  );
}

export const getJSON = (url) => fetch(url).then((r) => {
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
});

export function usePageTitle(title) {
  useEffect(() => {
    if (title) document.title = `${title} · Acme Store`;
  }, [title]);
}

export const money = (cents) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
export const shortDate = (iso) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(iso));
