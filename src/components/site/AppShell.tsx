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
        className="fixed bottom-0 left-0 z-[10002] block h-6 w-6 opacity-0"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        .
      </Link>
      <BottomNav />
    </div>
  );
}
