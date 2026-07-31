"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowRight } from "lucide-react";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a] px-4">
            <div className="text-center max-w-md">
                {/* آیکون 404 */}
                <div className="relative mb-8">
                    <h1 className="text-9xl font-black text-gray-200 dark:text-gray-800 select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                            className="w-24 h-24 text-gray-400 dark:text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm3.75 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75z"
                            />
                        </svg>
                    </div>
                </div>

                {/* متن */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    صفحه مورد نظر یافت نشد
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    ممکن است این صفحه حذف شده باشد، نام آن تغییر کرده باشد، یا به طور موقت در دسترس نباشد.
                </p>

                {/* دکمه‌ها */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition"
                    >
                        <Home className="w-4 h-4" />
                        صفحه اصلی
                    </Link>

                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-[#1e293b] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-[#1e293b]/80 transition"
                    >
                        <ArrowRight className="w-4 h-4" />
                        بازگشت
                    </button>
                </div>
            </div>
        </div>
    );
}