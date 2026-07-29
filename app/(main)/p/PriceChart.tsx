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

// ─── Dark Mode Detector ────────────────────────────────

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

// ─── Types & Data ──────────────────────────────────────

interface PriceEntry {
  val: number;
  i: number;
}

interface DataSet {
  label: string;
  entries: PriceEntry[];
  color: string;
}

interface PriceData {
  labels: string[];
  dataSets: DataSet[];
}

const rawData: PriceData = {
  labels: [
    "۳ خرداد ۱۴۰۳", "۹ شهریور ۱۴۰۳", "۲۷ بهمن ۱۴۰۳", "۸ اسفند ۱۴۰۳", "۱۹ اسفند ۱۴۰۳",
    "۳۰ اسفند ۱۴۰۳", "۱۱ فروردین ۱۴۰۴", "۲۲ فروردین ۱۴۰۴", "۲ اردیبهشت ۱۴۰۴", "۱۳ اردیبهشت ۱۴۰۴",
    "۲۴ اردیبهشت ۱۴۰۴", "۴ خرداد ۱۴۰۴", "۱۵ خرداد ۱۴۰۴", "۲۶ خرداد ۱۴۰۴", "۶ تیر ۱۴۰۴",
    "۱۷ تیر ۱۴۰۴", "۲۸ تیر ۱۴۰۴", "۸ مرداد ۱۴۰۴", "۱۹ مرداد ۱۴۰۴", "۳۰ مرداد ۱۴۰۴",
    "۱۰ شهریور ۱۴۰۴", "۲۱ شهریور ۱۴۰۴", "۲ مهر ۱۴۰۴", "۱۳ مهر ۱۴۰۴", "۲۴ مهر ۱۴۰۴",
    "۵ آبان ۱۴۰۴", "۱۶ آبان ۱۴۰۴", "۲۷ آبان ۱۴۰۴", "۸ آذر ۱۴۰۴", "۱۹ آذر ۱۴۰۴",
    "۳۰ آذر ۱۴۰۴", "۱۱ دی ۱۴۰۴", "۲۲ دی ۱۴۰۴", "۳ بهمن ۱۴۰۴", "۱۴ بهمن ۱۴۰۴",
    "۲۵ بهمن ۱۴۰۴", "۶ اسفند ۱۴۰۴", "۱۷ اسفند ۱۴۰۴", "۲۸ اسفند ۱۴۰۴", "۱۰ فروردین ۱۴۰۵",
    "۲۱ فروردین ۱۴۰۵", "۱ اردیبهشت ۱۴۰۵", "۱۲ اردیبهشت ۱۴۰۵", "۲۳ اردیبهشت ۱۴۰۵", "۳ خرداد ۱۴۰۵",
    "۱۴ خرداد ۱۴۰۵", "۲۵ خرداد ۱۴۰۵", "۵ تیر ۱۴۰۵", "۱۶ تیر ۱۴۰۵", "۲۷ تیر ۱۴۰۵"
  ],
  dataSets: [
    {
      label: "میانگین قیمت",
      color: "#00C853",
      entries: [
        { val: 59000, i: 0 }, { val: 59000, i: 1 }, { val: 15267416, i: 2 },
        { val: 14285305, i: 3 }, { val: 13980642, i: 4 }, { val: 16119826, i: 5 },
        { val: 16791872, i: 6 }, { val: 16676361, i: 7 }, { val: 14523475, i: 8 },
        { val: 15447763, i: 9 }, { val: 15534777, i: 10 }, { val: 14840902, i: 11 },
        { val: 14478008, i: 12 }, { val: 15797554, i: 13 }, { val: 15394357, i: 14 },
        { val: 15185357, i: 15 }, { val: 15283817, i: 16 }, { val: 15365729, i: 17 },
        { val: 15416123, i: 18 }, { val: 15503115, i: 19 }, { val: 17067953, i: 20 },
        { val: 16656115, i: 21 }, { val: 18177562, i: 22 }, { val: 19325981, i: 23 },
        { val: 18434949, i: 24 }, { val: 18054800, i: 25 }, { val: 18010426, i: 26 },
        { val: 18057465, i: 27 }, { val: 18668529, i: 28 }, { val: 19958987, i: 29 },
        { val: 21977521, i: 30 }, { val: 25447367, i: 31 }, { val: 26942889, i: 32 },
        { val: 26517464, i: 33 }, { val: 26816010, i: 34 }, { val: 26866706, i: 35 },
        { val: 26665257, i: 36 }, { val: 26970935, i: 37 }, { val: 26924554, i: 38 },
        { val: 28836033, i: 39 }, { val: 32800712, i: 40 }, { val: 33154137, i: 41 },
        { val: 38202911, i: 42 }, { val: 37316430, i: 43 }, { val: 37728241, i: 44 },
        { val: 37723090, i: 45 }, { val: 37630003, i: 46 }, { val: 37212821, i: 47 },
        { val: 38985759, i: 48 }, { val: 46476011, i: 49 }
      ]
    },
    {
      label: "کمترین قیمت",
      color: "#0091EA",
      entries: [
        { val: 59000, i: 0 }, { val: 59000, i: 1 }, { val: 14738000, i: 2 },
        { val: 13628000, i: 3 }, { val: 12948000, i: 4 }, { val: 13040000, i: 5 },
        { val: 13040000, i: 6 }, { val: 13766000, i: 7 }, { val: 12990000, i: 8 },
        { val: 13766000, i: 9 }, { val: 13766000, i: 10 }, { val: 13766000, i: 11 },
        { val: 13599000, i: 12 }, { val: 13350000, i: 13 }, { val: 13766000, i: 14 },
        { val: 13766000, i: 15 }, { val: 13766000, i: 16 }, { val: 13766000, i: 17 },
        { val: 14300000, i: 18 }, { val: 14300000, i: 19 }, { val: 14300000, i: 20 },
        { val: 14300000, i: 21 }, { val: 14650000, i: 22 }, { val: 14650000, i: 23 },
        { val: 14650000, i: 24 }, { val: 14650000, i: 25 }, { val: 14650000, i: 26 },
        { val: 14650000, i: 27 }, { val: 14650000, i: 28 }, { val: 14650000, i: 29 },
        { val: 14650000, i: 30 }, { val: 14650000, i: 31 }, { val: 15189000, i: 32 },
        { val: 15189000, i: 33 }, { val: 15189000, i: 34 }, { val: 15189000, i: 35 },
        { val: 15189000, i: 36 }, { val: 15189000, i: 37 }, { val: 15189000, i: 38 },
        { val: 15189000, i: 39 }, { val: 15189000, i: 40 }, { val: 15189000, i: 41 },
        { val: 15189000, i: 42 }, { val: 15189000, i: 43 }, { val: 15189000, i: 44 },
        { val: 15189000, i: 45 }, { val: 15189000, i: 46 }, { val: 16200000, i: 47 },
        { val: 16200000, i: 48 }, { val: 16200000, i: 49 }
      ]
    }
  ]
};

const chartData = rawData.labels.map((label, index) => ({
  name: label,
  avg: rawData.dataSets[0].entries[index].val,
  min: rawData.dataSets[1].entries[index].val,
  index,
}));

function formatPrice(price: number): string {
  return price.toLocaleString("fa-IR");
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
      className={`rounded-lg p-3 text-sm border shadow-xl ${
        isDark
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
  viewMode,
  setViewMode,
  isFullscreen,
  onToggleFullscreen,
  isDark,
}: {
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
    if (showAvg) prices.push(...rawData.dataSets[0].entries.map((e) => e.val));
    if (showMin) prices.push(...rawData.dataSets[1].entries.map((e) => e.val));
    return prices;
  }, [showAvg, showMin]);

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

      {/* Toggle Buttons — با background پررنگ solid برای active */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode("both")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            viewMode === "both"
              ? "bg-gray-700 text-white"
              : "dark:bg-[#0f172a] bg-[#f3f4f6] dark:text-[#9ca3af] text-[#6b7280] dark:hover:text-white hover:text-gray-900"
          }`}
        >
          همه
        </button>
        <button
          onClick={() => setViewMode("avg")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
            viewMode === "avg"
              ? "bg-green-600 text-white"
              : "dark:bg-[#0f172a] bg-[#f3f4f6] dark:text-[#9ca3af] text-[#6b7280] dark:hover:text-white hover:text-gray-900"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${viewMode === "avg" ? "bg-white" : "bg-green-500"}`} />
          میانگین قیمت
        </button>
        <button
          onClick={() => setViewMode("min")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
            viewMode === "min"
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

export default function PriceChart() {
  const [viewMode, setViewMode] = useState<ViewMode>("both");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isDark = useIsDark();

  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 h-screen flex items-center justify-center">
        <div className="dark:bg-[#1e293b] bg-white rounded-2xl p-6 w-[95vw] h-[90vh] flex flex-col">
          <ChartContent
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
        viewMode={viewMode}
        setViewMode={setViewMode}
        isFullscreen={false}
        onToggleFullscreen={toggleFullscreen}
        isDark={isDark}
      />
    </div>
  );
}