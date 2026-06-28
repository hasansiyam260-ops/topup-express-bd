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
        aria-label="Admin"
        title="Admin"
        className="fixed bottom-[78px] left-2 z-[10002] grid h-7 w-7 place-items-center rounded-full bg-rose-600/85 text-[11px] font-black text-white/95 shadow-[0_0_14px_rgba(225,29,72,0.45)] ring-1 ring-white/55 backdrop-blur-md transition-all hover:scale-105 hover:bg-rose-600"
      >
        A
      </Link>
      <BottomNav />
    </div>
  );
}
