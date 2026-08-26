"use client";

import {
  useState,
  Suspense,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { usePathname } from "next/navigation";
import {
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Search,
  XIcon,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  useGetUser,
  useGetUserAlerts,
  useGetUserFavorites,
  useSearch,
} from "@/lib/apis";
import ProductCard from "@/components/product-card";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Badge } from "./ui/badge";
import { useSearchFilters } from "../hooks/use-search-filters";


interface ApiFilterItem {
  id?: string | number;
  value?: string | number;
  name?: string;
  name_en?: string;
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


function PriceFilter({
  minPrice,
  maxPrice,
}: {
  minPrice?: number;
  maxPrice?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const {
    priceMinInput,
    setPriceMinInput,
    priceMaxInput,
    setPriceMaxInput,
    applyPrice,
    clearPrice,
  } = useSearchFilters();

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3 px-1 text-sm font-medium text-[#1e293b] dark:text-white"
      >
        <span>قیمت</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        )}
      </button>

      {expanded && (
        <div className="pb-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0 w-8">از</span>
            <div className="relative flex-1">
              <Input
                type="text"
                inputMode="numeric"
                placeholder={minPrice?.toString()}
                value={priceMinInput}
                onChange={(e) => setPriceMinInput(e.target.value)}
                className="bg-[#ffffff] dark:bg-[#0f172a] border-gray-300 dark:border-gray-700 text-sm text-left pl-16 h-10"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                تومان
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0 w-8">تا</span>
            <div className="relative flex-1">
              <Input
                type="text"
                inputMode="numeric"
                placeholder={maxPrice?.toString()}
                value={priceMaxInput}
                onChange={(e) => setPriceMaxInput(e.target.value)}
                className="bg-[#ffffff] dark:bg-[#0f172a] border-gray-300 dark:border-gray-700 text-sm text-left pl-16 h-10"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                تومان
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={clearPrice}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm"
            >
              حذف
            </button>
            <button
              onClick={applyPrice}
              className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-sm font-medium"
            >
              اعمال فیلتر
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


function SidebarFilters({
  apiFilters,
  minPrice,
  maxPrice,
  suggestedCategories,
  isBrowsePage,
  title,
  popularCategories,
}: {
  apiFilters: ApiFilter[];
  minPrice?: number;
  maxPrice?: number;
  suggestedCategories?: { id: number; title: string; url: string }[];
  isBrowsePage: boolean;
  title?: string;
  popularCategories?: { id: number; title: string; url: string }[];
}) {
  const { setActiveFilter, activeFilters } = useSearchFilters();

  const handleFilterChange = (groupId: string, optionId: string) => {
    const currentFilter = apiFilters.find((f) => f.slug === groupId);
    const isSingle =
      currentFilter?.type === "single_choice" ||
      currentFilter?.type === "dropdown";
    setActiveFilter(groupId, optionId, isSingle);
  };

  return (
    <div>
      <div className="bg-[#ffffff] dark:bg-[#1e293b] rounded-2xl p-4">
        {apiFilters.map((filter) => (
          <DynamicFilterGroup
            key={filter.slug}
            filter={filter}

            selected={
              activeFilters[
              filter.slug === "brand"
                ? "brand_id"
                : filter.slug
              ] || []
            } onChange={handleFilterChange}
          />
        ))}

        <SuggestedCategories categories={suggestedCategories || []} />
        <PriceFilter minPrice={minPrice} maxPrice={maxPrice} />

        {isBrowsePage && (
          <>
            <SearchInResults />
            <PriceListLink title={title} href="" />
            <PopularCategories categories={popularCategories || []} />
          </>
        )}
      </div>
    </div>
  );
}

function ActiveFilterBadges({
  filters,
}: {
  filters: ApiFilter[];
}) {
  const {
    activeFilters,
    clearActiveFilterGroup,
    topFilters,
    setTopFilter,
    priceGt,
    priceLt,
    clearPrice,
    q,
    setQ,
  } = useSearchFilters();

  const badges: {
    label: string;
    onClear: () => void;
  }[] = [];

  filters.forEach((f) => {
    if (
      f.badge_text &&
      topFilters[f.slug] != null &&
      topFilters[f.slug] !== false
    ) {
      badges.push({
        label: f.badge_text,
        onClear: () => setTopFilter(f.slug, null),
      });
    }
  });

  Object.entries(activeFilters).forEach(
    ([slug, values]) => {
      if (!values?.length) return;

      const filter = filters.find((f) => {
        if (slug === "brand_id") {
          return f.slug === "brand";
        }
        return f.slug === slug;
      });

      if (!filter) return;

      const names = values.map((v) => {
        if (slug === "brand_id") {
          const item = filter.items?.find(
            (i) => String(i.id) === String(v),
          );
          return item?.name || v;
        }

        const item = filter.items?.find(
          (i) => String(i.value ?? i.slug) === String(v),
        );
        return item?.name || v;
      });

      badges.push({
        label: `${filter.title}: ${names.join(" و ")}`,
        onClear: () => {
          console.log('clearing slug:', slug);
          if (slug === "brand_id") {
            clearActiveFilterGroup("brand");
          } else {
            clearActiveFilterGroup(slug);
          }
        }
      });
    },
  );

  if (priceGt != null || priceLt != null) {
    badges.push({
      label: `قیمت: ${priceGt?.toLocaleString("fa-IR") || "۰"
        } تا ${priceLt?.toLocaleString("fa-IR") || "∞"
        }`,
      onClear: clearPrice,
    });
  }

  if (q) {
    badges.push({
      label: `جستجو: ${q}`,
      onClear: () => setQ(""),
    });
  }

  if (!badges.length) return null;

  return (
    <div className="flex flex-wrap gap-4">
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
  );
}


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

  const isSingle =
    filter.type === "single_choice" || filter.type === "dropdown";

  const limit = 10;
  const items = filter.items || [];
  const displayItems = showAll ? items : items.slice(0, limit);
  const hasMore = items.length > limit;

  const isSelected = (value: string) => selected.includes(value);

  const handleSelect = (value: string) => {
    if (isSingle) {
      onChange(filter.slug, isSelected(value) ? "" : value);
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
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        )}
      </button>

      {expanded && (
        <div className="pb-3 space-y-1">
          {displayItems.map((item, idx) => {
            const value = String(item.id);
            const label = item.name || value;
            return (
              <label
                key={`${filter.slug}-${idx}`}
                className="flex items-center justify-between py-1.5 px-1 cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center transition ${isSingle
                      ? `w-4 h-4 rounded-full border ${isSelected(value)
                        ? "border-blue-500"
                        : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400"
                      }`
                      : `w-4 h-4 rounded border ${isSelected(value)
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400"
                      }`
                      }`}
                  >
                    {isSelected(value) &&
                      (isSingle ? (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      ) : (
                        <Check className="w-3 h-3 text-white" />
                      ))}
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
              className="w-full text-right py-2 px-1 text-sm text-blue-500 dark:text-blue-400"
            >
              مشاهده بیشتر
            </button>
          )}
          {showAll && hasMore && (
            <button
              onClick={() => setShowAll(false)}
              className="w-full text-right py-2 px-1 text-sm text-blue-500 dark:text-blue-400"
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
  if (!categories?.length) return null;

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 pb-4 mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3 px-1 text-sm font-medium text-[#1e293b] dark:text-white"
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



function SearchInResults() {
  const [expanded, setExpanded] = useState(true);
  const { searchInput, setSearchInput, applySearch, clearSearch } = useSearchFilters();

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-4 px-1 text-sm font-medium"
      >
        <span>جستجو در نتایج</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="pb-4 space-y-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="جستجو در نتایج..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applySearch();
              }}
              className="bg-[#ffffff] dark:bg-[#0f172a] border-gray-300 dark:border-gray-700 text-sm text-right pr-10 h-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={clearSearch}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm"
            >
              حذف
            </button>
            <button
              onClick={applySearch}
              className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-sm font-medium"
            >
              اعمال
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


function PriceListLink({ title, href }: { title?: string; href?: string }) {
  if (!title) return null;
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 py-4">
      <Link
        href={href || "#"}
        className="block text-sm font-medium text-[#1e293b] dark:text-white hover:text-[#d73948]"
      >
        لیست قیمت {title}
      </Link>
    </div>
  );
}


function PopularCategories({
  categories,
}: {
  categories: { id: number; title: string; url: string }[];
}) {
  if (!categories?.length) return null;
  return (
    <div className="mt-4">
      <h3 className="text-sm font-bold text-[#1e293b] dark:text-white mb-3">
        دسته‌بندی‌های پربازدید
      </h3>
      <div className="flex flex-col gap-2">
        {categories.map((cat) => (
          <Link
            href={`/browse/${cat.id}/${cat.url}`}
            key={cat.id}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-[#d73948]"
          >
            {cat.title}
          </Link>
        ))}
      </div>
    </div>
  );
}



function ProductResults({ data, isLoading }: { data: any[]; isLoading: boolean }) {
  const { data: user } = useGetUser();
  const { data: favoriteIds = [] } = useGetUserFavorites(true, {
    enabled: !!user?.phone,
  });
  const { data: alertIds = [] } = useGetUserAlerts(true, {
    enabled: !!user?.phone,
  });

  const favoriteSet = new Set(favoriteIds);
  const alertSet = new Set(alertIds);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8 text-blue-500" />
      </div>
    );
  }

  if (!data?.length) {
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
    <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 grid-cols-2 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}


function ShopHeader({ shop }: { shop: any }) {
  const [query, setQuery] = useState("");
  if (!shop) return null;

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
                className="text-sm text-blue-500 dark:text-blue-400"
              >
                {shop.domain}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function CategoryBreadcrumb({
  categories,
}: {
  categories: { id: number; title: string; url: string }[];
}) {
  if (!categories?.length) return null;
  return (
    <Breadcrumb dir="rtl" className="border-b border-gray-200 dark:border-gray-800 py-2">
      <BreadcrumbList>
        {categories.map((category, index) => {
          const isLast = index === categories.length - 1;
          return (
            <div key={category.id} className="flex items-center">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{category.title}</BreadcrumbPage>
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




function CategoryNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
      <Search className="w-16 h-16 mb-4 opacity-30" />
      <p className="text-lg font-bold text-red-500">دسته‌بندی مورد نظر یافت نشد</p>
      <p className="text-sm mt-2">دسته‌بندی که به دنبال آن هستید وجود ندارد یا حذف شده است</p>
      <Link
        href="/"
        className="mt-6 px-6 py-2 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-sm font-medium"
      >
        بازگشت به صفحه اصلی
      </Link>
    </div>
  );
}


function SearchContent() {
  const pathname = usePathname();
  const isBrowsePage = pathname.startsWith("/browse");
  const isSearchPage = pathname.startsWith("/search");
  const { apiParams, query } = useSearchFilters();

  const getCategoryIdFromPath = useCallback((currentPathname: string) => {
    const parts = currentPathname.split("/").filter(Boolean);
    const browseIndex = parts.indexOf("browse");
    if (browseIndex === -1) return null;
    const ids = parts.slice(browseIndex + 1).filter((part) => /^\d+$/.test(part));
    return ids.length ? Number(ids[ids.length - 1]) : null;
  }, []);

  const finalApiParams = useMemo(() => {
    const params = { ...apiParams };
    if (isSearchPage && query.trim()) params.query = query.trim();
    if (isBrowsePage) {
      const categoryId = getCategoryIdFromPath(pathname);
      if (categoryId) params.category_id = categoryId;
    }
    return params;
  }, [apiParams, isSearchPage, isBrowsePage, query, pathname, getCategoryIdFromPath]);

  const {
    data: searchResults,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
  } = useSearch(finalApiParams);

  const products = searchResults?.pages.flatMap((page: any) => page.data) || [];
  const firstPage = searchResults?.pages?.[0];

  const shop = firstPage?.shop;
  const title = firstPage?.title;
  const breadcrumb = firstPage?.breadcrumb || [];
  const sidebarFilters: ApiFilter[] = firstPage?.filters1 || [];
  const topFilters: ApiFilter[] = firstPage?.filters2 || [];
  const minPrice = firstPage?.min_price;
  const maxPrice = firstPage?.max_price;
  const suggestedCategories = firstPage?.suggested_categories || [];
  const popularCategories = firstPage?.popular_categories || [];

  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchNextPageRef = useRef<any>(null);
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

  const isCategoryNotFound = error && (error as any)?.status === 404;

  return (
    <div dir="rtl" className="min-h-screen text-[#1e293b] dark:text-white">
      <div className="max-w-8xl mx-auto px-12 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <SidebarFilters
              apiFilters={sidebarFilters}
              minPrice={minPrice}
              maxPrice={maxPrice}
              suggestedCategories={suggestedCategories}
              isBrowsePage={isBrowsePage}
              title={title}
              popularCategories={popularCategories}
            />
          </div>

          <div className="lg:col-span-9 space-y-4">
            <CategoryBreadcrumb categories={breadcrumb} />

            {title && (
              <h1 className="text-2xl py-4 font-bold text-[#1e293b] dark:text-white">
                {title}
              </h1>
            )}

            <TopFilterBar filters={topFilters} />
            <ActiveFilterBadges filters={sidebarFilters} />

            {shop && <ShopHeader shop={shop} />}

            {isCategoryNotFound ? (
              <CategoryNotFound />
            ) : (
              <ProductResults data={products} isLoading={isPending} />
            )}

            <div ref={sentinelRef} className="h-10 w-full" />

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