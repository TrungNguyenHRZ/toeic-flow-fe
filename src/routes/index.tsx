import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/layouts/AppLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

import { ExamPage } from "@/pages/ExamPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ResultPage } from "@/pages/ResultPage";
import { TeacherDashboardPage } from "@/pages/TeacherDashboardPage";

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
        path: "exam/:examId",
        element: <ExamPage />,
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
