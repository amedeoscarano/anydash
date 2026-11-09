'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { HomeIcon, OrdersIcon, SettingsIcon, SearchIcon, HelpIcon, MenuIcon, CollapseIcon, UserIcon } from './icons';
import { useToast } from './toast';
import { getJSON, LoadError } from './ui';

const work = [
  { href: '/', label: 'Home', Icon: HomeIcon },
  { href: '/orders', label: 'Orders', Icon: OrdersIcon },
];
const settingsItem = { href: '/settings', label: 'Settings', Icon: SettingsIcon };

const isActive = (pathname, href) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));

function NavLink({ item, pathname, collapsed, onNavigate }) {
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`group relative flex h-8 items-center gap-2 rounded-md px-2 text-sm ${active ? 'bg-neutral-tint font-semibold' : 'text-fg hover:bg-neutral-tint'}`}
    >
      <item.Icon />
      {/* Collapsed: the label stays in the accessibility tree and shows as a tooltip on hover and keyboard focus. */}
      <span className={collapsed ? 'pointer-events-none absolute left-full top-1/2 z-30 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-fg px-2 py-1 text-xs font-medium text-bg opacity-0 shadow-md group-hover:opacity-100 group-focus-visible:opacity-100' : ''}>{item.label}</span>
    </Link>
  );
}

function NavList({ pathname, collapsed, onNavigate }) {
  return (
    <nav aria-label="Main" className="flex h-full flex-col gap-1 p-2">
      {work.map((item) => <NavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />)}
      <div className="mt-auto border-t border-border pt-2">
        <NavLink item={settingsItem} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
      </div>
    </nav>
  );
}

const searchPages = [
  { href: '/', label: 'Home' },
  { href: '/orders', label: 'Orders' },
  { href: '/settings/general', label: 'General settings' },
  { href: '/settings/notifications', label: 'Notification settings' },
  { href: '/settings/branding', label: 'Branding settings' },
  { href: '/settings/integrations', label: 'Integrations' },
];

function SearchDialog({ dialogRef }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [orders, setOrders] = useState([]);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setFailed(false);
    if (!q.trim()) return setOrders([]);
    const t = setTimeout(() => {
      getJSON(`/api/orders?q=${encodeURIComponent(q)}`).then((d) => setOrders(d.orders.slice(0, 5))).catch(() => { setOrders([]); setFailed(true); });
    }, 200);
    return () => clearTimeout(t);
  }, [q, attempt]);

  const pages = searchPages.filter((p) => p.label.toLowerCase().includes(q.trim().toLowerCase()));
  const go = (href) => { dialogRef.current.close(); setQ(''); router.push(href); };

  return (
    <dialog ref={dialogRef} aria-label="Search" className="mx-auto mt-24 w-[36rem] max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-surface p-0 text-fg shadow-xl">
      <div className="border-b border-border p-2">
        <input
          autoFocus
          type="search"
          aria-label="Search orders and pages"
          placeholder="Search orders by number or customer, or jump to a page"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-8 w-full rounded-md bg-transparent px-2 text-sm outline-none"
        />
      </div>
      <div className="max-h-80 overflow-y-auto p-2 text-sm">
        <p className="px-2 py-1 text-xs font-medium text-muted">{q ? 'Pages' : 'Go to'}</p>
        <ul>
          {pages.map((p) => (
            <li key={p.href}><button type="button" className="w-full rounded-md px-2 py-2 text-left hover:bg-neutral-tint" onClick={() => go(p.href)}>{p.label}</button></li>
          ))}
        </ul>
        {orders.length > 0 && (
          <>
            <p className="px-2 py-1 text-xs font-medium text-muted">Orders</p>
            <ul>
              {orders.map((o) => (
                <li key={o.id}><button type="button" className="w-full rounded-md px-2 py-2 text-left hover:bg-neutral-tint" onClick={() => go(`/orders/${o.id}`)}>Order {o.number} · {o.customer}</button></li>
              ))}
            </ul>
          </>
        )}
        {failed && <div className="mt-2"><LoadError what="Matching orders" onRetry={() => setAttempt((n) => n + 1)} /></div>}
        {q && !failed && !pages.length && !orders.length && <p className="px-2 py-2 text-muted">No results for “{q}”.</p>}
      </div>
    </dialog>
  );
}

const appearances = [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']];
// The CSS in globals.css swaps colour tokens on <html data-theme>; "system" follows the OS.
const applyAppearance = (value) => { document.documentElement.dataset.theme = value; };

function UserMenu() {
  const [open, setOpen] = useState(false);
  const [appearance, setAppearance] = useState('system');
  const { toast } = useToast();
  const ref = useRef(null);

  useEffect(() => {
    getJSON('/api/me').then((me) => { setAppearance(me.appearance); applyAppearance(me.appearance); }).catch(() => {});
  }, []);

  async function choose(value) {
    const previous = appearance;
    setAppearance(value);
    applyAppearance(value);
    const r = await fetch('/api/me', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ appearance: value }) }).catch(() => null);
    if (r?.ok) return;
    setAppearance(previous);
    applyAppearance(previous);
    toast('Could not change appearance', { tone: 'error', action: { label: 'Retry', onClick: () => choose(value) } });
  }

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (e.key === 'Escape' || (e.type === 'mousedown' && !ref.current.contains(e.target))) setOpen(false); };
    document.addEventListener('keydown', close);
    document.addEventListener('mousedown', close);
    return () => { document.removeEventListener('keydown', close); document.removeEventListener('mousedown', close); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label="Account menu" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} className="flex h-8 w-8 items-center justify-center rounded-full border border-border">
        <UserIcon />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-10 z-20 w-56 rounded-lg border border-border bg-surface p-2 text-sm shadow-md">
          <p className="px-2 py-1 font-medium">Test admin</p>
          <p className="px-2 pb-2 text-muted">admin@example.com</p>
          <div role="group" aria-labelledby="appearance-label" className="mb-2 border-y border-border py-2">
            <p id="appearance-label" className="px-2 pb-1 text-xs font-medium text-muted">Appearance</p>
            {appearances.map(([value, label]) => (
              <button key={value} role="menuitemradio" aria-checked={appearance === value} type="button" className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-neutral-tint" onClick={() => choose(value)}>
                <span aria-hidden="true" className="w-4">{appearance === value ? '✓' : ''}</span>
                {label}
              </button>
            ))}
          </div>
          <button role="menuitem" type="button" className="w-full rounded-md px-2 py-2 text-left hover:bg-neutral-tint" onClick={() => { setOpen(false); toast('Signed out of the demo'); }}>Sign out</button>
        </div>
      )}
    </div>
  );
}

export function Shell({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const drawerRef = useRef(null);
  const searchRef = useRef(null);
  const menuButtonRef = useRef(null);

  const [hotkey, setHotkey] = useState('/');

  useEffect(() => {
    setHotkey(/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K');
    const onKey = (e) => {
      const t = e.target;
      if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      const combo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      const slash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey;
      if ((combo || slash) && !searchRef.current?.open) { e.preventDefault(); searchRef.current?.showModal(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex min-h-screen">
      <aside className={`sticky top-0 z-20 hidden h-screen shrink-0 flex-col border-r border-border bg-surface md:flex ${collapsed ? 'w-14' : 'w-56'}`}>
        <div className="flex h-12 items-center justify-between border-b border-border px-2">
          {!collapsed && <span className="px-2 text-sm font-semibold">Acme Store</span>}
          <button type="button" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-tint">
            <CollapseIcon />
          </button>
        </div>
        <NavList pathname={pathname} collapsed={collapsed} />
      </aside>

      <dialog
        ref={drawerRef}
        id="nav-drawer"
        aria-label="Menu"
        onClose={() => menuButtonRef.current?.setAttribute('aria-expanded', 'false')}
        className="m-0 h-full max-h-none w-64 border-r border-border bg-surface p-0 text-fg"
      >
        <div className="flex h-12 items-center justify-between border-b border-border px-4">
          <span className="text-sm font-semibold">Acme Store</span>
          <button type="button" aria-label="Close menu" onClick={() => drawerRef.current.close()} className="h-8 w-8 rounded-md hover:bg-neutral-tint">×</button>
        </div>
        <div className="h-[calc(100%-3rem)]">
          <NavList pathname={pathname} onNavigate={() => drawerRef.current.close()} />
        </div>
      </dialog>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-12 items-center gap-2 border-b border-border bg-surface px-4">
          <button
            ref={menuButtonRef}
            type="button"
            aria-label="Open menu"
            aria-expanded="false"
            aria-controls="nav-drawer"
            onClick={(e) => { drawerRef.current.showModal(); e.currentTarget.setAttribute('aria-expanded', 'true'); }}
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-tint md:hidden"
          >
            <MenuIcon />
          </button>
          <button
            type="button"
            onClick={() => searchRef.current.showModal()}
            className="flex h-8 w-full max-w-sm items-center gap-2 rounded-md border border-border px-2 text-sm text-muted"
          >
            <SearchIcon />
            <span className="flex-1 text-left">Search</span>
            <kbd className="hidden text-xs sm:inline">{hotkey}</kbd>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <a href="https://example.com/help" target="_blank" rel="noreferrer" className="hidden h-8 items-center gap-2 rounded-md px-2 text-sm hover:bg-neutral-tint md:inline-flex">
              <HelpIcon />
              Help
              <span aria-hidden="true">↗</span>
              <span className="sr-only">(opens in new tab)</span>
            </a>
            <UserMenu />
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
      <SearchDialog dialogRef={searchRef} />
    </div>
  );
}
