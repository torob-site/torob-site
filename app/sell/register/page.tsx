"use client";

import Link from "next/link";
import { Store, Globe, ArrowLeft } from "lucide-react";

export default function RegisterShopPage() {
  return (
    <div dir="rtl" className="flex min-h-screen w-full justify-center bg-white">
      <main className="flex w-full max-w-[760px] flex-col items-center px-5 pb-16 pt-14">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#1e293b]">
            ثبت فروشگاه
          </h1>

          <p className="mt-3 text-[14px] text-[#64748b]">
            نوع فروشگاه خود را انتخاب کنید
          </p>
        </div>

        {/* Shop Types */}
        <div className="mt-10 grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Offline */}
          <Link
            href="/sell/register/offline"
            className="group relative flex min-h-[230px] flex-col rounded-2xl border border-[#e2e8f0] bg-white p-6 text-right transition-all duration-200 hover:-translate-y-1 hover:border-[#d73948] hover:shadow-[0_12px_30px_rgba(215,57,72,0.10)]"
          >
            {/* Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1f2] transition-transform duration-200 group-hover:scale-105">
              <Store className="h-8 w-8 text-[#d73948]" strokeWidth={1.8} />
            </div>

            {/* Content */}
            <div className="mt-6 flex-1">
              <h2 className="text-[17px] font-bold text-[#1e293b]">
                فروشگاه حضوری
              </h2>

              <p className="mt-2 max-w-[260px] text-[13px] leading-6 text-[#94a3b8]">
                فروشگاه فیزیکی با آدرس و موقعیت مکانی
              </p>
            </div>

            {/* Bottom */}
            <div className="mt-5 flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#d73948]">
                انتخاب فروشگاه حضوری
              </span>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff1f2] transition-all group-hover:bg-[#d73948]">
                <ArrowLeft
                  className="h-4 w-4 text-[#d73948] transition-colors group-hover:text-white"
                  strokeWidth={2}
                />
              </div>
            </div>
          </Link>

          {/* Online */}
          <Link
            href="/sell/register/online"
            className="group relative flex min-h-[230px] flex-col rounded-2xl border border-[#e2e8f0] bg-white p-6 text-right transition-all duration-200 hover:-translate-y-1 hover:border-[#3b82f6] hover:shadow-[0_12px_30px_rgba(59,130,246,0.10)]"
          >
            {/* Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eff6ff] transition-transform duration-200 group-hover:scale-105">
              <Globe className="h-8 w-8 text-[#3b82f6]" strokeWidth={1.8} />
            </div>

            {/* Content */}
            <div className="mt-6 flex-1">
              <h2 className="text-[17px] font-bold text-[#1e293b]">
                فروشگاه آنلاین
              </h2>

              <p className="mt-2 max-w-[260px] text-[13px] leading-6 text-[#94a3b8]">
                فروشگاه اینترنتی با وب‌سایت و دامنه اختصاصی
              </p>
            </div>

            {/* Bottom */}
            <div className="mt-5 flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#3b82f6]">
                انتخاب فروشگاه آنلاین
              </span>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eff6ff] transition-all group-hover:bg-[#3b82f6]">
                <ArrowLeft
                  className="h-4 w-4 text-[#3b82f6] transition-colors group-hover:text-white"
                  strokeWidth={2}
                />
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
