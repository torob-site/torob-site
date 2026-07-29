"use client";

import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useGetInfiniteShops } from "@/lib/apis";
import { Search } from "lucide-react";

export default function Shops() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");

  const {
    data,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetInfiniteShops(search);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const shops =
    data?.pages.flatMap((page) => page.data) ?? [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "300px",
      }
    );

    const current = loadMoreRef.current;

    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  ]);

  function handleSearch() {
    setSearch(query.trim());
  }

  if (isPending) {
    return (
      <div className="flex w-full justify-center mt-12">
        <Spinner className="size-8 text-[#d73948]" />
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center mt-12">
      <div className="flex flex-col items-center w-full">

        <h1 className="dark:text-white text-[#1e293b] font-bold text-xl">
          فروشگاه‌های ثبت شده در ترب
        </h1>

        <div className="flex relative mt-16 border border-[#475569] rounded-lg justify-center items-center w-80 h-12">
          <Search
            className="absolute right-3 cursor-pointer"
            size={22}
            onClick={handleSearch}
          />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="w-full px-10 h-12 outline-none rounded-lg"
            placeholder="جستجوی نام فروشگاه"
          />
        </div>

        <div className="grid grid-cols-3 gap-5 mt-10">
          {shops.length > 0 ? (
            shops.map((shop) => (
              <div
                key={shop.id}
                className="flex items-center gap-4 h-20 w-72 border rounded-lg px-5 border-[#cbd5e1] dark:border-[#475569] cursor-pointer"
              >
                <img
                  className="w-12 h-12 rounded-lg"
                  src={shop.logo}
                  alt={shop.name}
                />

                <p className="text-sm text-[#1e293b] dark:text-[#f1f5f9]">
                  {shop.name}
                </p>
              </div>
            ))
          ) : (
            <p className="col-span-3 text-center text-slate-500">
              فروشگاهی پیدا نشد
            </p>
          )}
        </div>

        <div
          ref={loadMoreRef}
          className="h-10 w-full"
        />

        {isFetchingNextPage && (
          <div className="py-6">
            <Spinner className="size-8 text-[#d73948]" />
          </div>
        )}

      </div>
    </div>
  );
}