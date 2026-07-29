"use client";

import { useState, useEffect, Suspense, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Check, ChevronDown, ChevronUp, MapPin, Search, XIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useGetUser, useGetUserAlerts, useGetUserFavorites, useSearch } from "@/lib/apis";
import ProductCard from "@/components/product-card";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { Badge } from "./ui/badge";

interface ActiveFilters {
  [key: string]: string[];
}

interface PriceRange {
  min: string;
  max: string;
}

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

// ─── Dynamic Top Filter Renderers ──────────────────────

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
  const selected = filter.items?.find((o) => String(o.value || o.slug) === selectedValue);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1e293b] dark:text-gray-300 dark:hover:text-white transition"
      >
        <ChevronDown className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`} />
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
                className={`w-full text-right px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition first:rounded-t-xl last:rounded-b-xl ${selectedValue === value ? "text-blue-500 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
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
      <span className="text-sm text-gray-600 dark:text-gray-300">{filter.title}</span>
      <Switch
        dir="ltr"
        checked={checked}
        onCheckedChange={(v) => onChange(filter.slug, v)}
        className="data-[state=checked]:bg-blue-500"
      />
    </label>
  );
}

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
            {idx > 0 && <span className="text-sm text-gray-600 dark:text-gray-300 mr-4">{item.name || value}</span>}
            <Switch
              dir="ltr"
              checked={isSelected}
              onCheckedChange={(v) => onChange(filter.slug, v ? value : null)}
              className="data-[state=checked]:bg-blue-500"
            />
            {idx === 0 && <span className="text-sm text-gray-600 dark:text-gray-300">{item.name || value}</span>}
          </div>
        );
      })}
    </div>
  );
}

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
      <span className="text-sm text-gray-600 dark:text-gray-300">{filter.title}</span>
      <Switch
        id="switch-focus-mode"
        dir="ltr"
        checked={checked}
        onCheckedChange={(v) => onChange(filter.slug, v)}
        className="data-[state=checked]:bg-blue-500"
      />
    </label>
  );
}

// ─── Dynamic Top Filter Bar from API ───────────────────

function TopFilterBar({
  filters,
  activeValues,
  onChange,
}: {
  filters: ApiFilter[];
  activeValues: Record<string, string | boolean | null>;
  onChange: (slug: string, value: string | boolean | null) => void;
}) {
  if (!filters || filters.length === 0) return null;

  const renderFilter = (filter: ApiFilter, index: number) => {
    const separator = index > 0 ? <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" /> : null;
    let content: React.ReactNode;

    switch (filter.type) {
      case "dropdown":
        content = (
          <DropdownFilter
            filter={filter}
            selectedValue={(activeValues[filter.slug] as string) || null}
            onChange={(slug, val) => onChange(slug, val)}
          />
        );
        break;
      case "toggle":
        content = (
          <ToggleFilter
            filter={filter}
            checked={!!activeValues[filter.slug]}
            onChange={(slug, val) => onChange(slug, val)}
          />
        );
        break;
      case "toggle-group":
        content = (
          <ToggleGroupFilter
            filter={filter}
            selectedValue={(activeValues[filter.slug] as string) || null}
            onChange={(slug, val) => onChange(slug, val)}
          />
        );
        break;
      case "toggle-icon":
        content = (
          <ToggleIconFilter
            filter={filter}
            checked={!!activeValues[filter.slug]}
            onChange={(slug, val) => onChange(slug, val)}
          />
        );
        break;
      default:
        content = null;
    }

    return (
      <div key={filter.slug} className="contents">
        {separator}
        {content}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-4 flex-wrap bg-[#ffffff] dark:bg-[#1e293b] rounded-xl px-4 py-3">
      {filters.map((filter, index) => renderFilter(filter, index))}
    </div>
  );
}

// ─── Dynamic Sidebar Filter from API ───────────────────

function DynamicFilterGroup({
  filter,
  selected,
  onChange,
}: {
  filter: ApiFilter;
  selected: string[];
  onChange: (slug: string, value: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const isSingle = filter.type === "single_choice" || filter.type === "dropdown";
  const limit = 10;
  const items = filter.items || [];
  const displayItems = showAll ? items : items.slice(0, limit);
  const hasMore = items.length > limit;

  const isSelected = (value: string) => selected.includes(value);

  const handleSelect = (value: string) => {
    if (isSingle) {
      if (isSelected(value)) {
        onChange(filter.slug, "");
      } else {
        onChange(filter.slug, value);
      }
    } else {
      onChange(filter.slug, value);
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3 px-1 text-sm font-medium text-[#1e293b] dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition"
      >
        <span>{filter.title}</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
      </button>

      {expanded && (
        <div className="pb-3 space-y-1">
          {displayItems.map((item, idx) => {
            const value = String(item.value || item.slug || item.name);
            const label = item.name || value;

            return (
              <label
                key={idx}
                className="flex items-center justify-between py-1.5 px-1 cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center transition ${isSingle
                      ? `w-4 h-4 rounded-full border ${isSelected(value) ? "border-blue-500" : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-400"
                      }`
                      : `w-4 h-4 rounded border ${isSelected(value) ? "bg-blue-500 border-blue-500" : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-400"
                      }`
                      }`}
                  >
                    {isSelected(value) && (
                      <>
                        {isSingle ? (
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        ) : (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </>
                    )}
                  </div>
                  <input
                    type={isSingle ? "radio" : "checkbox"}
                    name={filter.slug}
                    className="hidden"
                    checked={isSelected(value)}
                    onChange={() => handleSelect(value)}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-[#1e293b] dark:group-hover:text-white transition">
                    {label}
                  </span>
                </div>
              </label>
            );
          })}

          {hasMore && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full text-right py-2 px-1 text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition"
            >
              مشاهده بیشتر
            </button>
          )}
          {showAll && hasMore && (
            <button
              onClick={() => setShowAll(false)}
              className="w-full text-right py-2 px-1 text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition"
            >
              مشاهده کمتر
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SuggestedCategories({
  categories,
}: {
  categories: { id: number; title: string; url: string }[];
}) {
  const [expanded, setExpanded] = useState(true);

  if (!categories || categories.length === 0) return null;

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 pb-4 mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3 px-1 text-sm font-medium text-[#1e293b] dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition"
      >
        <span>دسته‌بندی‌های پیشنهادی</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        )}
      </button>

      {expanded && (
        <div className="flex flex-col gap-4 pt-2">
          {categories.map((cat) => (
            <Link
              href={`/browse/${cat.id}/${cat.url}`}
              key={cat.id}
              className="text-sm mr-4 text-[#1e293b] dark:text-white hover:text-[#d73948]"
            >
              {cat.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Price Filter ──────────────────────────────────────

function PriceFilter({
  value,
  onChange,
  onApply,
  onClear,
  minPrice,
  maxPrice,
}: {
  value: PriceRange;
  onChange: (range: PriceRange) => void;
  onApply: () => void;
  onClear: () => void;
  minPrice?: number;
  maxPrice?: number;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3 px-1 text-sm font-medium text-[#1e293b] dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition"
      >
        <span>قیمت</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
      </button>

      {expanded && (
        <div className="pb-4 space-y-3">
          {minPrice !== undefined && maxPrice !== undefined && (
            <div className="text-xs text-gray-500 px-1">
              رنج قیمت: {minPrice.toLocaleString("fa-IR")} - {maxPrice.toLocaleString("fa-IR")} تومان
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0 w-8">از</span>
            <div className="relative flex-1">
              <Input
                type="text"
                inputMode="numeric"
                placeholder={minPrice?.toString()}
                value={value.min}
                onChange={(e) => onChange({ ...value, min: e.target.value })}
                className="bg-[#ffffff] dark:bg-[#0f172a] border-gray-300 dark:border-gray-700 text-sm text-left pl-16 h-10 text-[#1e293b] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">تومان</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0 w-8">تا</span>
            <div className="relative flex-1">
              <Input
                type="text"
                inputMode="numeric"
                placeholder={maxPrice?.toString()}
                value={value.max}
                onChange={(e) => onChange({ ...value, max: e.target.value })}
                className="bg-[#ffffff] dark:bg-[#0f172a] border-gray-300 dark:border-gray-700 text-sm text-left pl-16 h-10 text-[#1e293b] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">تومان</span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClear}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              حذف
            </button>
            <button
              onClick={onApply}
              className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-white transition"
            >
              اعمال فیلتر
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar Filters Component ─────────────────────────

function SidebarFilters({
  apiFilters,
  activeFilters,
  onFilterChange,
  priceRange,
  onPriceChange,
  onPriceApply,
  onPriceClear,
  minPrice,
  maxPrice,
  suggestedCategories
}: {
  apiFilters: ApiFilter[];
  activeFilters: ActiveFilters;
  onFilterChange: (groupId: string, optionId: string) => void;
  priceRange: PriceRange;
  onPriceChange: (range: PriceRange) => void;
  onPriceApply: () => void;
  onPriceClear: () => void;
  minPrice?: number;
  maxPrice?: number;
  suggestedCategories?: { id: number; title: string; url: string }[];
}) {
  return (
    <div>
      <div className="bg-[#ffffff] dark:bg-[#1e293b] rounded-2xl p-4">
        {apiFilters.map((filter) => (
          <DynamicFilterGroup
            key={filter.slug}
            filter={filter}
            selected={activeFilters[filter.slug] || []}
            onChange={(slug, value) => onFilterChange(slug, value)}
          />
        ))}

        <SuggestedCategories categories={suggestedCategories || []} />

        <PriceFilter
          value={priceRange}
          onChange={onPriceChange}
          onApply={onPriceApply}
          onClear={onPriceClear}
          minPrice={minPrice}
          maxPrice={maxPrice}
        />
      </div>
    </div>
  );
}

// ─── Product Results Component ─────────────────────────

function ProductResults({ data, isLoading }: { data: any[]; isLoading: boolean }) {
  const { data: user } = useGetUser();
  const { data: favoriteIds = [] } = useGetUserFavorites(true, { enabled: !!user?.phone, });
  const { data: alertIds = [] } = useGetUserAlerts(true, { enabled: !!user?.phone, });
  const favoriteSet = new Set(favoriteIds);
  const alertSet = new Set(alertIds);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8 text-blue-500" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
        <Search className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg">نتیجه‌ای پیدا نشد</p>
        <p className="text-sm mt-2">لطفاً عبارت دیگری را جستجو کنید</p>
      </div>
    );
  }
  const products = data.map((product) => ({
    ...product,
    is_favorite: favoriteSet.has(product.id),
    is_alert: alertSet.has(product.id),
  }));
  return (
    <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 grid-cols-2 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}

function ShopHeader({ shop }: { shop: any }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  if (!shop) return null;

  const doSearch = () => {
    if (!query.trim()) return;
    router.push(
      `/shop/${shop.id}/${shop.shop_name}/محصولات/?q=${encodeURIComponent(query.trim())}`
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") doSearch();
  };

  return (
    <div className="mb-4 w-96 space-y-3">
      <div className="bg-[#ffffff] dark:bg-[#1e293b] rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {shop.shop_logo && (
            <img
              src={shop.shop_logo}
              alt={shop.shop_name}
              className="w-14 h-14 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-[#1e293b] dark:text-white truncate">
              {shop.shop_name}
            </h2>
            {shop.domain && (
              <a
                href={`https://${shop.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition"
              >
                {shop.domain}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex bg-gray-100 dark:bg-[#212b36] py-3 rounded-lg px-3 items-center gap-3">
        <Search onClick={doSearch} className="w-5 h-5 cursor-pointer" color="#f43f5e" />
        <input
          type="text"
          placeholder="جستجو در محصولات این فروشگاه..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-0 text-sm text-[#1e293b] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0"
        />
      </div>
    </div>
  );
}

function CategoryBreadcrumb({
  categories,
}: {
  categories: {
    id: number;
    title: string;
    url: string;
  }[];
}) {
  if (!categories || categories.length === 0) return null;

  return (
    <Breadcrumb dir="rtl" className="border-b border-gray-200 dark:border-gray-800 py-2">
      <BreadcrumbList>
        {categories.map((category, index) => {
          const isLast = index === categories.length - 1;

          return (
            <div key={category.id} className="flex items-center">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>
                    {category.title}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={`/browse/${category.id}/${category.url}`}>
                    {category.title}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLast && <BreadcrumbSeparator className="px-1 rotate-180" />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function ActiveFilterBadges({
  filters,
  onClear,
}: {
  filters: ApiFilter[];
  onClear: (slug: string) => void;
}) {
  const badges = filters.filter((f) => f.badge_text);

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-4">
      {badges.map((filter) => (
        <Badge
          key={filter.slug}
          onClick={() => onClear(filter.slug)}
          className="flex py-4 gap-3 items-center bg-gray-100 dark:bg-[#212b36] border border-gray-300 dark:border-white rounded-full px-3 text-[#1e293b] dark:text-white cursor-pointer">
          <span>{filter.badge_text}</span>
          <XIcon className="w-4 h-4" />
        </Badge>
      ))}
    </div>
  );
}

function CategoryNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
      <Search className="w-16 h-16 mb-4 opacity-30" />
      <p className="text-lg font-bold text-red-500 dark:text-red-400">
        دسته‌بندی مورد نظر یافت نشد
      </p>
      <p className="text-sm mt-2">
        دسته‌بندی که به دنبال آن هستید وجود ندارد یا حذف شده است
      </p>
      <Link
        href="/"
        className="mt-6 px-6 py-2 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-white transition"
      >
        بازگشت به صفحه اصلی
      </Link>
    </div>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isBrowsePage = pathname.startsWith("/browse");
  const isSearchPage = pathname.startsWith("/search");

  // ─── Read initial values from URL ────────────────────
  const initialQuery = searchParams.get("query") || "";
  const initialPriceGt = searchParams.get("price_gt") || "";
  const initialPriceLt = searchParams.get("price_lt") || "";

  // ─── Search Query ────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // ─── Sidebar State ───────────────────────────────────
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});

  const [priceRange, setPriceRange] = useState<PriceRange>({
    min: initialPriceGt,
    max: initialPriceLt,
  });
  const [appliedPrice, setAppliedPrice] = useState<PriceRange | null>(
    initialPriceGt || initialPriceLt ? { min: initialPriceGt, max: initialPriceLt } : null
  );

  // ─── Top Filter State (dynamic from API) ─────────────
  const [topFilterValues, setTopFilterValues] = useState<Record<string, string | boolean | null>>({});

  // ─── Initialization guard ────────────────────────────
  const [isInitialized, setIsInitialized] = useState(false);
  const isSyncingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchNextPageRef = useRef<any>(null);

  // ─── Build API Params with useMemo ───────────────────
  const apiParams = useMemo(() => {
    const params: Record<string, any> = {
      query: searchQuery,
    };

    if (isSearchPage && searchQuery) {
      params.query = searchQuery;
    }

    const getCategoryIdFromPath = (pathname: string) => {
      const parts = pathname.split("/").filter(Boolean);
      const browseIndex = parts.indexOf("browse");
      if (browseIndex === -1) return null;
      const ids = parts.slice(browseIndex + 1).filter((part) => /^\d+$/.test(part));
      return ids.length ? Number(ids[ids.length - 1]) : null;
    };

    if (isBrowsePage) {
      const categoryId = getCategoryIdFromPath(pathname);
      if (categoryId) {
        params.category_id = categoryId;
      }
    }

    // Top filters
    Object.entries(topFilterValues).forEach(([key, value]) => {
      if (value !== null && value !== false && value !== "") {
        params[key] = value;
      }
    });

    // Sidebar filters
    Object.entries(activeFilters).forEach(([key, values]) => {
      if (!values.length) return;
      if (key === "brand") {
        params.brand = values;
      } else {
        params[`spec_${key}`] = values.join(",");
      }
    });

    if (appliedPrice?.min) {
      params.price_gt = Number(appliedPrice.min.replace(/,/g, ""));
    }
    if (appliedPrice?.max) {
      params.price_lt = Number(appliedPrice.max.replace(/,/g, ""));
    }

    return params;
  }, [searchQuery, topFilterValues, activeFilters, appliedPrice, pathname, isBrowsePage, isSearchPage]);

  // ─── Call API with Infinite Query ────────────────────
  const {
    data: searchResults,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error
  } = useSearch(apiParams);

  // Ref for stable observer callback
  fetchNextPageRef.current = fetchNextPage;

  // Flatten all pages
  const products = searchResults?.pages.flatMap((page: any) => page.data) || [];
  const firstPage = searchResults?.pages?.[0];

  const shop = firstPage?.shop;
  const title = firstPage?.title;
  const breadcrumb = firstPage?.breadcrumb || [];
  const sidebarFilters: ApiFilter[] = firstPage?.filters1 || [];
  const topFilters: ApiFilter[] = firstPage?.filters2 || [];
  const pagination = firstPage?.pagination;
  const minPrice = firstPage?.min_price;
  const maxPrice = firstPage?.max_price;
  const suggestedCategories = firstPage?.suggested_categories || [];

  // ─── Initialize sidebar filters from URL ─────────────
  useEffect(() => {
    if (!sidebarFilters.length) return;
    const initial: ActiveFilters = {};
    sidebarFilters.forEach((filter) => {
      const values = searchParams.getAll(filter.slug);
      if (values.length) {
        initial[filter.slug] = values.flatMap((v) => v.split(",")).filter(Boolean);
      }
    });
    setActiveFilters(initial);
  }, [sidebarFilters, searchParams]);

  // ─── Initialize top filter values from URL + API ─────
  useEffect(() => {
    if (topFilters.length === 0) return;

    const initialTopValues: Record<string, string | boolean | null> = {};
    topFilters.forEach((filter) => {
      const urlValue = searchParams.get(filter.slug);
      if (urlValue !== null) {
        if (filter.type === "toggle" || filter.type === "toggle-icon") {
          initialTopValues[filter.slug] = urlValue === "true";
        } else {
          initialTopValues[filter.slug] = urlValue;
        }
      } else {
        // هیچ defaultای نمی‌ذاریم. همه null/false
        if (filter.type === "toggle" || filter.type === "toggle-icon") {
          initialTopValues[filter.slug] = false;
        } else {
          initialTopValues[filter.slug] = null;
        }
      }
    });

    setTopFilterValues(initialTopValues);
    setIsInitialized(true);
  }, [topFilters.length, searchParams]);

  // ─── Intersection Observer for Infinite Scroll ───────
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

  // ─── Sync URL with filters (بدون page) ───────────────
  useEffect(() => {
    if (!isInitialized) return;
    if (isSyncingRef.current) return;

    const params = new URLSearchParams();

    if (searchQuery) params.set("query", searchQuery);

    // Top filters
    Object.entries(topFilterValues).forEach(([key, value]) => {
      if (value !== null && value !== false && value !== "") {
        if (value === true) {
          params.set(key, "true");
        } else {
          params.set(key, String(value));
        }
      }
    });

    // Sidebar filters
    Object.entries(activeFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        if (key === "brand") {
          params.set("brand", values.join(","));
        } else {
          params.set(`spec_${key}`, values.join(","));
        }
      }
    });

    if (appliedPrice?.min) params.set("price_gt", appliedPrice.min);
    if (appliedPrice?.max) params.set("price_lt", appliedPrice.max);

    const newUrl = `/search?${params.toString()}`;
    const currentUrl = window.location.pathname + window.location.search;

    if (newUrl !== currentUrl) {
      isSyncingRef.current = true;
      router.push(newUrl, { scroll: false });
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 0);
    }
  }, [isInitialized, topFilterValues, activeFilters, appliedPrice, searchQuery, router]);

  // ─── Handlers ────────────────────────────────────────
  const handleTopFilterChange = useCallback((slug: string, value: string | boolean | null) => {
    setTopFilterValues((prev) => ({ ...prev, [slug]: value }));
  }, []);

  const handleFilterChange = useCallback((groupId: string, optionId: string) => {
    setActiveFilters((prev) => {
      const currentFilter = sidebarFilters.find((f) => f.slug === groupId);
      const isSingle = currentFilter?.type === "single_choice" || currentFilter?.type === "dropdown";

      if (isSingle) {
        const current = prev[groupId] || [];
        if (current.includes(optionId) || optionId === "") {
          return { ...prev, [groupId]: [] };
        }
        return { ...prev, [groupId]: [optionId] };
      } else {
        const current = prev[groupId] || [];
        if (current.includes(optionId)) {
          return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
        }
        return { ...prev, [groupId]: [...current, optionId] };
      }
    });
  }, [sidebarFilters]);

  const handlePriceApply = useCallback(() => {
    setAppliedPrice(priceRange);
  }, [priceRange]);

  const handlePriceClear = useCallback(() => {
    setPriceRange({ min: "", max: "" });
    setAppliedPrice(null);
  }, []);

  const handleClearFilterGroup = useCallback((slug: string) => {
    setActiveFilters((prev) => ({ ...prev, [slug]: [] }));
  }, []);

  const isCategoryNotFound = error && (error as any)?.status === 404
  return (
    <div dir="rtl" className="min-h-screen text-[#1e293b] dark:text-white">
      <div className="max-w-8xl mx-auto px-12 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <SidebarFilters
              apiFilters={sidebarFilters}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              onPriceApply={handlePriceApply}
              onPriceClear={handlePriceClear}
              minPrice={minPrice}
              maxPrice={maxPrice}
              suggestedCategories={suggestedCategories}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-4">
            <CategoryBreadcrumb categories={breadcrumb} />

            {title && (
              <h1 className="text-2xl py-4 font-bold text-[#1e293b] dark:text-white">{title}</h1>
            )}

            <TopFilterBar
              filters={topFilters}
              activeValues={topFilterValues}
              onChange={handleTopFilterChange}
            />

            <ActiveFilterBadges
              filters={sidebarFilters}
              onClear={handleClearFilterGroup}
            />

            {/* Results Count */}
            {pagination && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {pagination.total} محصول یافت شد
              </div>
            )}

            {shop && <ShopHeader shop={shop} />}

            {/* Product Results */}
            {isCategoryNotFound ? <CategoryNotFound /> : <ProductResults data={products} isLoading={isPending} />}
            {/* Sentinel for Infinite Scroll */}
            <div ref={sentinelRef} className="h-10 w-full" />

            {/* Loading spinner for next page */}
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-6">
                <Spinner className="size-6 text-blue-500" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchFilters() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#ffffff] dark:bg-[#0f172a] flex items-center justify-center">
          <Spinner className="size-10 text-blue-500" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}