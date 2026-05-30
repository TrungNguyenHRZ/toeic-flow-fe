import { toast } from "sonner";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

import logoMainUrl from "@/assets/branding/logo-main.svg?url";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

function StatCard(props: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">{props.title}</div>
      <p className="mt-2 text-sm text-slate-600">{props.description}</p>
    </div>
  );
}

function MockPanel(props: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900">
            {props.title}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-300" />
        </div>
      </div>

      <div className="px-4 py-4">{props.children}</div>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const loading = useAuthStore((s) => s.loading);
  const roleLoading = useAuthStore((s) => s.roleLoading);
  const initialized = useAuthStore((s) => s.initialized);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    // Avoid redirect flicker: wait for global auth init/loading + role fetch.
    if (!user) return;
    if (!initialized || loading || roleLoading) return;

    if (role === "teacher") {
      navigate("/teacher", { replace: true });
      return;
    }

    if (role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }
  }, [initialized, loading, navigate, role, roleLoading, user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    } catch {
      toast.error("Failed to log out. Please try again.");
    }
  };

  if (user) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-slate-900">
              Welcome back
            </h1>
            <p className="text-sm text-slate-600">
              Logged in as{" "}
              <span className="font-medium text-slate-900">{user.email}</span>
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button onClick={() => navigate("/teacher")} className="sm:w-auto">
              Go to Dashboard
            </Button>

            <Button
              variant="secondary"
              onClick={handleLogout}
              disabled={loading}
              className="sm:w-auto"
            >
              {loading ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Exam Management"
            description="Create exams, manage questions, and share links with students."
          />
          <StatCard
            title="Public Sharing"
            description="Students can access published exams without accounts."
          />
          <StatCard
            title="Fast Results"
            description="Practice with timed sessions and get instant feedback."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-10">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-10 md:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid items-center gap-10 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-2xl ">
                  <img src={logoMainUrl} alt="ToeicFlow" />
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 md:text-4xl">
                  Create, share, and manage TOEIC exams easily.
                </h1>
                <p className="text-base text-slate-600">
                  A calm, production-oriented platform for teachers and
                  students: build exams, share public links, and practice with
                  timed sessions.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto"
                >
                  Get Started
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  Public exam sharing
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                  <span className="inline-flex h-2 w-2 rounded-full bg-slate-300" />
                  Timer + instant results
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-slate-50 to-white opacity-70 blur-2xl" />
              <div className="relative space-y-4">
                <MockPanel title="Teacher preview">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          Your Exams
                        </div>
                        <div className="text-xs text-slate-500">
                          Manage questions + publish
                        </div>
                      </div>
                      <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                        Active
                      </span>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="text-xs font-medium text-slate-600">
                          Questions
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">
                          Part 5 (MVP)
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="text-xs font-medium text-slate-600">
                          Sharing
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">
                          Publish link
                        </div>
                      </div>
                    </div>
                  </div>
                </MockPanel>

                <MockPanel title="Student preview">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          Public Exam Player
                        </div>
                        <div className="text-xs text-slate-500">
                          Timed practice + results
                        </div>
                      </div>
                      <span className="inline-flex rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                        Ready
                      </span>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="text-xs font-medium text-slate-600">
                          Timer
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">
                          Sticky sidebar
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="text-xs font-medium text-slate-600">
                          Score
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">
                          Instant review
                        </div>
                      </div>
                    </div>
                  </div>
                </MockPanel>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="space-y-3">
          <div className="text-sm font-semibold text-slate-900">
            Features built for real workflows
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Everything you need to run TOEIC practice
          </h2>
          <p className="max-w-2xl text-sm text-slate-600">
            Lightweight, reliable, and designed around teachers and students.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              Exam Management
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Create exams, import questions, and keep your sessions organized.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              Public Exam Sharing
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Publish an exam once and students can start instantly—no friction.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              Real-time Practice Experience
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Timed sessions, answer tracking, and quick results review.
            </p>
          </div>
        </div>
      </section>

      {/* TEACHER VS STUDENT */}
      <section className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Teacher workflow & Student workflow
          </h2>
          <p className="max-w-2xl text-sm text-slate-600">
            Clear separation of roles—designed to reduce confusion and keep
            sessions smooth.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-900">
                  Teachers
                </div>
                <div className="text-xs text-slate-500">
                  Create, manage, and share exams
                </div>
              </div>
              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                Admin-ready
              </span>
            </div>

            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  1
                </span>
                <span>Create exams and manage Part 5 questions in V1.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  2
                </span>
                <span>Publish exams and share public links with students.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  3
                </span>
                <span>Review submissions and keep sessions consistent.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-900">
                  Students
                </div>
                <div className="text-xs text-slate-500">
                  Practice smarter, get instant feedback
                </div>
              </div>
              <span className="inline-flex rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                No login (MVP)
              </span>
            </div>

            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200">
                  A
                </span>
                <span>Open a shared exam link and enter your name/class.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200">
                  B
                </span>
                <span>
                  Complete a timed TOEIC practice session (Part 5 in V1).
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200">
                  C
                </span>
                <span>Submit answers and review results right away.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* PRODUCT PREVIEW (LIGHTWEIGHT) */}
      <section className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="space-y-3">
          <div className="text-sm font-semibold text-slate-900">
            Product preview
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            A real app experience (no mock templates)
          </h2>
          <p className="max-w-2xl text-sm text-slate-600">
            Simple, readable screens with clean navigation and calm educational
            styling.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <MockPanel title="Exam detail (read-only)">
              <div className="space-y-3">
                <div className="h-2 w-2/3 rounded bg-slate-100" />
                <div className="h-2 w-1/2 rounded bg-slate-100" />
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Part 5
                    </span>
                    <span className="text-xs text-slate-500">10 questions</span>
                  </div>
                  <div className="h-10 rounded-xl border border-slate-200 bg-white" />
                  <div className="h-10 rounded-xl border border-slate-200 bg-white" />
                </div>
              </div>
            </MockPanel>
          </div>

          <div className="lg:col-span-2">
            <MockPanel title="Student practice layout (preview)">
              <div className="grid gap-4 md:grid-cols-[1fr_260px]">
                <div className="space-y-3">
                  <div className="h-10 rounded-xl border border-slate-200 bg-white" />
                  <div className="h-40 rounded-xl border border-slate-200 bg-slate-50" />
                  <div className="h-40 rounded-xl border border-slate-200 bg-slate-50" />
                </div>
                <div className="space-y-3">
                  <div className="h-28 rounded-xl border border-slate-200 bg-white" />
                  <div className="h-40 rounded-xl border border-slate-200 bg-slate-50" />
                  <div className="h-12 rounded-xl bg-slate-900" />
                </div>
              </div>
            </MockPanel>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto max-w-6xl px-4 pb-10 md:px-6">
        <div className="flex flex-col gap-3 border-t border-slate-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-slate-900">ToeicFlow</div>
          <div className="text-sm text-slate-600">
            © {new Date().getFullYear()} ToeicFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
