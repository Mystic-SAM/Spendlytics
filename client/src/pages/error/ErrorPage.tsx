import { Button } from "@/components/ui/button";
import { PROTECTED_ROUTES } from "@/routes/common/routePath";
import { AlertTriangle, ArrowLeft, Home, FileQuestion } from "lucide-react";
import { useNavigate } from "react-router-dom";

type GenericErrorProps = {
  errorTitle?: string;
  errorMessage?: string;
  isNotFoundPage?: false;
};

type NotFoundErrorProps = {
  errorTitle?: never;
  errorMessage?: never;
  isNotFoundPage: true;
};

export type ErrorPageProps = GenericErrorProps | NotFoundErrorProps;

const ErrorPage = ({
  errorTitle,
  errorMessage,
  isNotFoundPage = false,
}: ErrorPageProps) => {
  const navigate = useNavigate();

  const title = errorTitle || (isNotFoundPage ? "Page Not Found" : "Something went wrong!");
  const message = errorMessage || (isNotFoundPage 
    ? "Oops! It seems you've wandered into unknown territory. The page you're looking for doesn't exist or has been moved." 
    : "An unexpected error has occurred. Please try again later.");
  
  const Icon = isNotFoundPage ? FileQuestion : AlertTriangle;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="flex flex-col items-center space-y-6 max-w-md text-center">
        <div className="rounded-full bg-destructive/10 p-6 shadow-sm border border-destructive/20">
          <Icon className="w-24 h-24 text-destructive" strokeWidth={1.5} />
        </div>
        
        <div className="space-y-3">
          {isNotFoundPage && (
            <h1 className="text-6xl font-extrabold tracking-tight lg:text-7xl text-primary drop-shadow-sm">
              404
            </h1>
          )}
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full justify-center">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center gap-2 hover:bg-muted font-medium transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </Button>
          <Button 
            size="lg" 
            onClick={() => navigate(PROTECTED_ROUTES.DASHBOARD, { replace: true })}
            className="w-full sm:w-auto flex items-center gap-2 shadow-md hover:shadow-lg transition-all font-medium"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
