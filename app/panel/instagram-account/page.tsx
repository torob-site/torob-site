'use client'
import InstagramComponent from "@/components/instagram";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function InstagramPage() {
        const router = useRouter();
    return <>
        <header
            className="
                sticky
                top-0
                z-50
                h-[60px]
                w-full
                border-b
                border-gray-200
                bg-white
                dark:border-gray-800
                dark:bg-[#212b36]
            "
        >
            <div
                className="
                    relative
                    mx-auto
                    flex
                    h-full
                    w-full
                    max-w-[700px]
                    items-center
                    justify-center
                    px-5
                "
            >
                {/* عنوان وسط */}
                <h1
                    className="
                        text-sm
                        font-semibold
                        text-[#1e293b]
                        dark:text-white
                    "
                >
                    اتصال به اینستاگرام
                </h1>

                {/* دکمه بازگشت سمت راست */}
                <button
                    type="button"
                    onClick={() => router.back()}
                    aria-label="بازگشت"
                    className="
                        absolute
                        right-5
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        text-[#1e293b]
                        transition
                        hover:bg-gray-100
                        dark:text-white
                        dark:hover:bg-gray-800
                    "
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </header>
        <InstagramComponent />
    </>
}