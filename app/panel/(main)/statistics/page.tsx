"use client";

import { StatisticsRange, useGetShopStatistics } from "@/lib/apis";
import { useState } from "react";

import {
    BarChart,
    Bar,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";


const tabs: {
    label: string;
    value: StatisticsRange;
}[] = [
    {
        label: "۲۴ ساعت",
        value: "24h",
    },
    {
        label: "۷ روز",
        value: "7d",
    },
    {
        label: "۳۰ روز",
        value: "30d",
    },
];


function toPersianNumber(value: number) {
    return new Intl.NumberFormat("fa-IR").format(value);
}


function formatDate(
    date: {
        year: number;
        month: number;
        day: number;
    },
) {
    return `${toPersianNumber(date.year)}/${toPersianNumber(
        date.month,
    )}/${toPersianNumber(date.day)}`;
}


export default function StatisticsPage() {
    const [range, setRange] =
        useState<StatisticsRange>("30d");

    const {
        data,
        isLoading,
        isFetching,
        isError,
    } = useGetShopStatistics(range);


    /*
     * ============================
     * Loading
     * ============================
     */

    if (isLoading) {
        return (
            <main
                dir="rtl"
                className="w-full max-w-[700px] mx-auto px-4 py-6"
            >
                <div className="space-y-5 animate-pulse">

                    <div className="h-8 w-32 bg-gray-100 rounded-lg" />

                    <div className="h-[70px] bg-gray-50 rounded-xl" />

                    <div className="h-[280px] bg-gray-50 rounded-xl" />

                    <div className="h-24 bg-gray-50 rounded-xl" />

                    <div className="h-24 bg-gray-50 rounded-xl" />

                </div>
            </main>
        );
    }


    /*
     * ============================
     * Error
     * ============================
     */

    if (isError || !data) {
        return (
            <main
                dir="rtl"
                className="w-full max-w-[700px] mx-auto px-4 py-6"
            >
                <div className="flex min-h-[300px] items-center justify-center">
                    <p className="text-sm text-red-500">
                        دریافت اطلاعات آمار با خطا مواجه شد.
                    </p>
                </div>
            </main>
        );
    }


    /*
     * ============================
     * Data
     * ============================
     */

    const {
        period,
        summary,
        chart,
    } = data;


    /*
     * بیشترین مقدار نمودار
     *
     * sort / filter نداریم.
     */

    let maxValue = 0;

    for (const item of chart) {
        const value = Number(item.value);

        if (value > maxValue) {
            maxValue = value;
        }
    }


    /*
     * محور Y
     *
     * برای حالت‌هایی که maxValue صفر است
     * مقدار مناسب نمایش می‌دهیم.
     */

    const yMax =
        maxValue <= 5
            ? 5
            : Math.ceil(maxValue / 5) * 5;


    const yTicks: number[] = [];

    for (
        let value = 0;
        value <= yMax;
        value += yMax / 5
    ) {
        yTicks.push(Math.round(value));
    }


    /*
     * در 30 روز فقط بعضی labelها را
     * نمایش می‌دهیم تا نمودار شلوغ نشود.
     *
     * در 24 ساعت هم همه ساعت‌ها لازم نیست
     * نمایش داده شوند.
     */

    const getXAxisTick = (
        props: any,
    ) => {
        const {
            x,
            y,
            payload,
            index,
        } = props;

        let show = false;

        if (range === "24h") {
            show = index % 4 === 0;
        }

        if (range === "7d") {
            show = true;
        }

        if (range === "30d") {
            show = index % 5 === 0;
        }

        if (!show) {
            return null;
        }

        return (
            <text
                x={x}
                y={Number(y) + 18}
                textAnchor="middle"
                className="fill-gray-500 text-[11px]"
            >
                {payload.value}
            </text>
        );
    };


    return (
        <main
            dir="rtl"
            className="
                w-full
                max-w-[700px]
                mx-auto
                px-4
                py-5
                text-gray-900
            "
        >

            <div className="space-y-5">

                {/* ================================= */}
                {/* Header / Period */}
                {/* ================================= */}

                <div className="flex items-center justify-between">

                    <div
                        className="
                            flex
                            items-center
                            gap-5
                            text-sm
                            font-medium
                        "
                    >

                        {tabs.map((tab) => {
                            const isActive =
                                range === tab.value;

                            return (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() =>
                                        setRange(tab.value)
                                    }
                                    className={`
                                        relative
                                        pb-3
                                        transition-colors
                                        ${
                                            isActive
                                                ? "text-blue-600"
                                                : "text-gray-900"
                                        }
                                    `}
                                >
                                    {tab.label}

                                    {isActive && (
                                        <span
                                            className="
                                                absolute
                                                right-0
                                                left-0
                                                bottom-0
                                                h-[2px]
                                                rounded-full
                                                bg-blue-600
                                            "
                                        />
                                    )}
                                </button>
                            );
                        })}

                    </div>


                    <span
                        className="
                            text-sm
                            font-medium
                            text-gray-900
                        "
                    >
                        {period.label}
                    </span>

                </div>


                {/* ================================= */}
                {/* Total Clicks */}
                {/* ================================= */}

                <div
                    className="
                        h-[70px]
                        rounded-xl
                        bg-gray-50
                        flex
                        items-center
                        justify-between
                        px-5
                    "
                >

                    <span
                        className="
                            text-sm
                            text-gray-700
                        "
                    >
                        کل کلیک
                    </span>


                    <span
                        className="
                            text-xl
                            font-bold
                            text-gray-900
                        "
                    >
                        {toPersianNumber(
                            summary.total_clicks,
                        )}{" "}
                        نفر
                    </span>

                </div>


                {/* ================================= */}
                {/* Chart */}
                {/* ================================= */}

                <div
                    className="
                        w-full
                        h-[280px]
                        mt-2
                    "
                >

                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >

                        <BarChart
                            data={chart}
                            margin={{
                                top: 10,
                                right: 10,
                                left: -20,
                                bottom: 10,
                            }}
                        >

                            <CartesianGrid
                                vertical={false}
                                strokeDasharray="3 3"
                                stroke="#e5e7eb"
                            />


                            <XAxis
                                dataKey="label"
                                tick={getXAxisTick}
                                axisLine={{
                                    stroke: "#e5e7eb",
                                }}
                                tickLine={false}
                                interval={0}
                            />


                            <YAxis
                                domain={[
                                    0,
                                    yMax,
                                ]}
                                ticks={yTicks}
                                allowDecimals={false}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(
                                    value,
                                ) =>
                                    toPersianNumber(
                                        Number(value),
                                    )
                                }
                                width={28}
                            />


                            <Tooltip
                                cursor={{
                                    fill:
                                        "rgba(0,0,0,0.04)",
                                }}
                                formatter={(
                                    value,
                                ) => [
                                    toPersianNumber(
                                        Number(value),
                                    ),
                                    "کلیک",
                                ]}
                                labelFormatter={(
                                    label,
                                ) =>
                                    `زمان: ${label}`
                                }
                            />


                            <Bar
                                dataKey="value"
                                fill="#356FD8"
                                barSize={
                                    range === "24h"
                                        ? 18
                                        : range === "7d"
                                            ? 28
                                            : 18
                                }
                                radius={[
                                    5,
                                    5,
                                    0,
                                    0,
                                ]}
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>


                {/* ================================= */}
                {/* Loading new range */}
                {/* ================================= */}

                {isFetching && (
                    <div
                        className="
                            text-center
                            text-[11px]
                            text-gray-400
                        "
                    >
                        در حال بروزرسانی آمار...
                    </div>
                )}


                {/* ================================= */}
                {/* Active Products */}
                {/* ================================= */}

                <div
                    className="
                        text-center
                        border-b
                        border-gray-200
                        pb-6
                    "
                >

                    <p
                        className="
                            text-red-500
                            text-sm
                            font-medium
                        "
                    >
                        تعداد محصول فعال
                    </p>


                    <p
                        className="
                            font-bold
                            text-lg
                            mt-3
                            text-gray-900
                        "
                    >
                        {toPersianNumber(
                            summary.active_products,
                        )}
                    </p>

                </div>


                {/* ================================= */}
                {/* Most Viewed Product */}
                {/* ================================= */}

                <div
                    className="
                        text-center
                        pb-4
                    "
                >

                    <p
                        className="
                            text-red-500
                            text-sm
                            font-medium
                        "
                    >
                        پربازدیدترین محصول
                    </p>


                    {summary.most_viewed_product ? (
                        <>
                            <p
                                className="
                                    font-bold
                                    mt-3
                                    text-sm
                                    text-gray-900
                                "
                            >
                                {
                                    summary
                                        .most_viewed_product
                                        .name
                                }
                            </p>

                            <p
                                className="
                                    text-[11px]
                                    text-gray-400
                                    mt-2
                                "
                            >
                                {toPersianNumber(
                                    summary
                                        .most_viewed_product
                                        .views,
                                )}{" "}
                                بازدید
                            </p>
                        </>
                    ) : (
                        <p
                            className="
                                text-sm
                                text-gray-400
                                mt-3
                            "
                        >
                            هنوز محصولی وجود ندارد
                        </p>
                    )}

                </div>

            </div>

        </main>
    );
}