import Logo from "@/components/ui/Logo/Logo";
import dashboardImg from "../../assets/images/dashboard_.png";
import dashboardImgDark from "../../assets/images/dashboard_dark.png";
import SignInForm from "./components/SignInForm";
import SignUpForm from "./components/SignUpForm";
import { useTheme } from "@/context/ThemeProvider";
import { AUTH_PAGE_TYPE, type AuthPageType } from "@/features/auth/authTypes";

interface AuthPageProps {
  type: AuthPageType;
}

const AuthPage = ({ type }: AuthPageProps) => {
  const { theme } = useTheme();

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 md:pt-6">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo url="/" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {type === AUTH_PAGE_TYPE.SIGN_IN ? <SignInForm /> : <SignUpForm />}
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block -mt-3">
        <div className="absolute inset-0 flex flex-col items-end justify-end pt-8 pl-8">
          <div className="w-full max-w-3xl mx-0 pr-5">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Hi, I'm your personal finance app, Spendlytics!
            </h1>
            <p className="mt-4 text-gray-600 dark:text-muted-foreground">
              Spendlytics provides insights, monthly reports, CSV import,
              recurring transaction. 🚀
            </p>
          </div>
          <div className="relative max-w-3xl h-full w-full overflow-hidden mt-3">
            <img
              src={theme === "light" ? dashboardImg : dashboardImgDark}
              alt="Dashboard"
              className="absolute top-0 left-0 w-full h-full"
              style={{
                objectPosition: "left top",
                transformOrigin: "left top",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
