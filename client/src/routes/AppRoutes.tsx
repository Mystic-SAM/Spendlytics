import { BrowserRouter, useRoutes, type RouteObject } from "react-router-dom";
import AuthRoute from "./AuthRoute";
import { authenticationRoutePaths, protectedRoutePaths } from "./common/routes";
import BaseLayout from "@/layouts/BaseLayout";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "@/layouts/AppLayout";
import useAuthExpiration from "@/hooks/useAuthExpiration";

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

    // Protected Routes
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppLayout />,
          children: protectedRoutePaths,
        },
      ],
    },

    // Catch-all for undefined routes
    {
      path: "*",
      element: <>404</>,
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
