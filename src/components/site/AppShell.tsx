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
        <span className="block h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.9)]" />
      </Link>

      <BottomNav />
    </div>
  );
}
