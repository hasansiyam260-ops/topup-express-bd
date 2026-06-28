import { Link, useLocation } from "@tanstack/react-router";
import { Home, Plus, Package, Sparkles, User } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/wallet", label: "Add Money", icon: Plus },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/codes", label: "My Codes", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const loc = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-onyx/90 backdrop-blur-xl">
      <ul className="mx-auto max-w-7xl grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = loc.pathname === to || (to !== "/" && loc.pathname.startsWith(to));
          return (
            <li key={to}>
              <Link
                to={to}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold tracking-wide transition-colors ${
                  active ? "text-gold" : "text-muted-foreground hover:text-gold-soft"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" : ""}`} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
