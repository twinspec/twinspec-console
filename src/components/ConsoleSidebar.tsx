"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardBody } from "@/components/ui";

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <a
      href={href}
      className={cn(
        "block rounded-xl2 px-3 py-2 text-sm border transition",
        active ? "bg-surface2 border-border text-ink" : "bg-transparent border-transparent text-muted hover:bg-surface2 hover:border-border"
      )}
    >
      {label}
    </a>
  );
}

export function ConsoleSidebar() {
  return (
    <Card>
      <CardBody>
        <div className="text-sm font-semibold">TwinSpec</div>
        <div className="mt-1 text-xs text-muted">Console navigation</div>

        <div className="mt-4 space-y-1">
          <div className="text-xs font-medium text-muted px-2">Console</div>
          <NavItem href="/app/console/modea" label="Mode A" />
          <NavItem href="/app/console/modeb" label="Mode B" />
          <NavItem href="/app/console/modec" label="Mode C" />
        </div>

        <div className="mt-4 space-y-1">
          <div className="text-xs font-medium text-muted px-2">Other</div>
          <NavItem href="/app/data" label="Data" />
          <NavItem href="/" label="Home" />
        </div>
      </CardBody>
    </Card>
  );
}