"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/axios";
import {
  ArrowRight,
  Globe,
  Loader2,
  MapPin,
  Phone,
  ShoppingCart,
  Store,
  MessageCircle,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/format";



function getContactIcon(platform: string) {
  switch (platform) {
    case "PHONE":
      return <Phone size={18} className="text-white" />;
    case "WHATSAPP":
      return <span className="text-[14px] font-bold text-white">W</span>;
    case "TELEGRAM":
      return <Send size={18} className="text-white" />;
    case "BALE":
      return <MessageCircle size={18} className="text-white" />;
    case "INSTAGRAM":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none" />
        </svg>
      );
    default:
      return <Phone size={18} className="text-white" />;
  }
}

function getContactHref(platform: string, value: string): string | null {
  switch (platform) {
    case "PHONE":
      return `tel:${value}`;
    case "WHATSAPP":
      return `https://wa.me/${value.replace(/[^0-9]/g, "")}`;
    case "TELEGRAM":
      return `https://t.me/${value.replace("@", "")}`;
    case "BALE":
      return `https://t.me/bale/${value.replace("@", "")}`;
    case "INSTAGRAM":
      return `https://instagram.com/${value.replace("@", "")}`;
    default:
      return null;
  }
}

const DAY_NAMES: Record<string, string> = {
  SATURDAY: "شنبه",
  SUNDAY: "یکشنبه",
  MONDAY: "دوشنبه",
  TUESDAY: "سه‌شنبه",
  WEDNESDAY: "چهارشنبه",
  THURSDAY: "پنجشنبه",
  FRIDAY: "جمعه",
};

function formatTime(time: string): string {
  if (!time) return "";

  const isoMatch = time.match(/T(\d{2}:\d{2})/);

  if (isoMatch) {
    return isoMatch[1];
  }

  const timeMatch = time.match(/^(\d{2}:\d{2})/);

  if (timeMatch) {
    return timeMatch[1];
  }

  return time;
}

function formatWorkingHours(hours: { day: string; start_time: string; end_time: string; shift_number: number }[]): string[] {
  if (!hours || hours.length === 0) return [];

  const dayMap = new Map<string, string[]>();

  for (const h of hours) {
    const dayName = DAY_NAMES[h.day] ?? h.day;
    const timeRange = `${formatTime(h.start_time)} تا ${formatTime(h.end_time)}`;
    if (!dayMap.has(dayName)) {
      dayMap.set(dayName, []);
    }
    dayMap.get(dayName)!.push(timeRange);
  }

  return Array.from(dayMap.entries()).map(([day, times]) => {
    const timeStr = times.length === 1 ? times[0] : times.join(" و ");
    return `${day}: ${timeStr}`;
  });
}

function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "";

  return phone.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export default function PurchaseDetail() {
  const searchParams = useSearchParams();
  const productId = Number(searchParams.get("product_id"));
  const shopId = Number(searchParams.get("shop_id"));

  const { data, isLoading } = useQuery({
    queryKey: ["purchase-detail", productId, shopId],
    queryFn: async () => {
      const res = await axiosClient.get(
        `/users/me/purchases/detail?product_id=${productId}&shop_id=${shopId}`,
      );
      return res.data;
    },
    enabled: !!productId && !!shopId,
  });

  const [selectedImage, setSelectedImage] = useState(0);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 size={25} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const images = data.product_images ?? [];
  const contacts = data.shop_contacts ?? [];

  return (
    <div
      dir="rtl"
      className="flex min-h-screen w-full justify-center bg-slate-50"
    >
      <div className="flex min-h-screen w-full max-w-[770px] flex-col border-x border-slate-100 bg-white">
        {/* =========================
            Main Content
        ========================== */}
        <div className="flex-1 px-6 pb-24 pt-5 sm:px-10">
          {/* Back */}
          <div className="mb-4">
            <Link
              href="/user/purchases"
              className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-700"
            >
              <ArrowRight size={18} />
              <span>بازگشت</span>
            </Link>
          </div>

          {/* =========================
              Shop Header
          ========================== */}
          <div className="flex items-center justify-center gap-4">
            {/* Shop Logo */}
            <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
              {data.shop_logo ? (
                <img
                  src={data.shop_logo}
                  alt={data.shop_name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <ShoppingCart
                  size={38}
                  strokeWidth={1.5}
                  className="text-slate-300"
                />
              )}
            </div>

            {/* Shop Name */}
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <Store size={17} className="text-slate-400" />

                <h1 className="text-[16px] font-extrabold text-slate-700">
                  {data.shop_name}
                </h1>
              </div>

              {data.shop_domain && (
                <a
                  href={
                    data.shop_domain.startsWith("http")
                      ? data.shop_domain
                      : `https://${data.shop_domain}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="text-[14px] font-bold text-slate-700 transition hover:text-blue-500"
                >
                  {data.shop_domain}
                </a>
              )}
            </div>
          </div>

          {/* =========================
              Product Images
          ========================== */}
          <section className="mt-6">
            <h2 className="mb-4 text-center text-[15px] font-extrabold text-slate-700">
              تصاویر محصول
            </h2>

            <div className="flex justify-center">
              {images.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setSelectedImage(selectedImage)}
                  className="h-[125px] w-[125px] overflow-hidden rounded-lg border border-slate-200 bg-white"
                >
                  <img
                    src={images[selectedImage]}
                    alt={data.product_name}
                    className="h-full w-full object-contain"
                  />
                </button>
              ) : (
                <div className="flex h-[125px] w-[125px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                  <ShoppingCart size={35} className="text-slate-300" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-3 flex justify-center gap-2 overflow-x-auto pb-1">
                {images.map((image: string, index: number) => (
                  <button
                    key={image + index}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-white transition ${
                      selectedImage === index
                        ? "border-slate-600"
                        : "border-slate-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* =========================
              Support Box
          ========================== */}
          <section className="mx-auto mt-7 max-w-[410px] rounded-xl border border-dashed border-slate-300 p-4">
            <h2 className="mb-4 text-[15px] font-extrabold text-slate-700">
              ارتباط با پشتیبانی
            </h2>

            {/* Warning */}
            <div className="rounded-md bg-[#fff0c2] px-3 py-4 text-[13px] leading-7 text-[#9a7519]">
              برای سرعت بیشتر تلاش کنید در ابتدا مشکل را خودتان از فروشگاه
              پیگیری کنید.
            </div>

            {/* Website */}
            {data.shop_domain && (
              <div className="mt-5 flex items-center justify-end gap-3">
                <a
                  href={
                    data.shop_domain.startsWith("http")
                      ? data.shop_domain
                      : `https://${data.shop_domain}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-medium text-blue-500"
                >
                  ورود به سایت فروشگاه
                </a>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e293b]">
                  <Globe size={18} className="text-white" />
                </div>
              </div>
            )}

            {/* Contacts */}
            {contacts.map((contact: { platform: string; type: string; value: string }, index: number) => {
              const icon = getContactIcon(contact.platform);
              const href = getContactHref(contact.platform, contact.value);

              return (
                <div key={index} className="mt-3 flex items-center justify-end gap-3">
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      dir="ltr"
                      className="text-[13px] text-slate-600"
                    >
                      {contact.platform === "PHONE" ? formatPhone(contact.value) : contact.value}
                    </a>
                  ) : (
                    <span dir="ltr" className="text-[13px] text-slate-600">
                      {contact.platform === "PHONE" ? formatPhone(contact.value) : contact.value}
                    </span>
                  )}

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e293b]">
                    {icon}
                  </div>
                </div>
              );
            })}

            {/* Working Hours */}
            {(() => {
              const workingHoursLines = formatWorkingHours(data.shop_working_hours ?? []);
              return workingHoursLines.length > 0 ? (
                <div className="mt-6 text-[13px] leading-7 text-slate-600">
                  <p className="mb-1 font-bold text-slate-700">ساعات کاری:</p>
                  {workingHoursLines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              ) : null;
            })()}

            {/* Address */}
            {(data.province_name || data.city_name || data.shop_address) && (
              <div className="mt-4 flex items-start gap-2 text-[13px] leading-7 text-slate-600">
                <MapPin size={18} className="mt-1 shrink-0 text-slate-500" />

                <p>
                  {data.province_name && `استان: ${data.province_name}`}
                  {data.city_name && ` - شهر: ${data.city_name}`}
                  {data.shop_address && ` - ${data.shop_address}`}
                </p>
              </div>
            )}
          </section>
        </div>

        {/* =========================
            Bottom Sticky Button
        ========================== */}
        <div className="sticky bottom-0 z-40 border-t border-slate-100 bg-white px-6 py-3 sm:px-10">
          <Link
            href='#'
            className="flex h-12 w-full items-center justify-center rounded-lg bg-[#1e293b] text-[14px] font-bold text-white shadow-md transition hover:bg-[#26364d]"
          >
            از فروشگاه پاسخ مناسبی دریافت نکردم{" "}
          </Link>
        </div>
      </div>
    </div>
  );
}
