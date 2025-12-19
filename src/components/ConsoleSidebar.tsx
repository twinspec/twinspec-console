"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardBody } from "@/components/ui";

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();

  // Exact match OR child route match (e.g., /app/console/modec/foo)
  const active =
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  return (
    <Link
      href={href}
      className={cn(
        "block rounded-xl2 px-3 py-2 text-sm border transition",
        active
          ? "bg-surface2 border-border text-ink"
          : "bg-transparent border-transparent text-muted hover:bg-surface2 hover:border-border"
      )}
    >
      {label}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-medium text-muted px-2">{children}</div>;
}

export function ConsoleSidebar() {
  return (
    <Card className="h-full">
      {/* Make sidebar content scroll instead of clipping */}
      <CardBody className="h-full min-h-0">
        <div className="text-sm font-semibold">TwinSpec</div>
        <div className="mt-1 text-xs text-muted">Console navigation</div>

        <div className="mt-4 min-h-0 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 space-y-4">
          <div className="space-y-1">
            <SectionLabel>Console</SectionLabel>

            {/* Root console page (overview) */}
            <NavItem href="/app/console" label="Console" />

            <NavItem href="/app/console/modea" label="Mode A" />
            <NavItem href="/app/console/modeb" label="Mode B" />
            <NavItem href="/app/console/modec" label="Mode C" />
          </div>

          <div className="space-y-1">
            <SectionLabel>Other</SectionLabel>
            <NavItem href="/app/data" label="Data" />
            <NavItem href="/" label="Home" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}