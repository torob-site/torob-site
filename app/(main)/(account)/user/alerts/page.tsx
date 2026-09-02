"use client";

import PriceChart from "@/app/(main)/p/PriceChart";
import ProductCard from "@/components/product-card";
import { PageSpinner, InlineSpinner } from "@/components/ui/page-spinner";

import {
  useGetProductPriceHistory,
  useGetUser,
  useGetUserAlerts,
  useGetUserFavorites,
  useGetOfferHistory,
} from "@/lib/apis";

import { ArrowDownLeft, ArrowUpLeft, Bell, Clock } from "lucide-react";

// ============================================
// HELPERS
// ============================================

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fa-IR");
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================
// HISTORY ITEM
// ============================================

function HistoryItem({
  item,
}: {
  item: {
    title: string;
    description: string;
    created_at: string;
  };
}) {
  const isIncrease = item.title.includes("افزایش");

  const isDecrease = item.title.includes("کاهش");

  const isAvailable =
    item.title.includes("موجود شدن") || item.title.includes("موجود");

  return (
    <div
      className="
        flex
        gap-3
        border-b
        border-gray-100
        px-5
        py-4
        last:border-b-0
      "
    >
      {/* Icon */}

      <div
        className={`
          mt-1
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-full

          ${
            isIncrease
              ? "bg-red-50 text-red-500"
              : isDecrease
                ? "bg-green-50 text-green-500"
                : isAvailable
                  ? "bg-blue-50 text-blue-500"
                  : "bg-gray-50 text-gray-500"
          }
        `}
      >
        {isIncrease ? (
          <ArrowUpLeft className="h-5 w-5" />
        ) : isDecrease ? (
          <ArrowDownLeft className="h-5 w-5" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
      </div>

      {/* Content */}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-gray-900">{item.title}</p>

          <span className="shrink-0 text-[11px] text-gray-400">
            {formatTime(item.created_at)}
          </span>
        </div>

        <p className="mt-1 text-xs text-gray-500">{item.description}</p>

        <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400">
          <Clock className="h-3 w-3" />

          <span>{formatDate(item.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ALERT ANALYTICS
// ============================================

function AlertAnalytics({
  product,
  isFavorite,
}: {
  product: any;
  isFavorite: boolean;
}) {
  /*
   * برای هر محصول یک درخواست جداگانه
   * برای نمودار قیمت
   */

  const { data: priceHistory, isPending: priceHistoryLoading } =
    useGetProductPriceHistory(product.id);

  /*
   * برای همان محصول یک درخواست جداگانه
   * برای تاریخچه تغییرات
   */

  const { data: history, isPending: historyLoading } = useGetOfferHistory(
    product.id,
    1,
    10,
  );

  const productWithData = {
    ...product,
    is_favorite: isFavorite,
    is_alert: true,
  };

  const historyItems = history?.data ?? [];

  return (
    <div
      className="
        flex
        w-full
        flex-col
        overflow-hidden
        rounded-xl
        bg-white
        shadow-sm

        lg:flex-row-reverse
      "
    >
      {/* ==========================================
          PRODUCT
          سمت راست
      ========================================== */}

      {/* ==========================================
          ANALYTICS
          تاریخچه + نمودار
      ========================================== */}

      <div
        className="
          min-w-0
          flex-1
          grid
          grid-cols-1
          lg:grid-cols-[1.15fr_0.85fr]
        "
      >
        {/* ========================================
            PRICE CHART
            سمت چپ
        ======================================== */}

        {/* ========================================
            PRICE HISTORY
            وسط
        ======================================== */}

        <div
          dir="rtl"
          className="
            min-w-0
            flex
            flex-col
          "
        >
          {/* Header */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-gray-100
              px-5
              py-5
            "
          >
            <h2
              className="
                text-lg
                font-bold
                text-gray-900
              "
            >
              تاریخچه تغییر قیمت
            </h2>
          </div>

          {/* History */}

          {historyLoading ? (
            <InlineSpinner className="h-[300px]" />
          ) : historyItems.length > 0 ? (
            <div
              className="
                max-h-[360px]
                overflow-y-auto
              "
            >
              {historyItems.map((item: any, index: number) => (
                <HistoryItem key={`${item.created_at}-${index}`} item={item} />
              ))}
            </div>
          ) : (
            <div
              className="
                flex
                h-[300px]
                items-center
                justify-center
                px-5
              "
            >
              <p
                className="
                  text-center
                  text-sm
                  text-gray-400
                "
              >
                هنوز تغییری در قیمت این محصول ثبت نشده است.
              </p>
            </div>
          )}
        </div>
        <div
          className="
            min-w-0
            border-b
            border-gray-100
            p-5

            lg:border-b-0
            lg:border-r
          "
        >
          {priceHistoryLoading ? (
            <InlineSpinner className="h-[300px]" />
          ) : (
            <div
              className="
                w-full
                min-w-0
                overflow-hidden
              "
            >
              <PriceChart priceData={priceHistory ?? []} />
            </div>
          )}
        </div>
      </div>
      <div
        className="
          w-full
          shrink-0
          border-b
          border-gray-100

          lg:w-[22%]
          lg:border-b-0
          lg:border-l
        "
      >
        <ProductCard product={productWithData} />
      </div>
    </div>
  );
}

// ============================================
// MAIN ANALYTICS
// ============================================

export default function Analytics() {
  const { data: alerts = [], isPending, error } = useGetUserAlerts();

  const { data: user } = useGetUser();

  const { data: favoriteIds = [] } = useGetUserFavorites(true, {
    enabled: !!user?.phone && alerts.length > 0,
  });

  const favoriteSet = new Set(favoriteIds);

  // ==========================================
  // LOADING
  // ==========================================

  if (isPending) {
    return (
      <PageSpinner />
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div
        className="
          flex
          w-full
          items-center
          justify-center
          py-20
        "
      >
        <p className="text-sm text-red-500">دریافت اعلان‌ها با خطا مواجه شد.</p>
      </div>
    );
  }

  // ==========================================
  // EMPTY
  // ==========================================

  if (!alerts || alerts.length === 0) {
    return (
      <div className="mt-20 w-full px-10">
        <div
          className="
            flex
            w-full
            flex-col
            items-center
            justify-center
            bg-white
            py-4
            dark:bg-[#212b36]
          "
        >
          <img
            className="w-96"
            src="https://assets.torob.com/public/main/images/empty_watched.PNG"
            alt="اعلان قیمت"
          />

          <p
            className="
              mt-6
              max-w-sm
              text-center
              text-xs
              text-[#919eab]
            "
          >
            اعلان قیمت را برای محصولات دلخواه خود فعال کنید تا از موجودی و
            تغییرات قیمت‌شان مطلع شوید.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div
      className="
        flex
        w-full
        flex-col
        gap-10
        bg-[#f5f7f9]
        px-4
        py-10

        lg:px-10
      "
    >
      {alerts.map((product: any) => (
        <AlertAnalytics
          key={product.id}
          product={product}
          isFavorite={favoriteSet.has(product.id)}
        />
      ))}
    </div>
  );
}
