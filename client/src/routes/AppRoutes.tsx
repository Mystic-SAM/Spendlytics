import { BrowserRouter, useRoutes, type RouteObject } from "react-router-dom";
import AuthRoute from "./AuthRoute";
import { authenticationRoutePaths, protectedRoutePaths, superAdminRoutePaths } from "./common/routes";
import BaseLayout from "@/layouts/BaseLayout";
import ProtectedRoute from "./ProtectedRoute";
import SuperAdminRoute from "./SuperAdminRoute";
import AppLayout from "@/layouts/AppLayout";
import useAuthExpiration from "@/hooks/useAuthExpiration";
import ErrorPage from "@/pages/error/ErrorPage";

const AppRouter = () => {
  const routes: RouteObject[] = [
    // Authentication Routes
    {
      path: "/",
      element: <AuthRoute />,
      children: [
        {
          element: <BaseLayout />,
          children: authenticationRoutePaths,
        },
      ],
    },

    // Protected Routes (Regular users)
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppLayout />,
          children: protectedRoutePaths,
        },
      ],
    },

    // Super Admin Route — gated by SuperAdminRoute (403 → /dashboard)
    {
      element: <SuperAdminRoute />,
      children: [
        {
          element: <AppLayout />,
          children: superAdminRoutePaths,
        },
      ],
    },

    // Catch-all for undefined routes
    {
      path: "*",
      element: <ErrorPage isNotFoundPage />,
    },
  ];
  return useRoutes(routes);
};

const AppRoutes = () => {
  useAuthExpiration();

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
};

export default AppRoutes;
