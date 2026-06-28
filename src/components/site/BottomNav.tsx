import { Link, useLocation } from "@tanstack/react-router";
import { Home, PlusCircle, Package, Sparkles, User } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/wallet", label: "Add Money", icon: PlusCircle },
  { to: "/orders", label: "My Orders", icon: Package },
  { to: "/codes", label: "My Codes", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const loc = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto max-w-7xl grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = loc.pathname === to || (to !== "/" && loc.pathname.startsWith(to));
          return (
            <li key={to}>
              <Link
                to={to}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold tracking-wide transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={`relative grid place-items-center h-7 w-7 ${
                  active ? "drop-shadow-[0_0_10px_color-mix(in_oklab,var(--brand-red)_70%,transparent)]" : ""
                }`}>
                  <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
