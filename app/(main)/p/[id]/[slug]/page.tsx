"use client";

import { useState, useRef, useMemo, useEffect, Fragment } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import {
  Bell,
  Share2,
  Flag,
  ChevronDown,
  ChevronUp,
  Send,
  Phone,
  MapPin,
  MessageCircle,
  Search,
  Home,
  ArrowRight,
  Map,
  X,
  Trash2,
  ArrowLeft,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";

import PriceChart from "../../PriceChart";
import ProductImages from "../../ProductImages";
import ProductCard from "@/components/product-card";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import {
  useGetProduct,
  useGetProductPriceHistory,
  useGetProductOffers,
  useGetSimilarProducts,
  useGetUser,
  useGetUserFavorites,
  useGetUserAlerts,
  usePostUserFavorite,
  usePostUserHistory,
  usePostUserAlert,
  useDeleteUserAlert,
  useGetProductAlert,
} from "@/lib/apis";

import { ScreenSpinner, InlineSpinner } from "@/components/ui/page-spinner";
import { baseURL } from "@/lib/axios";
import ProductMap from "@/components/product-map";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ReportModal from "@/components/report-modal";
import CitySelector from "@/components/city";
import { formatPrice } from "@/lib/format";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface ShopContact {
  id?: number;
  type: string;
  platform: string;
  value: string;
}

interface ShopImage {
  id?: number;
  url: string;
}

interface Shop {
  id: number;
  shop_name: string;
  shop_logo?: string;
  type: "ONLINE_SHOP" | "OFFLINE_SHOP";
  domain?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  city?: {
    id: number;
    name: string;
  };
  shopContacts?: ShopContact[];
  shopImages?: ShopImage[];
}

interface Warranty {
  title: string;
  description?: string;
}

interface OfferBadge {
  text: string;
  tooltip?: string;
}

interface Offer {
  id: number;
  product_id: number;
  price: number;
  stock_status: string;
  more_info_url: string;
  description: string;
  warranty: Warranty | null;
  warranty_duration: number | null;
  updated_at: string;
  shop: Shop;
  shopContacts?: ShopContact[];
  is_best?: boolean;
  badges: OfferBadge[];
  is_available: boolean;
}

interface BreadcrumbCategory {
  id: number;
  title: string;
  slug: string;
}

type TabType = "all" | "ONLINE_SHOP" | "OFFLINE_SHOP";

interface OfferFilters {
  all: { count: number; starting_price: number | null };
  city: {
    count: number;
    starting_price: number | null;
    city_name: string | null;
  };
  warranty: { count: number; starting_price: number | null };
  guaranteed?: { count: number; starting_price: number | null };
}

// ─────────────────────────────────────────────
// Platform
// ─────────────────────────────────────────────

const platformIcons: Record<string, React.ReactNode> = {
  PHONE: <Phone className="h-4 w-4" />,
  TELEGRAM: <MessageCircle className="h-4 w-4" />,
  WHATSAPP: <MessageCircle className="h-4 w-4" />,
  BALE: <MessageCircle className="h-4 w-4" />,
  INSTAGRAM: <MessageCircle className="h-4 w-4" />,
};

const platformLabels: Record<string, string> = {
  PHONE: "تماس",
  TELEGRAM: "تلگرام",
  WHATSAPP: "واتساپ",
  BALE: "بله",
  INSTAGRAM: "اینستاگرام",
};

// ─────────────────────────────────────────────
// OfferCard
// ─────────────────────────────────────────────

function OfferCard({
  offer,
  index,
  isLast,
  productName,
  productImage,
  expandedId,
  onToggleContact,
}: {
  offer: Offer;
  index: number;
  isLast: boolean;
  productName: string;
  productImage: string | null;
  expandedId: number | null;
  onToggleContact: (id: number) => void;
}) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const isExpanded = expandedId === offer.id;
  const isOffline = offer.shop.type === "OFFLINE_SHOP";

  const shopContacts = offer.shopContacts || offer.shop.shopContacts || [];
  const shopImages = offer.shop.shopImages || [];

  const warrantyTitle = offer.warranty?.title || "";

  const warrantyDescription =
    offer.warranty?.description ||
    (offer.warranty_duration ? `${offer.warranty_duration} ماهه` : "");

  return (
    <>
      <div
        className={`flex h-auto flex-col px-4 py-3 ${
          !isLast ? "border-b border-gray-300" : ""
        }`}
      >
        <div className="flex w-full gap-6 sm:gap-10">
          {!isOffline ? (
            <>
              <div className="w-[120px] shrink-0">
                <h1 className="text-sm font-bold text-[#1e293b]">
                  {offer.shop.shop_name}
                </h1>

                {offer.shop.city?.name && (
                  <p className="mt-1 text-xs text-[#64748b]">
                    {offer.shop.city.name}
                  </p>
                )}

                {offer.shop.shop_logo && (
                  <img
                    src={offer.shop.shop_logo}
                    alt={offer.shop.shop_name}
                    className="mt-2 h-8 w-8 rounded-lg object-cover"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => setReportModalOpen(true)}
                    className="flex cursor-pointer items-center justify-center gap-1 rounded-full bg-[#f1f5f9] px-1.5 py-1.5 text-xs"
                  >
                    <img
                      width={14}
                      height={14}
                      src="https://assets.torob.com/public/main/images/flag_white.png"
                      alt=""
                    />

                    <p>گزارش</p>
                  </div>
                </div>

                {/* Product name instead of description */}
                <h1 className="max-w-max text-sm text-[#1e293b]">
                  {productName}
                </h1>

                {(offer.warranty?.title || offer.warranty_duration) && (
                  <p className="text-xs text-[#64748b]">
                    {offer.warranty?.title || ""}

                    {offer.warranty_duration
                      ? ` ${offer.warranty_duration} ماهه`
                      : ""}
                  </p>
                )}

                {Array.isArray(offer.badges) && offer.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {offer.badges.map((x, badgeIndex) => (
                      <Tooltip key={`${offer.id}-${badgeIndex}`}>
                        <TooltipTrigger asChild>
                          <Button variant="secondary" size="xs">
                            {x.text}
                          </Button>
                        </TooltipTrigger>

                        {x.tooltip && (
                          <TooltipContent side="top">
                            {x.tooltip}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    ))}
                  </div>
                )}
              </div>

              <div className="shrink-0 text-left">
                <span className="whitespace-nowrap text-sm font-bold text-[#1e293b]">
                  {offer.is_available ? (
                    <p>{formatPrice(offer.price)}</p>
                  ) : (
                    <p className="text-gray-400">ناموجود</p>
                  )}
                </span>

                <a
                  href={`${baseURL}/products/redirect?offer_id=${offer.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="mt-2 cursor-pointer rounded-lg bg-[#d73948] px-2 py-2.5 text-center text-sm text-white transition hover:bg-[#c4323f]">
                    خرید اینترنتی
                  </div>
                </a>
              </div>
            </>
          ) : (
            <>
              {/* Offline shop */}

              <div className="w-[120px] shrink-0">
                <h1 className="text-sm font-medium text-[#1e293b]">
                  {offer.shop.shop_name}
                </h1>

                {/* Shop images instead of city */}
                {shopImages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {shopImages.slice(0, 4).map((image, imageIndex) => (
                      <img
                        key={image.id ?? imageIndex}
                        src={image.url}
                        alt={offer.shop.shop_name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}

                {shopImages.length === 0 && offer.shop.shop_logo && (
                  <img
                    src={offer.shop.shop_logo}
                    alt={offer.shop.shop_name}
                    className="mt-2 h-10 w-10 rounded-lg object-cover"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                {/* Report */}
                <div className="mb-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(true)}
                    className="flex items-center gap-1 rounded-full bg-[#f1f5f9] px-2.5 py-1.5 text-xs text-[#64748b] transition hover:bg-[#e2e8f0]"
                  >
                    <Flag className="h-3.5 w-3.5" />

                    <span>گزارش</span>
                  </button>
                </div>

                {/* Address */}
                {offer.shop.address && (
                  <div className="mb-3 flex items-start gap-1.5 text-xs text-[#64748b]">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                    <span>{offer.shop.address}</span>
                  </div>
                )}

                {/* Warranty + warranty description */}
                {(warrantyTitle || warrantyDescription) && (
                  <div className="mb-3 flex items-start gap-6 text-xs">
                    <div className="min-w-0">
                      <span className="font-medium text-[#1e293b]">
                        {warrantyTitle || "گارانتی"}
                      </span>

                      {offer.warranty_duration && (
                        <span className="mr-1">
                          {offer.warranty_duration} ماهه
                        </span>
                      )}
                    </div>

                    {warrantyDescription && (
                      <div className="min-w-0 text-[#64748b]">
                        {warrantyDescription}
                      </div>
                    )}
                  </div>
                )}

                {/* Badges */}
                {Array.isArray(offer.badges) && offer.badges.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {offer.badges.map((x, badgeIndex) => (
                      <Tooltip key={`${offer.id}-${badgeIndex}`}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="xs"
                            className="text-xs"
                          >
                            {x.text}
                          </Button>
                        </TooltipTrigger>

                        {x.tooltip && (
                          <TooltipContent side="top">
                            {x.tooltip}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    ))}
                  </div>
                )}
              </div>

              {/* Price + contact button */}
              <div className="flex shrink-0 flex-col items-end justify-start gap-3 text-left">
                <span className="whitespace-nowrap text-sm font-bold text-[#1e293b]">
                  {offer.is_available ? (
                    <p>{formatPrice(offer.price)}</p>
                  ) : (
                    <p className="text-gray-400">ناموجود</p>
                  )}
                </span>

                {offer.is_best && (
                  <Badge variant="secondary" className="text-xs">
                    ارزان&#8204;ترین
                  </Badge>
                )}

                <Button
                  onClick={() => onToggleContact(offer.id)}
                  variant="outline"
                  size="sm"
                  className="gap-1 whitespace-nowrap"
                >
                  <Phone className="h-4 w-4" />

                  <span>{isExpanded ? "بستن" : "اطلاعات تماس"}</span>

                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Offline contacts */}
        {isOffline && isExpanded && (
          <div className="mt-3 border-t border-gray-200 pt-3">
            <div className="flex flex-wrap gap-2">
              {shopContacts.map((contact, idx) => {
                let href = "#";

                if (contact.platform === "PHONE") {
                  href = `tel:${contact.value}`;
                } else if (contact.platform === "TELEGRAM") {
                  href = `https://t.me/${contact.value.replace("@", "")}`;
                } else if (contact.platform === "WHATSAPP") {
                  href = `https://wa.me/${contact.value.replace(/[^0-9]/g, "")}`;
                } else if (contact.platform === "BALE") {
                  href = `https://ble.ir/${contact.value}`;
                } else if (contact.platform === "INSTAGRAM") {
                  href = `https://instagram.com/${contact.value.replace(
                    "@",
                    "",
                  )}`;
                }

                return (
                  <a
                    key={idx}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1.5 border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-100"
                    >
                      {platformIcons[contact.platform] ?? (
                        <MessageCircle className="h-4 w-4" />
                      )}

                      <span className="text-xs">
                        {platformLabels[contact.platform] ?? contact.platform}
                      </span>

                      <span className="ltr text-xs text-gray-500">
                        {contact.value}
                      </span>
                    </Button>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {reportModalOpen && (
        <ReportModal
          open={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          offer={offer}
          productName={productName}
          productImage={productImage}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// SellersList
// ─────────────────────────────────────────────

type OfferFilterTab = "all" | "city" | "warranty" | "guaranteed";

function SellersList({
  data,
  filters,
  activeFilter,
  onFilterChange,
  productId,
  productName,
  productImage,
}: {
  data: Offer[];
  filters: OfferFilters | null;
  activeFilter: "all" | "city" | "warranty" | "guaranteed";
  onFilterChange: (f: "all" | "city" | "warranty" | "guaranteed") => void;
  productId: number;
  productName: string;
  productImage: string | null;
}) {
  const [activeTab, setActiveTab] = useState<
    "all" | "ONLINE_SHOP" | "OFFLINE_SHOP"
  >("all");
  const [showMap, setShowMap] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const listTopRef = useRef<HTMLDivElement>(null);
  const offlineStartRef = useRef<HTMLDivElement>(null);

  // Data is already filtered by backend based on activeFilter
  const filteredOffers = data;

  // Then apply online/offline tab
  const displayOffers = useMemo(() => {
    if (activeTab === "ONLINE_SHOP")
      return filteredOffers.filter((o) => o.shop.type === "ONLINE_SHOP");
    if (activeTab === "OFFLINE_SHOP")
      return filteredOffers.filter((o) => o.shop.type === "OFFLINE_SHOP");
    return filteredOffers;
  }, [filteredOffers, activeTab]);

  const onlineOffers = useMemo(
    () =>
      displayOffers
        .filter((o) => o.shop.type === "ONLINE_SHOP")
        .sort((a, b) => a.price - b.price),
    [displayOffers],
  );

  const offlineOffers = useMemo(
    () =>
      displayOffers
        .filter((o) => o.shop.type === "OFFLINE_SHOP")
        .sort((a, b) => a.price - b.price),
    [displayOffers],
  );

  const hasOnlineOffers = filteredOffers.some(
    (o) => o.shop.type === "ONLINE_SHOP",
  );
  const hasOfflineOffers = filteredOffers.some(
    (o) => o.shop.type === "OFFLINE_SHOP",
  );

  const handleTabChange = (tab: "all" | "ONLINE_SHOP" | "OFFLINE_SHOP") => {
    setActiveTab(tab);
    const headerOffset = 90;
    if (listTopRef.current) {
      const top =
        listTopRef.current.getBoundingClientRect().top +
        window.scrollY -
        headerOffset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const toggleContact = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      ref={listTopRef}
      className="rounded-2xl bg-[#ffffff] dark:bg-[#1e293b]"
    >
      {/* ── Sticky header: title + online/offline tabs ── */}
      <div className="sticky top-0 z-10 rounded-t-2xl border-b border-gray-200 bg-[#ffffff] px-6 py-4 dark:border-gray-800 dark:bg-[#1e293b]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="whitespace-nowrap text-lg font-bold text-[#1e293b] dark:text-[#f1f5f9]">
            لیست قیمت فروشندگان
          </h2>

          <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1 dark:bg-[#0f172a]">
            <button
              onClick={() => handleTabChange("all")}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm transition ${
                activeTab === "all"
                  ? "bg-white font-medium text-[#1e293b] shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              همه
            </button>
            {hasOnlineOffers && (
              <button
                onClick={() => handleTabChange("ONLINE_SHOP")}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm transition ${
                  activeTab === "ONLINE_SHOP"
                    ? "bg-white font-medium text-[#1e293b] shadow-sm dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                خرید اینترنتی (
                {
                  filteredOffers.filter((o) => o.shop.type === "ONLINE_SHOP")
                    .length
                }
                )
              </button>
            )}
            {hasOfflineOffers && (
              <button
                onClick={() => handleTabChange("OFFLINE_SHOP")}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm transition ${
                  activeTab === "OFFLINE_SHOP"
                    ? "bg-white font-medium text-[#1e293b] shadow-sm dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                خرید حضوری (
                {
                  filteredOffers.filter((o) => o.shop.type === "OFFLINE_SHOP")
                    .length
                }
                )
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filter row: all / city / warranty ── */}
      {filters && (
        <div
          dir="rtl"
          className="flex items-center gap-2 overflow-x-auto border-b border-gray-100 px-6 py-2.5 dark:border-gray-800"
        >
          {/* تمام ایران */}
          <div className="relative shrink-0">
            <button
              onClick={() => onFilterChange("all")}
              className={`
        flex h-[58px] min-w-[155px] flex-col
        justify-center rounded-[18px] border
        px-4 text-right transition
        ${
          activeFilter === "all"
            ? "border-slate-800 bg-white dark:border-slate-300 dark:bg-slate-900"
            : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-slate-900"
        }
      `}
            >
              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100">
                تمام ایران
              </span>

              {filters?.all?.starting_price != null ? (
                <span className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  از {formatPrice(filters.all.starting_price)}
                </span>
              ) : (
                <p className="text-xs">بدون فروشنده</p>
              )}
            </button>

            {/* ضربدر فیلتر فعال */}
            {activeFilter === "all" && (
              <button
                type="button"
                onClick={() => onFilterChange("all")}
                className="absolute -left-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 dark:bg-white dark:text-black text-white shadow-sm"
              >
                <span className="text-sm leading-none">×</span>
              </button>
            )}
          </div>

          {/* شهر */}
          {filters?.city?.city_name ? (
            <div className="relative shrink-0">
              <div
                className={`
          flex h-[58px] min-w-[185px] overflow-hidden
          rounded-[18px] border bg-white transition
          dark:bg-slate-900
          ${
            activeFilter === "city"
              ? "border-slate-800 dark:border-slate-300"
              : "border-gray-200 dark:border-gray-700"
          }
        `}
              >
                <button
                  onClick={() =>
                    onFilterChange(activeFilter === "city" ? "all" : "city")
                  }
                  className="flex flex-1 items-center gap-2 px-3 text-right"
                >
                  <MapPin className="h-5 w-5 shrink-0 fill-slate-300 text-slate-700 dark:fill-slate-200 dark:text-slate-200" />

                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-bold text-slate-800 dark:text-slate-100">
                      {filters.city.city_name}
                    </div>

                    {filters.city.starting_price != null ? (
                      <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        از {formatPrice(filters.city.starting_price)}
                      </div>
                    ) : (
                      <p className="text-xs">بدون فروشنده</p>
                    )}
                  </div>
                </button>

                {/* تغییر شهر */}
                <CitySelector>
                  <button
                    type="button"
                    className="flex w-8 items-center justify-center border-r h-full border-gray-200 text-slate-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                </CitySelector>
              </div>

              {/* ضربدر */}
              {activeFilter === "city" && (
                <button
                  type="button"
                  onClick={() => onFilterChange("all")}
                  className="absolute -left-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 dark:bg-white dark:text-black text-white shadow-sm"
                >
                  <span className="text-sm leading-none">×</span>
                </button>
              )}
            </div>
          ) : (
            <CitySelector>
              <button
                type="button"
                className="flex h-[58px] min-w-[155px] shrink-0 items-center gap-2 rounded-[18px] border border-gray-200 bg-white px-3 text-right dark:border-gray-700 dark:bg-slate-900"
              >
                <MapPin className="h-5 w-5 text-slate-700 dark:text-slate-200" />

                <div>
                  <div className="text-[13px] font-bold text-slate-700 dark:text-slate-200">
                    انتخاب شهر
                  </div>
                </div>
              </button>
            </CitySelector>
          )}

          {/* گارانتی */}
          {filters?.warranty && filters.warranty.count > 0 && (
            <div className="relative shrink-0">
              <button
                onClick={() =>
                  onFilterChange(
                    activeFilter === "warranty" ? "all" : "warranty",
                  )
                }
                className={`
          flex h-[58px] min-w-[170px] flex-col
          justify-center rounded-[18px] border
          px-4 text-right transition
          ${
            activeFilter === "warranty"
              ? "border-slate-800 bg-white dark:border-slate-300 dark:bg-slate-900"
              : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-slate-900"
          }
        `}
              >
                <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100">
                  گارانتی‌دار
                </span>

                {filters.warranty.starting_price != null ? (
                  <span className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    از {formatPrice(filters.warranty.starting_price)}
                  </span>
                ) : (
                  <p className="text-xs">بدون فروشنده</p>
                )}
              </button>

              {/* ضربدر */}
              {activeFilter === "warranty" && (
                <button
                  type="button"
                  onClick={() => onFilterChange("all")}
                  className="absolute -left-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 dark:bg-white dark:text-black text-white shadow-sm"
                >
                  <span className="text-sm leading-none">×</span>
                </button>
              )}
            </div>
          )}

          {/* ضمانت ترب */}
          {filters?.guaranteed && filters.guaranteed.count > 0 && (
            <div className="relative shrink-0">
              <button
                onClick={() =>
                  onFilterChange(
                    activeFilter === "guaranteed" ? "all" : "guaranteed",
                  )
                }
                className={`
          flex h-[58px] min-w-[170px] flex-col
          justify-center rounded-[18px] border
          px-4 text-right transition
          ${
            activeFilter === "guaranteed"
              ? "border-slate-800 bg-white dark:border-slate-300 dark:bg-slate-900"
              : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-slate-900"
          }
        `}
              >
                <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100">
                  ضمانت ترب ({filters.guaranteed.count})
                </span>

                {filters.guaranteed.starting_price != null ? (
                  <span className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    از {formatPrice(filters.guaranteed.starting_price)}
                  </span>
                ) : (
                  <p className="text-xs">بدون فروشنده</p>
                )}
              </button>

              {/* ضربدر */}
              {activeFilter === "guaranteed" && (
                <button
                  type="button"
                  onClick={() => onFilterChange("all")}
                  className="absolute -left-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 dark:bg-white dark:text-black text-white shadow-sm"
                >
                  <span className="text-sm leading-none">×</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {onlineOffers.map((offer, index) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            index={index}
            isLast={
              index === onlineOffers.length - 1 && offlineOffers.length === 0
            }
            productName={productName}
            productImage={productImage}
            expandedId={expandedId}
            onToggleContact={toggleContact}
          />
        ))}

        {offlineOffers.length > 0 && (
          <>
            <div ref={offlineStartRef} className="pt-4">
              {onlineOffers.length > 0 && (
                <div className="mb-2 flex items-center gap-3 pb-2">
                  <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                  <span className="whitespace-nowrap text-xs font-medium text-gray-500">
                    فروشگاه&#8204;های حضوری ({offlineOffers.length})
                  </span>
                  <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                </div>
              )}
            </div>

            <div className="relative overflow-hidden rounded-lg">
              <img
                src="https://assets.torob.com/public/main/images/map/offline-map-banner.svg"
                alt="نقشه فروشگاه‌ها"
                className="w-full"
              />
              <Button
                onClick={() => setShowMap(true)}
                className="absolute bottom-2 right-4 gap-2 rounded-lg bg-blue-500 py-5 text-white shadow-lg transition-all hover:bg-blue-600"
              >
                <Map className="h-4 w-4" />
                نمایش روی نقشه
              </Button>
            </div>
          </>
        )}

        {showMap && (
          <ProductMap
            onClose={() => setShowMap(false)}
            productName={productName}
            product_id={productId}
          />
        )}

        {offlineOffers.map((offer, index) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            index={onlineOffers.length + index}
            isLast={index === offlineOffers.length - 1}
            productName={productName}
            expandedId={expandedId}
            productImage={productImage}
            onToggleContact={toggleContact}
          />
        ))}

        {displayOffers.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-500">
            فروشنده&#8204;ای یافت نشد
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Product Page
// ─────────────────────────────────────────────

export default function ProductPage() {
  const { id } = useParams();

  const productId = Number(id);

  // ─────────────────────────────────────────
  // Product
  // ─────────────────────────────────────────

  const { data, isPending } = useGetProduct(productId);

  const { data: priceHistory } = useGetProductPriceHistory(productId);

  const [activeFilter, setActiveFilter] = useState<
    "all" | "city" | "warranty" | "guaranteed"
  >("all");

  const {
    data: offersData,
    isPending: offersPending,
    refetch: refetchOffers,
  } = useGetProductOffers(
    productId,
    activeFilter === "all" ? undefined : activeFilter,
  );

  const {
    data: searchResults,
    isPending: searchResultsIsPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetSimilarProducts(productId);

  const { data: user } = useGetUser();

  // Refetch offers when user's city changes (after CitySelector)
  useEffect(() => {
    refetchOffers();
  }, [user?.city?.id]);

  // ─────────────────────────────────────────
  // Offers
  // ─────────────────────────────────────────

  const offers: Offer[] = useMemo(() => {
    if (Array.isArray(offersData)) {
      return offersData;
    }

    if (offersData?.data && Array.isArray(offersData.data)) {
      return offersData.data;
    }

    if (offersData?.offers && Array.isArray(offersData.offers)) {
      return offersData.offers;
    }

    return [];
  }, [offersData]);

  const offerFilters: OfferFilters | null = useMemo(() => {
    if (offersData?.filters) return offersData.filters;
    return null;
  }, [offersData]);

  const cheapestOffer = useMemo(() => {
    if (offers.length === 0) {
      return null;
    }

    return [...offers].sort((a, b) => a.price - b.price)[0];
  }, [offers]);

  // گزارش کنار لایک باید مربوط به همان فروشنده‌ای باشد
  // که در CTA اصلی برای خرید انتخاب شده است.
  const [mainReportModalOpen, setMainReportModalOpen] = useState(false);

  const handleMainReport = () => {
    if (!cheapestOffer) {
      toast.error("فروشنده‌ای برای گزارش وجود ندارد");
      return;
    }

    setMainReportModalOpen(true);
  };

  // ─────────────────────────────────────────
  // Similar Products
  // ─────────────────────────────────────────

  const hasSimilarProducts =
    searchResults?.pages?.some(
      (page: any) => Array.isArray(page?.data) && page.data.length > 0,
    ) ?? false;

  // ─────────────────────────────────────────
  // Favorites
  // ─────────────────────────────────────────

  const { data: favoriteIds = [] } = useGetUserFavorites(true, {
    enabled: !!user?.phone,
  });

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const favoriteMutation = usePostUserFavorite();

  const [mainProductFavorite, setMainProductFavorite] = useState(false);

  useEffect(() => {
    setMainProductFavorite(
      Boolean(data?.is_favorite) || favoriteSet.has(productId),
    );
  }, [data?.is_favorite, favoriteSet, productId]);

  const handleMainFavorite = () => {
    favoriteMutation.mutate(
      {
        product_id: productId,
      },
      {
        onSuccess: () => {
          setMainProductFavorite((prev) => !prev);
        },
      },
    );
  };

  // ─────────────────────────────────────────
  // Alert
  // ─────────────────────────────────────────

  const { data: alertIds = [] } = useGetUserAlerts(true, {
    enabled: !!user?.phone,
  });

  const alertSet = useMemo(
    () => new Set<number>(Array.isArray(alertIds) ? alertIds : []),
    [alertIds],
  );

  const mainProductAlert = alertSet.has(productId);

  const createAlertMutation = usePostUserAlert();
  const deleteAlertMutation = useDeleteUserAlert();
  const { refetch: refetchProductAlert } = useGetProductAlert(productId);

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [alertPrice, setAlertPrice] = useState("");

  const [hasExistingAlert, setHasExistingAlert] = useState(false);
  const [hasExistingAvailabilityAlert, setHasExistingAvailabilityAlert] =
    useState(false);
  const [existingAlertData, setExistingAlertData] = useState<any>(null);

  useEffect(() => {
    setHasExistingAlert(Boolean(data?.is_alert));
  }, [data?.is_alert]);

  const openAlertModal = async () => {
    if (!data) return;

    try {
      const result = await refetchProductAlert();
      const alert = result.data;

      const hasPrice =
        alert?.watch_price !== null && alert?.watch_price !== undefined;

      const hasAvailability = alert?.watch_availability === true;

      setExistingAlertData(alert ?? null);
      setHasExistingAlert(Boolean(alert) && (hasPrice || hasAvailability));
      setHasExistingAvailabilityAlert(hasAvailability);

      if (hasPrice) {
        setAlertPrice(String(alert.watch_price));
        setShowAvailabilityModal(false);
        setShowAlertModal(true);
        return;
      }

      if (hasAvailability) {
        setShowAlertModal(false);
        setShowAvailabilityModal(true);
        return;
      }

      setAlertPrice("");

      if (data.is_available === false) {
        setShowAlertModal(false);
        setShowAvailabilityModal(true);
      } else {
        setShowAvailabilityModal(false);
        setShowAlertModal(true);
      }
    } catch (error) {
      console.error("Error getting product alert:", error);
      setHasExistingAlert(false);
      setHasExistingAvailabilityAlert(false);
      setExistingAlertData(null);
      setAlertPrice("");

      if (data.is_available === false) {
        setShowAlertModal(false);
        setShowAvailabilityModal(true);
      } else {
        setShowAvailabilityModal(false);
        setShowAlertModal(true);
      }
    }
  };

  const closeAlertModal = () => {
    setShowAlertModal(false);
    setAlertPrice("");
  };

  const closeAvailabilityModal = () => {
    setShowAvailabilityModal(false);
  };

  const handleAlertSubmit = async () => {
    if (!alertPrice.trim()) {
      return;
    }

    const price = Number(alertPrice.replace(/,/g, ""));

    if (isNaN(price) || price <= 0) {
      toast.error("لطفاً قیمت معتبر وارد کنید");
      return;
    }

    try {
      const result = await createAlertMutation.mutateAsync({
        product_id: productId,
        watch_price: price,
      });

      setExistingAlertData(result ?? { watch_price: price });
      setHasExistingAlert(true);
      setHasExistingAvailabilityAlert(false);
      setAlertPrice(price.toString());

      closeAlertModal();
    } catch (error: any) {
      const message = error?.response?.data?.message || "خطا در ثبت اعلان قیمت";

      toast.error(message);
    }
  };

  const handleDeleteAlert = async () => {
    try {
      await deleteAlertMutation.mutateAsync({
        product_id: productId,
      });

      setHasExistingAlert(false);
      setHasExistingAvailabilityAlert(false);
      setExistingAlertData(null);
      setAlertPrice("");

      closeAlertModal();
    } catch (error: any) {
      const message = error?.response?.data?.message || "خطا در حذف اعلان قیمت";

      toast.error(message);
    }
  };

  const handleAvailabilityConfirm = async () => {
    if (hasExistingAvailabilityAlert) {
      closeAvailabilityModal();
      return;
    }

    try {
      const result = await createAlertMutation.mutateAsync({
        product_id: productId,
        watch_availability: true,
      });

      setExistingAlertData(result ?? { watch_availability: true });
      setHasExistingAlert(true);
      setHasExistingAvailabilityAlert(true);

      toast.success("اعلان موجودی با موفقیت ثبت شد");
      closeAvailabilityModal();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "خطا در ثبت اعلان موجودی";

      toast.error(message);
    }
  };

  const handleDeleteAvailabilityAlert = async () => {
    if (!hasExistingAvailabilityAlert) {
      return;
    }

    try {
      await deleteAlertMutation.mutateAsync({
        product_id: productId,
      });

      setHasExistingAlert(false);
      setHasExistingAvailabilityAlert(false);
      setExistingAlertData(null);

      toast.success("اعلان موجودی با موفقیت حذف شد");
      closeAvailabilityModal();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "خطا در حذف اعلان موجودی";

      toast.error(message);
    }
  };

  const handleCancel = () => {
    closeAvailabilityModal();
  };

  // ─────────────────────────────────────────
  // Variant
  // ─────────────────────────────────────────

  const [activeVariant, setActiveVariant] = useState(0);

  // ─────────────────────────────────────────
  // History
  // ─────────────────────────────────────────

  const { mutate: addView } = usePostUserHistory();

  // ─────────────────────────────────────────
  // Infinite Scroll
  // ─────────────────────────────────────────

  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchNextPageRef = useRef(fetchNextPage);

  fetchNextPageRef.current = fetchNextPage;

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPageRef.current?.();
        }
      },
      {
        rootMargin: "300px",
      },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage]);

  // ─────────────────────────────────────────
  // Record View
  // ─────────────────────────────────────────

  useEffect(() => {
    if (!user?.id || !id) {
      return;
    }

    addView({
      product_id: Number(id),
    });
  }, [user?.id, id]);

  // ─────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────

  if (isPending) return <ScreenSpinner />;

  // ─────────────────────────────────────────
  // 404
  // ─────────────────────────────────────────

  if (!data) {
    return (
      <div
        className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center"
        dir="rtl"
      >
        <div className="group relative mb-10">
          <div className="absolute inset-0 h-36 w-36 animate-pulse rounded-full bg-rose-500/10 blur-2xl dark:bg-rose-500/20" />

          <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-2 border-gray-200 bg-white shadow-xl dark:border-gray-600/50 dark:bg-[#1e293b]">
            <Search
              className="h-14 w-14 text-gray-400 dark:text-gray-500"
              strokeWidth={1.5}
            />
          </div>

          <div
            className="absolute -bottom-2 -left-2 flex h-12 w-12 animate-bounce items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-sm font-extrabold text-white shadow-lg"
            style={{
              animationDuration: "2s",
            }}
          >
            ۴۰۴
          </div>

          <div
            className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-amber-400"
            style={{
              animationDuration: "3s",
            }}
          />

          <div
            className="absolute -right-5 top-1/2 h-2 w-2 animate-ping rounded-full bg-blue-400"
            style={{
              animationDuration: "2.5s",
              animationDelay: "0.5s",
            }}
          />
        </div>

        <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          محصول مورد نظر پیدا نشد
        </h1>

        <p className="mb-10 max-w-sm text-base leading-relaxed text-gray-500 dark:text-gray-400">
          ممکن است این محصول حذف شده باشد، نام آن تغییر کرده باشد یا موقتاً در
          دسترس نباشد. لطفاً از طریق جستجو، محصول مورد نظر خود را پیدا کنید.
        </p>

        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <Link href="/">
            <Button className="h-12 w-full gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 px-8 font-semibold text-white shadow-lg sm:w-auto">
              <Home className="h-5 w-5" />
              صفحه اصلی
            </Button>
          </Link>
        </div>

        <Link
          href="/"
          className="group mt-8 flex items-center gap-2 text-sm font-medium text-rose-500"
        >
          <ArrowRight className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          بازگشت به صفحه قبل
        </Link>

        <div className="mt-10 w-full max-w-md border-t border-gray-200 pt-8 dark:border-gray-800">
          <p className="mb-4 text-xs font-medium text-gray-400 dark:text-gray-500">
            یا شاید به دنبال این‌ها بودید؟
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {["گوشی موبایل", "لپ‌تاپ", "هدفون", "ساعت هوشمند"].map((item) => (
              <Link
                key={item}
                href={`/search?query=${encodeURIComponent(item)}`}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-[#1e293b] dark:text-gray-400"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const products = searchResults?.pages.flatMap((page: any) => page.data) || [];

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <>
      <div className="min-h-screen font-sans text-[#1e293b] dark:text-white">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList className="text-sm text-gray-500 dark:text-gray-400">
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="transition hover:text-[#1e293b] dark:hover:text-white"
                >
                  ترب
                </BreadcrumbLink>
              </BreadcrumbItem>

              {data.breadcrumb?.map(
                (category: BreadcrumbCategory, index: number) => {
                  const isLast = index === (data.breadcrumb?.length ?? 0) - 1;

                  return (
                    <Fragment key={category.id}>
                      <BreadcrumbSeparator className="mx-2 text-gray-400 dark:text-gray-600">
                        &#8250;
                      </BreadcrumbSeparator>

                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage className="font-bold text-gray-600 dark:text-gray-300">
                            {category.title}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            href={`/browse/${category.id}/${category.slug}`}
                            className="transition hover:text-[#1e293b] dark:hover:text-white"
                          >
                            {category.title}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </Fragment>
                  );
                },
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Product */}

        <div className="mx-auto max-w-7xl px-4 pb-12">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="rounded-2xl bg-[#ffffff] p-6 dark:bg-[#1e293b]">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <ProductImages
                    productImages={data?.productImages ?? []}
                    productName={data?.name}
                  />

                  <div className="space-y-4">
                    <h1 className="text-xl font-bold leading-relaxed text-[#1e293b] dark:text-[#f1f5f9]">
                      {data.name}
                    </h1>

                    {data.name_en && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {data.name_en}
                      </p>
                    )}

                    {data.productVariants?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {data.productVariants.map((v: any, i: number) => (
                          <button
                            key={i}
                            onClick={() => setActiveVariant(i)}
                            className={`rounded-lg px-3 py-2 text-xs transition ${
                              activeVariant === i
                                ? "border-2 border-blue-500 bg-[#ffffff] dark:bg-[#0f172a]"
                                : "border border-gray-300 bg-[#ffffff] hover:border-gray-400 dark:border-gray-600 dark:bg-[#0f172a]"
                            }`}
                          >
                            <div className="text-right">{v.title}</div>

                            <div className="text-gray-500 dark:text-gray-400">
                              {v.lowest_price != null ? (
                                <>
                                  <span className="font-medium text-[#1e293b] dark:text-white">
                                    از {formatPrice(v.lowest_price)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-400">ناموجود</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Actions */}

                    <div dir="ltr" className="flex items-center gap-3 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleMainReport}
                        disabled={!cheapestOffer}
                        className="text-gray-500 hover:text-[#1e293b] dark:text-gray-300 dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span dir="rtl">گزارش</span>

                        <Flag className="mr-1 h-4 w-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-[#1e293b] dark:text-gray-300 dark:hover:text-white"
                      >
                        <Share2 className="h-5 w-5" />
                      </Button>

                      {/* Favorite */}

                      <button
                        type="button"
                        onClick={handleMainFavorite}
                        disabled={favoriteMutation.isPending}
                        className="flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-gray-100 disabled:cursor-not-allowed dark:hover:bg-gray-800"
                      >
                        <div
                          className={`h-5 w-5 ${
                            mainProductFavorite ? "like_fill" : "like"
                          }`}
                        />
                      </button>

                      {/* Alert */}

                      <button
                        type="button"
                        onClick={openAlertModal}
                        disabled={
                          createAlertMutation.isPending ||
                          deleteAlertMutation.isPending
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-gray-100 disabled:cursor-not-allowed dark:hover:bg-gray-800"
                      >
                        <div
                          className={`h-5 w-5 ${
                            mainProductAlert ? "bell_fill" : "bell"
                          }`}
                        />
                      </button>

                      {offers.length > 0 && (
                        <div
                          dir="rtl"
                          className="ml-auto flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400"
                        >
                          <span>{offers.length} فروشنده</span>

                          <ChevronDown className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    {/* CTA */}

                    {cheapestOffer ? (
                      <a
                        href={`${baseURL}/products/redirect?offer_id=${cheapestOffer.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="w-full rounded-xl bg-gradient-to-r from-[#f04151] to-[#d73948] py-8 text-lg font-bold text-white shadow-lg shadow-red-500/20">
                          <div className="flex w-full items-center justify-between px-4">
                            <div className="text-right">
                              <div className="text-sm font-normal">
                                خرید از {cheapestOffer.shop.shop_name}
                              </div>

                              <div>{formatPrice(cheapestOffer.price)}</div>
                            </div>

                            <Badge className="bg-[#1C1C5D] text-xs">
                              <span className="bg-gradient-to-r from-[#ffff00] to-[#00ffff] bg-clip-text text-transparent">
                                ضمانت ترب
                              </span>
                            </Badge>
                          </div>
                        </Button>
                      </a>
                    ) : (
                      <Button className="w-full py-6 bg-[#f1f5f9] hover:bg-[#f1f5f9] text-[#919eab] rounded-lg">
                        این محصول فعلا فروشنده‌ای ندارد
                      </Button>
                    )}
                  </div>
                </div>

                {/* Ask Torob */}

                <div className="relative mt-6">
                  <Input
                    placeholder="از ترب بپرس ..."
                    className="w-full rounded-full border-gray-300 bg-[#ffffff] py-6 pl-14 pr-6 text-right text-[#1e293b] placeholder:text-gray-400 focus:border-blue-500 dark:border-gray-700 dark:bg-[#0f172a] dark:text-white dark:placeholder:text-gray-500"
                  />

                  <Button
                    size="icon"
                    className="absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Price Chart */}

            <div className="lg:col-span-4">
              {priceHistory && priceHistory.labels?.length > 0 ? (
                <PriceChart priceData={priceHistory} />
              ) : (
                <div className="flex h-56 items-center justify-center rounded-2xl bg-white p-6 dark:bg-[#1e293b]">
                  <span className="text-sm text-gray-500">
                    داده‌ای برای نمایش وجود ندارد
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Offers + Specifications */}

          <div className="mt-6 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
            <div className="min-h-0 lg:col-span-8">
              {offersPending ? (
                <InlineSpinner className="rounded-2xl bg-white py-16 dark:bg-[#1e293b]" />
              ) : (
                <SellersList
                  data={offers}
                  filters={offerFilters}
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  productId={productId}
                  productName={data.name || ""}
                  productImage={data.productImages?.[0]?.url ?? null}
                />
              )}
            </div>

            {/* Specifications */}

            <div className="min-h-0 lg:col-span-4">
              {data.productSpecifications?.length > 0 && (
                <div className="h-full max-h-full min-h-0 overflow-y-auto rounded-2xl bg-white p-6 dark:bg-[#1e293b]">
                  <h3 className="mb-6 text-lg font-bold text-[#1e293b] dark:text-[#f1f5f9]">
                    مشخصات محصول
                  </h3>

                  {(() => {
                    const keySpecs = data.productSpecifications.filter(
                      (s: any) => s.type === "KEY",
                    );

                    const generalSpecs = data.productSpecifications.filter(
                      (s: any) => s.type === "GENERAL",
                    );

                    return (
                      <>
                        {keySpecs.length > 0 && (
                          <div className="mb-6">
                            <h4 className="mb-5 text-sm font-bold text-[#1e293b] dark:text-[#f1f5f9]">
                              مشخصات کلیدی
                            </h4>

                            <div className="space-y-3">
                              {keySpecs.map((spec: any) => (
                                <div
                                  key={spec.id}
                                  className="flex items-center justify-between gap-6 text-sm"
                                >
                                  <span className="text-[#1e293b] dark:text-[#f1f5f9]">
                                    {spec.specification?.title || spec.title}
                                  </span>

                                  <span className="text-left text-[#64748b] dark:text-[#94a3b8]">
                                    {spec.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {generalSpecs.length > 0 && (
                          <div
                            className={
                              keySpecs.length > 0
                                ? "border-t border-gray-200 pt-6 dark:border-gray-700"
                                : ""
                            }
                          >
                            <h4 className="mb-5 text-sm font-bold text-[#1e293b] dark:text-[#f1f5f9]">
                              مشخصات کلی
                            </h4>

                            <div className="space-y-3">
                              {generalSpecs.map((spec: any) => (
                                <div
                                  key={spec.id}
                                  className="flex items-center justify-between gap-6 text-sm"
                                >
                                  <span className="text-[#1e293b] dark:text-[#f1f5f9]">
                                    {spec.specification?.title || spec.title}
                                  </span>

                                  <span className="text-left text-[#64748b] dark:text-[#94a3b8]">
                                    {spec.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Similar Products */}

          <div className="mt-10">
            <h2 className="mb-4 text-xl font-bold text-[#1e293b] dark:text-[#f1f5f9]">
              محصولات پیشنهادی
            </h2>

            {searchResultsIsPending ? (
              <InlineSpinner />
            ) : products.length === 0 ? (
              <div className="flex justify-center py-10">
                <span className="text-sm text-gray-500">
                  محصول مشابهی یافت نشد
                </span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {products.map((product: any) => (
                    <ProductCard
                      key={product.id}
                      product={{
                        ...product,
                        is_favorite: favoriteSet.has(product.id),
                        is_alert: alertSet.has(product.id),
                      }}
                    />
                  ))}
                </div>

                <div ref={sentinelRef} className="h-10 w-full" />

                {isFetchingNextPage && <InlineSpinner size="size-6" />}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* Main Report Modal */}
      {/* مربوط به فروشنده CTA اصلی */}
      {/* ═══════════════════════════════════════ */}

      {mainReportModalOpen && cheapestOffer && (
        <ReportModal
          open={mainReportModalOpen}
          onClose={() => setMainReportModalOpen(false)}
          offer={cheapestOffer}
          productName={data.name || ""}
          productImage={data.productImages?.[0]?.url ?? null}
        />
      )}

      {/* ═══════════════════════════════════════ */}
      {/* Alert Price Modal */}
      {/* ═══════════════════════════════════════ */}

      {showAlertModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-4"
          onMouseDown={closeAlertModal}
        >
          <div
            className="relative w-full max-w-[540px] rounded-xl bg-white px-7 pb-7 pt-6 shadow-2xl dark:bg-[#212b36]"
            onMouseDown={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <button
              type="button"
              onClick={closeAlertModal}
              className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
            >
              <X size={22} />
            </button>

            <div className="pt-1 text-center">
              <h2 className="text-lg font-bold text-[#1e293b] dark:text-white">
                {hasExistingAlert
                  ? "ویرایش اعلان قیمت"
                  : "اطلاع از قیمت دلخواه"}
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#64748b] dark:text-slate-400">
                {hasExistingAlert
                  ? "قیمت دلخواه خود را ویرایش کنید"
                  : "قیمت دلخواهتان را ثبت کنید تا شما را مطلع کنیم"}
              </p>
            </div>

            <div className="mt-7">
              <div className="flex h-14 items-center overflow-hidden rounded-lg border border-red-400 bg-white dark:bg-[#212b36]">
                <input
                  type="text"
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                  placeholder="تومان"
                  className="h-full w-full border-0 px-4 text-sm text-[#1e293b] outline-none placeholder:text-gray-400 dark:bg-[#212b36] dark:text-white"
                  dir="rtl"
                />

                <span className="shrink-0 px-4 text-sm text-gray-500 dark:text-gray-400">
                  تومان
                </span>
              </div>

              <p className="mt-2 text-right text-xs text-red-500">
                قیمت فعلی:{" "}
                {cheapestOffer?.price != null
                  ? formatPrice(cheapestOffer.price)
                  : "نامشخص"}
              </p>
            </div>

            <div className="mt-7 flex gap-3">
              {hasExistingAlert ? (
                <>
                  <button
                    type="button"
                    onClick={handleAlertSubmit}
                    disabled={
                      !alertPrice.trim() || createAlertMutation.isPending
                    }
                    className="h-14 flex-1 rounded-lg bg-[#dc3045] text-base font-bold text-white transition hover:bg-[#c92a3d] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {createAlertMutation.isPending ? "در حال ثبت..." : "ثبت"}
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteAlert}
                    disabled={deleteAlertMutation.isPending}
                    className="flex h-14 flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 text-base font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-5 w-5" />

                    {deleteAlertMutation.isPending ? "در حال حذف..." : "حذف"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleAlertSubmit}
                  disabled={!alertPrice.trim() || createAlertMutation.isPending}
                  className="h-14 w-full rounded-lg bg-[#dc3045] text-base font-bold text-white transition hover:bg-[#c92a3d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createAlertMutation.isPending ? "در حال ثبت..." : "ثبت"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* Availability Modal */}
      {/* ═══════════════════════════════════════ */}

      {showAvailabilityModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-4"
          onMouseDown={closeAvailabilityModal}
        >
          <div
            className="relative w-full max-w-[540px] rounded-xl bg-white px-7 pb-7 pt-6 shadow-2xl dark:bg-[#212b36]"
            onMouseDown={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <button
              type="button"
              onClick={closeAvailabilityModal}
              className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
            >
              <X size={22} />
            </button>

            <div className="pt-1 text-center">
              <h2 className="text-lg font-bold text-[#1e293b] dark:text-white">
                {hasExistingAvailabilityAlert
                  ? "حذف اعلان موجودی"
                  : "اطلاع از موجودی"}
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#64748b] dark:text-slate-400">
                {hasExistingAvailabilityAlert
                  ? "شما قبلاً برای این محصول اعلان موجودی ثبت کرده‌اید. آیا می‌خواهید آن را حذف کنید؟"
                  : "می‌خواهید موجود شدن محصول را از طریق اعلان (نوتیفیکیشن) به شما اطلاع دهیم؟"}
              </p>
            </div>

            <div className="mt-7 flex gap-3">
              {hasExistingAvailabilityAlert ? (
                <>
                  <button
                    type="button"
                    onClick={handleDeleteAvailabilityAlert}
                    disabled={deleteAlertMutation.isPending}
                    className="flex h-14 flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 text-base font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-5 w-5" />

                    {deleteAlertMutation.isPending ? "در حال حذف..." : "حذف"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="h-14 flex-1 rounded-lg bg-gray-200 text-base font-bold text-gray-700 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    انصراف
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleAvailabilityConfirm}
                    disabled={createAlertMutation.isPending}
                    className="h-14 flex-1 rounded-lg bg-[#dc3045] text-base font-bold text-white transition hover:bg-[#c92a3d] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {createAlertMutation.isPending
                      ? "در حال ثبت..."
                      : "بله، اطلاع بده"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="h-14 flex-1 rounded-lg bg-gray-200 text-base font-bold text-gray-700 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    خیر
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
