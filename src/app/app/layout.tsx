import { SiteShell } from "@/components/SiteShell";

export default function AppAreaLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}