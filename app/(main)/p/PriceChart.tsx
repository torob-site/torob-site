"use client";

import { useState, useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Maximize2, X } from "lucide-react";
import { formatPriceNumber as formatPrice } from "@/lib/format";


function useIsDark() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();

    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

interface PriceEntry {
  val: number;
  i: number;
}

interface DataSet {
  label: string;
  entries: PriceEntry[];
}

interface PriceData {
  labels: string[];
  dataSets: DataSet[];
}



function formatYAxis(value: number): string {
  if (value >= 1000000) return (value / 1000000).toFixed(0) + "M";
  if (value >= 1000) return (value / 1000).toFixed(0) + "K";
  return value.toString();
}

type ViewMode = "both" | "avg" | "min";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
  }>;
  label?: string;
  isDark: boolean;
}

function CustomTooltip({ active, payload, label, isDark }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className={`rounded-lg p-3 text-sm border shadow-xl ${isDark
        ? "bg-[#0f172a] border-gray-700"
        : "bg-white border-gray-200"
        }`}
    >
      <div className={`mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        {label}
      </div>
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className={isDark ? "text-gray-300" : "text-gray-600"}>
              {entry.dataKey === "avg" ? "میانگین:" : "کمترین:"}
            </span>
            <span className="font-bold" style={{ color: entry.color }}>
              {formatPrice(entry.value)} تومان
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartContent({
  chartData,
  viewMode,
  setViewMode,
  isFullscreen,
  onToggleFullscreen,
  isDark,
}: {
  chartData: Array<{ name: string; avg: number; min: number; index: number }>;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isDark: boolean;
}) {
  const showAvg = viewMode === "both" || viewMode === "avg";
  const showMin = viewMode === "both" || viewMode === "min";

  const allVisiblePrices = useMemo(() => {
    const prices: number[] = [];
    if (showAvg) prices.push(...chartData.map((d) => d.avg));
    if (showMin) prices.push(...chartData.map((d) => d.min));
    return prices;
  }, [showAvg, showMin, chartData]);

  const minPrice = Math.min(...allVisiblePrices);
  const maxPrice = Math.max(...allVisiblePrices);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold dark:text-[#f1f5f9] text-[#1e293b]">
          لیست تغییرات قیمت
        </h3>
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-lg transition dark:hover:bg-gray-700 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-white text-gray-500 hover:text-gray-900"
          title={isFullscreen ? "بستن" : "بزرگنمایی"}
        >
          {isFullscreen ? (
            <X className="w-5 h-5" />
          ) : (
            <Maximize2 className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Toggle Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode("both")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${viewMode === "both"
            ? "bg-gray-700 text-white"
            : "dark:bg-[#0f172a] bg-[#f3f4f6] dark:text-[#9ca3af] text-[#6b7280] dark:hover:text-white hover:text-gray-900"
            }`}
        >
          همه
        </button>
        <button
          onClick={() => setViewMode("avg")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${viewMode === "avg"
            ? "bg-green-600 text-white"
            : "dark:bg-[#0f172a] bg-[#f3f4f6] dark:text-[#9ca3af] text-[#6b7280] dark:hover:text-white hover:text-gray-900"
            }`}
        >
          <span className={`w-2 h-2 rounded-full ${viewMode === "avg" ? "bg-white" : "bg-green-500"}`} />
          میانگین قیمت
        </button>
        <button
          onClick={() => setViewMode("min")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${viewMode === "min"
            ? "bg-blue-600 text-white"
            : "dark:bg-[#0f172a] bg-[#f3f4f6] dark:text-[#9ca3af] text-[#6b7280] dark:hover:text-white hover:text-gray-900"
            }`}
        >
          <span className={`w-2 h-2 rounded-full ${viewMode === "min" ? "bg-white" : "bg-blue-500"}`} />
          کمترین قیمت
        </button>
      </div>

      {/* Chart */}
      <div className={isFullscreen ? "h-[65vh]" : "h-56"}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00C853" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00C853" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0091EA" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0091EA" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#334155" : "#e5e7eb"}
              vertical={false}
            />

            <XAxis dataKey="name" hide={true} />

            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fill: isDark ? "#6b7280" : "#9ca3af", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={["auto", "auto"]}
              width={40}
            />

            <Tooltip
              content={<CustomTooltip isDark={isDark} />}
              cursor={{ stroke: isDark ? "#475569" : "#d1d5db", strokeWidth: 1, strokeDasharray: "4 2" }}
            />

            {showAvg && (
              <Area
                type="monotone"
                dataKey="avg"
                stroke="#00C853"
                strokeWidth={2}
                fill="url(#avgGrad)"
                dot={false}
                activeDot={{ r: 5, stroke: "white", strokeWidth: 2, fill: "#00C853" }}
                animationDuration={800}
                animationEasing="ease-in-out"
              />
            )}

            {showMin && (
              <Line
                type="monotone"
                dataKey="min"
                stroke="#0091EA"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, stroke: "white", strokeWidth: 2, fill: "#0091EA" }}
                animationDuration={800}
                animationEasing="ease-in-out"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2 text-xs">
        {showAvg && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="dark:text-gray-400 text-gray-600">میانگین قیمت</span>
          </div>
        )}
        {showMin && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="dark:text-gray-400 text-gray-600">کمترین قیمت</span>
          </div>
        )}
      </div>

      {/* Price range summary */}
      <div className="mt-4 pt-4 border-t dark:border-gray-700 border-gray-200 flex justify-between text-sm">
        <div className={isDark ? "text-gray-400" : "text-gray-600"}>
          کمترین:{" "}
          <span className="text-blue-500 dark:text-blue-400 font-bold">
            {formatPrice(minPrice)}
          </span>
        </div>
        <div className={isDark ? "text-gray-400" : "text-gray-600"}>
          بیشترین:{" "}
          <span className="text-green-500 dark:text-green-400 font-bold">
            {formatPrice(maxPrice)}
          </span>
        </div>
      </div>
    </>
  );
}

// ─── Main Export ───────────────────────────────────────

interface PriceChartProps {
  priceData: PriceData;
}

export default function PriceChart({ priceData }: PriceChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("both");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isDark = useIsDark();

  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  const data = priceData;

  const chartData = data?.labels?.map((label, index) => ({
    name: label,
    avg: data.dataSets[0].entries[index].val,
    min: data.dataSets[1].entries[index].val,
    index,
  }));

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 h-screen flex items-center justify-center">
        <div className="dark:bg-[#1e293b] bg-white rounded-2xl p-6 w-[95vw] h-[90vh] flex flex-col">
          <ChartContent
            chartData={chartData}
            viewMode={viewMode}
            setViewMode={setViewMode}
            isFullscreen={true}
            onToggleFullscreen={toggleFullscreen}
            isDark={isDark}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="dark:bg-[#1e293b] bg-white rounded-2xl p-6">
      <ChartContent
        chartData={chartData}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isFullscreen={false}
        onToggleFullscreen={toggleFullscreen}
        isDark={isDark}
      />
    </div>
  );
}