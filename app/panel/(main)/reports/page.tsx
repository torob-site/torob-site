"use client";

import { useState } from "react";
import {
    Check,
    X,
    Activity,
    CheckCheck,
} from "lucide-react";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { axiosClient } from "@/lib/axios";
import { Switch } from "@/components/ui/switch";

interface ReportReason {
    id: number;
    title: string;
    type: string;
    report_type: string | null;
    needs_description: boolean;
}

interface ReportProduct {
    id: number;
    name: string;
}

interface Report {
    id: number;
    description: string | null;
    price_at_report_time: number;
    status: "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED";
    created_at: string;
    updated_at: string;
    product?: ReportProduct | null;
    reason?: ReportReason | null;
}

interface ReportsResponse {
    reports: Report[];
}

function formatPrice(value: number) {
    return new Intl.NumberFormat("fa-IR").format(value);
}

async function getReports(shopId: number) {
    const { data } = await axiosClient.get<ReportsResponse>(
        `/panel/shops/${shopId}/reports`,
    );

    return data;
}

async function updateReport(
    shopId: number,
    reportId: number,
    payload: {
        action: "APPROVE" | "REJECT";
        new_price?: number;
    },
) {
    const { data } = await axiosClient.patch(
        `/panel/shops/${shopId}/reports/${reportId}`,
        payload,
    );

    return data;
}

export default function ReportsPage() {
    const { currentShop } = useCurrentShop();
    const queryClient = useQueryClient();

    const [selectedReport, setSelectedReport] =
        useState<Report | null>(null);

    const [newPrice, setNewPrice] = useState("");

    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["shop-reports", currentShop?.id],

        queryFn: async () => {
            if (!currentShop?.id) {
                throw new Error("shop id not found");
            }

            return getReports(currentShop.id);
        },

        enabled: !!currentShop?.id,
    });

    const reportMutation = useMutation({
        mutationFn: async ({
            reportId,
            action,
            new_price,
        }: {
            reportId: number;
            action: "APPROVE" | "REJECT";
            new_price?: number;
        }) => {
            if (!currentShop?.id) {
                throw new Error("shop id not found");
            }

            return updateReport(
                currentShop.id,
                reportId,
                {
                    action,
                    new_price,
                },
            );
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["shop-reports", currentShop?.id],
            });

            setSelectedReport(null);
            setNewPrice("");
        },
    });

    const handleApprove = (report: Report) => {
        if (
            report.reason?.report_type ===
            "PRICE_CHANGE_AFTER_ORDER"
        ) {
            setSelectedReport(report);

            setNewPrice(
                String(report.price_at_report_time),
            );

            return;
        }

        reportMutation.mutate({
            reportId: report.id,
            action: "APPROVE",
        });
    };

    const handleReject = (report: Report) => {
        setSelectedReport(null);
        setNewPrice("");

        reportMutation.mutate({
            reportId: report.id,
            action: "REJECT",
        });
    };

    const handleSubmitPrice = () => {
        if (!selectedReport) {
            return;
        }

        const numericPrice = Number(
            newPrice.replace(/[^\d]/g, ""),
        );

        if (!numericPrice || numericPrice <= 0) {
            return;
        }

        reportMutation.mutate({
            reportId: selectedReport.id,
            action: "APPROVE",
            new_price: numericPrice,
        });
    };

    const reports = data?.reports ?? [];

    const pendingReports = reports.filter(
        (report) => report.status === "PENDING",
    );

    const reviewedReports = reports.filter(
        (report) =>
            report.status === "REVIEWED" ||
            report.status === "RESOLVED" ||
            report.status === "REJECTED",
    );

    if (isLoading) {
        return (
            <main
                dir="rtl"
                className="mx-auto w-full max-w-[700px] px-4 py-5"
            >
                <div className="space-y-4">
                    <div className="h-6 w-40 animate-pulse rounded bg-gray-100" />
                    <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
                    <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
                </div>
            </main>
        );
    }

    if (isError) {
        return (
            <main
                dir="rtl"
                className="mx-auto w-full max-w-[700px] px-4 py-5"
            >
                <div className="rounded-xl bg-red-50 px-4 py-5 text-center">
                    <span className="text-[13px] text-red-600">
                        دریافت گزارش‌ها با خطا مواجه شد.
                    </span>
                </div>
            </main>
        );
    }

    return (
        <>
            <main
                dir="rtl"
                className={`
                    mx-auto
                    w-full
                    max-w-[700px]
                    px-4
                    py-5
                    ${selectedReport ? "pb-40" : "pb-8"}
                `}
            >

                <div className="mb-6 space-y-6">


                    <div
                        className="
            flex
            items-center
            justify-between
            rounded-xl
            border
            border-[#f2f2f2]
            bg-[#f9fafb]
            px-3
            py-3
        "
                    >
                        <p className="text-[13px] font-bold text-gray-900">
                            ارسال پیامک در صورت ایجاد گزارش جدید
                        </p>

                        <Switch
                            dir="ltr"
                            size="default"
                            className="
        border-2
        border-gray-300
        bg-gray-100

        data-checked:border-blue-500
        data-checked:bg-blue-50

        [&_[data-slot=switch-thumb]]:!h-3
        [&_[data-slot=switch-thumb]]:!w-3

        [&_[data-slot=switch-thumb]]:!bg-gray-400
        data-checked:[&_[data-slot=switch-thumb]]:!bg-blue-500
    "
                        />
                    </div>

                    {/* معتبر بودن قیمت و موجودی */}

                    <div
                        className="
            flex
            items-center
            justify-between
            rounded-xl
            border
            border-[#f2f2f2]
            bg-[#f9fafb]
            px-3
            py-3
        "
                    >
                        <p className="text-[13px] font-bold text-gray-900">
                            قیمت و موجودی من معتبر است
                        </p>

                        <Switch
                            dir="ltr"
                            size="default"
                            className="
        border-2
        border-gray-300
        bg-gray-100

        data-checked:border-blue-500
        data-checked:bg-blue-50

        [&_[data-slot=switch-thumb]]:!h-3
        [&_[data-slot=switch-thumb]]:!w-3

        [&_[data-slot=switch-thumb]]:!bg-gray-400
        data-checked:[&_[data-slot=switch-thumb]]:!bg-blue-500
    "
                        />
                    </div>

                </div>

                {/* ================================
                    گزارش‌های نیازمند بررسی
                ================================= */}

                {pendingReports.length > 0 && (
                    <section>
                        <div className="mb-3 flex items-center gap-2">
                            <Activity
                                className="h-5 w-5 text-orange-500"
                                strokeWidth={2}
                            />

                            <h2 className="text-[14px] font-bold text-gray-900">
                                گزارشات نیازمند بررسی
                            </h2>
                        </div>

                        <div className="mb-3 h-px bg-gray-200" />

                        <div>
                            {pendingReports.map((report) => {
                                const isPriceReport =
                                    report.reason?.report_type ===
                                    "PRICE_CHANGE_AFTER_ORDER";

                                const isSelected =
                                    selectedReport?.id === report.id;

                                return (
                                    <div
                                        key={report.id}
                                        className="border-b border-gray-200 pb-3 pt-3"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="
                                                    flex
                                                    h-[52px]
                                                    w-[40px]
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    overflow-hidden
                                                    rounded-md
                                                    bg-gray-100
                                                "
                                            >
                                                <div className="h-10 w-5 rounded-sm bg-gray-800" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="text-[13px] leading-6 text-gray-800">
                                                    {report.product?.name ||
                                                        "محصول بدون نام"}
                                                </p>

                                                <p className="mt-1 text-[13px] font-bold text-gray-900">
                                                    {formatPrice(
                                                        report.price_at_report_time,
                                                    )}{" "}
                                                    تومان
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 rounded-xl bg-gray-50 px-3 py-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-[12px] font-medium text-gray-800">
                                                    {isPriceReport
                                                        ? "آیا قیمت این محصول نیاز به اصلاح دارد؟"
                                                        : report.reason?.title ||
                                                        "آیا این گزارش نیاز به اصلاح دارد؟"}
                                                </p>

                                                <div className="flex shrink-0 items-center gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            reportMutation.isPending
                                                        }
                                                        onClick={() =>
                                                            handleReject(report)
                                                        }
                                                        className="
                                                            flex
                                                            h-9
                                                            w-9
                                                            items-center
                                                            justify-center
                                                            rounded-lg
                                                            bg-gray-800
                                                            text-white
                                                            transition
                                                            hover:bg-gray-900
                                                            disabled:opacity-50
                                                        "
                                                    >
                                                        <X className="h-5 w-5" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            reportMutation.isPending
                                                        }
                                                        onClick={() =>
                                                            handleApprove(report)
                                                        }
                                                        className={`
                                                            flex
                                                            h-9
                                                            w-9
                                                            items-center
                                                            justify-center
                                                            rounded-lg
                                                            text-white
                                                            transition
                                                            disabled:opacity-50
                                                            ${isSelected
                                                                ? "bg-blue-700"
                                                                : "bg-blue-600 hover:bg-blue-700"
                                                            }
                                                        `}
                                                    >
                                                        <Check className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {isSelected &&
                                                isPriceReport && (
                                                    <div className="mt-2 rounded-lg bg-red-50 px-3 py-2.5 text-center">
                                                        <span className="text-[12px] font-medium text-red-500">
                                                            قیمت/موجودی نامعتبر
                                                        </span>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ================================
                    گزارش‌های بررسی شده
                ================================= */}

                <section className="mt-7">
                    <div className="mb-3 flex items-center gap-2">
                        <CheckCheck
                            className="h-5 w-5 text-green-500"
                            strokeWidth={2}
                        />

                        <h2 className="text-[14px] font-bold text-gray-900">
                            گزارشات بررسی شده
                        </h2>
                    </div>

                    <div className="mb-1 h-px bg-gray-200" />

                    {reviewedReports.length === 0 ? (
                        <div className="py-8 text-center">
                            <span className="text-[12px] text-gray-400">
                                گزارشی بررسی نشده است.
                            </span>
                        </div>
                    ) : (
                        <div>
                            {reviewedReports.map((report) => (
                                <div
                                    key={report.id}
                                    className="
                                        flex
                                        items-start
                                        gap-3
                                        border-b
                                        border-gray-200
                                        py-4
                                    "
                                >
                                    <div
                                        className="
                                            flex
                                            h-[48px]
                                            w-[38px]
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-md
                                            bg-gray-100
                                        "
                                    >
                                        <div className="h-9 w-5 rounded-sm bg-gray-800" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-[13px] leading-6 text-gray-800">
                                            {report.product?.name ||
                                                "محصول بدون نام"}
                                        </p>

                                        <div className="mt-2">
                                            {report.status === "RESOLVED" ||
                                                report.status === "REVIEWED" ? (
                                                <span
                                                    className="
                                                        inline-flex
                                                        rounded-lg
                                                        bg-green-50
                                                        px-3
                                                        py-1.5
                                                        text-[11px]
                                                        font-medium
                                                        text-green-600
                                                    "
                                                >
                                                    در حال به‌روزرسانی
                                                </span>
                                            ) : (
                                                <span
                                                    className="
                                                        inline-flex
                                                        rounded-lg
                                                        bg-red-50
                                                        px-3
                                                        py-1.5
                                                        text-[11px]
                                                        font-medium
                                                        text-red-600
                                                    "
                                                >
                                                    رد شده
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* ================================
                PRICE FOOTER
            ================================= */}

            {selectedReport &&
                selectedReport.reason?.report_type ===
                "PRICE_CHANGE_AFTER_ORDER" && (
                    <div
                        dir="rtl"
                        className="
                            fixed
                            inset-x-0
                            bottom-[82px]
                            z-40
                        "
                    >
                        <div
                            className="
                                mx-auto
                                w-full
                                max-w-[700px]
                                border
                                border-gray-200
                                bg-white
                                px-4
                                py-4
                                shadow-[0_-6px_20px_rgba(0,0,0,0.08)]
                            "
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className="
                                        flex
                                        h-11
                                        flex-1
                                        items-center
                                        rounded-lg
                                        border
                                        border-gray-200
                                        bg-gray-50
                                        px-3
                                        focus-within:border-blue-500
                                        focus-within:bg-white
                                    "
                                >
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={newPrice}
                                        onChange={(event) => {
                                            setNewPrice(
                                                event.target.value.replace(
                                                    /[^\d]/g,
                                                    "",
                                                ),
                                            );
                                        }}
                                        placeholder="قیمت جدید"
                                        className="
                                            min-w-0
                                            flex-1
                                            bg-transparent
                                            text-[13px]
                                            text-gray-900
                                            outline-none
                                            placeholder:text-gray-400
                                        "
                                    />

                                    <span className="mr-2 text-[11px] text-gray-400">
                                        تومان
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    disabled={
                                        !newPrice ||
                                        reportMutation.isPending
                                    }
                                    onClick={handleSubmitPrice}
                                    className="
                                        h-11
                                        min-w-[90px]
                                        rounded-lg
                                        bg-blue-600
                                        px-4
                                        text-[13px]
                                        font-bold
                                        text-white
                                        transition
                                        hover:bg-blue-700
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    {reportMutation.isPending
                                        ? "در حال ثبت..."
                                        : "ثبت"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedReport(null);
                                        setNewPrice("");
                                    }}
                                    className="
                                        h-11
                                        min-w-[90px]
                                        rounded-lg
                                        border
                                        border-gray-200
                                        bg-white
                                        px-4
                                        text-[13px]
                                        font-bold
                                        text-gray-700
                                        transition
                                        hover:bg-gray-50
                                    "
                                >
                                    انصراف
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </>
    );
}