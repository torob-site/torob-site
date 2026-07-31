"use client";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ChevronRight, X, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

const formSchema = z.object({
  code: z.string().length(6, "کد باید ۶ رقم باشد"),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  phone: string;
  onBack: () => void;
  onSuccess?: () => void;
  onClose?: () => void;
  onResend?: () => Promise<void>;
};

export default function OtpStep({
  phone,
  onBack,
  onSuccess,
  onClose,
  onResend,
}: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: "" },
  });

  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const codeValue = watch("code") || "";

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
    setCanResend(true);
  }, [timer]);

  const handleResend = useCallback(async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    try {
      await onResend?.();
      setTimer(120);
      setCanResend(false);
      setValue("code", "");
    } finally {
      setIsResending(false);
    }
  }, [canResend, isResending, onResend, setValue]);

  const onSubmit = async (data: FormValues) => {
    console.log({ phone, code: data.code });
    onSuccess?.();
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const isComplete = codeValue.length === 6;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[400px] mx-auto"
    >
      <div className="relative bg-white dark:bg-slate-950 rounded-3xl shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] dark:shadow-none border border-slate-100 dark:border-slate-800/60 overflow-hidden">
        
        {/* Header buttons */}
        <div className="flex items-center justify-between px-6 pt-6">
          <AnimatePresence>
            {onClose && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <X size={18} strokeWidth={2} />
              </motion.button>
            )}
          </AnimatePresence>

          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={onBack}
            className="flex items-center gap-1 text-[13px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors px-2 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ChevronRight size={15} />
            ویرایش شماره
          </motion.button>
        </div>

        <div className="px-8 pt-4 pb-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-10"
          >
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight leading-none">
              کد تأیید
            </h1>
            <p className="mt-3 text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed">
              کد ارسال‌شده به{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums" dir="ltr">
                {phone}
              </span>{" "}
              را وارد کنید.
            </p>
          </motion.div>

          {/* OTP */}
          <motion.form
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col items-center gap-4">
                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      if (value.length === 6) {
                        setTimeout(() => handleSubmit(onSubmit)(), 300);
                      }
                    }}
                  >
                    <InputOTPGroup dir="ltr" className="gap-3">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className={`
                            h-14 w-12 rounded-xl border-0 text-xl font-semibold 
                            bg-slate-50 dark:bg-slate-800/50 ring-1 ring-slate-200 dark:ring-slate-700 
                            transition-all duration-200 text-slate-900 dark:text-slate-100
                            focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:bg-white dark:focus:bg-slate-800 focus:scale-105
                            data-[active=true]:ring-slate-900 dark:data-[active=true]:ring-white data-[active=true]:bg-white dark:data-[active=true]:bg-slate-800
                            ${field.value[index] ? "bg-white dark:bg-slate-800 ring-slate-300 dark:ring-slate-600" : ""}
                          `}
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>

                  <AnimatePresence>
                    {errors.code && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-sm font-medium text-red-500 dark:text-red-400"
                      >
                        {errors.code.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              )}
            />

            {/* Timer */}
            <div className="flex justify-center">
              <AnimatePresence mode="wait">
                {canResend ? (
                  <motion.button
                    key="resend"
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <motion.span
                      animate={isResending ? { rotate: 360 } : {}}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      ↻
                    </motion.span>
                    {isResending ? "در حال ارسال..." : "ارسال مجدد کد"}
                  </motion.button>
                ) : (
                  <motion.div
                    key="timer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-[13px] text-slate-400 dark:text-slate-500 font-medium tabular-nums bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-lg"
                  >
                    <span>ارسال مجدد</span>
                    <motion.span
                      key={timer}
                      initial={{ opacity: 0.5, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-slate-700 dark:text-slate-300 font-bold"
                      dir="ltr"
                    >
                      {formatTime(timer)}
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <motion.div
              whileHover={isComplete ? { y: -1 } : {}}
              whileTap={isComplete ? { scale: 0.98 } : {}}
            >
              <Button
                type="submit"
                disabled={!isComplete || isSubmitting}
                className={`
                  w-full h-[52px] rounded-xl text-[15px] font-semibold transition-all duration-300
                  ${isComplete 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-lg shadow-slate-900/10 dark:shadow-white/10" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  }
                `}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="block w-4 h-4 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full"
                    />
                    در حال بررسی
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    تأیید و ورود
                    <ArrowLeft size={16} strokeWidth={2.5} />
                  </span>
                )}
              </Button>
            </motion.div>
          </motion.form>
        </div>
      </div>
    </motion.div>
  );
}