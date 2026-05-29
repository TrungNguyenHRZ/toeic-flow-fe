import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/layouts/AppLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleProtectedRoute } from "@/routes/RoleProtectedRoute";

import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PublicExamPage } from "@/pages/PublicExamPage";
import { ResultPage } from "@/pages/ResultPage";
import { TeacherDashboardPage } from "@/pages/TeacherDashboardPage";
import { ExamDetailPage } from "@/pages/ExamDetailPage";

import { AdminLayout } from "@/layouts/AdminLayout";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { AdminAccountsPage } from "@/pages/AdminAccountsPage";
import { AdminExamsPage } from "@/pages/AdminExamsPage";
import { AdminDeletedExamsPage } from "@/pages/AdminDeletedExamsPage";
import { AdminExamDetailPage } from "@/pages/AdminExamDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "teacher",
        element: (
          <ProtectedRoute>
            <TeacherDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "teacher/exams/:examId",
        element: (
          <ProtectedRoute>
            <ExamDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <RoleProtectedRoute allowRoles={["admin"]}>
            <AdminLayout />
          </RoleProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <AdminDashboardPage />,
          },
          {
            path: "accounts",
            element: <AdminAccountsPage />,
          },
          {
            path: "exams",
            element: <AdminExamsPage />,
          },
          {
            path: "deleted-exams",
            element: <AdminDeletedExamsPage />,
          },
          {
            path: "exams/:examId",
            element: <AdminExamDetailPage />,
          },
          {
            path: "deleted-exams/:examId",
            element: <AdminExamDetailPage />,
          },
        ],
      },
      {
        path: "exam/:examId",
        element: <PublicExamPage />,
      },
      {
        path: "result/:submissionId",
        element: <ResultPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
