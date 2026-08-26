"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { useCurrentShop } from "@/hooks/useCurrentShop";
import { useGetShopOwnerInfo, useUpdateOwnerInfo } from "@/lib/apis";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function OwnerInfo() {
  const router = useRouter();
  const { currentShop } = useCurrentShop();

  const { data, isPending, isError, refetch } = useGetShopOwnerInfo();
  const updateOwnerInfo = useUpdateOwnerInfo();

  const [form, setForm] = useState({
    national_code: "",
    first_name: "",
    last_name: "",
    birth_date: "",
    mobile_phone: "",
  });

  // بررسی کامل بودن اطلاعات
  const hasAllInfo =
    !!data?.national_code &&
    !!data?.first_name &&
    !!data?.last_name &&
    !!data?.birth_date &&
    !!data?.mobile_phone;

  // اگر اطلاعات کامل باشد، غیرفعال است
  const isFullyDisabled = hasAllInfo;

  useEffect(() => {
    if (data) {
      setForm({
        national_code: data.national_code ?? "",
        first_name: data.first_name ?? "",
        last_name: data.last_name ?? "",
        birth_date: data.birth_date
          ? new Date(data.birth_date).toISOString().split("T")[0]
          : "",
        mobile_phone: data.mobile_phone ?? "",
      });
    }
  }, [data]);

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit() {
    // اعتبارسنجی کامل - همه فیلدها الزامی هستند
    if (
      !form.national_code ||
      !form.first_name ||
      !form.last_name ||
      !form.birth_date ||
      !form.mobile_phone
    ) {
      toast.error("لطفاً تمام فیلدها را پر کنید");
    }

    await updateOwnerInfo.mutateAsync({
      national_code: form.national_code,
      first_name: form.first_name,
      last_name: form.last_name,
      birth_date: form.birth_date,
      mobile_phone: form.mobile_phone,
    });
  }

  if (isPending) {
    return (
      <main dir="rtl" className="mx-auto w-full max-w-[700px] px-6 py-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main dir="rtl" className="mx-auto w-full max-w-[700px] px-6 py-6">
        <p className="text-center text-sm text-red-500">
          دریافت مشخصات مالک با خطا مواجه شد.
        </p>
      </main>
    );
  }

  // نمایش دکمه ثبت فقط زمانی که اطلاعات کامل نباشد
  const showSubmitButton = !hasAllInfo;

  return (
    <main dir="rtl" className="mx-auto w-full max-w-[700px] px-6 py-6 pb-28">
      <div className="mb-5">
        <Label className="mb-2 block text-sm font-medium text-gray-800">
          کد ملی
        </Label>
        <Input
          value={form.national_code}
          disabled={isFullyDisabled}
          onChange={(e) => updateField("national_code", e.target.value)}
          placeholder="کد ملی را وارد کنید"
          className="h-11"
          dir="ltr"
        />
      </div>

      {/* نام */}
      <div className="mb-5">
        <Label className="mb-2 block text-sm font-medium text-gray-800">
          نام
        </Label>
        <Input
          value={form.first_name}
          disabled={isFullyDisabled}
          onChange={(e) => updateField("first_name", e.target.value)}
          placeholder="نام را وارد کنید"
          className="h-11"
        />
      </div>

      {/* نام خانوادگی */}
      <div className="mb-5">
        <Label className="mb-2 block text-sm font-medium text-gray-800">
          نام خانوادگی
        </Label>
        <Input
          value={form.last_name}
          disabled={isFullyDisabled}
          onChange={(e) => updateField("last_name", e.target.value)}
          placeholder="نام خانوادگی را وارد کنید"
          className="h-11"
        />
      </div>

      {/* تاریخ تولد */}
      <div className="mb-5">
        <Label className="mb-2 block text-sm font-medium text-gray-800">
          تاریخ تولد
        </Label>
        <Input
          type="date"
          value={form.birth_date}
          disabled={isFullyDisabled}
          onChange={(e) => updateField("birth_date", e.target.value)}
          className="h-11"
          dir="ltr"
        />
      </div>

      {/* شماره همراه */}
      <div className="mb-5">
        <Label className="mb-2 block text-sm font-medium text-gray-800">
          تلفن همراه مالک فروشگاه
        </Label>
        <Input
          value={form.mobile_phone}
          disabled={isFullyDisabled}
          onChange={(e) => updateField("mobile_phone", e.target.value)}
          placeholder="شماره همراه را وارد کنید"
          className="h-11"
          dir="ltr"
        />
      </div>

      {/* اطلاعیه */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
        <span>این مشخصات به مشتریان نمایش داده نخواهد شد.</span>
      </div>

      {/* دکمه ثبت - فقط زمانی که اطلاعات کامل نباشد */}
      {showSubmitButton && (
        <div
          className="
            fixed
            bottom-0
            left-1/2
            z-30
            w-full
            max-w-[700px]
            -translate-x-1/2
            border-t
            border-gray-200
            bg-white
            px-5
            py-4
            shadow-[0_-4px_15px_rgba(0,0,0,0.08)]
          "
        >
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              updateOwnerInfo.isPending ||
              !form.national_code ||
              !form.first_name ||
              !form.last_name ||
              !form.birth_date ||
              !form.mobile_phone
            }
            className="
              flex
              h-11
              w-full
              items-center
              justify-center
              rounded-lg
              bg-blue-600
              text-sm
              font-medium
              text-white
              transition
              hover:bg-blue-700
              disabled:cursor-not-allowed
              disabled:bg-gray-300
            "
          >
            {updateOwnerInfo.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "ثبت اطلاعات"
            )}
          </button>
        </div>
      )}
    </main>
  );
}
