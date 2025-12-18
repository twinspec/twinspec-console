"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

const nav: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/console", label: "Demo Console" },
  { href: "/docs", label: "Docs" },
  { href: "/app/data", label: "Data" },
  { href: "/app/console", label: "Console" }
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 backdrop-blur border-b border-border/80 bg-bg/70">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight text-ink">
            TwinSpec
          </Link>

          <nav className="flex items-center gap-6 text-sm text-muted">
            {nav.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "text-ink" : "hover:text-ink transition-colors"}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}