"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "block rounded-xl px-3 py-2 text-sm",
        active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="w-[260px] shrink-0 border-r border-slate-200 bg-white">
      <div className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-slate-900" />
          <div>
            <div className="text-sm font-semibold">TwinSpec</div>
            <div className="text-xs text-slate-500">Lab Console</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Lab Console
          </div>
          <div className="mt-2 space-y-1">
            <NavItem href="/console/instrument" label="Instrument Console" />
            <NavItem href="/console/data" label="Data Viewer" />
          </div>
        </div>

        <div className="mt-6">
          <div className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Site
          </div>
          <div className="mt-2 space-y-1">
            <NavItem href="/" label="Home" />
          </div>
        </div>
      </div>
    </aside>
  );
}