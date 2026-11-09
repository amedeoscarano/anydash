'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft } from '@/components/icons';

const pages = [
  { href: '/settings/general', label: 'General' },
  { href: '/settings/notifications', label: 'Notifications' },
  { href: '/settings/branding', label: 'Branding' },
  { href: '/settings/integrations', label: 'Manage integrations' },
];

export default function SettingsLayout({ children }) {
  const pathname = usePathname();
  return (
    <div className="-mx-4 -my-8 min-h-[calc(100vh-3rem)] bg-subtle px-4 py-8 md:-mx-8 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 md:flex-row">
        <nav aria-label="Settings" className="shrink-0 md:w-48">
          <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:underline">
            <ChevronLeft /> Back to home
          </Link>
          <ul className="flex flex-wrap gap-1 md:flex-col">
            {pages.map((p) => {
              const active = pathname === p.href;
              return (
                <li key={p.href}>
                  <Link href={p.href} aria-current={active ? 'page' : undefined} className={`flex h-8 items-center rounded-md px-2 text-sm ${active ? 'bg-surface font-semibold' : 'hover:bg-surface'}`}>
                    {p.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
