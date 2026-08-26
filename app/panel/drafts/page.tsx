"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DraftsPage() {
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
            {/* Header */}
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
            flex
            h-full
            items-center
            px-5
          "
                >
                    {/* عنوان + بازگشت */}

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
                        <span>پیش‌نویس‌ها</span>
                    </button>
                </div>
            </header>

            {/* ========================= */}
            {/* محتوا */}
            {/* ========================= */}

            <main className="w-full">
                {/* فعلاً خالی */}
            </main>
        </div>
    );
}