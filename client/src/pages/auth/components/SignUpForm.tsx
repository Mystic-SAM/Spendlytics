import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_ROUTES } from "@/routes/common/routePath";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRegisterMutation } from "@/features/auth/authAPI";
import { toast } from "sonner";
import GithubIcon from "@/assets/Icons/GithubIcon";
import { cn } from "@/lib/utils";
import { signUpSchema } from "@/validators/authValidators";
import type { ComponentPropsWithoutRef } from "react";
import OTPInput from "@/components/OTPInput";
import { GITHUB_LOGIN_ENABLED, OTP_DIGITS } from "@/constants/constants";
import { useOtp } from "@/hooks/useOtp";

type FormValues = z.infer<typeof signUpSchema>;

const SignUpForm = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"form">) => {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const {
    otpSent,
    otpValues,
    setOtpValues,
    cooldown,
    isSendingOtp,
    sendOtp,
    handleEditEmail,
    resetOtpState,
    isOtpComplete,
  } = useOtp();

  const form = useForm<FormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      otp: "",
    },
  });

  // Sync OTP input array → form field value
  useEffect(() => {
    form.setValue("otp", otpValues.join(""), { shouldValidate: otpSent });
  }, [otpValues, otpSent, form]);

  const handleSendOtp = async () => {
    // Validate email before sending
    const isEmailValid = await form.trigger("email");
    if (!isEmailValid) return;

    const email = form.getValues("email");
    await sendOtp(email);
  };

  const onSubmit = (values: FormValues) => {
    register(values)
      .unwrap()
      .then(() => {
        form.reset();
        resetOtpState();
        toast.success("Sign up successful");
        navigate(AUTH_ROUTES.SIGN_IN);
      })
      .catch((error) => {
        console.log(error);
        toast.error(error?.data?.message || "Failed to sign up");
      });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Sign up to Spendlytics</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Fill information below to sign up
          </p>
        </div>

        <div className="grid gap-6">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder="john.doe@example.com"
                      disabled={otpSent}
                      {...field}
                    />
                  </FormControl>
                  {otpSent && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleEditEmail}
                      className="shrink-0"
                    >
                      Edit
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="*******" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* OTP Section — shown after OTP is sent */}
          {otpSent && (
            <FormField
              control={form.control}
              name="otp"
              render={() => (
                <FormItem>
                  <FormLabel>Enter OTP</FormLabel>
                  <FormControl>
                    <OTPInput
                      noOfDigits={OTP_DIGITS}
                      value={otpValues}
                      onChange={setOtpValues}
                    />
                  </FormControl>
                  <FormMessage />
                  {/* Resend OTP */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={cooldown > 0 || isSendingOtp}
                      onClick={handleSendOtp}
                      className="w-full"
                    >
                      {isSendingOtp ? (
                        <><Loader className="h-3 w-3 animate-spin mr-1" /> Resending…</>
                      ) : cooldown > 0 ? (
                        `Resend OTP in ${cooldown}s`
                      ) : (
                        "Resend OTP"
                      )}
                    </Button>
                  </div>
                </FormItem>
              )}
            />
          )}

          {/* Primary Action Button */}
          {!otpSent ? (
            <Button
              type="button"
              className="w-full"
              disabled={isSendingOtp || !form.watch("email")}
              onClick={handleSendOtp}
            >
              {isSendingOtp && <Loader className="h-4 w-4 animate-spin mr-2" />}
              Send OTP
            </Button>
          ) : (
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isOtpComplete}
            >
              {isLoading && <Loader className="h-4 w-4 animate-spin mr-2" />}
              Verify OTP & Sign Up
            </Button>
          )}
          {
            GITHUB_LOGIN_ENABLED && (
              <>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-[var(--bg-color)] dark:bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => toast.info("GitHub sign up not implemented yet!")}
                >
                  <GithubIcon />
                  Sign up with GitHub
                </Button>
              </>
            )
          }
        </div>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link
            to={AUTH_ROUTES.SIGN_IN}
            className="underline underline-offset-4"
          >
            Sign in
          </Link>
        </div>
      </form>
    </Form>
  );
};

export default SignUpForm;
