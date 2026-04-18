import { useTypedSelector } from "@/app/hook";
import { Navigate, Outlet } from "react-router-dom";
import { PROTECTED_ROUTES } from "./common/routePath";

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

  return <Navigate to={PROTECTED_ROUTES.DASHBOARD} replace />;
};

export default SuperAdminRoute;
