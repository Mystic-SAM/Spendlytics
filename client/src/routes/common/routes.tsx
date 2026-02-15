import { AUTH_ROUTES } from "./routePath";
import SignUp from "@/pages/auth/SignUpPage";
import SignIn from "@/pages/auth/SignInPage";

export const authenticationRoutePaths = [
  { path: AUTH_ROUTES.SIGN_IN, element: <SignIn /> },
  { path: AUTH_ROUTES.SIGN_UP, element: <SignUp /> },
];