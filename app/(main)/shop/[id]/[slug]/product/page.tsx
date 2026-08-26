'use client'
import ProductCard from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useSearchFilters } from "@/hooks/use-search-filters";
import { useGetShopProducts, useGetUser, useGetUserAlerts, useGetUserFavorites } from "@/lib/apis";
import { ChevronDown, MapPin, Search, XIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ApiFilterItem {
  value?: string | number;
  name?: string;
  slug?: string;
}

interface ApiFilter {
  title: string;
  slug: string;
  type: string;
  badge_text?: string;
  icon?: string;
  items?: ApiFilterItem[];
}

// ─── Dropdown Filter ─────────────────────────

function DropdownFilter({
  filter,
  selectedValue,
  onChange,
}: {
  filter: ApiFilter;
  selectedValue: string | null;
  onChange: (slug: string, value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);

  const selected = filter.items?.find(
    (o) => String(o.value || o.slug) === selectedValue
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1e293b] dark:text-gray-300 dark:hover:text-white transition"
      >
        <ChevronDown
          className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`}
        />
        {selected?.name || filter.badge_text || filter.title}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 bg-[#ffffff] dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 min-w-[160px]">
          {filter.items?.map((item) => {
            const value = String(item.value || item.slug);
            return (
              <button
                key={value}
                onClick={() => {
                  onChange(filter.slug, selectedValue === value ? null : value);
                  setOpen(false);
                }}
                className={`w-full text-right px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition first:rounded-t-xl last:rounded-b-xl ${selectedValue === value
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300"
                  }`}
              >
                {item.name || value}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Toggle Filter ───────────────────────────

function ToggleFilter({
  filter,
  checked,
  onChange,
}: {
  filter: ApiFilter;
  checked: boolean;
  onChange: (slug: string, checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {filter.title}
      </span>
      <Switch
        dir="ltr"
        checked={checked}
        onCheckedChange={(v) => onChange(filter.slug, v)}
        className="data-[state=checked]:bg-blue-500"
      />
    </label>
  );
}

// ─── Toggle Group Filter ─────────────────────

function ToggleGroupFilter({
  filter,
  selectedValue,
  onChange,
}: {
  filter: ApiFilter;
  selectedValue: string | null;
  onChange: (slug: string, value: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {filter.items?.map((item, idx) => {
        const value = String(item.value || item.slug);
        const isSelected = selectedValue === value;
        return (
          <div key={value} className="flex items-center gap-2">
            {idx > 0 && (
              <span className="text-sm text-gray-600 dark:text-gray-300 mr-4">
                {item.name || value}
              </span>
            )}
            <Switch
              dir="ltr"
              checked={isSelected}
              onCheckedChange={(v) => onChange(filter.slug, v ? value : null)}
              className="data-[state=checked]:bg-blue-500"
            />
            {idx === 0 && (
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {item.name || value}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Toggle Icon Filter ──────────────────────

function ToggleIconFilter({
  filter,
  checked,
  onChange,
}: {
  filter: ApiFilter;
  checked: boolean;
  onChange: (slug: string, checked: boolean) => void;
}) {
  const IconComponent = filter.icon === "MapPin" ? MapPin : null;
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      {IconComponent && <IconComponent className="w-4 h-4 text-gray-400" />}
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {filter.title}
      </span>
      <Switch
        dir="ltr"
        checked={checked}
        onCheckedChange={(v) => onChange(filter.slug, v)}
        className="data-[state=checked]:bg-blue-500"
      />
    </label>
  );
}


// ─── Top Filter Bar ──────────────────────────

function TopFilterBar({ filters }: { filters: ApiFilter[] }) {
  const { topFilters, setTopFilter } = useSearchFilters();
  if (!filters?.length) return null;

  return (
    <div className="flex items-center gap-4 flex-wrap bg-[#ffffff] dark:bg-[#1e293b] rounded-xl px-4 py-3">
      {filters.map((filter, index) => {
        const separator = index > 0 ? <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" /> : null;
        let content: React.ReactNode = null;

        switch (filter.type) {
          case "dropdown":
            content = (
              <DropdownFilter
                filter={filter}
                selectedValue={(topFilters[filter.slug] as string) || null}
                onChange={(slug, val) => setTopFilter(slug, val)}
              />
            );
            break;
          case "toggle":
            content = (
              <ToggleFilter
                filter={filter}
                checked={!!topFilters[filter.slug]}
                onChange={(slug, val) => setTopFilter(slug, val)}
              />
            );
            break;
          case "toggle-group":
            content = (
              <ToggleGroupFilter
                filter={filter}
                selectedValue={(topFilters[filter.slug] as string) || null}
                onChange={(slug, val) => setTopFilter(slug, val)}
              />
            );
            break;
          case "toggle-icon":
            content = (
              <ToggleIconFilter
                filter={filter}
                checked={!!topFilters[filter.slug]}
                onChange={(slug, val) => setTopFilter(slug, val)}
              />
            );
            break;
        }

        return (
          <div key={filter.slug} className="contents">
            {separator}
            {content}
          </div>
        );
      })}
    </div>
  );
}

export default function ShopProductsPage() {
  const { id } = useParams()

  // دریافت فیلترها از URL
  const {
    apiParams, // این رو اضافه کنید
    activeFilters,
    topFilters,
    priceGt,
    priceLt,
    q,
    clearPrice,
    setQ
  } = useSearchFilters();

  // استفاده از queryParams در API
  const {
    data,
    isPending,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetShopProducts(Number(id), apiParams);

  const { data: user } = useGetUser();
  const { data: favoriteIds = [] } = useGetUserFavorites(true, { enabled: !!user?.phone, });
  const { data: alertIds = [] } = useGetUserAlerts(true, { enabled: !!user?.phone, });
  const favoriteSet = new Set(favoriteIds);
  const alertSet = new Set(alertIds);

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

  const firstPage = data?.pages?.[0];
  const topFiltersList: ApiFilter[] = firstPage?.filters2 || [];
  const products = data?.pages.flatMap((page: any) => page.data) || [];

  const badges: {
    label: string;
    onClear: () => void;
  }[] = [];
  if (priceGt != null || priceLt != null) {
    badges.push({
      label: `قیمت: ${priceGt?.toLocaleString("fa-IR") || "۰"
        } تا ${priceLt?.toLocaleString("fa-IR") || "∞"
        }`,
      onClear: clearPrice,
    });
  }

  // ── Search badge ──
  if (q) {
    badges.push({
      label: `جستجو: ${q}`,
      onClear: () => setQ(""),
    });
  }

  return (
    <>
      <div className="px-10 py-5">
        <TopFilterBar filters={topFiltersList} />
      </div>
      <div className="flex flex-wrap gap-4 px-10">
        {badges.map((badge, i) => (
          <Badge
            key={i}
            onClick={badge.onClear}
            className="flex py-4 gap-3 items-center dark:text-white text-black bg-gray-100 dark:bg-[#212b36] border border-gray-300 dark:border-white rounded-full px-3 cursor-pointer"
          >
            <span>{badge.label}</span>

            <XIcon className="w-4 h-4" />
          </Badge>
        ))}
      </div>
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
          <Search className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-lg">نتیجه‌ای پیدا نشد</p>
          <p className="text-sm mt-2">لطفاً عبارت دیگری را جستجو کنید</p>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 mt-5">
                {mappedProducts.map((product: any) => (
                  <div key={product.id} className="flex min-w-0 justify-center">
                    <ProductCard product={product} />
                  </div>
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
    </>
  );
}