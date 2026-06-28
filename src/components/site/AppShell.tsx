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
        className="fixed bottom-[72px] left-1.5 z-[10002] block h-2 w-2 rounded-full bg-rose-500/70 shadow-[0_0_4px_rgba(244,63,94,0.7)]"
      />

      <BottomNav />
    </div>
  );
}
