"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PhoneStep from "./phone-step";
import OtpStep from "./otp-step";


type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AuthModal({
  open,
  onOpenChange,
}: Props) {

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  function cancelCity() {
    onOpenChange(false);
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);

        if (!value) {
          setStep("phone");
          setPhone("");
        }
      }}

    >
      <DialogContent dir="rtl" className="sm:max-w-md [&>button]:hidden">

        <DialogHeader>
          <DialogTitle>
            {step === "phone"
              ? "ورود یا ثبت‌نام"
              : "تایید شماره"}
          </DialogTitle>
          <button
              onClick={cancelCity}
              className="rounded-full absolute left-2 p-1.5 top-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              aria-label="بستن"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
        </DialogHeader>

        {step === "phone" ? (
          <PhoneStep
            onNext={(phone) => {
              setPhone(phone);
              setStep("otp");
            }}
          />
        ) : (
          <OtpStep
            phone={phone}
            onBack={() => setStep("phone")}
          />
        )}

      </DialogContent>
    </Dialog>
  );
}