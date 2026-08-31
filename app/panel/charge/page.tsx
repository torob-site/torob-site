"use client";

import { useState } from "react";
import { ArrowRight, Check, ChevronRight, CircleCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatPriceNumber as formatPrice } from "@/lib/format";

const amounts = [
    50_000,
    100_000,
    200_000,
    300_000,
    400_000,
    500_000,
    1_000_000,
    2_000_000,
    3_000_000,
    5_000_000,
    10_000_000,
    20_000_000,
    30_000_000,
    50_000_000,
];



export default function IncreaseBalancePage() {
    const router = useRouter();
    const [selectedAmount, setSelectedAmount] = useState<number | null>(
        200_000,
    );

    return (
        <main
            dir="rtl"
            className="
                min-h-screen
                w-full
                bg-white
                pb-36
                text-gray-900
            "
        >
            <div className="mx-auto w-full max-w-[700px]">
                {/* Header */}
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
                            <span>افزایش موجودی</span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <section className="px-4 pt-7">
                    <h2
                        className="
                            mb-5
                            text-center
                            text-[15px]
                            font-bold
                            text-gray-900
                        "
                    >
                        مبلغ شارژ مدنظرتان را از بین گزینه‌های زیر انتخاب کنید!
                    </h2>

                    {/* Amounts */}
                    <div className="space-y-2">
                        {amounts.map((amount) => {
                            const isSelected = selectedAmount === amount;

                            return (
                                <button
                                    key={amount}
                                    type="button"
                                    onClick={() =>
                                        setSelectedAmount(amount)
                                    }
                                    className={`
                                        relative
                                        flex
                                        h-[52px]
                                        w-full
                                        items-center
                                        justify-between
                                        rounded-lg
                                        border
                                        px-4
                                        text-right
                                        transition-all
                                        ${isSelected
                                            ? "border-blue-500 bg-white"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                        }
                                    `}
                                >
                                    {/* مبلغ */}
                                    <span
                                        className="
                                            text-[14px]
                                            font-medium
                                            text-gray-800
                                        "
                                    >
                                        {formatPrice(amount)} تومان
                                    </span>

                                    {/* Checkbox */}
                                    <span
                                        className={`
                                            flex
                                            h-5
                                            w-5
                                            items-center
                                            justify-center
                                            rounded
                                            transition-all
                                            ${isSelected
                                                ? "bg-blue-600 text-white"
                                                : "border border-gray-300 bg-white"
                                            }
                                        `}
                                    >
                                        {isSelected && (
                                            <Check
                                                className="h-3.5 w-3.5"
                                                strokeWidth={3}
                                            />
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Information / Tax */}
                    <div className="mt-5 space-y-3 px-1 pb-5">
                        <div className="flex items-center gap-2">
                            <CircleCheck
                                className="
                                    h-5
                                    w-5
                                    shrink-0
                                    text-green-500
                                "
                                strokeWidth={2}
                            />

                            <span
                                className="
                                    text-[12px]
                                    text-gray-400
                                "
                            >
                                مبالغ پرداختی به علاوه ۱۰ درصد مالیات می‌شوند.
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <CircleCheck
                                className="
                                    h-5
                                    w-5
                                    shrink-0
                                    text-green-500
                                "
                                strokeWidth={2}
                            />

                            <span
                                className="
                                    text-[12px]
                                    text-gray-400
                                "
                            >
                                اطلاعات شما برای اداره مالیات ارسال نمی‌شود.
                            </span>
                        </div>
                    </div>
                </section>
            </div>


            {/* Bottom Payment */}
            <div
                className="
        fixed
        bottom-0
        left-1/2
        z-40
        w-full
        max-w-[700px]
        -translate-x-1/2
        border
        border-gray-200
        rounded-tr-4xl
        rounded-tl-4xl
        bg-white
        px-4
        py-4
        shadow-[0_-20px_15px_rgba(0,0,0,0.06)]
    "
            >
                <button
                    type="button"
                    disabled={selectedAmount === null}
                    className="
            h-11
            w-full
            rounded-lg
            bg-blue-600
            text-[14px]
            font-bold
            text-white
            transition
            hover:bg-blue-700
            active:scale-[0.99]
            disabled:cursor-not-allowed
            disabled:opacity-50
        "
                    onClick={() => {
                        console.log("selected amount:", selectedAmount);
                    }}
                >
                    پرداخت
                </button>
            </div>

        </main>
    );
}