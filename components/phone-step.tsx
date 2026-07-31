"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { X, ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/, "شماره معتبر نیست"),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  onNext: (phone: string) => void;
  onClose?: () => void;
};

export default function PhoneStep({ onNext, onClose }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { phone: "" },
  });

  const inputRef = useRef<HTMLInputElement | null>(null);
  const phoneValue = watch("phone") || "";
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFocus("phone"), 300);
    return () => clearTimeout(t);
  }, [setFocus]);

  const onSubmit = (data: FormValues) => onNext(data.phone);

  const isValid = /^09\d{9}$/.test(phoneValue);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[400px] mx-auto"
    >
      <div className="relative bg-white dark:bg-slate-950 rounded-3xl shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] dark:shadow-none border border-slate-100 dark:border-slate-800/60 overflow-hidden">
        
        {/* Close */}
        <AnimatePresence>
          {onClose && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={onClose}
              className="absolute left-6 top-6 z-20 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <X size={18} strokeWidth={2} />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="px-8 pt-16 pb-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
            className="mb-10"
          >
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight leading-none">
              ورود به حساب
            </h1>
            <p className="mt-3 text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed">
              شماره موبایل خود را وارد کنید تا کد تأیید ارسال شود.
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Input */}
            <div className="relative">
              <label className="block text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                شماره موبایل
              </label>
              <div className="relative">
                <Input
                  dir="ltr"
                  type="tel"
                  inputMode="tel"
                  maxLength={11}
                  placeholder="0912 345 6789"
                  {...register("phone", {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, "");
                    },
                  })}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  ref={(e) => {
                    register("phone").ref(e);
                    inputRef.current = e;
                  }}
                  className={`
                    h-14 text-lg tracking-[0.08em] text-center bg-slate-50 dark:bg-slate-800/50 border-0 rounded-xl
                    ring-1 ring-slate-200 dark:ring-slate-700 transition-all duration-300
                    placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:tracking-normal
                    text-slate-900 dark:text-slate-100
                    focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:bg-white dark:focus:bg-slate-800
                    ${isValid && !errors.phone ? "ring-emerald-400/60 dark:ring-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100" : ""}
                    ${errors.phone ? "ring-red-400 dark:ring-red-500/50 bg-red-50/30 dark:bg-red-900/20" : ""}
                  `}
                />
                
                {/* Status indicator */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AnimatePresence mode="wait">
                    {isValid && !errors.phone && (
                      <motion.svg
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="w-5 h-5 text-emerald-500 dark:text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <AnimatePresence>
                {errors.phone && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 text-sm text-red-500 dark:text-red-400 font-medium"
                  >
                    {errors.phone.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <motion.div
              whileHover={isValid ? { y: -1 } : {}}
              whileTap={isValid ? { scale: 0.98 } : {}}
            >
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className={`
                  w-full h-[52px] rounded-xl text-[15px] font-semibold transition-all duration-300
                  ${isValid 
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
                    در حال ارسال
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    ادامه
                    <ArrowLeft size={16} strokeWidth={2.5} />
                  </span>
                )}
              </Button>
            </motion.div>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-[13px] text-slate-400 dark:text-slate-500 leading-relaxed"
            >
              با ورود، 
              <button type="button" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white underline underline-offset-2 transition-colors mx-1">
                قوانین و مقررات
              </button>
              را می‌پذیرم.
            </motion.p>
          </motion.form>
        </div>

        {/* Decorative subtle line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-slate-100 dark:bg-slate-800 rounded-full" />
      </div>
    </motion.div>
  );
}