import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppDispatch, useTypedSelector } from "@/app/hook";
import { Loader } from "lucide-react";
import { useUpdateUserMutation } from "@/features/user/userAPI";
import { updateCredentials } from "@/features/auth/authSlice";
import { accountFormSchema } from "@/validators/userValidators";
import OTPInput from "@/components/OTPInput";
import { OTP_DIGITS } from "@/constants/constants";
import { useOtp } from "@/hooks/useOtp";
import type { UpdateUserPayload } from "@/features/user/userTypes";

type AccountFormValues = z.infer<typeof accountFormSchema>;

const AccountForm = () => {
  const dispatch = useAppDispatch();
  const { user } = useTypedSelector((state) => state.auth);

  const [updateUserMutation, { isLoading }] = useUpdateUserMutation();

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

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const watchedName = form.watch("name");
  const watchedEmail = form.watch("email");

  const isNameModified = (watchedName || "") !== (user?.name || "");
  const isEmailModified = (watchedEmail || "") !== (user?.email || "");
  const isModified = isNameModified || isEmailModified;

  // Reset OTP state whenever the email is changed back to original
  useEffect(() => {
    if (!isEmailModified) {
      resetOtpState();
    }
  }, [isEmailModified, resetOtpState]);

  const handleSendOtp = async () => {
    const isEmailValid = await form.trigger("email");
    if (!isEmailValid) return;

    const email = form.getValues("email");
    if (!email) return;

    await sendOtp(email);
  };

  // Submit is allowed only when:
  // - something is modified AND
  // - if email is modified, OTP must be complete
  const canSubmit = isModified && (!isEmailModified || isOtpComplete);

  const onSubmit = (values: AccountFormValues) => {
    if (isLoading || !canSubmit) return;

    const payload: UpdateUserPayload = {};
    if (isNameModified && values.name) payload.name = values.name;
    if (isEmailModified && values.email) {
      payload.email = values.email;
      payload.otp = otpValues.join("");
    }

    updateUserMutation(payload)
      .unwrap()
      .then((response) => {
        dispatch(
          updateCredentials({
            user: {
              name: response.data.name,
              email: response.data.email,
            },
          })
        );
        // Reset OTP state after success
        resetOtpState();
        toast.success("Account updated successfully");
      })
      .catch((error) => {
        toast.error(error?.data?.message || "Failed to update account");
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-[500px]">
        <div className="flex flex-col items-start space-y-4">
          <FormLabel>Profile Picture</FormLabel>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.profilePicture || ""} />
              <AvatarFallback className="text-2xl">
                {form.watch("name")?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
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
                    type="email"
                    placeholder="Your email"
                    disabled={otpSent}
                    {...field}
                  />
                </FormControl>
                {isEmailModified && !otpSent && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSendingOtp || !watchedEmail}
                    onClick={handleSendOtp}
                    className="shrink-0"
                  >
                    {isSendingOtp ? (
                      <><Loader className="h-4 w-4 animate-spin mr-1" /> Sending…</>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                )}
                {isEmailModified && otpSent && (
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

        {/* OTP Section — shown after OTP is sent for email change */}
        {otpSent && isEmailModified && (
          <div className="space-y-2">
            <FormLabel>Enter OTP</FormLabel>
            <OTPInput
              noOfDigits={OTP_DIGITS}
              value={otpValues}
              onChange={setOtpValues}
            />
            {/* Resend OTP */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                disabled={cooldown > 0 || isSendingOtp}
                onClick={handleSendOtp}
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
          </div>
        )}

        <Button disabled={isLoading || !canSubmit} type="submit">
          {isLoading && <Loader className="h-4 w-4 animate-spin mr-2" />}
          Update Account
        </Button>
      </form>
    </Form>
  );
};

export default AccountForm;