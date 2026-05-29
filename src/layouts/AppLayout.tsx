import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="min-h-screen ">
        <Outlet />
      </main>
    </div>
  );
}
