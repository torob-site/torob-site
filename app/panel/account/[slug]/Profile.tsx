"use client";

import { useGetShopProfile } from "@/lib/apis";
import { CheckCircle2, Upload } from "lucide-react";
import Image from "next/image";

export default function ShopNameLogoPage() {
  const { data, isPending, isError } = useGetShopProfile();

  if (isPending) {
    return (
      <main dir="rtl" className="mx-auto w-full max-w-[700px] px-6 py-6">
        <div className="space-y-6 animate-pulse">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-11 w-full rounded-lg bg-gray-200" />
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-32 w-full rounded-lg bg-gray-200" />
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main dir="rtl" className="mx-auto w-full max-w-[700px] px-6 py-6">
        <p className="text-center text-sm text-red-500">
          دریافت اطلاعات فروشگاه با خطا مواجه شد.
        </p>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="mx-auto min-h-[calc(100vh-120px)] w-full max-w-[700px] bg-white"
    >
      {/* Content */}
      <div className="px-6 py-6">
        {/* نام فروشگاه */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-800">
            نام فروشگاه
          </label>

          <div className="flex h-11 items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
            <span className="text-sm text-gray-500">{data.shop_name}</span>
          </div>
        </div>

        {/* لوگو */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-800">
              لوگو فروشگاه
            </label>

            <span className="text-xs text-gray-500">اختیاری</span>
          </div>

          {data.shop_logo ? (
            <div className="rounded-lg bg-gray-100 p-4">
              <div className="flex justify-center">
                <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-white">
                  <Image
                    src={data.shop_logo}
                    alt="لوگو فروشگاه"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-5 w-5 shrink-0" />

                <span>لوگوی فعلی فروشگاه</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-10">
              <button
                className="
                  inline-flex items-center gap-2
                  px-6 py-2.5
                  bg-blue-500 hover:bg-blue-600
                  text-white text-sm font-medium
                  rounded-xl
                  transition
                  shadow-lg shadow-blue-500/20
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <Upload className="h-4 w-4" />
                انتخاب فایل
              </button>
            </div>
          )}
        </div>

        {/* توضیح */}
        <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />

          <p>اطلاعات فعلی فروشگاه در این بخش نمایش داده می‌شود.</p>
        </div>
      </div>
    </main>
  );
}
