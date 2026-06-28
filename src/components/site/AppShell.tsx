import type { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="dark min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
