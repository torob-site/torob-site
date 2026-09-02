"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import {
    X,
    Check,
    ChevronDown,
    Home,
    Flag,
    Plus,
    BarChart3,
    MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type FilterKey =
    | "sort"
    | "registration_status"
    | "description";

type FilterOption = {
    label: string;
    value: string;
};

const filterOptions: Record<FilterKey, FilterOption[]> = {
    sort: [
        {
            label: "نام محصول",
            value: "name",
        },
        {
            label: "جدیدترین",
            value: "newest",
        },
        {
            label: "پربازدیدترین",
            value: "popular",
        },
        {
            label: "موجودی",
            value: "stock",
        },
        {
            label: "ناموجود",
            value: "out_of_stock",
        },
    ],

    registration_status: [
        {
            label: "گارانتی ثبت نشده",
            value: "not_registered",
        },
        {
            label: "گارانتی ثبت شده",
            value: "registered",
        },
    ],

    description: [
        {
            label: "بدون توضیحات",
            value: "false",
        },
        {
            label: "دارای توضیحات",
            value: "true",
        },
    ],
};

const footerItems = [
  {
    title: "خانه",
    href: "/panel",
    icon: Home,
  },
  {
    title: "گزارش",
    href: "/panel/reports",
    icon: Flag,
  },
  {
    title: "افزودن محصول",
    href: "/panel/add-product",
    icon: Plus,
    main: true,
  },
  {
    title: "آمار",
    href: "/panel/statistics",
    icon: BarChart3,
  },
  {
    title: "بیشتر",
    href: "/panel/more",
    icon: MoreHorizontal,
  },
];

export default function ProductFilters() {
    const pathname = usePathname();

    /*
     * فقط برای باز و بسته شدن Modal
     * وارد URL نمی‌شود
     */
    const [activeModal, setActiveModal] =
        useState<FilterKey | null>(null);

    /*
     * فیلترهای واقعی URL
     */

    const [sort, setSort] = useQueryState("sort", {
        defaultValue: "",
        clearOnDefault: true,
    });

    const [
        registrationStatus,
        setRegistrationStatus,
    ] = useQueryState("registration_status", {
        defaultValue: "",
        clearOnDefault: true,
    });

    const [
        descriptionStatus,
        setDescriptionStatus,
    ] = useQueryState("description", {
        defaultValue: "",
        clearOnDefault: true,
    });
    const closeModal = () => {
        setActiveModal(null);
    };

    /*
     * گرفتن مقدار فعلی هر فیلتر
     */

    const getSelectedValue = (
        key: FilterKey
    ): string => {
        switch (key) {
            case "sort":
                return sort;

            case "registration_status":
                return registrationStatus;

            case "description":
                return descriptionStatus;

            default:
                return "";
        }
    };

    /*
     * انتخاب یا حذف فیلتر
     *
     * اگر همان گزینه انتخاب شده باشد:
     * → حذف می‌شود
     * → Modal بسته می‌شود
     *
     * اگر گزینه جدید باشد:
     * → مقدار جدید ثبت می‌شود
     * → Modal بسته می‌شود
     */

    const handleSelect = async (
        key: FilterKey,
        value: string
    ) => {
        if (key === "sort") {
            const nextValue =
                sort === value ? "" : value;

            await setSort(nextValue);

            // چه انتخاب باشد چه حذف، Modal بسته شود
            setActiveModal(null);

            return;
        }

        if (key === "registration_status") {
            const nextValue =
                registrationStatus === value
                    ? ""
                    : value;

            await setRegistrationStatus(
                nextValue
            );

            // چه انتخاب باشد چه حذف، Modal بسته شود
            setActiveModal(null);

            return;
        }

        if (key === "description") {
            const nextValue =
                descriptionStatus === value
                    ? ""
                    : value;

            await setDescriptionStatus(
                nextValue
            );

            // چه انتخاب باشد چه حذف، Modal بسته شود
            setActiveModal(null);

            return;
        }
    };

    /*
     * عنوان Modal
     */

    const getModalTitle = () => {
        if (activeModal === "sort") {
            return "مرتب سازی";
        }

        if (
            activeModal ===
            "registration_status"
        ) {
            return "فیلتر وضعیت گارانتی";
        }

        if (
            activeModal ===
            "description"
        ) {
            return "فیلتر وضعیت توضیحات";
        }

        return "";
    };

    /*
     * گزینه‌های Modal
     */

    const currentOptions =
        activeModal
            ? filterOptions[activeModal]
            : [];

    /*
     * مقدار انتخاب‌شده
     */

    const currentValue =
        activeModal
            ? getSelectedValue(activeModal)
            : "";

    return (
        <>
            {/* ================================================= */}
            {/* FILTER BAR */}
            {/* ================================================= */}

            <div
                className="
                    fixed
                    bottom-[82px]
                    z-40
                    w-full
                    max-w-[700px]
                    border-t
                    border-gray-200
                    bg-white
                    dark:border-gray-800
                    dark:bg-[#212b36]
                "
            >
                <div
                    className="
                        flex
                        h-[48px]
                        items-center
                        justify-start
                        gap-5
                        px-4
                    "
                >
                    {/* مرتب سازی */}

                    <button
                        type="button"
                        onClick={() =>
                            setActiveModal("sort")
                        }
                        className="
                            flex
                            items-center
                            gap-1
                            text-sm
                            text-gray-800
                            dark:text-white
                        "
                    >
                        <span>
                            مرتب سازی
                        </span>

                        <ChevronDown className="h-4 w-4" />
                    </button>

                    {/* وضعیت گارانتی */}

                    <button
                        type="button"
                        onClick={() =>
                            setActiveModal(
                                "registration_status"
                            )
                        }
                        className="
                            flex
                            items-center
                            gap-1
                            text-sm
                            text-gray-800
                            dark:text-white
                        "
                    >
                        <span>
                            وضعیت ثبت گارانتی
                        </span>

                        <ChevronDown className="h-4 w-4" />
                    </button>

                    {/* وضعیت توضیحات */}

                    <button
                        type="button"
                        onClick={() =>
                            setActiveModal(
                                "description"
                            )
                        }
                        className="
                            flex
                            items-center
                            gap-1
                            text-sm
                            text-gray-800
                            dark:text-white
                        "
                    >
                        <span>
                            وضعیت توضیحات
                        </span>

                        <ChevronDown className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* ================================================= */}
            {/* OVERLAY فقط در محدوده 700px */}
            {/* ================================================= */}

            {activeModal !== null && (
                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        justify-center
                        pointer-events-auto
                    "
                    onClick={closeModal}
                >
                    <div
                        className="
                            h-full
                            w-full
                            max-w-[700px]
                            bg-black/60
                        "
                    />
                </div>
            )}

            {/* ================================================= */}
            {/* MODAL */}
            {/* ================================================= */}

            {activeModal !== null && (
                <div
                    dir="rtl"
                    className="
                        fixed
                        bottom-[82px]
                        left-1/2
                        z-[60]
                        w-full
                        max-w-[700px]
                        -translate-x-1/2
                        rounded-t-[18px]
                        bg-white
                        px-4
                        pt-4
                        pb-5
                        shadow-2xl
                    "
                    onClick={(event) =>
                        event.stopPropagation()
                    }
                >
                    {/* Header */}

                    <div
                        className="
                            mb-4
                            flex
                            items-center
                            justify-between
                        "
                    >
                        <button
                            type="button"
                            onClick={closeModal}
                            className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                            "
                            aria-label="بستن"
                        >
                            <X
                                className="
                                    h-5
                                    w-5
                                    text-gray-900
                                "
                            />
                        </button>

                        <h2
                            className="
                                text-[15px]
                                font-bold
                                text-gray-900
                            "
                        >
                            {getModalTitle()}
                        </h2>
                    </div>

                    {/* Options */}

                    <div className="space-y-2">
                        {currentOptions.map(
                            (option) => {
                                const selected =
                                    currentValue ===
                                    option.value;

                                return (
                                    <button
                                        key={
                                            option.value
                                        }
                                        type="button"
                                        onClick={() =>
                                            handleSelect(
                                                activeModal,
                                                option.value
                                            )
                                        }
                                        className="
                                            flex
                                            h-[52px]
                                            w-full
                                            items-center
                                            justify-between
                                            rounded-xl
                                            border
                                            border-gray-200
                                            bg-white
                                            px-4
                                            text-sm
                                            transition
                                            hover:bg-gray-50
                                        "
                                    >
                                        <span
                                            className="
                                                text-gray-900
                                            "
                                        >
                                            {
                                                option.label
                                            }
                                        </span>

                                        {selected && (
                                            <span
                                                className="
                                                    flex
                                                    h-5
                                                    w-5
                                                    items-center
                                                    justify-center
                                                    rounded
                                                    bg-blue-600
                                                    text-white
                                                "
                                            >
                                                <Check
                                                    className="
                                                        h-3.5
                                                        w-3.5
                                                    "
                                                />
                                            </span>
                                        )}
                                    </button>
                                );
                            }
                        )}
                    </div>
                </div>
            )}

            {/* ================================================= */}
            {/* FOOTER */}
            {/* ================================================= */}

            <footer
                dir="rtl"
                className="
                    fixed
                    bottom-0
                    left-1/2
                    z-[70]
                    h-[82px]
                    w-full
                    max-w-[700px]
                    -translate-x-1/2
                    border-t
                    border-gray-200
                    bg-white
                    dark:border-gray-800
                    dark:bg-[#212b36]
                "
            >
                <nav
                    className="
                        grid
                        h-full
                        grid-cols-5
                        px-4
                    "
                >
                    {footerItems.map(
                        (item) => {
                            const Icon =
                                item.icon;

                            const isActive =
                                item.href ===
                                    "/panel"
                                    ? pathname ===
                                    "/panel"
                                    : pathname.startsWith(
                                        item.href
                                    );

                            /*
                             * افزودن محصول
                             */

                            if (item.main) {
                                return (
                                    <Link
                                        key={
                                            item.href
                                        }
                                        href={
                                            item.href
                                        }
                                        className="
                                            flex
                                            h-full
                                            flex-col
                                            items-center
                                            justify-center
                                            gap-1
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                h-10
                                                w-10
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-blue-600
                                                text-white
                                            "
                                        >
                                            <Plus
                                                className="
                                                    h-6
                                                    w-6
                                                "
                                            />
                                        </div>

                                        <span
                                            className="
                                                text-xs
                                                font-medium
                                                text-blue-600
                                            "
                                        >
                                            {
                                                item.title
                                            }
                                        </span>
                                    </Link>
                                );
                            }

                            /*
                             * سایر آیتم‌ها
                             */

                            return (
                                <Link
                                    key={
                                        item.href
                                    }
                                    href={
                                        item.href
                                    }
                                    className="
                                        flex
                                        h-full
                                        flex-col
                                        items-center
                                        justify-center
                                        gap-1
                                    "
                                >
                                    <div
                                        className={`
                                            flex
                                            h-9
                                            w-14
                                            items-center
                                            justify-center
                                            rounded-full

                                            ${isActive
                                                ? "bg-blue-50 dark:bg-blue-950/40"
                                                : ""
                                            }
                                        `}
                                    >
                                        <Icon
                                            className={`
                                                h-5
                                                w-5

                                                ${isActive
                                                    ? "text-blue-600"
                                                    : "text-gray-500 dark:text-gray-400"
                                                }
                                            `}
                                        />
                                    </div>

                                    <span
                                        className={`
                                            text-xs

                                            ${isActive
                                                ? "font-semibold text-blue-600"
                                                : "text-gray-500 dark:text-gray-400"
                                            }
                                        `}
                                    >
                                        {
                                            item.title
                                        }
                                    </span>
                                </Link>
                            );
                        }
                    )}
                </nav>
            </footer>
        </>
    );
}