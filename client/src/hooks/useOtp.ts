import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { OTP_DIGITS, OTP_RESEND_COOLDOWN_SEC } from "@/constants/constants";
import { useSendOtpMutation } from "@/features/auth/authAPI";

interface UseOtpOptions {
  onSendSuccess?: () => void;
  onSendError?: (error: any) => void;
}

export const useOtp = (options?: UseOtpOptions) => {
  const [sendOtpMutation, { isLoading: isSendingOtp }] = useSendOtpMutation();

  const [otpSent, setOtpSent] = useState(false);
  const [otpValues, setOtpValues] = useState<string[]>(new Array(OTP_DIGITS).fill(""));
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(OTP_RESEND_COOLDOWN_SEC);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownTimer.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetOtpState = useCallback(() => {
    setOtpSent(false);
    setOtpValues(new Array(OTP_DIGITS).fill(""));
    setCooldown(0);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
  }, []);

  const sendOtp = async (email: string) => {
    try {
      await sendOtpMutation({ email }).unwrap();
      setOtpSent(true);
      setOtpValues(new Array(OTP_DIGITS).fill(""));
      startCooldown();
      toast.success("OTP sent! Check your inbox.");
      options?.onSendSuccess?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to send OTP. Please try again.");
      options?.onSendError?.(error);
    }
  };

  const isOtpComplete = otpValues.every((v) => v !== "");

  return {
    otpSent,
    otpValues,
    setOtpValues,
    cooldown,
    isSendingOtp,
    sendOtp,
    handleEditEmail: resetOtpState,
    resetOtpState,
    isOtpComplete,
  };
};
