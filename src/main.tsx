import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";

import { router } from "@/routes";
import { useAuthStore } from "@/stores/auth-store";

// Ensure auth initialization runs globally (not only inside ProtectedRoute).
// This prevents LoginPage from being stuck on "Loading..." when /teacher is never visited.
void useAuthStore.getState().initAuth();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Toaster richColors position="top-right" />
  </React.StrictMode>,
);
