"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useGetCities,
  useGetAllBusinessTypes,
  useCreateShop,
} from "@/lib/apis";

export default function RegisterOfflinePage() {
  const [shopName, setShopName] = useState("");
  const [cityId, setCityId] = useState<number | null>(null);
  const [businessType, setBusinessType] = useState("");
  const [hasLicense, setHasLicense] = useState<boolean | null>(null);

  const { data: cities = [], isPending: loadingCities } = useGetCities();
  const { data: businessTypes = [], isPending: loadingBusinessTypes } =
    useGetAllBusinessTypes();

  const createShop = useCreateShop();

  // =====================================================
  // Can submit
  // =====================================================

  const canSubmit =
    shopName.trim().length > 0 &&
    cityId !== null &&
    businessType.trim().length > 0 &&
    hasLicense !== null;

  // =====================================================
  // Submit
  // =====================================================

  const handleSubmit = () => {
    if (!canSubmit || createShop.isPending) {
      return;
    }

    createShop.mutate({
      type: "OFFLINE_SHOP",

      shop_name: shopName.trim(),

      city_id: cityId!,

      business_type: businessType,

      has_license: hasLicense!,
    });
  };

  return (
    <div dir="rtl" className="flex min-h-screen w-full justify-center bg-white">
      <main className="flex w-full max-w-[480px] flex-col items-center px-5 pb-16 pt-10">
        {/* =====================================================
            Back
        ====================================================== */}

        <Link
          href="/sell/register"
          className="mb-6 flex w-full items-center gap-1 text-sm text-[#64748b] transition hover:text-[#d73948]"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت
        </Link>

        {/* =====================================================
            Title
        ====================================================== */}

        <h1 className="text-lg font-bold text-[#1e293b]">ثبت فروشگاه حضوری</h1>

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
              City (shadcn Select)
          ====================================================== */}

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-[#475569]">
              شهر <span className="text-[#d73948]">*</span>
            </label>

            {loadingCities ? (
              <div className="h-11 w-full animate-pulse rounded-lg bg-[#f1f5f9]" />
            ) : (
              <Select
                value={cityId !== null ? String(cityId) : undefined}
                onValueChange={(value) => setCityId(Number(value))}
              >
                <SelectTrigger className="h-11 w-full rounded-lg border-[#e2e8f0] bg-white px-4 text-[14px] text-[#1e293b] data-[placeholder]:text-[#cbd5e1] focus:border-[#d73948] focus:ring-1 focus:ring-[#d73948] focus-visible:ring-1 focus-visible:ring-[#d73948]">
                  <SelectValue placeholder="انتخاب شهر" />
                </SelectTrigger>

                <SelectContent position="popper" className="max-h-72">
                  {cities.map((city: any) => (
                    <SelectItem
                      key={city.id}
                      value={String(city.id)}
                      className="text-[14px]"
                    >
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* =====================================================
              Business Type (shadcn Select)
          ====================================================== */}

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-[#475569]">
              حوزه فعالیت <span className="text-[#d73948]">*</span>
            </label>

            {loadingBusinessTypes ? (
              <div className="h-11 w-full animate-pulse rounded-lg bg-[#f1f5f9]" />
            ) : (
              <Select value={businessType || undefined} onValueChange={setBusinessType}>
                <SelectTrigger className="h-11 w-full rounded-lg border-[#e2e8f0] bg-white px-4 text-[14px] text-[#1e293b] data-[placeholder]:text-[#cbd5e1] focus:border-[#d73948] focus:ring-1 focus:ring-[#d73948] focus-visible:ring-1 focus-visible:ring-[#d73948]">
                  <SelectValue placeholder="انتخاب حوزه فعالیت" />
                </SelectTrigger>

                <SelectContent position="popper" className="max-h-72">
                  {businessTypes.map((business: any) => (
                    <SelectItem
                      key={business.value}
                      value={business.value}
                      className="text-[14px]"
                    >
                      {business.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* =====================================================
              Has License
          ====================================================== */}

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-[#475569]">
              جواز کسب دارید؟ <span className="text-[#d73948]">*</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* Has license */}
              <button
                type="button"
                onClick={() => setHasLicense(true)}
                className={`relative flex h-11 items-center justify-center rounded-lg border text-[14px] font-medium transition ${
                  hasLicense === true
                    ? "border-[#d73948] bg-[#fff5f6] text-[#d73948]"
                    : "border-[#e2e8f0] bg-white text-[#475569] hover:border-[#cbd5e1]"
                }`}
              >
                {hasLicense === true && (
                  <Check className="absolute right-3 h-4 w-4" />
                )}

                <span>دارم</span>
              </button>

              {/* No license */}
              <button
                type="button"
                onClick={() => setHasLicense(false)}
                className={`relative flex h-11 items-center justify-center rounded-lg border text-[14px] font-medium transition ${
                  hasLicense === false
                    ? "border-[#d73948] bg-[#fff5f6] text-[#d73948]"
                    : "border-[#e2e8f0] bg-white text-[#475569] hover:border-[#cbd5e1]"
                }`}
              >
                {hasLicense === false && (
                  <Check className="absolute right-3 h-4 w-4" />
                )}

                <span>ندارم</span>
              </button>
            </div>
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
