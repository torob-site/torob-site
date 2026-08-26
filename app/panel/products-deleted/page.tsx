"use client";

import { ChevronRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RejectedProductsPage() {
    const router = useRouter();

    return (
        <div
            dir="rtl"
            className="
        min-h-screen
        w-full
        max-w-[700px]
        mx-auto
        bg-white
        border-x
        border-gray-200
      "
        >
            {/* ========================= */}
            {/* Header مخصوص این صفحه */}
            {/* ========================= */}

            <header
                className="
          h-[60px]
          w-full
          border-b
          border-gray-200
          bg-white
        "
            >
                <div
                    className="
            relative
            h-full
            flex
            items-center
            px-5
          "
                >
                    {/* عنوان + برگشت */}

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="
              absolute
              right-5
              flex
              items-center
              gap-1
              text-[14px]
              font-bold
              text-gray-900
            "
                    >
                        <ChevronRight className="h-5 w-5" />
                        <span>محصولات رد شده</span>
                    </button>
                </div>
            </header>

            {/* ========================= */}
            {/* محتوا */}
            {/* ========================= */}

            <main className="px-4 pt-2">
                {/* جستجو */}

                <div
                    className="
            relative
            w-full
            h-[52px]
            rounded-xl
            bg-gray-50
          "
                >
                    <input
                        type="text"
                        placeholder="نام کالا یا لینک ترب را وارد کنید"
                        className="
              h-full
              w-full
              rounded-xl
              bg-transparent
              pr-12
              pl-4
              outline-none
              text-[13px]
              text-gray-900
              placeholder:text-gray-500
            "
                    />

                    <Search
                        className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              h-7
              w-7
              text-gray-900
            "
                    />
                </div>
            </main>
        </div>
    );
}