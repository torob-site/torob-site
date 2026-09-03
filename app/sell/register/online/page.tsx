"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";

import { useCreateShop } from "@/lib/apis";

export default function RegisterOnlinePage() {
  const [shopName, setShopName] = useState("");
  const [domain, setDomain] = useState("");

  const createShop = useCreateShop();

  // Both fields are required
  const canSubmit = shopName.trim().length > 0 && domain.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit || createShop.isPending) return;

    createShop.mutate({
      type: "ONLINE_SHOP",
      shop_name: shopName.trim(),
      domain: domain.trim(),
    });
  };

  return (
    <div dir="rtl" className="flex min-h-screen w-full justify-center bg-white">
      <main className="flex w-full max-w-[480px] flex-col items-center px-5 pb-16 pt-10">
        {/* Back */}
        <Link
          href="/sell/register"
          className="mb-6 flex w-full items-center gap-1 self-start text-sm text-[#64748b] transition hover:text-[#d73948]"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت
        </Link>

        {/* Title */}
        <h1 className="text-lg font-bold text-[#1e293b]">ثبت فروشگاه آنلاین</h1>

        <div className="mt-8 flex w-full flex-col gap-5">
          {/* =====================================================
              Shop Name
          ====================================================== */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-[#475569]">
              نام فروشگاه <span className="text-[#d73948]">*</span>
            </label>

            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="نام فروشگاه خود را وارد کنید"
              className="h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-4 text-[14px] text-[#1e293b] outline-none transition placeholder:text-[#cbd5e1] focus:border-[#d73948] focus:ring-1 focus:ring-[#d73948]"
            />
          </div>

          {/* =====================================================
              Domain
          ====================================================== */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-[#475569]">
              آدرس وب‌سایت <span className="text-[#d73948]">*</span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                }}
                placeholder="مثال: example.com"
                dir="ltr"
                className="h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-4 pr-11 text-[14px] text-[#1e293b] outline-none transition placeholder:text-[#cbd5e1] focus:border-[#d73948] focus:ring-1 focus:ring-[#d73948]"
              />

              <Globe className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
            </div>

            <p className="text-[11px] text-[#94a3b8]">
              دامنه فروشگاه خود را بدون http یا https وارد کنید.
            </p>
          </div>

          {/* =====================================================
              Submit
          ====================================================== */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || createShop.isPending}
            className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-[#d73948] text-[15px] font-bold text-white transition hover:bg-[#c62d3a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createShop.isPending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "ثبت فروشگاه"
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
