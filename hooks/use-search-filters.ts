"use client";

import { useMemo, useCallback, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQueryState } from "nuqs";

export type ActiveFilters = Record<string, string[]>;

const RESERVED_PARAMS = new Set([
  "query",
  "q",
  "price_gt",
  "price_lt",
  "sort",
  "page",
]);

export function useSearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── ثابت‌ها با nuqs ──
  const [query, setQuery] = useQueryState("query", {
    defaultValue: "",
    throttleMs: 400,
  });

  const [q, setQ] = useQueryState("q", {
    defaultValue: "",
  });

  const [sort, setSort] = useQueryState("sort", {
    defaultValue: "",
  });

  const [priceGt, setPriceGt] = useQueryState("price_gt", {
    parse: (v) => (v ? Number(v.replace(/,/g, "")) : null),
    serialize: (v) => (v != null ? String(v) : ""),
    defaultValue: null as number | null,
  });

  const [priceLt, setPriceLt] = useQueryState("price_lt", {
    parse: (v) => (v ? Number(v.replace(/,/g, "")) : null),
    serialize: (v) => (v != null ? String(v) : ""),
    defaultValue: null as number | null,
  });

  // ── لوکال استیت برای دکمه اعمال قیمت ──
  const [priceMinInput, setPriceMinInput] = useState(priceGt?.toString() ?? "");
  const [priceMaxInput, setPriceMaxInput] = useState(priceLt?.toString() ?? "");

  const applyPrice = useCallback(() => {
    const min = priceMinInput.replace(/,/g, "");
    const max = priceMaxInput.replace(/,/g, "");
    setPriceGt(min ? Number(min) : null);
    setPriceLt(max ? Number(max) : null);
  }, [priceMinInput, priceMaxInput, setPriceGt, setPriceLt]);

  const clearPrice = useCallback(() => {
    setPriceMinInput("");
    setPriceMaxInput("");
    setPriceGt(null);
    setPriceLt(null);
  }, [setPriceGt, setPriceLt]);

  // ── لوکال استیت برای دکمه اعمال جستجو در نتایج ──
  const [searchInput, setSearchInput] = useState(q);

  const applySearch = useCallback(() => {
    setQ(searchInput.trim() || null);
  }, [searchInput, setQ]);

  const clearSearch = useCallback(() => {
    setSearchInput("");
    setQ(null);
  }, [setQ]);

  // ── تاپ فیلترها (flat در URL) ──
  const topFilters = useMemo(() => {
    const result: Record<string, string | boolean> = {};
    searchParams.forEach((value, key) => {
      if (RESERVED_PARAMS.has(key)) return;
      if (key === "brand") return;
      if (key.startsWith("spec_")) return;
      if (value === "true") result[key] = true;
      else if (value === "false") result[key] = false;
      else result[key] = value;
    });
    return result;
  }, [searchParams]);

  const setTopFilter = useCallback(
    (key: string, value: string | boolean | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === false || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  // ── سایدبار فیلترها (brand + spec_*) ──
  const activeFilters = useMemo(() => {
    const result: ActiveFilters = {};
    searchParams.forEach((value, key) => {
      if (key === "brand") {
        result.brand = value.split(",").filter(Boolean);
        return;
      }
      if (key.startsWith("spec_")) {
        const slug = key.replace(/^spec_/, "");
        result[slug] = value.split(",").filter(Boolean);
      }
    });
    return result;
  }, [searchParams]);

  const setActiveFilter = useCallback(
    (groupId: string, optionId: string, isSingle: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      const urlKey = groupId === "brand" ? "brand" : `spec_${groupId}`;
      const current = activeFilters[groupId] || [];

      let next: string[];
      if (isSingle) {
        next = current.includes(optionId) || optionId === "" ? [] : [optionId];
      } else {
        next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
      }

      if (next.length > 0) {
        params.set(urlKey, next.join(","));
      } else {
        params.delete(urlKey);
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router, activeFilters],
  );

  const clearActiveFilterGroup = useCallback(
    (groupId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const urlKey = groupId === "brand" ? "brand" : `spec_${groupId}`;
      params.delete(urlKey);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  // ── ساخت پارامترهای API ──
  const apiParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (query.trim()) params.query = query.trim();
    if (q?.trim()) params.q = q.trim();
    if (priceGt != null) params.price_gt = priceGt;
    if (priceLt != null) params.price_lt = priceLt;
    if (sort) params.sort = sort;

    Object.entries(topFilters).forEach(([key, val]) => {
      if (val !== null && val !== false && val !== "") params[key] = val;
    });

    Object.entries(activeFilters).forEach(([key, values]) => {
      if (!values?.length) return;
      if (key === "brand" && values[0]) params.brand_id = Number(values[0]);
      else params[`spec_${key}`] = values.join(",");
    });

    return params;
  }, [query, q, priceGt, priceLt, sort, topFilters, activeFilters]);

  const clearAllFilters = useCallback(() => {
    setQuery("");
    setQ(null);
    setSort("");
    setPriceGt(null);
    setPriceLt(null);
    setPriceMinInput("");
    setPriceMaxInput("");
    setSearchInput("");
    router.replace(pathname, { scroll: false });
  }, [setQuery, setQ, setSort, setPriceGt, setPriceLt, router, pathname]);

  return {
    query,
    setQuery,
    q,
    setQ,
    searchInput,
    setSearchInput,
    applySearch,
    clearSearch,
    sort,
    setSort,
    priceGt,
    setPriceGt,
    priceLt,
    setPriceLt,
    priceMinInput,
    setPriceMinInput,
    priceMaxInput,
    setPriceMaxInput,
    applyPrice,
    clearPrice,
    topFilters,
    setTopFilter,
    activeFilters,
    setActiveFilter,
    clearActiveFilterGroup,
    apiParams,
    clearAllFilters,
  };
}
