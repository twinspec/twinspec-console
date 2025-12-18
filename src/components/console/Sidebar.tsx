"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      className={[
        "flex h-10 w-full items-center justify-center rounded-xl text-xs font-medium transition",
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      ].join(" ")}
      title={label}
    >
      {label}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="w-[88px] shrink-0 border-r border-slate-200 bg-white">
      {/* Brand mark */}
      <div className="flex h-16 items-center justify-center border-b border-slate-200">
        <div className="h-9 w-9 rounded-xl bg-slate-900" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 px-3 py-4">
        <div className="flex flex-col gap-1">
          <NavItem href="/app/console" label="Console" />
          <NavItem href="/app/data" label="Data" />
        </div>

        <div className="mt-4 border-t border-slate-200 pt-3">
          <NavItem href="/" label="Home" />
        </div>
      </nav>
    </aside>
  );
}