"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import {
  Heart,
  Bell,
  Share2,
  Flag,
  ChevronDown,
  ChevronUp,
  Send,
  Store,
  ExternalLink,
  ShieldCheck,
  Package,
  Phone,
  MapPin,
  MessageCircle,
  Search,
  Home,
  ArrowRight,
  Map,
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
  useGetSimilarProducts,
  useGetUser,
  useGetUserAlerts,
  useGetUserFavorites,
  usePostUserFavorite,
  usePostUserHistory,
  useGetProductOffers,
  usePostUserAlert,
} from "@/lib/apis";

import { Spinner } from "@/components/ui/spinner";
import { baseURL } from "@/lib/axios";
import ProductMap from "@/components/product-map";

import Link from "next/link";

interface Shop {
  id: number;
  shop_name: string;
  shop_logo?: string;
  type: "ONLINE_SHOP" | "OFFLINE_SHOP";
  domain?: string;
  address?: string;
  city: {
    id: number;
    name: string;
  };
}

interface ShopContact {
  type: string;
  platform: string;
  value: string;
}

interface Offer {
  id: number;
  price: number;
  stock_status: string;
  more_info_url: string;
  description: string;
  warranty: { title: string } | null;
  warranty_duration: number | null;
  updated_at: string;
  shop: Shop;
  shopContacts?: ShopContact[];
  is_best?: boolean;
}

// ─── Mock Data ─────────────────────────────────────────

const variants = [
  {
    storage: "۱۲ GB",
    ram: null as string | null,
    price: "۲۹۹,۰۰۰",
  },
  {
    storage: "۱۲ GB",
    ram: "۵۱۲ GB",
    price: "۲۸۹,۹۶۰,۰۰۰",
  },
];

const offers: Offer[] = [
  {
    id: 1,
    price: 271370000,
    stock_status: "موجود در انبار",
    more_info_url: "#",
    description: "",
    warranty: {
      title: "ضمانت ۱۸ ماهه",
    },
    warranty_duration: 18,
    updated_at: new Date().toISOString(),
    shop: {
      id: 1,
      shop_name: "جیجی مارکت",
      shop_logo: "",
      type: "ONLINE_SHOP",
      domain: "digikala.com",
    },
    is_best: true,
  },

  {
    id: 2,
    price: 275000000,
    stock_status: "موجود در انبار",
    more_info_url: "#",
    description: "",
    warranty: {
      title: "ضمانت ۱۲ ماهه",
    },
    warranty_duration: 12,
    updated_at: new Date().toISOString(),
    shop: {
      id: 2,
      shop_name: "دیجی‌کالا",
      shop_logo: "",
      type: "ONLINE_SHOP",
      domain: "digikala.com",
    },
    is_best: false,
  },

  {
    id: 3,
    price: 280000000,
    stock_status: "تک‌فروشی",
    more_info_url: "#",
    description: "",
    warranty: {
      title: "ضمانت ۷ روزه",
    },
    warranty_duration: null,
    updated_at: new Date().toISOString(),
    shop: {
      id: 3,
      shop_name: "موبایل مرکزی",
      shop_logo: "",
      type: "OFFLINE_SHOP",
      address: "تهران، خیابان جمهوری، پاساژ علاءالدین، طبقه ۲",
    },
    shopContacts: [
      {
        type: "PHONE",
        platform: "PHONE",
        value: "09123456789",
      },
      {
        type: "MESSENGER",
        platform: "TELEGRAM",
        value: "@mobile_market",
      },
      {
        type: "MESSENGER",
        platform: "WHATSAPP",
        value: "09123456789",
      },
    ],
    is_best: false,
  },

  {
    id: 4,
    price: 278000000,
    stock_status: "موجود",
    more_info_url: "#",
    description: "",
    warranty: {
      title: "ضمانت ۱۲ ماهه",
    },
    warranty_duration: 12,
    updated_at: new Date().toISOString(),
    shop: {
      id: 4,
      shop_name: "بازار موبایل ایران",
      shop_logo: "",
      type: "OFFLINE_SHOP",
      address: "تهران، خیابان حافظ، پاساژ چارسو",
    },
    shopContacts: [
      {
        type: "PHONE",
        platform: "PHONE",
        value: "021-12345678",
      },
      {
        type: "MESSENGER",
        platform: "BALE",
        value: "bale.ir/mobileshop",
      },
    ],
    is_best: false,
  },
];

type TabType = "all" | "ONLINE_SHOP" | "OFFLINE_SHOP";

const platformIcons: Record<string, React.ReactNode> = {
  PHONE: <Phone className="w-4 h-4" />,
  TELEGRAM: <MessageCircle className="w-4 h-4" />,
  WHATSAPP: <MessageCircle className="w-4 h-4" />,
  BALE: <MessageCircle className="w-4 h-4" />,
  INSTAGRAM: <MessageCircle className="w-4 h-4" />,
};

const platformLabels: Record<string, string> = {
  PHONE: "تماس",
  TELEGRAM: "تلگرام",
  WHATSAPP: "واتساپ",
  BALE: "بله",
  INSTAGRAM: "اینستاگرام",
};

function OfferCard({
  offer,
  index,
  expandedId,
  onToggleContact,
}: {
  offer: Offer;
  index: number;
  expandedId: number | null;
  onToggleContact: (id: number) => void;
}) {
  const isExpanded = expandedId === offer.id;
  const isOffline = offer.shop.type === "OFFLINE_SHOP";

  return (
    <div className="flex flex-col h-auto px-4 py-4 border-b border-gray-300">
      <div className="flex gap-10 w-full">
        {!isOffline ? (
          <>
            <div>
              <h1 className="text-[#1e293b]">کوک همراه</h1>
              <p className="text-[#64748b] mt-2 text-xs">یزد</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center text-xs gap-2 justify-center bg-[#e7fae3] border border-[#e7fae3] text-[#248212] py-1 px-1 rounded-full">
                  <span>★۴.۹ (۳ ماه در ترب)</span>
                  <ChevronDown size={20} />
                </div>
                <div className="flex items-center gap-1 text-xs justify-center px-1.5 py-1.5 rounded-full cursor-pointer bg-[#f1f5f9]">
                  <img
                    width={16}
                    height={16}
                    src="https://assets.torob.com/public/main/images/flag_white.png"
                  />
                  <p>گزارش</p>
                </div>
              </div>
              <h1 className="text-[#1e293b] text-sm max-w-max">
                گوشی موبایل اپل مدل iPhone 17 Pro Max ZAA ظرفیت 256 گیگابایت رم
                12 گیگابایت - نات اکتیو/ رجیستر شده
              </h1>
              <p className="text-xs text-[#64748b]">
                گارانتی 6 ماهه موبایل وسعت و 48 ساعت مهلت تست
              </p>
            </div>
            <div>
              <span className="text-[#1e293b] text-sm font-bold">
                ۳۷۵٫۹۰۰٫۰۰۰ تومان
              </span>
              <Link href="">
                <div className="text-white text-sm px-2 mt-2 py-2.5 text-center bg-[#d73948] rounded-lg">
                  خرید اینترنتی
                </div>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div>
              <h1 className="text-[#1e293b]">کوک همراه</h1>
              <img src="https://image.torob.com/shops/images/83bfad8e37c5.jpg_/300x300.webp" />
            </div>
          </>
        )}
      </div>
      {/* <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
            {offer.shop.shop_logo ? (
              <img
                src={offer.shop.shop_logo}
                alt={offer.shop.shop_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Store className="h-6 w-6 text-gray-500" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {offer.shop.shop_name}
              </span>

              {isOffline && (
                <Badge
                  variant="outline"
                  className="h-5 gap-1 border-gray-300 text-[10px] text-gray-500 dark:border-gray-600 dark:text-gray-400"
                >
                  <MapPin className="h-3 w-3" />
                  حضوری
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {offer.warranty && (
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                  {offer.warranty.title}
                </span>
              )}

              <span className="flex items-center gap-1">
                <Package className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                {offer.stock_status || "موجود"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-left">
            <div className="text-lg font-bold text-[#1e293b] dark:text-white">
              {offer.price.toLocaleString("fa-IR")} تومان
            </div>

            {index === 0 && (
              <div className="text-xs text-green-600 dark:text-green-400">
                ارزان‌ترین
              </div>
            )}
          </div>

          {isOffline ? (
            <Button
              size="sm"
              onClick={() =>
                onToggleContact(offer.id)
              }
              className={`h-10 shrink-0 gap-1 rounded-xl px-5 transition ${isExpanded
                ? "bg-gray-200 text-[#1e293b] hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                : "bg-blue-400 text-white hover:bg-blue-500"
                }`}
            >
              <span className="text-sm">
                {isExpanded
                  ? "بستن"
                  : "اطلاعات تماس"}
              </span>

              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <a
              href={`${baseURL}/products/redirect?offer_id=${Number(
                offer.id
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button
                size="sm"
                className="h-10 gap-1 rounded-xl bg-gradient-to-r from-[#f04151] to-[#d73948] px-5 text-white hover:opacity-90"
              >
                <span className="text-sm">
                  مشاهده فروشگاه
                </span>

                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          )}
        </div>
      </div>

      {isOffline && isExpanded && (
        <div className="mt-2 border-t border-gray-200 pt-3 dark:border-gray-800">
          {offer.shop.address && (
            <div className="mb-3 flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
              <span>{offer.shop.address}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {offer.shopContacts?.map(
              (contact, idx) => (
                <a
                  key={idx}
                  href={
                    contact.platform === "PHONE"
                      ? `tel:${contact.value}`
                      : contact.platform ===
                        "TELEGRAM"
                        ? `https://t.me/${contact.value.replace(
                          "@",
                          ""
                        )}`
                        : contact.platform ===
                          "WHATSAPP"
                          ? `https://wa.me/${contact.value.replace(
                            /[^0-9]/g,
                            ""
                          )}`
                          : "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-800"
                  >
                    {platformIcons[
                      contact.platform
                    ] ?? (
                        <MessageCircle className="h-4 w-4" />
                      )}

                    <span className="text-xs">
                      {platformLabels[
                        contact.platform
                      ] ?? contact.platform}
                    </span>

                    <span className="ltr text-xs text-gray-500">
                      {contact.value}
                    </span>
                  </Button>
                </a>
              )
            )}
          </div>
        </div>
      )} */}
    </div>
  );
}

function SellersList({ data }: { data: Offer[] }) {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const [showMap, setShowMap] = useState(false);

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const listTopRef = useRef<HTMLDivElement>(null);

  const offlineStartRef = useRef<HTMLDivElement>(null);

  const onlineOffers = useMemo(
    () =>
      data
        .filter((o) => o.shop.type === "ONLINE_SHOP")
        .sort((a, b) => a.price - b.price),
    [data],
  );

  const offlineOffers = useMemo(
    () =>
      data
        .filter((o) => o.shop.type === "OFFLINE_SHOP")
        .sort((a, b) => a.price - b.price),
    [data],
  );

  const tabs: {
    key: TabType;
    label: string;
  }[] = [
    {
      key: "all",
      label: `همه (${data.length})`,
    },
    {
      key: "ONLINE_SHOP",
      label: `آنلاین (${onlineOffers.length})`,
    },
    {
      key: "OFFLINE_SHOP",
      label: `حضوری (${offlineOffers.length})`,
    },
  ];

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);

    const headerOffset = 90;

    if (
      tab === "OFFLINE_SHOP" &&
      offlineOffers.length > 0 &&
      offlineStartRef.current
    ) {
      const top =
        offlineStartRef.current.getBoundingClientRect().top +
        window.scrollY -
        headerOffset;

      window.scrollTo({
        top,
        behavior: "smooth",
      });
    } else if (listTopRef.current) {
      const top =
        listTopRef.current.getBoundingClientRect().top +
        window.scrollY -
        headerOffset;

      window.scrollTo({
        top,
        behavior: "smooth",
      });
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
      <div className="sticky top-0 z-10 rounded-t-2xl border-b border-gray-200 bg-[#ffffff] px-6 py-4 dark:border-gray-800 dark:bg-[#1e293b]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="whitespace-nowrap text-lg font-bold text-[#1e293b] dark:text-[#f1f5f9]">
            لیست قیمت فروشندگان
          </h2>

          <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1 dark:bg-[#0f172a]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm transition ${
                  activeTab === tab.key
                    ? "bg-white font-medium text-[#1e293b] shadow-sm dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {onlineOffers.map((offer, index) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            index={index}
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
                    فروشگاه‌های حضوری ({offlineOffers.length})
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
            productName="گوشی سامسونگ S26 Ultra 5G حافظه ۲۵۶ رم ۱۲ گیگابایت"
            product_id={1}
          />
        )}

        {offlineOffers.map((offer, index) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            index={onlineOffers.length + index}
            expandedId={expandedId}
            onToggleContact={toggleContact}
          />
        ))}

        {data.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-500">
            فروشنده‌ای یافت نشد
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { id, slug } = useParams();

  const productId = Number(id);

  const { data, isPending } = useGetProduct(productId);

  const { data: priceHistory } = useGetProductPriceHistory(productId);

  const {
    data: searchResults,
    isPending: searchResultsIsPending,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetSimilarProducts(productId);

  const { data: user } = useGetUser();

  // =========================================
  // آیا محصول مشابه داریم؟
  // =========================================

  const hasSimilarProducts =
    searchResults?.pages?.some(
      (page: any) => Array.isArray(page?.data) && page.data.length > 0,
    ) ?? false;

  // =========================================
  // Favorites
  // فقط وقتی مشابه داریم درخواست زده می‌شود
  // =========================================

  const { data: favoriteIds = [] } = useGetUserFavorites(true, {
    enabled: !!user?.phone && hasSimilarProducts,
  });

  // =========================================
  // Alerts
  // فقط وقتی مشابه داریم درخواست زده می‌شود
  // =========================================

  const { data: alertIds = [] } = useGetUserAlerts(true, {
    enabled: !!user?.phone && hasSimilarProducts,
  });

  const favoriteSet = new Set(favoriteIds);

  const alertSet = new Set(alertIds);

  // =========================================
  // Favorite Mutation
  // =========================================

  const favoriteMutation = usePostUserFavorite();

  // =========================================
  // وضعیت لایک محصول اصلی
  // =========================================

  const [mainProductFavorite, setMainProductFavorite] = useState(() =>
    favoriteSet.has(productId),
  );

  const handleMainFavorite = () => {
    if (favoriteMutation.isPending) {
      return;
    }

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

  // =========================================
  // وضعیت Alert محصول اصلی
  // =========================================

  const isMainProductAlert = alertSet.has(productId);

  // =========================================
  // State
  // =========================================

  const [activeVariant, setActiveVariant] = useState(0);

  const { mutate: addView } = usePostUserHistory();

  // =========================================
  // Infinite Scroll
  // =========================================

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

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage]);

  // =========================================
  // Product View
  // =========================================

  useEffect(() => {
    if (!user?.id || !id) {
      return;
    }

    addView({
      product_id: Number(id),
    });
  }, [user?.id, id]);

  // =========================================
  // Loading
  // =========================================

  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="size-8 text-blue-500" />
      </div>
    );
  }

  // =========================================
  // Product Not Found
  // =========================================

  if (!data || data.length === 0) {
    return (
      <div
        className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center"
        dir="rtl"
      >
        <div className="group relative mb-10">
          <div className="absolute inset-0 h-36 w-36 animate-pulse rounded-full bg-rose-500/10 blur-2xl dark:bg-rose-500/20" />

          <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-2 border-gray-200 bg-white shadow-xl transition-all duration-500 group-hover:scale-105 dark:border-gray-600/50 dark:bg-[#1e293b]">
            <Search
              className="h-14 w-14 text-gray-400 transition-colors duration-500 dark:text-gray-500"
              strokeWidth={1.5}
            />
          </div>

          <div
            className="absolute -bottom-2 -left-2 flex h-12 w-12 animate-bounce items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-sm font-extrabold text-white shadow-lg dark:from-rose-600 dark:to-pink-700"
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

        <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-gray-900 transition-colors duration-500 dark:text-white">
          محصول مورد نظر پیدا نشد
        </h1>

        <p className="mb-10 max-w-sm text-base leading-relaxed text-gray-500 transition-colors duration-500 dark:text-gray-400">
          ممکن است این محصول حذف شده باشد، نام آن تغییر کرده باشد یا موقتاً در
          دسترس نباشد. لطفاً از طریق جستجو، محصول مورد نظر خود را پیدا کنید.
        </p>

        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <Link href="/">
            <Button className="h-12 w-full gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 px-8 font-semibold text-white shadow-lg shadow-rose-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-rose-600 hover:to-pink-700 active:translate-y-0 sm:w-auto">
              <Home className="h-5 w-5" />
              صفحه اصلی
            </Button>
          </Link>
        </div>

        <Link
          href="/"
          className="group mt-8 flex items-center gap-2 text-sm font-medium text-rose-500 transition-colors duration-300 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300"
        >
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
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
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 transition-all duration-300 hover:border-rose-300 hover:text-rose-500 dark:border-gray-700 dark:bg-[#1e293b] dark:text-gray-400 dark:hover:border-rose-500/50 dark:hover:text-rose-400"
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

  return (
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

            <BreadcrumbSeparator className="mx-2 text-gray-400 dark:text-gray-600">
              ›
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              <BreadcrumbLink
                href="/digital"
                className="transition hover:text-[#1e293b] dark:hover:text-white"
              >
                موبایل و کالای دیجیتال
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator className="mx-2 text-gray-400 dark:text-gray-600">
              ›
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              <BreadcrumbLink
                href="/mobile"
                className="transition hover:text-[#1e293b] dark:hover:text-white"
              >
                گوشی موبایل
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator className="mx-2 text-gray-400 dark:text-gray-600">
              ›
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              <BreadcrumbPage className="text-gray-600 dark:text-gray-300">
                سامسونگ (Samsung)
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12">
        {/* ================================================= */}
        {/* Product + Price */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left */}

          <div className="lg:col-span-8">
            <div className="rounded-2xl bg-[#ffffff] p-6 dark:bg-[#1e293b]">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <ProductImages />

                <div className="space-y-4">
                  <h1 className="text-xl font-bold leading-relaxed text-[#1e293b] dark:text-[#f1f5f9]">
                    {data.name}
                  </h1>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {data.name_en}
                  </p>

                  {/* Variants */}

                  <div className="flex flex-wrap gap-2">
                    {variants.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveVariant(i)}
                        className={`rounded-lg px-3 py-2 text-xs transition ${
                          activeVariant === i
                            ? "border-2 border-blue-500 bg-[#ffffff] dark:bg-[#0f172a]"
                            : "border border-gray-300 bg-[#ffffff] hover:border-gray-400 dark:border-gray-600 dark:bg-[#0f172a] dark:hover:border-gray-500"
                        }`}
                      >
                        <div className="text-right">
                          ویترنام - {v.storage} {v.ram && `- ${v.ram}`}
                        </div>

                        <div className="text-gray-500 dark:text-gray-400">
                          از {v.price} تومان
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Actions */}

                  <div dir="ltr" className="flex items-center gap-3 pt-2">
                    {/* Report */}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-[#1e293b] dark:text-gray-300 dark:hover:text-white"
                    >
                      <Flag className="mr-1 h-4 w-4" />
                      <span dir="rtl">گزارش</span>
                    </Button>

                    {/* Share */}

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-[#1e293b] dark:text-gray-300 dark:hover:text-white"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>

                    {/* Favorite */}

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={favoriteMutation.isPending}
                      onClick={handleMainFavorite}
                      className="p-0"
                    >
                      <div
                        className={`
      h-5
      w-5
      ${mainProductFavorite ? "like_fill" : "like"}
    `}
                      />
                    </Button>

                    {/* Alert */}

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={
                        isMainProductAlert
                          ? "text-red-500 hover:text-red-600"
                          : "text-gray-500 hover:text-[#1e293b] dark:text-gray-300 dark:hover:text-white"
                      }
                    >
                      <Bell
                        className={`h-5 w-5 ${
                          isMainProductAlert ? "fill-red-500" : ""
                        }`}
                      />
                    </Button>

                    {/* Seller count */}

                    {offers.length > 1 && (
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

                  <Button className="w-full rounded-xl bg-gradient-to-r from-[#f04151] to-[#d73948] py-8 text-lg font-bold text-white shadow-lg shadow-red-500/20">
                    <div className="flex w-full items-center justify-between px-4">
                      <div className="text-right">
                        <div className="text-sm font-normal">
                          خرید از جیجی مارکت
                        </div>

                        <div>۲۷۱,۳۷۰,۰۰۰ تومان</div>
                      </div>

                      <Badge className="bg-[#1C1C5D] text-xs">
                        <span className="bg-gradient-to-r from-[#ffff00] to-[#00ffff] bg-clip-text text-transparent">
                          ضمانت ترب
                        </span>
                      </Badge>
                    </div>
                  </Button>
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

          {/* Right */}

          <div className="lg:col-span-4">
            {priceHistory && priceHistory.labels.length > 0 ? (
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

        {/* ================================================= */}
        {/* Offers + Specifications */}
        {/* ================================================= */}

        <div className="mt-6 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
          {/* Offers */}

          <div className="min-h-0 lg:col-span-8">
            <SellersList data={offers} />
          </div>

          {/* Specifications */}

          <div className="min-h-0 lg:col-span-4">
            {data.productSpecifications?.length > 0 && (
              <div
                className="
                  h-full
                  max-h-full
                  min-h-0
                  overflow-y-auto
                  rounded-2xl
                  bg-white
                  p-6
                  dark:bg-[#1e293b]

                  [&::-webkit-scrollbar]:w-1.5
                  [&::-webkit-scrollbar-track]:bg-transparent
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  [&::-webkit-scrollbar-thumb]:bg-gray-300
                  dark:[&::-webkit-scrollbar-thumb]:bg-gray-700
                "
              >
                <h3
                  className="
                    mb-6
                    text-lg
                    font-bold
                    text-[#1e293b]
                    dark:text-[#f1f5f9]
                  "
                >
                  مشخصات محصول
                </h3>

                {(() => {
                  const keySpecs = data.productSpecifications.filter(
                    (spec: any) => spec.type === "KEY",
                  );

                  const generalSpecs = data.productSpecifications.filter(
                    (spec: any) => spec.type === "GENERAL",
                  );

                  return (
                    <>
                      {keySpecs.length > 0 && (
                        <div className="mb-6">
                          <h4
                            className="
                              mb-5
                              text-sm
                              font-bold
                              text-[#1e293b]
                              dark:text-[#f1f5f9]
                            "
                          >
                            مشخصات کلیدی
                          </h4>

                          <div className="space-y-3">
                            {keySpecs.map((spec: any) => (
                              <div
                                key={spec.id}
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-6
                                    text-sm
                                  "
                              >
                                <span className="text-[#1e293b] dark:text-[#f1f5f9]">
                                  {spec.specification.title}
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
                          <h4
                            className="
                              mb-5
                              text-sm
                              font-bold
                              text-[#1e293b]
                              dark:text-[#f1f5f9]
                            "
                          >
                            مشخصات کلی
                          </h4>

                          <div className="space-y-3">
                            {generalSpecs.map((spec: any) => (
                              <div
                                key={spec.id}
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-6
                                    text-sm
                                  "
                              >
                                <span className="text-[#1e293b] dark:text-[#f1f5f9]">
                                  {spec.specification.title}
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

        {/* ================================================= */}
        {/* Similar Products */}
        {/* ================================================= */}

        <div className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-[#1e293b] dark:text-[#f1f5f9]">
            محصولات پیشنهادی
          </h2>

          {searchResultsIsPending ? (
            <div className="flex justify-center py-10">
              <Spinner className="size-8 text-blue-500" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex justify-center py-10">
              <Button>یافت نشد</Button>
            </div>
          ) : (
            <>
              {(() => {
                const mappedProducts = products.map((product: any) => ({
                  ...product,
                  is_favorite: favoriteSet.has(product.id),
                  is_alert: alertSet.has(product.id),
                }));

                return (
                  <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {mappedProducts.map((product: any) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                );
              })()}

              <div ref={sentinelRef} className="h-10 w-full" />

              {isFetchingNextPage && (
                <div className="flex items-center justify-center py-6">
                  <Spinner className="size-6 text-blue-500" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
