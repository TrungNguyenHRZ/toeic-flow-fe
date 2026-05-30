import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";

import logoIconUrl from "@/assets/branding/logo-icon.svg?url";
import { router } from "@/routes";
import { useAuthStore } from "@/stores/auth-store";

// Ensure favicon is set early (so the browser tab shows TOEICFlow icon).
const existingFavicon =
  document.querySelector<HTMLLinkElement>("link[rel='icon']");

if (existingFavicon) {
  existingFavicon.type = "image/svg+xml";
  existingFavicon.href = logoIconUrl;
} else {
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/svg+xml";
  link.href = logoIconUrl;
  document.head.appendChild(link);
}

// Ensure auth initialization runs globally (not only inside ProtectedRoute).
// This prevents LoginPage from being stuck on "Loading..." when /teacher is never visited.
void useAuthStore.getState().initAuth();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Toaster richColors position="top-right" />
  </React.StrictMode>,
);
