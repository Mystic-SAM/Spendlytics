import { AUTH_PAGE_TYPE } from "@/features/auth/authTypes";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "./routePath";
import AuthPage from "@/pages/auth/AuthPage";
import Dashboard from "@/pages/dashboard/DashboardPage";
import Transactions from "@/pages/transactions/transaction";
import ReportsPage from "@/pages/reports/ReportsPage";
import Settings from "@/pages/settings/SettingsPage";
import Account from "@/pages/settings/Account";
import Appearance from "@/pages/settings/Appearance";

export const authenticationRoutePaths = [
  {
    path: AUTH_ROUTES.SIGN_IN,
    element: <AuthPage type={AUTH_PAGE_TYPE.SIGN_IN} />,
  },
  {
    path: AUTH_ROUTES.SIGN_UP,
    element: <AuthPage type={AUTH_PAGE_TYPE.SIGN_UP} />,
  },
];

export const protectedRoutePaths = [
  { path: PROTECTED_ROUTES.DASHBOARD, element: <Dashboard /> },
  { path: PROTECTED_ROUTES.TRANSACTIONS, element: <Transactions /> },
  { path: PROTECTED_ROUTES.REPORTS, element: <ReportsPage /> },
  {
    path: PROTECTED_ROUTES.SETTINGS,
    element: <Settings />,
    children: [
      { index: true, element: <Account /> },
      { path: PROTECTED_ROUTES.SETTINGS_APPEARANCE, element: <Appearance /> },
    ]
  },
];
