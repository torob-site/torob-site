"use client";

import {
    ChevronDown,
    ChevronLeft,
    DollarSign,
    Lightbulb,
    FilePen,
    PackageX,
    User,
    MessageCircle,
    LifeBuoy,
    LogOut,
    X,
} from "lucide-react";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function MoreMenu() {
    const pathname = usePathname();

    return (
        <MoreMenuContent key={pathname} />
    );
}

function MoreMenuContent() {
    const router = useRouter();
    // همیشه با ورود به کامپوننت، بسته است
    const [openSections, setOpenSections] = useState<string[]>([]);
    const [logoutOpen, setLogoutOpen] = useState(false);

    const toggleSection = (id: string) => {
        setOpenSections((prev) => {
            if (prev.includes(id)) {
                return prev.filter((item) => item !== id);
            }

            return [...prev, id];
        });
    };

    const isOpen = (id: string) => {
        return openSections.includes(id);
    };

    const handleLogout = () => {
        localStorage.removeItem('token')
        router.push('/panel/login')
        setLogoutOpen(false);
    };

    return (
        <>
            <main
                dir="rtl"
                className="w-full max-w-[700px] mx-auto px-4 py-6"
            >
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">

                    {/* ================= مالی ================= */}

                    <div>
                        <button
                            type="button"
                            onClick={() => toggleSection("financial")}
                            className="
              w-full
              h-12
              px-4
              flex
              items-center
              justify-between
              border-b
              border-gray-200
            "
                        >
                            <div className="flex items-center gap-3">
                                <DollarSign className="h-5 w-5" />

                                <span className="text-sm font-bold">
                                    مالی
                                </span>
                            </div>

                            {isOpen("financial") ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                                <ChevronLeft className="h-4 w-4 text-gray-500" />
                            )}
                        </button>

                        {isOpen("financial") && (
                            <div className="px-3 py-2 space-y-1">
                                <Link
                                    href="/panel/transactions"
                                    className="
                  block
                  rounded-lg
                  bg-gray-50
                  px-4
                  py-3
                  text-sm
                "
                                >
                                    صورتحساب‌ها
                                </Link>

                                <Link
                                    href="#"
                                    className="
                  block
                  rounded-lg
                  bg-gray-50
                  px-4
                  py-3
                  text-sm
                "
                                >
                                    مشخصات فاکتور رسمی
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* ================= مشاور فروش ================= */}

                    <Link
                        href="#"
                        className="
            h-12
            px-4
            flex
            items-center
            justify-between
            border-b
            border-gray-200
          "
                    >
                        <div className="flex items-center gap-3">
                            <Lightbulb className="h-5 w-5" />

                            <span className="text-sm font-bold">
                                مشاور فروش
                            </span>
                        </div>

                        <ChevronLeft className="h-4 w-4 text-gray-500" />
                    </Link>

                    {/* ================= پیش‌نویس‌ها ================= */}

                    <Link
                        href="/panel/drafts"
                        className="
            h-12
            px-4
            flex
            items-center
            justify-between
            border-b
            border-gray-200
          "
                    >
                        <div className="flex items-center gap-3">
                            <FilePen className="h-5 w-5" />

                            <span className="text-sm font-bold">
                                پیش‌نویس‌ها
                            </span>
                        </div>

                        <ChevronLeft className="h-4 w-4 text-gray-500" />
                    </Link>

                    {/* ================= اینستاگرام ================= */}

                    <Link
                        href="/panel/instagram-account"
                        className="
            h-12
            px-4
            flex
            items-center
            justify-between
            border-b
            border-gray-200
          "
                    >
                        <div className="flex items-center gap-3">
                            <PackageX className="h-5 w-5" />

                            <span className="text-sm font-bold">
                                اتصال حساب اینستاگرام
                            </span>
                        </div>

                        <ChevronLeft className="h-4 w-4 text-gray-500" />
                    </Link>

                    {/* ================= محصولات رد شده ================= */}

                    <Link
                        href="/panel/products-deleted"
                        className="
            h-12
            px-4
            flex
            items-center
            justify-between
            border-b
            border-gray-200
          "
                    >
                        <div className="flex items-center gap-3">
                            <PackageX className="h-5 w-5" />

                            <span className="text-sm font-bold">
                                محصولات رد شده
                            </span>
                        </div>

                        <ChevronLeft className="h-4 w-4 text-gray-500" />
                    </Link>

                    {/* ================= حساب من ================= */}

                    <Link
                        href="/panel/account"
                        className="
            h-12
            px-4
            flex
            items-center
            justify-between
            border-b
            border-gray-200
          "
                    >
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5" />

                            <span className="text-sm font-bold">
                                حساب من
                            </span>
                        </div>

                        <ChevronLeft className="h-4 w-4 text-gray-500" />
                    </Link>

                    {/* ================= پشتیبانی ================= */}

                    <Link
                        href="/panel/support"
                        className="
            h-12
            px-4
            flex
            items-center
            justify-between
            border-b
            border-gray-200
          "
                    >
                        <div className="flex items-center gap-3">
                            <MessageCircle className="h-5 w-5" />

                            <span className="text-sm font-bold">
                                پشتیبانی
                            </span>
                        </div>

                        <ChevronLeft className="h-4 w-4 text-gray-500" />
                    </Link>

                    {/* ================= راهنما ================= */}

                    <div>
                        <button
                            type="button"
                            onClick={() => toggleSection("help")}
                            className="
              w-full
              h-12
              px-4
              flex
              items-center
              justify-between
              border-b
              border-gray-200
            "
                        >
                            <div className="flex items-center gap-3">
                                <LifeBuoy className="h-5 w-5" />

                                <span className="text-sm font-bold">
                                    راهنما
                                </span>
                            </div>

                            {isOpen("help") ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                                <ChevronLeft className="h-4 w-4 text-gray-500" />
                            )}
                        </button>

                        {isOpen("help") && (
                            <div className="px-3 py-2 space-y-1">
                                <Link
                                    href="#"
                                    className="block rounded-lg bg-gray-50 px-4 py-3 text-sm"
                                >
                                    شرایط همکاری
                                </Link>

                                <Link
                                    href="#"
                                    className="block rounded-lg bg-gray-50 px-4 py-3 text-sm"
                                >
                                    تعرفه خدمات
                                </Link>

                                <Link
                                    href="#"
                                    className="block rounded-lg bg-gray-50 px-4 py-3 text-sm"
                                >
                                    پرسش‌های متداول
                                </Link>

                                <Link
                                    href="#"
                                    className="block rounded-lg bg-gray-50 px-4 py-3 text-sm"
                                >
                                    ویدیوهای آموزشی
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* ================= خروج ================= */}

                    <button
                        type="button"
                        onClick={() => setLogoutOpen(true)}
                        className="w-full h-12 px-5 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut className="w-6 h-6" />

                            <span className="font-bold text-sm">
                                خروج
                            </span>
                        </div>

                        <ChevronLeft className="w-5 h-5 text-gray-500" />
                    </button>

                </div>
            </main>
            {logoutOpen && (
                <div className="fixed inset-0 z-[100] flex justify-center">
                    {/* محدوده اصلی 700px */}
                    <div className="relative w-full max-w-[700px] h-full">

                        {/* Overlay فقط داخل 700px */}
                        <div
                            className="absolute inset-0 bg-black/60"
                            onClick={() => setLogoutOpen(false)}
                        />

                        {/* Modal */}
                        <div className="absolute bottom-0 left-0 w-full bg-white rounded-t-2xl px-6 py-5">

                            {/* دکمه بستن */}
                            <button
                                type="button"
                                onClick={() => setLogoutOpen(false)}
                                className="absolute top-5 left-5 text-gray-500"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* آیکون */}
                            <div className="flex justify-center mb-3">
                                <LogOut className="w-8 h-8 text-black" />
                            </div>

                            {/* عنوان */}
                            <h2 className="text-center text-base font-bold">
                                خروج از حساب کاربری
                            </h2>

                            {/* توضیح */}
                            <p className="text-center text-sm text-gray-700 mt-3">
                                آیا می‌خواهید از حساب کاربری خود خارج شوید؟
                            </p>

                            {/* خروج */}
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full mt-5 rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white"
                            >
                                خروج
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}