import { Link } from "@tanstack/react-router";
import { Home, Grid3x3, ScanLine, MessageCircle, Wrench } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/catalogue", label: "Systems", icon: Grid3x3 },
  { to: "/survey", label: "AI Survey", icon: ScanLine },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/installer", label: "Installer", icon: Wrench },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-5 py-3 backdrop-blur">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-copper text-primary-foreground">◉</span>
          Copper<span className="text-copper">Eye</span>
        </Link>
        <Link to="/customer" className="rounded-full border border-primary/50 px-3 py-1.5 text-xs font-semibold text-primary">My account</Link>
      </header>
      <main className="mx-auto max-w-5xl">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} activeOptions={{ exact: to === "/" }} className="flex flex-col items-center gap-1 py-3 text-[11px] text-muted-foreground [&.active]:text-primary">
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function head(title: string, description: string) {
  return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
}
