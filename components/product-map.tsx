"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  MapPin,
  Flag,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ExternalLink,
  Phone,
  MessageCircle,
  Navigation,
  MapPinned,
  AlertCircle,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useGetProductMapOffers } from "@/lib/apis";

/* ==================== Helpers ==================== */

const createPriceMarker = (price: number, isActive: boolean) => {
  const formattedPrice = new Intl.NumberFormat("fa-IR").format(price);

  return L.divIcon({
    className: "price-marker",
    html: `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="
          background: ${isActive ? "#dc2626" : "#2563eb"};
          color: white;
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          transition: all 0.2s ease;
          transform: ${isActive ? "scale(1.1) translateY(-2px)" : "scale(1)"};
        ">
          ${formattedPrice} تومان
        </div>
        <div style="
          margin-top: 2px;
          width: 20px;
          height: 20px;
          background: ${isActive ? "#dc2626" : "#2563eb"};
          border: 2px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 6px;
            height: 6px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      </div>
    `,
    iconSize: [120, 55],
    iconAnchor: [60, 55],
  });
};

function MapController({ center }: any) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { duration: 1.2 });
  }, [center, map]);
  return null;
}

const getContactConfig = (platform: string) => {
  const map: Record<
    string,
    { label: string; color: string; bg: string; darkBg: string; link: string }
  > = {
    PHONE: {
      label: "تماس تلفنی",
      color: "text-green-600",
      bg: "bg-green-100",
      darkBg: "dark:bg-green-950/50",
      link: "",
    },
    BALE: {
      label: "بله",
      color: "text-blue-600",
      bg: "bg-blue-50",
      darkBg: "dark:bg-blue-950/30",
      link: "https://ble.ir/",
    },
    TELEGRAM: {
      label: "تلگرام",
      color: "text-sky-500",
      bg: "bg-sky-50",
      darkBg: "dark:bg-sky-950/30",
      link: "https://t.me/",
    },
    WHATSAPP: {
      label: "واتساپ",
      color: "text-green-600",
      bg: "bg-green-50",
      darkBg: "dark:bg-green-950/30",
      link: "https://wa.me/",
    },
    INSTAGRAM: {
      label: "اینستاگرام",
      color: "text-pink-600",
      bg: "bg-pink-50",
      darkBg: "dark:bg-pink-950/30",
      link: "https://instagram.com/",
    },
  };
  return (
    map[platform] || {
      label: platform,
      color: "text-gray-600",
      bg: "bg-gray-50",
      darkBg: "dark:bg-gray-800",
      link: "#",
    }
  );
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fa-IR").format(price);
};

/* ==================== Skeleton ==================== */

function SidebarSkeleton() {
  return (
    <div className="space-y-4 p-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex gap-1.5">
            {[1, 2, 3].map((j) => (
              <div
                key={j}
                className="h-16 w-1/3 animate-pulse rounded-lg bg-gray-200 dark:bg-neutral-800"
              />
            ))}
          </div>
          <div className="mt-3 h-5 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
          <div className="mt-2 h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-neutral-800">
            <div className="h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
            <div className="h-9 w-28 animate-pulse rounded-xl bg-gray-200 dark:bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ==================== Component ==================== */

export default function ProductMap(props: any) {
  const { product_id, productName, onClose } = props;

  const { data, isLoading, error, refetch } = useGetProductMapOffers(product_id);

  const sellers = data?.sellers ?? [];

  const [activeSeller, setActiveSeller] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<any>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSeller, setContactSeller] = useState<any>(null);
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);

  const cardRefs = useRef<any>({});

  /* ---------- Sync map center when data arrives ---------- */
  useEffect(() => {
    if (sellers.length > 0 && !mapCenter) {
      setMapCenter([sellers[0].shop.latitude, sellers[0].shop.longitude]);
    }
  }, [sellers, mapCenter]);

  /* ---------- Scroll to active card ---------- */
  useEffect(() => {
    if (activeSeller !== null) {
      const el = cardRefs.current[activeSeller];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeSeller]);

  /* ---------- Handlers ---------- */
  const handleSellerClick = (seller: any) => {
    setActiveSeller(seller.id);
    setMapCenter([seller.shop.latitude, seller.shop.longitude]);
  };

  const openGallery = (images: any, startIndex: any) => {
    setGalleryImages(images);
    setGalleryIndex(startIndex);
    setGalleryOpen(true);
  };

  const openContact = (seller: any) => {
    setContactSeller(seller);
    setContactOpen(true);
  };

  /* ---------- Derived ---------- */
  const initialCenter: any =
    sellers.length > 0
      ? [sellers[0].shop.latitude, sellers[0].shop.longitude]
      : [35.6892, 51.389];

  const currentMapCenter = mapCenter ?? initialCenter;

  return (
    <div className="fixed h-full inset-0 z-[9999]">
      <style>{`
        .leaflet-control-attribution {
          right: 440px !important;
          left: auto !important;
          border-radius: 8px 0 0 0 !important;
          font-size: 10px !important;
          padding: 4px 8px !important;
          background: rgba(255,255,255,0.9) !important;
        }
        .leaflet-control-scale {
          left: 16px !important;
          bottom: 16px !important;
          right: auto !important;
        }
      `}</style>

      {/* ===== Map ===== */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={initialCenter}
          zoom={12}
          zoomControl={false}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={currentMapCenter} />
          {sellers.map((seller: any) => (
            <Marker
              key={seller.id}
              position={[seller.shop.latitude, seller.shop.longitude]}
              icon={createPriceMarker(
                seller.price,
                activeSeller === seller.id
              )}
              eventHandlers={{
                click: () => {
                  setActiveSeller(seller.id);
                  setMapCenter([
                    seller.shop.latitude,
                    seller.shop.longitude,
                  ]);
                },
              }}
            />
          ))}
        </MapContainer>
      </div>

      {/* ===== Title (top-left) ===== */}
      <div className="absolute left-4 top-4 z-50">
        <div
          onClick={() => setIsTitleExpanded(!isTitleExpanded)}
          className="w-[320px] cursor-pointer overflow-hidden rounded-xl bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-sm transition-all dark:bg-neutral-900/95"
        >
          <div className="flex items-start gap-2">
            <h1
              className={`min-w-0 flex-1 leading-snug transition-all duration-200 ${isTitleExpanded
                ? "whitespace-normal break-words text-base text-gray-900 dark:text-white"
                : "truncate text-sm text-gray-500 dark:text-gray-400"
                }`}
            >
              {productName || data?.product_name}
            </h1>
            <div className="mt-0.5 shrink-0 rounded-full p-0.5 text-gray-400">
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${isTitleExpanded ? "rotate-180" : ""
                  }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== Sidebar ===== */}
      <div className="absolute right-0 top-0 bottom-0 z-50 flex w-[420px] flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-4 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <ArrowRight className="h-5 w-5" />
            <span className="text-sm font-medium">بازگشت</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <SidebarSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {error instanceof Error ? error.message : "خطایی رخ داد."}
              </p>
              <button
                onClick={() => refetch()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                تلاش مجدد
              </button>
            </div>
          ) : sellers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <MapPinned className="h-10 w-10 text-gray-300 dark:text-neutral-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                فروشنده‌ای برای این محصول یافت نشد.
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-3">
              {sellers.map((seller: any) => {
                const images = seller.shop.shopImages.map((img: any) => img.url);

                return (
                  <div
                    key={seller.id}
                    ref={(el: any) => {
                      cardRefs.current[seller.id] = el;
                    }}
                    onClick={() => handleSellerClick(seller)}
                    className={`cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-200 ${activeSeller === seller.id
                      ? "border-blue-500 shadow-lg dark:border-blue-400"
                      : "border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                      }`}
                  >
                    {/* Thumbnails */}
                    <div className="flex gap-1.5 p-2">
                      {[0, 1, 2].map((idx) => {
                        const img = images[idx];
                        const hasMore = images.length > 3 && idx === 2;
                        const isEmpty = !img;

                        return (
                          <div
                            key={idx}
                            className={`relative h-16 w-1/3 overflow-hidden rounded-lg ${isEmpty
                              ? "bg-gray-100 dark:bg-neutral-800"
                              : ""
                              }`}
                            onClick={(e) => {
                              if (img) {
                                e.stopPropagation();
                                openGallery(images, idx);
                              }
                            }}
                          >
                            {img ? (
                              <>
                                <img
                                  src={img}
                                  alt=""
                                  className="h-full w-full object-cover transition hover:scale-105"
                                />
                                {hasMore && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-bold text-white">
                                    +{images.length - 3}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-neutral-600">
                                <MapPinned className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Shop name + city + report */}
                    <div className="flex items-center justify-between px-3 py-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {seller.shop.shop_name}
                        </h3>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-neutral-800 dark:text-gray-400">
                          {seller.shop.city.name}
                        </span>
                      </div>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Flag className="h-3.5 w-3.5" />
                        گزارش
                      </button>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-1.5 px-3 pb-3 text-sm text-gray-900 dark:text-gray-400">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{seller.shop.address}</span>
                    </div>

                    {/* Warranty + description */}
                    <div className="flex items-start gap-1.5 px-3 pb-6 text-[13px] text-gray-500 dark:text-gray-400">
                      <div className="min-w-0 flex-1 leading-relaxed">
                        <span>
                          گارانتی {seller.warranty_duration} ماهه{" "}
                          {seller.warranty.title}
                        </span>
                        {seller.description && (
                          <>
                            <span className="mx-1 text-gray-300 dark:text-neutral-600">
                              |
                            </span>
                            <span>{seller.description}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Price + contact */}
                    <div className="flex items-center justify-between border-t border-gray-100 px-3 py-3 dark:border-neutral-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                          {formatPrice(seller.price)}
                        </span>
                        <span className="text-xs text-gray-400">تومان</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openContact(seller);
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                      >
                        <Phone className="h-4 w-4" />
                        اطلاعات تماس
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ===== Gallery Modal ===== */}
      {galleryOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <button
            onClick={() => setGalleryOpen(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            onClick={() =>
              setGalleryIndex((i) =>
                i > 0 ? i - 1 : galleryImages.length - 1
              )
            }
            className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="max-h-[80vh] max-w-[80vw]">
            <img
              src={galleryImages[galleryIndex]}
              alt=""
              className="max-h-[80vh] max-w-[80vw] rounded-2xl object-contain"
            />
            <div className="mt-4 text-center text-white">
              <span className="text-lg font-medium">
                {galleryIndex + 1} / {galleryImages.length}
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              setGalleryIndex((i) =>
                i < galleryImages.length - 1 ? i + 1 : 0
              )
            }
            className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* ===== Contact Modal ===== */}
      {contactOpen && contactSeller && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {contactSeller.shop.shop_name}
              </h3>
              <button
                onClick={() => setContactOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {contactSeller.shop.shopContacts
                ?.filter((c: any) => c.platform === "PHONE")
                .map((contact: any) => (
                  <a
                    key={contact.id}
                    href={`tel:${contact.value}`}
                    className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 transition hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/50">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        تماس تلفنی
                      </p>
                      <p
                        className="font-medium text-gray-900 dark:text-white"
                        dir="ltr"
                      >
                        {contact.value}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </a>
                ))}

              <div className="grid grid-cols-3 gap-2">
                {contactSeller.shop.shopContacts
                  ?.filter((c: any) => c.platform !== "PHONE")
                  .map((contact: any) => {
                    const cfg = getContactConfig(contact.platform);
                    return (
                      <a
                        key={contact.id}
                        href={`${cfg.link}${contact.value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex flex-col items-center gap-1 rounded-xl ${cfg.bg} p-3 transition hover:opacity-80 ${cfg.darkBg}`}
                      >
                        <MessageCircle className={`h-6 w-6 ${cfg.color}`} />
                        <span className={`text-xs font-medium ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </a>
                    );
                  })}
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${contactSeller.shop.latitude},${contactSeller.shop.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-orange-50 py-3 text-sm font-medium text-orange-700 transition hover:bg-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:hover:bg-orange-950/50"
              >
                <Navigation className="h-4 w-4" />
                مسیریابی
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}