"use client";

import { useGetMyShops } from "@/lib/apis";
import { Loader2 } from "lucide-react";

type Shop = {
  id: number;
  name: string;
  logo: string;
  type: string;
  is_active: boolean;
  access: string[];
  domain: string
};

type MyShopsResponse = {
  shops: Shop[];
};

export default function MyShops() {
  const {
    data,
    isPending,
    error,
  } = useGetMyShops() as {
    data: MyShopsResponse | undefined;
    isPending: boolean;
    error: unknown;
  };

  const shops = data ?? [];

  return (
    <main
      dir="rtl"
      className="mx-auto w-full max-w-[700px] px-4 py-5"
    >

      <h1 className="mb-5 text-base font-bold text-gray-900">
        فروشگاه‌های من
      </h1>


      {isPending && (
        <div className="flex min-h-[250px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}


      {!isPending && error && (
        <div className="py-10 text-center">
          <p className="text-sm text-red-500">
            دریافت فروشگاه‌ها با خطا مواجه شد
          </p>
        </div>
      )}


      {!isPending && !error && shops.length === 0 && (
        <div
          className="
            rounded-xl
            border
            border-gray-200
            bg-white
            px-4
            py-10
            text-center
          "
        >
          <p className="text-sm text-gray-500">
            فروشگاهی برای نمایش وجود ندارد
          </p>
        </div>
      )}


      {!isPending && !error && shops.length > 0 && (
        <div
          className="
            overflow-hidden
            rounded-xl
            border
            border-gray-200
            bg-white
          "
        >
          {shops.map((shop, index) => (
            <div
              key={shop.id}
              className={`
                flex
                min-h-[76px]
                items-center
                gap-4
                px-4
                py-3
                ${
                  index !== shops.length - 1
                    ? "border-b border-gray-300"
                    : ""
                }
              `}
            >
              {/* لوگو */}

              <div
                className="
                  h-11
                  w-11
                  shrink-0
                  overflow-hidden
                  rounded-lg
                  border
                  border-gray-100
                  bg-gray-50
                "
              >
                <img
                  src={shop.shop_logo}
                  alt={shop.shop_name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* اطلاعات فروشگاه */}

              <div className="min-w-0 flex-1">
                {/* نام */}

                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="
                      truncate
                      text-sm
                      font-medium
                      text-gray-800
                    "
                  >
                    {shop.shop_name}
                  </span>

                </div>

                {/* دسترسی‌ها */}

                <div className="flex flex-wrap items-center gap-1.5">
                  {shop.access.map((access) => (
                    <span
                      key={access}
                      className={`
                        rounded-full
                        px-2.5
                        py-1
                        text-[10px]
                        font-medium
                        ${
                          access === "صاحب امتیاز"
                            ? "bg-blue-50 text-blue-600"
                            : access === "ادمین"
                              ? "bg-orange-50 text-orange-600"
                              : "bg-gray-100 text-gray-600"
                        }
                      `}
                    >
                      {access}
                    </span>
                  ))}
                </div>
              </div>

              {/* دامنه */}

              <div className="hidden shrink-0 text-left sm:block">
                <span className="text-xs text-gray-400">
                  {shop.domain || ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
