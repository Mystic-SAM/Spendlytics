import { useTypedSelector } from "@/app/hook";
import { Outlet } from "react-router-dom";
import ErrorPage from "@/pages/error/ErrorPage";

/**
 * Route guard for super-admin-only pages.
 *
 * Requires:
 *   1. A valid access token (authenticated user)
 *   2. `isSuperAdmin === true` on the current user object
 */
const SuperAdminRoute = () => {
  const { accessToken, user } = useTypedSelector((state) => state.auth);

  if (accessToken && user?.isSuperAdmin) return <Outlet />;

  return <ErrorPage isNotFoundPage />;
};

export default SuperAdminRoute;
