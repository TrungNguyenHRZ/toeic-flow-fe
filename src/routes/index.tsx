import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/layouts/AppLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PublicExamPage } from "@/pages/PublicExamPage";
import { ResultPage } from "@/pages/ResultPage";
import { TeacherDashboardPage } from "@/pages/TeacherDashboardPage";
import { ExamDetailPage } from "@/pages/ExamDetailPage";

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
