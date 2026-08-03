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
import ProductSpecs from "../../ProductSpecs";
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
import { useGetProduct, useGetProductPriceHistory, useGetSimilarProducts, useGetUser, useGetUserAlerts, useGetUserFavorites, usePostUserHistory } from "@/lib/apis";
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
  { storage: "۱۲ GB", ram: null as string | null, price: "۲۹۹,۰۰۰" },
  { storage: "۱۲ GB", ram: "۵۱۲ GB", price: "۲۸۹,۹۶۰,۰۰۰" },
];

const offers: Offer[] = [
  {
    id: 1,
    price: 271370000,
    stock_status: "موجود در انبار",
    more_info_url: "#",
    description: "",
    warranty: { title: "ضمانت ۱۸ ماهه" },
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
    warranty: { title: "ضمانت ۱۲ ماهه" },
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
    warranty: { title: "ضمانت ۷ روزه" },
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
      { type: "PHONE", platform: "PHONE", value: "09123456789" },
      { type: "MESSENGER", platform: "TELEGRAM", value: "@mobile_market" },
      { type: "MESSENGER", platform: "WHATSAPP", value: "09123456789" },
    ],
    is_best: false,
  },
  {
    id: 4,
    price: 278000000,
    stock_status: "موجود",
    more_info_url: "#",
    description: "",
    warranty: { title: "ضمانت ۱۲ ماهه" },
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
      { type: "PHONE", platform: "PHONE", value: "021-12345678" },
      { type: "MESSENGER", platform: "BALE", value: "bale.ir/mobileshop" },
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
    <div
      className={`relative flex flex-col gap-3 p-4 rounded-xl border transition ${offer.is_best
        ? "bg-[#ffffff] dark:bg-[#0f172a] border-blue-500/50"
        : "bg-[#ffffff] dark:bg-[#0f172a] border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
        }`}
    >
      {offer.is_best && (
        <div className="absolute -top-2.5 right-4 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          بهترین قیمت
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
            {offer.shop.shop_logo ? (
              <img
                src={offer.shop.shop_logo}
                alt={offer.shop.shop_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Store className="w-6 h-6 text-gray-500" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{offer.shop.shop_name}</span>
              {isOffline && (
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  حضوری
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {offer.warranty && (
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                  {offer.warranty.title}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
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
            {index === 0 && <div className="text-xs text-green-600 dark:text-green-400">ارزان‌ترین</div>}
          </div>

          {isOffline ? (
            <Button
              size="sm"
              onClick={() => onToggleContact(offer.id)}
              className={`shrink-0 rounded-xl px-5 h-10 gap-1 transition ${isExpanded
                ? "bg-gray-200 hover:bg-gray-300 text-[#1e293b] dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                : "bg-gradient-to-r bg-blue-400 hover:bg-blue-500 text-white"
                }`}
            >
              <span className="text-sm">{isExpanded ? "بستن" : "اطلاعات تماس"}</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          ) : (
            <a
              href={`${baseURL}/products/redirect?offer_id=${Number(offer.id)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#f04151] to-[#d73948] hover:opacity-90 text-white rounded-xl px-5 h-10 gap-1"
              >
                <span className="text-sm">مشاهده فروشگاه</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>
      </div>

      {isOffline && isExpanded && (
        <div className="mt-2 pt-3 border-t border-gray-200 dark:border-gray-800">
          {offer.shop.address && (
            <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
              <span>{offer.shop.address}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {offer.shopContacts?.map((contact, idx) => (
              <a
                key={idx}
                href={
                  contact.platform === "PHONE"
                    ? `tel:${contact.value}`
                    : contact.platform === "TELEGRAM"
                      ? `https://t.me/${contact.value.replace("@", "")}`
                      : contact.platform === "WHATSAPP"
                        ? `https://wa.me/${contact.value.replace(/[^0-9]/g, "")}`
                        : "#"
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 hover:border-gray-400 hover:bg-gray-100 text-gray-600 dark:border-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-800 dark:text-gray-300 gap-1.5 h-9"
                >
                  {platformIcons[contact.platform] ?? <MessageCircle className="w-4 h-4" />}
                  <span className="text-xs">
                    {platformLabels[contact.platform] ?? contact.platform}
                  </span>
                  <span className="text-xs text-gray-500 ltr">{contact.value}</span>
                </Button>
              </a>
            ))}
          </div>
        </div>
      )}
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
    () => data.filter((o) => o.shop.type === "ONLINE_SHOP").sort((a, b) => a.price - b.price),
    [data]
  );

  const offlineOffers = useMemo(
    () => data.filter((o) => o.shop.type === "OFFLINE_SHOP").sort((a, b) => a.price - b.price),
    [data]
  );

  const tabs: { key: TabType; label: string }[] = [
    { key: "all", label: `همه (${data.length})` },
    { key: "ONLINE_SHOP", label: `آنلاین (${onlineOffers.length})` },
    { key: "OFFLINE_SHOP", label: `حضوری (${offlineOffers.length})` },
  ];

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const headerOffset = 90;

    if (tab === "OFFLINE_SHOP" && offlineOffers.length > 0 && offlineStartRef.current) {
      const top =
        offlineStartRef.current.getBoundingClientRect().top +
        window.scrollY -
        headerOffset;
      window.scrollTo({ top, behavior: "smooth" });
    } else if (listTopRef.current) {
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
    <div className="dark:bg-[#1e293b] bg-[#ffffff] rounded-2xl" ref={listTopRef}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-[#ffffff] dark:bg-[#1e293b] px-6 py-4 border-b border-gray-200 dark:border-gray-800 rounded-t-2xl">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold whitespace-nowrap text-[#1e293b] dark:text-[#f1f5f9]">لیست قیمت فروشندگان</h2>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#0f172a] rounded-xl p-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm transition whitespace-nowrap ${activeTab === tab.key
                  ? "bg-white text-[#1e293b] dark:bg-gray-700 dark:text-white font-medium shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-5 space-y-3">
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
                <div className="flex items-center gap-3 pb-2 mb-2">
                  <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                  <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
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
                className="absolute bg-blue-500 hover:bg-blue-600 transition-all right-4 bottom-2 gap-2 rounded-lg py-5 text-white shadow-lg"
              >
                <Map className="h-4 w-4" />
                نمایش روی نقشه
              </Button>
            </div>
          </>
        )}
        {showMap && <ProductMap onClose={() => setShowMap(false)} productName='گوشی سامسونگ S26 Ultra 5G حافظه ۲۵۶ رم ۱۲ گیگابایت' product_id={1} />}

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
          <div className="text-center py-10 text-gray-500 text-sm">
            فروشنده‌ای یافت نشد
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { id, slug } = useParams();

  const { data, isPending } = useGetProduct(Number(id))




  const { data: priceHistory } = useGetProductPriceHistory(Number(id))

  const {
    data: searchResults,
    isPending: searchResultsIsPending,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetSimilarProducts(Number(id));

  const { data: user } = useGetUser();
  const { data: favoriteIds = [] } = useGetUserFavorites(true, { enabled: !!user?.phone, });
  const { data: alertIds = [] } = useGetUserAlerts(true, { enabled: !!user?.phone, });
  const favoriteSet = new Set(favoriteIds);
  const alertSet = new Set(alertIds);
  const [activeVariant, setActiveVariant] = useState(0);
  const { mutate: addView } = usePostUserHistory();

  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchNextPageRef = useRef(fetchNextPage);
  fetchNextPageRef.current = fetchNextPage;

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPageRef.current?.();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (!user?.id || !id) return;
    addView({ product_id: Number(id) });
  }, [user?.id, id]);


  if (isPending) {
    return (
      <div className="flex items-center w-full h-screen justify-center">
        <Spinner className="size-8 text-blue-500" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20" dir="rtl">

        <div className="relative mb-10 group">
          <div className="absolute inset-0 w-36 h-36 rounded-full bg-rose-500/10 dark:bg-rose-500/20 blur-2xl animate-pulse" />

          <div className="relative w-32 h-32 rounded-full bg-white dark:bg-[#1e293b] border-2 border-gray-200 dark:border-gray-600/50 shadow-xl flex items-center justify-center transition-all duration-500 group-hover:scale-105">
            <Search className="w-14 h-14 text-gray-400 dark:text-gray-500 transition-colors duration-500" strokeWidth={1.5} />
          </div>

          <div className="absolute -bottom-2 -left-2 w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 dark:from-rose-600 dark:to-pink-700 shadow-lg flex items-center justify-center text-sm font-extrabold text-white animate-bounce" style={{ animationDuration: "2s" }}>
            ۴۰۴
          </div>

          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" style={{ animationDuration: "3s" }} />
          <div className="absolute top-1/2 -right-5 w-2 h-2 rounded-full bg-blue-400 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }} />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight transition-colors duration-500">
          محصول مورد نظر پیدا نشد
        </h1>

        <p className="text-gray-500 dark:text-gray-400 text-base max-w-sm mb-10 leading-relaxed transition-colors duration-500">
          ممکن است این محصول حذف شده باشد، نام آن تغییر کرده باشد یا موقتاً در دسترس نباشد. لطفاً از طریق جستجو، محصول مورد نظر خود را پیدا کنید.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link href="/">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl px-8 h-12 gap-2 font-semibold shadow-lg shadow-rose-500/25 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0">
              <Home className="w-5 h-5" />
              صفحه اصلی
            </Button>
          </Link>
        </div>

        <Link
          href="/"
          className="mt-8 flex items-center gap-2 text-sm text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors duration-300 font-medium group"
        >
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          بازگشت به صفحه قبل
        </Link>

        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-800 w-full max-w-md transition-colors duration-500">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 font-medium">
            یا شاید به دنبال این‌ها بودید؟
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["گوشی موبایل", "لپ‌تاپ", "هدفون", "ساعت هوشمند"].map((item) => (
              <Link
                key={item}
                href={`/search?query=${encodeURIComponent(item)}`}
                className="px-4 py-2 rounded-xl bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:border-rose-300 dark:hover:border-rose-500/50 hover:text-rose-500 dark:hover:text-rose-400 transition-all duration-300"
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
    <div className="min-h-screen text-[#1e293b] dark:text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <Breadcrumb>
          <BreadcrumbList className="text-sm text-gray-500 dark:text-gray-400">
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="hover:text-[#1e293b] dark:hover:text-white transition">
                ترب
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-400 dark:text-gray-600 mx-2">
              ›
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/digital"
                className="hover:text-[#1e293b] dark:hover:text-white transition"
              >
                موبایل و کالای دیجیتال
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-400 dark:text-gray-600 mx-2">
              ›
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/mobile"
                className="hover:text-[#1e293b] dark:hover:text-white transition"
              >
                گوشی موبایل
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-400 dark:text-gray-600 mx-2">
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

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Product Main Card */}
            <div className="dark:bg-[#1e293b] bg-[#ffffff] rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProductImages />

                <div className="space-y-4">
                  <h1 className="text-xl font-bold leading-relaxed text-[#1e293b] dark:text-[#f1f5f9]">
                    گوشی سامسونگ S26 Ultra 5G حافظه ۲۵۶ رم ۱۲ گیگابایت
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Samsung Galaxy S26 Ultra 5G 256/12 GB
                  </p>

                  {/* Variants */}
                  <div className="flex gap-2 flex-wrap">
                    {variants.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveVariant(i)}
                        className={`px-3 py-2 rounded-lg text-xs transition ${activeVariant === i
                          ? "border-2 border-blue-500 bg-[#ffffff] dark:bg-[#0f172a]"
                          : "border border-gray-300 dark:border-gray-600 bg-[#ffffff] dark:bg-[#0f172a] hover:border-gray-400 dark:hover:border-gray-500"
                          }`}
                      >
                        <div className="text-right">
                          ویترنام - {v.storage} {v.ram && `- ${v.ram}`}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">از {v.price} تومان</div>
                      </button>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-[#1e293b] dark:text-gray-300 dark:hover:text-white"
                    >
                      <Flag className="w-4 h-4 ml-1" />
                      گزارش
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-[#1e293b] dark:text-gray-300 dark:hover:text-white"
                    >
                      <Share2 className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-[#1e293b] dark:text-gray-300 dark:hover:text-white"
                    >
                      <Heart className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-[#1e293b] dark:text-gray-300 dark:hover:text-white"
                    >
                      <Bell className="w-5 h-5" />
                    </Button>
                    <div className="mr-auto flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>{offers.length} فروشنده</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>

                  {/* CTA */}
                  <Button className="w-full py-8 bg-gradient-to-r from-[#f04151] to-[#d73948] text-white font-bold text-lg rounded-xl shadow-lg shadow-red-500/20">
                    <div className="flex items-center justify-between w-full px-4">
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
              <div className="mt-6 relative">
                <Input
                  placeholder="از ترب بپرس ..."
                  className="w-full bg-[#ffffff] dark:bg-[#0f172a] border-gray-300 dark:border-gray-700 rounded-full py-6 pr-6 pl-14 text-right text-[#1e293b] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500"
                />
                <Button
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Sellers */}
            <SellersList data={offers} />
          </div>

          <div className="lg:col-span-4 space-y-6">
            {priceHistory && priceHistory.labels.length > 0 ? (
              <PriceChart priceData={priceHistory} />
            ) : (
              <div className="dark:bg-[#1e293b] bg-white rounded-2xl p-6 flex items-center justify-center h-56">
                <span className="text-sm text-gray-500">داده‌ای برای نمایش وجود ندارد</span>
              </div>
            )}
            <ProductSpecs />
          </div>
        </div>

        <div className="mt-10">
          <h2 className="font-bold text-xl mb-4 dark:text-[#f1f5f9] text-[#1e293b]">محصولات پیشنهادی</h2>

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
                  <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 grid-cols-2 gap-6">
                    {mappedProducts.map((product: any) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                      />
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