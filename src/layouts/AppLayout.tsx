import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-4">
        <Outlet />
      </main>
    </div>
  );
}
