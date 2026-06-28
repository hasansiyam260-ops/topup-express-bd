import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pb-24">{children}</main>
      <Link
        to="/admin"
        aria-label="."
        tabIndex={-1}
        className="fixed bottom-[68px] left-0 z-[10002] grid h-9 w-9 place-items-center"
      >
        <span className="block h-1.5 w-1.5 rounded-full bg-white/50 shadow-[0_0_3px_rgba(255,255,255,0.6)]" />
      </Link>

      <BottomNav />
    </div>
  );
}
