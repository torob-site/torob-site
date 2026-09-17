"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import PhoneStep from "@/components/phone-step";
import OtpStep from "@/components/otp-step";
import {
  useGetUser,
  usePostAuthSendCode,
  usePostAuthVerifyCode,
} from "@/lib/apis";

const OFFLINE_SHOPS_LOGO =
  "https://panel.torob.com/o/assets/images/offline-shops-logo.svg";

export default function PanelLoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");

  const sendCode = usePostAuthSendCode();
  const verifyCode = usePostAuthVerifyCode();

  // اگر از قبل لاگین است، مستقیم به پنل برود
  const { data: user } = useGetUser();
  useEffect(() => {
    if (user) {
      router.replace("/panel");
    }
  }, [user, router]);

  async function handlePhoneNext(phone: string) {
    try {
      await sendCode.mutateAsync({ phone });
      setPhone(phone);
      setStep("otp");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? "خطا در ارسال کد تأیید",
      );
    }
  }

  async function handleVerify(code: string) {
    try {
      await verifyCode.mutateAsync({ phone, code });
      toast.success("با موفقیت وارد شدید");
      router.replace("/panel");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? "کد تأیید نامعتبر است",
      );
    }
  }

  async function handleResend() {
    try {
      await sendCode.mutateAsync({ phone });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? "خطا در ارسال مجدد کد",
      );
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-white">
      <div className="mx-auto min-h-screen w-full max-w-[870px] border-x border-[#e5e7eb] bg-white">
        <div className="flex min-h-screen flex-col px-7 sm:px-10">
          <div className="flex flex-1 flex-col items-center pt-[96px]">
            {/* Logo */}

            <div className="flex h-[100px] w-[100px] items-center justify-center">
              <img
                src={OFFLINE_SHOPS_LOGO}
                alt="پنل فروشندگان حضوری ترب"
                className="h-[100px] w-[100px] object-contain"
              />
            </div>

            {/* Title */}

            <h1 className="mt-5 text-[20px] font-bold leading-8 text-[#202124]">
              پنل فروشندگان حضوری ترب
            </h1>

            {/* Form */}

            <div className="mt-[52px] w-full max-w-[816px]">
              {step === "phone" ? (
                <PhoneStep onNext={handlePhoneNext} />
              ) : (
                <OtpStep
                  phone={phone}
                  onBack={() => setStep("phone")}
                  onVerify={handleVerify}
                  onResend={handleResend}
                />
              )}
            </div>

            {/* Register */}

            <div className="mt-auto pb-[85px] pt-10 text-center text-[14px] text-[#202124]">
              <span>هنوز ثبت نام نکرده‌اید؟</span>

              <Link
                href="/sell/register"
                className="mr-1 font-bold text-[#3474dc] hover:underline"
              >
                همین حالا ثبت نام کنید!
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
