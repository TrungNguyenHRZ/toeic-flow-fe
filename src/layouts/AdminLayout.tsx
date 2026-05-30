import { Outlet, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

const navItems = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/accounts", label: "Accounts" },
  { to: "/admin/exams", label: "Exams" },
  { to: "/admin/deleted-exams", label: "Deleted Exams" },
] as const;

export function AdminLayout() {
  const logout = useAuthStore((s) => s.logout);

  // Header height is fixed (h-14). Keep all fixed regions aligned to this value.
  const headerHeightClass = "h-14";

  return (
    <div className="h-screen overflow-hidden bg-slate-50">
      {/* Top header (always visible) */}
      <header
        className={[
          "fixed top-0 left-0 right-0 z-40",
          headerHeightClass,
          "flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 md:px-6",
        ].join(" ")}
      >
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900">
            Admin
          </div>
          <div className="truncate text-xs text-slate-500">
            ToeicFlow moderation tools
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void logout();
            }}
            className="text-xs"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Desktop/tablet shell: sidebar fixed, only main content scrolls */}
      <div className="flex h-full w-full">
        {/* Sidebar (desktop/tablet) */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 md:flex">
          <div
            className={[
              "fixed left-0 top-14 bottom-0 z-20 w-64",
              "overflow-y-auto pr-4",
              // subtle scrollbar UX (if utilities exist in your Tailwind build)
              "scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent",
            ].join(" ")}
          >
            <nav className="flex w-full flex-col gap-2 p-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    [
                      "rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content (only scrolls here) */}
        <main
          className={[
            "min-w-0 flex-1 overflow-y-auto",
            "pt-14",
            // keep content clear of mobile bottom nav
            "pb-20 md:pb-6",
            // subtle scrollbar UX (if utilities exist)
            "scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent",
          ].join(" ")}
        >
          <div className="px-4 md:px-6">
            <div className="py-6 md:py-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 h-16 border-t border-slate-200 bg-white md:hidden">
        <div className="grid h-full grid-cols-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                [
                  "flex items-center justify-center px-2 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
