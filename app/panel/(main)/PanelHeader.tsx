"use client";

import {
    ChevronDown,
    ChevronRight,
    Search,
    X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import StatusModal from "./StatusModal";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { usePatchShopStatus } from "@/lib/apis";

const pageTitles: Record<string, string> = {
    "/panel/account": "حساب کاربری",
    "/panel/instagram": "اتصال به اینستاگرام",
    "/panel/products": "محصولات",
    "/panel/transactions": "مالی",
    "/panel/support": "پشتیبانی",
};

export default function PanelHeader() {
    const [showStatus, setShowStatus] = useState(false);
    const [showShops, setShowShops] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    const pathname = usePathname();
    const router = useRouter();

    const {
        shops,
        currentShop,
        selectShop,
        isLoading,
    } = useCurrentShop();

    const patchShopStatus = usePatchShopStatus();

    const isHomePage = pathname === "/panel" || pathname === '/panel/reports';
    const isProductsPage = pathname === "/panel";
    const isPanelPage = pathname === "/panel";

    const pageTitle = pageTitles[pathname];
    const hasPageTitle = Boolean(pageTitle);

    const handleSelectShop = (shop: (typeof shops)[number]) => {
        selectShop(shop);
        setShowShops(false);
    };

    /**
     * تغییر وضعیت فروشگاه فعلی
     */
    const handleChangeStatus = (is_active: boolean) => {
        if (!currentShop?.id) {
            return;
        }

        setShowStatus(false);

        patchShopStatus.mutate({
            shop_id: currentShop.id,
            is_active,
        });
    };

    const isStatusUpdating = patchShopStatus.isPending;

    // باز کردن خودکار focus روی input
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    // هندل کردن جستجو
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // اگر در صفحه محصولات هستیم، از nuqs برای اضافه کردن به URL استفاده میکنیم
            if (isProductsPage) {
                const url = new URL(window.location.href);
                url.searchParams.set('q', searchQuery.trim());
                router.push(url.pathname + url.search);
            }
            setIsSearchOpen(false);
            setSearchQuery("");
        }
    };

    // بستن جستجو با دکمه ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isSearchOpen) {
                setIsSearchOpen(false);
                setSearchQuery("");
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isSearchOpen]);

    return (
        <>
            <header
                className="
                    sticky
                    top-0
                    z-50
                    h-[60px]
                    shrink-0
                    border-b
                    border-gray-200
                    bg-white
                    dark:border-gray-800
                    dark:bg-[#212b36]
                "
            >
                <div className="relative flex h-full items-center px-5">

                    {/* ================================= */}
                    {/* حالت عادی - وقتی جستجو باز نیست */}
                    {/* ================================= */}

                    {!isSearchOpen ? (
                        <>
                            {/* فروشگاه */}
                            <button
                                type="button"
                                onClick={() => setShowShops((prev) => !prev)}
                                disabled={isLoading || shops.length === 0}
                                className="
                                    absolute
                                    left-5
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    font-medium
                                    text-[#1e293b]
                                    dark:text-white
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >
                                <span>
                                    {isLoading
                                        ? "در حال بارگذاری..."
                                        : currentShop?.shop_name ??
                                        "فروشگاهی وجود ندارد"}
                                </span>

                                <ChevronDown
                                    className={`
                                        h-4
                                        w-4
                                        transition-transform
                                        duration-200
                                        ${showShops ? "rotate-180" : ""}
                                    `}
                                />
                            </button>

                            {/* لیست فروشگاه‌ها */}
                            {showShops && shops.length > 0 && (
                                <>
                                    <button
                                        type="button"
                                        aria-label="بستن لیست فروشگاه‌ها"
                                        onClick={() => setShowShops(false)}
                                        className="
                                            fixed
                                            inset-0
                                            z-40
                                            cursor-default
                                        "
                                    />

                                    <div
                                        className="
                                            absolute
                                            left-5
                                            top-[54px]
                                            z-50
                                            w-[220px]
                                            overflow-hidden
                                            rounded-xl
                                            border
                                            border-gray-200
                                            bg-white
                                            shadow-lg
                                            dark:border-gray-700
                                            dark:bg-[#212b36]
                                        "
                                    >
                                        <div className="max-h-[300px] overflow-y-auto p-1">
                                            {shops.map((shop) => {
                                                const isSelected =
                                                    shop.id === currentShop?.id;

                                                return (
                                                    <button
                                                        key={shop.id}
                                                        type="button"
                                                        onClick={() =>
                                                            handleSelectShop(shop)
                                                        }
                                                        className={`
                                                            flex
                                                            w-full
                                                            items-center
                                                            justify-between
                                                            rounded-lg
                                                            px-3
                                                            py-2.5
                                                            text-right
                                                            text-sm
                                                            transition
                                                            ${isSelected
                                                                ? "bg-gray-100 font-semibold dark:bg-gray-700"
                                                                : "hover:bg-gray-50 dark:hover:bg-gray-800"
                                                            }
                                                        `}
                                                    >
                                                        <span className="truncate">
                                                            {shop.shop_name}
                                                        </span>

                                                        {isSelected && (
                                                            <span className="mr-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* صفحه اصلی */}
                            {isHomePage && (
                                <div
                                    className="
                                        absolute
                                        right-5
                                        flex
                                        items-center
                                        gap-3
                                    "
                                >
                                    {isPanelPage && (

                                        <button
                                            type="button"
                                            onClick={() => setIsSearchOpen(true)}
                                            className="
                                            flex
                                            h-9
                                            w-9
                                            items-center
                                            justify-center
                                            text-[#1e293b]
                                            dark:text-white
                                            hover:bg-gray-100
                                            dark:hover:bg-gray-700
                                            rounded-lg
                                            transition
                                        "
                                        >
                                            <Search className="h-5 w-5" />
                                        </button>

                                    )}
                                    {currentShop && (
                                        <button
                                            type="button"
                                            onClick={() => setShowStatus(true)}
                                            disabled={isStatusUpdating}
                                            className="
                                                flex
                                                items-center
                                                gap-1
                                                text-sm
                                                font-medium
                                                text-[#1e293b]
                                                dark:text-white
                                                disabled:cursor-not-allowed
                                                disabled:opacity-60
                                            "
                                        >
                                            <span
                                                className={`
                                                    h-2.5
                                                    w-2.5
                                                    rounded-full
                                                    ${currentShop.is_active
                                                        ? "bg-green-500"
                                                        : "bg-red-500"
                                                    }
                                                `}
                                            />

                                            <span>
                                                {currentShop.is_active
                                                    ? "فعال"
                                                    : "غیرفعال (عدم نمایش محصولات)"}
                                            </span>

                                            <ChevronDown
                                                className={`
                                                    h-4
                                                    w-4
                                                    ${isStatusUpdating
                                                        ? "animate-spin"
                                                        : ""
                                                    }
                                                `}
                                            />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* صفحات داخلی */}
                            {!isHomePage && hasPageTitle && (
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="
                                        absolute
                                        right-5
                                        flex
                                        h-9
                                        items-center
                                        gap-1
                                        text-sm
                                        font-medium
                                        text-[#1e293b]
                                        dark:text-white
                                    "
                                >
                                    <ChevronRight className="h-5 w-5" />

                                    <span>{pageTitle}</span>
                                </button>
                            )}
                        </>
                    ) : (
                        /* ================================= */
                        /* حالت جستجو - فقط نوار جستجو نمایش داده میشه */
                        /* ================================= */
                        <form
                            onSubmit={handleSearch}
                            className="w-full flex items-center gap-2"
                        >
                            <div className="flex-1 relative">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="جستجوی محصول..."
                                    className="
                                        w-full
                                        h-10
                                        px-4
                                        pr-10
                                        text-sm
                                        border
                                        border-gray-300
                                        dark:border-gray-600
                                        rounded-lg
                                        bg-white
                                        dark:bg-[#1e293b]
                                        text-gray-900
                                        dark:text-white
                                        outline-none
                                        focus:border-blue-500
                                        focus:ring-1
                                        focus:ring-blue-500
                                        transition
                                    "
                                />
                                <Search
                                    className="
                                        absolute
                                        right-3
                                        top-1/2
                                        -translate-y-1/2
                                        h-4
                                        w-4
                                        text-gray-400
                                        dark:text-gray-500
                                    "
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsSearchOpen(false);
                                    setSearchQuery("");
                                }}
                                className="
                                    p-2
                                    text-gray-500
                                    hover:text-gray-700
                                    dark:text-gray-400
                                    dark:hover:text-gray-200
                                    rounded-lg
                                    hover:bg-gray-100
                                    dark:hover:bg-gray-700
                                    transition
                                "
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </form>
                    )}
                </div>
            </header>

            {/* ================================= */}
            {/* Modal وضعیت */}
            {/* ================================= */}

            {isHomePage && showStatus && currentShop && (
                <StatusModal
                    currentShop={currentShop}
                    isUpdating={isStatusUpdating}
                    onChangeStatus={handleChangeStatus}
                    onClose={() => setShowStatus(false)}
                />
            )}
        </>
    );
}