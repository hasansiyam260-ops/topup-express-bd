import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { useSiteSettings } from "@/lib/site-settings";
import { Construction } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const s = useSiteSettings();
  const path = useRouterState({ select: (st) => st.location.pathname });
  const isAdminPath = path.startsWith("/admin") || path.startsWith("/auth");

  if (s.maintenance_enabled && !isAdminPath) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-amber-50 via-white to-rose-50 px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
            <Construction className="h-10 w-10" />
          </div>
          <h1 className="mt-5 font-display text-2xl text-slate-900">{s.site_name}</h1>
          <div className="mt-1 text-xs font-bold uppercase tracking-widest text-amber-600">Under Maintenance</div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 whitespace-pre-line">{s.maintenance_message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pb-24">{children}</main>
      <Link to="/admin" aria-label="." tabIndex={-1} className="fixed bottom-[68px] left-0 z-[10002] grid h-9 w-9 place-items-center">
        <span className="block h-1.5 w-1.5 rounded-full bg-white/50 shadow-[0_0_3px_rgba(255,255,255,0.6)]" />
      </Link>
      <BottomNav />
    </div>
  );
}
