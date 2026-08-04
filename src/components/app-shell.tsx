import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/levels", label: "Levels", icon: "🗺️" },
  { to: "/multiplayer", label: "Versus", icon: "⚔️" },
  { to: "/profile", label: "You", icon: "🎒" },
] as const;

export function AppShell({ children, nav = true }: { children: ReactNode; nav?: boolean }) {
  return (
    <div className="scene-sky min-h-screen w-full">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <main className={cn("flex-1 px-5 pt-6", nav ? "pb-28" : "pb-6")}>{children}</main>
        {nav && (
          <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-4 pb-4">
            <div className="clay flex items-center justify-around rounded-3xl bg-card px-2 py-2">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 text-[11px] font-bold text-muted-foreground transition-transform active:scale-95"
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ className: "clay-inset bg-muted text-foreground" }}
                >
                  <span className="text-xl leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

export function TopBar({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <header className="mb-5 flex items-center justify-between gap-3">
      <h1 className="font-display text-3xl font-extrabold">{title}</h1>
      {right}
    </header>
  );
}
