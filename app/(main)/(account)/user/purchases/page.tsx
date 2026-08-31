"use client";

import { useGetUserPurchases } from "@/lib/apis";
import { Input } from "@/components/ui/input";
import { Search, Store, ShoppingCart, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useMemo, useState } from "react";

type PurchaseItem = {
  id: number;
  product_id: number;
  shop_id: number;
  product_name: string;
  product_slug: string;
  product_image: string;
  shop_name: string;
  city_name: string;
  price: number;
  more_info_url: string;
  created_at: string;
};

function formatPrice(price: number | null | undefined): string {
  if (price == null) return "";
  return price.toLocaleString("fa-IR") + " تومان";
}

function extractDatePart(created_at: string): string {
  const parts = created_at.split(" - ");
  const day = parts[0] ?? "";
  const dateAndTime = parts[1] ?? "";
  const timeParts = dateAndTime.split(" ");
  timeParts.pop();
  return `${day} ${timeParts.join(" ")}`.trim();
}

function extractTimePart(created_at: string): string {
  const parts = created_at.split(" - ");
  const dateAndTime = parts[1] ?? "";
  const timeParts = dateAndTime.split(" ");
  return timeParts[timeParts.length - 1] ?? "";
}

function PurchaseItemCard({ item }: { item: PurchaseItem }) {
  return (
    <Link
      href={`/user/purchases/detail?product_id=${item.product_id}&shop_id=${item.shop_id}`}
      className="flex gap-4 border-b border-slate-100 py-6 last:border-b-0"
    >
      {/* Product image */}
      <div className="relative h-[145px] w-[145px] shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-white">
        <img
          src={item.product_image}
          alt={item.product_name}
          className="h-full w-full object-contain"
        />

        {/* Cart icon */}
        <div className="absolute bottom-0 right-0 flex h-11 w-11 items-center justify-center bg-white shadow-sm">
          <ShoppingCart size={18} className="text-slate-300" />
        </div>
      </div>

      {/* Information */}
      <div className="flex min-w-0 flex-1 flex-col items-start">
        <h3 className="line-clamp-2 text-right text-[15px] font-bold leading-7 text-slate-700">
          {item.product_name}
        </h3>

        <div className="mt-3 flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5">
          <Store size={16} className="text-slate-500" />
          <span className="text-xs text-slate-600">
            {item.shop_name} | {item.city_name}
          </span>
        </div>

        <div className="mt-3 text-xs text-slate-400">
          ساعت بازدید:{" "}
          <span className="font-medium text-slate-500">
            {extractTimePart(item.created_at)}
          </span>
        </div>

        <div className="mt-2 text-xs font-bold text-slate-500">
          قیمت در زمان بازدید:{" "}
          <span className="text-slate-700">{formatPrice(item.price)}</span>
        </div>
      </div>
    </Link>
  );
}

export default function Purchases() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useGetUserPurchases(debouncedSearch || undefined);

  const observerRef = useRef<HTMLDivElement>(null);

  // Flatten all pages into a single list
  const allItems = useMemo(() => {
    return data?.pages.flatMap((page) => page.results) ?? [];
  }, [data]);

  // Group items by date
  const groupedItems = useMemo(() => {
    const groups: { date: string; items: PurchaseItem[] }[] = [];
    let currentDate = "";

    for (const item of allItems) {
      const datePart = extractDatePart(item.created_at);
      if (datePart !== currentDate) {
        currentDate = datePart;
        groups.push({ date: datePart, items: [] });
      }
      groups[groups.length - 1].items.push(item);
    }

    return groups;
  }, [allItems]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex w-full justify-center bg-slate-50">
      <div className="w-full max-w-[760px] border-x border-slate-100 bg-white">
        {/* Header */}
        <div className="px-10 pb-4 pt-8">
          <h1 className="text-center text-[17px] font-extrabold text-slate-800">
            خریدهای من
          </h1>

          {/* Search */}
          <div className="relative mt-6">
            <Search
              size={22}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <Input
              className="h-11 rounded-lg border-slate-200 bg-white pr-11 text-sm text-slate-700 placeholder:text-slate-400"
              placeholder="نام محصول یا فروشگاه را وارد کنید"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Purchases scroll area */}
        <div className="relative px-10">
          {/* Description */}
          <div className="px-8 pb-4 pt-4 text-center">
            <h2 className="text-[17px] font-extrabold text-slate-700">
              خریدهای اخیر
            </h2>
            <p className="mt-3 text-[12px] leading-6 text-slate-400">
              براساس بازدیدهای شما از وبسایت فروشندگان حدس می‌زنیم این محصولات
              را خریداری کرده‌اید (ترب از تراکنش شما اطلاعی ندارد)
            </p>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && allItems.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">
              خریدی یافت نشد
            </div>
          )}

          {/* Date + purchases */}
          {!isLoading && allItems.length > 0 && (
            <div dir="rtl" className="pl-2 pr-1">
              {groupedItems.map((group) => (
                <section key={group.date}>
                  {/* Sticky date */}
                  <div className="sticky top-0 z-20 flex justify-center bg-white py-3">
                    <span className="rounded-full bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 shadow-sm">
                      {group.date}
                    </span>
                  </div>

                  <div>
                    {group.items.map((item) => (
                      <PurchaseItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              ))}

              {/* Infinite scroll trigger */}
              <div ref={observerRef} className="flex justify-center py-6">
                {isFetchingNextPage && (
                  <Loader2
                    size={24}
                    className="animate-spin text-slate-400"
                  />
                )}
              </div>
            </div>
          )}

          {/* Bottom button */}
          <div className="sticky bottom-0 z-30 bg-white pt-3">
            <button
              type="button"
              className="h-12 w-full rounded-lg bg-[#1e293b] text-sm font-bold text-white shadow-md transition hover:bg-[#26364d]"
            >
              سفارشم را پیدا نکردم
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
