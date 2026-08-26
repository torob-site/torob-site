"use client";

import {
    ArrowLeft,
    Check,
    Loader2,
    Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
    useGetBusinessTypes,
    useUpdateBusinessType,
} from "@/lib/apis";

interface BusinessType {
    value: string;
    label: string;
}

interface BusinessTypesResponse {
    business_types: BusinessType[];
    selected_business_type: string | null;
}

export default function BusinessTypePage() {
    const {
        data,
        isPending,
        isError,
    } = useGetBusinessTypes();

    const updateMutation = useUpdateBusinessType();

    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const businessTypes =
        (data as BusinessTypesResponse | undefined)?.business_types ?? [];

    const serverSelectedType =
        (data as BusinessTypesResponse | undefined)
            ?.selected_business_type ?? null;

    /*
     * مقدار انتخاب‌شده اولیه را از API می‌گیریم
     */
    useEffect(() => {
        if (serverSelectedType) {
            setSelectedType(serverSelectedType);
        }
    }, [serverSelectedType]);

    /*
     * فیلتر جستجو
     */
    const filteredTypes = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) {
            return businessTypes;
        }

        return businessTypes.filter((item) =>
            item.label.toLowerCase().includes(value)
        );
    }, [businessTypes, search]);

    /*
     * ثبت
     */
    const handleSubmit = () => {
        if (!selectedType || updateMutation.isPending) {
            return;
        }

        updateMutation.mutate(
            {
                business_type: selectedType,
            },
        );
    };

    /*
     * Loading دریافت اطلاعات
     */
    if (isPending) {
        return (
            <main
                dir="rtl"
                className="mx-auto w-full max-w-[700px] px-3 py-4"
            >
                <div
                    className="
                        flex
                        h-[60vh]
                        items-center
                        justify-center
                    "
                >
                    <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
                </div>
            </main>
        );
    }

    /*
     * Error
     */
    if (isError) {
        return (
            <main
                dir="rtl"
                className="mx-auto w-full max-w-[700px] px-3 py-4"
            >
                <div className="flex h-[60vh] items-center justify-center">
                    <p className="text-sm text-red-500">
                        دریافت اطلاعات با خطا مواجه شد.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main
            dir="rtl"
            className="
                mx-auto
                min-h-[calc(100vh-60px)]
                w-full
                max-w-[700px]
                bg-white
            "
        >

            {/* ================================= */}
            {/* توضیحات */}
            {/* ================================= */}

            <div className="px-5 pt-5">
                <p className="text-center text-sm text-gray-700">
                    انتخاب نوع کسب و کار باعث نمایش بهتر شما در نتایج خواهد شد
                </p>
            </div>

            {/* ================================= */}
            {/* Search */}
            {/* ================================= */}

            <div className="px-5 pt-5">
                <div
                    className="
                        flex
                        h-12
                        items-center
                        rounded-lg
                        bg-gray-100
                        px-3
                    "
                >
                    <Search className="h-5 w-5 shrink-0 text-gray-500" />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="جستجو بین انواع کسب و کار"
                        className="
                            mr-2
                            flex-1
                            bg-transparent
                            text-right
                            text-sm
                            text-gray-800
                            outline-none
                            placeholder:text-gray-500
                        "
                    />
                </div>
            </div>

            {/* ================================= */}
            {/* Business Types */}
            {/* ================================= */}

            <div className="space-y-2 px-5 pb-28 pt-6">
                {filteredTypes.map((item) => {
                    const isSelected = selectedType === item.value;

                    return (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() =>
                                setSelectedType(item.value)
                            }
                            disabled={updateMutation.isPending}
                            className={`
                                flex
                                h-13
                                w-full
                                items-center
                                justify-between
                                rounded-lg
                                border
                                px-4
                                text-right
                                text-sm
                                transition
                                disabled:cursor-not-allowed
                                disabled:opacity-60

                                ${isSelected
                                    ? `
                                            border-blue-500
                                            bg-blue-50
                                            text-gray-900
                                        `
                                    : `
                                            border-gray-200
                                            bg-white
                                            text-gray-800
                                            hover:bg-gray-50
                                        `
                                }
                            `}
                        >
                            <span>
                                {item.label}
                            </span>

                            <span
                                className={`
                                    flex
                                    h-5
                                    w-5
                                    items-center
                                    justify-center
                                    rounded-full
                                    border-2

                                    ${isSelected
                                        ? `
                                                border-blue-500
                                                bg-blue-500
                                            `
                                        : `
                                                border-gray-300
                                                bg-white
                                            `
                                    }
                                `}
                            >
                                {isSelected && (
                                    <span className="h-2 w-2 rounded-full bg-white" />
                                )}
                            </span>
                        </button>
                    );
                })}

                {filteredTypes.length === 0 && (
                    <div className="py-10 text-center">
                        <p className="text-sm text-gray-400">
                            موردی پیدا نشد
                        </p>
                    </div>
                )}
            </div>

            {/* ================================= */}
            {/* Bottom Button */}
            {/* ================================= */}

            <div
                className="
                    fixed
                    bottom-0
                    left-1/2
                    z-30
                    w-full
                    max-w-[700px]
                    -translate-x-1/2
                    border-t
                    border-gray-200
                    bg-white
                    px-5
                    py-4
                    shadow-[0_-4px_15px_rgba(0,0,0,0.08)]
                "
            >
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                        !selectedType ||
                        updateMutation.isPending
                    }
                    className="
                        flex
                        h-11
                        w-full
                        items-center
                        justify-center
                        rounded-lg
                        bg-blue-600
                        text-sm
                        font-medium
                        text-white
                        transition
                        hover:bg-blue-700
                        disabled:cursor-not-allowed
                        disabled:bg-gray-300
                    "
                >
                    {updateMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        "ثبت"
                    )}
                </button>
            </div>
        </main>
    );
}