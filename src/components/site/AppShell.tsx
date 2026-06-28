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
        className="fixed bottom-1 left-1 z-[10001] grid h-5 w-5 place-items-center text-[10px] font-bold text-foreground/10 transition-colors hover:text-rose-500/80"
      >
        A
      </Link>
      <BottomNav />
    </div>
  );
}
