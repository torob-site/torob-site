"use client"

import { useMemo, useCallback, useState } from "react"
import { useQueryState } from "nuqs"

export function useShopFilters() {
  const [q, setQ] = useQueryState("q", { defaultValue: "" })

  const [priceGt, setPriceGt] = useQueryState("price_gt", {
    parse: (v) => (v ? Number(v.replace(/,/g, "")) : null),
    serialize: (v) => (v != null ? String(v) : ""),
    defaultValue: null as number | null,
  })

  const [priceLt, setPriceLt] = useQueryState("price_lt", {
    parse: (v) => (v ? Number(v.replace(/,/g, "")) : null),
    serialize: (v) => (v != null ? String(v) : ""),
    defaultValue: null as number | null,
  })

  const [sort, setSort] = useQueryState("sort", { defaultValue: "" })

  const [isAvailable, setIsAvailable] = useQueryState("is_available", {
    parse: (v) => v === "true",
    serialize: (v) => (v ? "true" : ""),
    defaultValue: false,
  })

  // لوکال استیت‌ها برای دکمه اعمال
  const [priceMinInput, setPriceMinInput] = useState(priceGt?.toString() ?? "")
  const [priceMaxInput, setPriceMaxInput] = useState(priceLt?.toString() ?? "")
  const [searchInput, setSearchInput] = useState(q)

  const applyPrice = useCallback(() => {
    const min = priceMinInput.replace(/,/g, "")
    const max = priceMaxInput.replace(/,/g, "")
    setPriceGt(min ? Number(min) : null)
    setPriceLt(max ? Number(max) : null)
  }, [priceMinInput, priceMaxInput, setPriceGt, setPriceLt])

  const clearPrice = useCallback(() => {
    setPriceMinInput("")
    setPriceMaxInput("")
    setPriceGt(null)
    setPriceLt(null)
  }, [setPriceGt, setPriceLt])

  const applySearch = useCallback(() => {
    setQ(searchInput.trim() || null)
  }, [searchInput, setQ])

  const clearSearch = useCallback(() => {
    setSearchInput("")
    setQ(null)
  }, [setQ])

  const apiParams = useMemo(() => {
    const params: Record<string, any> = {}
    if (q?.trim()) params.q = q.trim()
    if (priceGt != null) params.price_gt = priceGt
    if (priceLt != null) params.price_lt = priceLt
    if (sort) params.sort = sort
    if (isAvailable) params.is_available = true
    return params
  }, [q, priceGt, priceLt, sort, isAvailable])

  const clearAllFilters = useCallback(() => {
    setQ(null)
    setPriceGt(null)
    setPriceLt(null)
    setSort("")
    setIsAvailable(false)
    setPriceMinInput("")
    setPriceMaxInput("")
    setSearchInput("")
  }, [setQ, setPriceGt, setPriceLt, setSort, setIsAvailable])

  return {
    q, setQ,
    searchInput, setSearchInput,
    applySearch,
    clearSearch,
    priceGt, setPriceGt,
    priceLt, setPriceLt,
    priceMinInput, setPriceMinInput,
    priceMaxInput, setPriceMaxInput,
    applyPrice,
    clearPrice,
    sort, setSort,
    isAvailable, setIsAvailable,
    apiParams,
    clearAllFilters,
  }
}