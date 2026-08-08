"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MapPin, Search } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useGetShop } from "@/lib/apis"
import { useShopFilters } from "./use-shop-filters"

function TabLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link
      href={href}
      className={`text-sm px-8 py-3 transition-colors ${
        isActive
          ? "text-[#d73948] font-medium"
          : "text-[#64748b] dark:text-[#94a3b8] hover:text-black dark:hover:text-white"
      }`}
    >
      {label}
    </Link>
  )
}

function ShopSidebarFilters() {
  const {
    priceMinInput, setPriceMinInput,
    priceMaxInput, setPriceMaxInput,
    applyPrice, clearPrice,
    searchInput, setSearchInput,
    applySearch, clearSearch,
  } = useShopFilters()

  return (
    <div className="px-8 py-6 border-t border-[#f1f5f9] dark:border-[#15202b] space-y-5">
      <h3 className="text-sm font-bold dark:text-white">فیلتر محصولات</h3>

      <div className="space-y-2">
        <label className="text-xs text-[#94a3b8]">جستجو در محصولات</label>
        <div className="relative">
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            placeholder="نام محصول را بنویسید..."
            className="bg-white dark:bg-[#1a232e] border-[#e2e8f0] dark:border-[#2d3a4a] text-sm pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-[#94a3b8]">محدوده قیمت (تومان)</label>
        <div className="flex items-center gap-2">
          <Input
            type="text" inputMode="numeric"
            value={priceMinInput}
            onChange={(e) => setPriceMinInput(e.target.value)}
            placeholder="از"
            className="bg-white dark:bg-[#1a232e] border-[#e2e8f0] dark:border-[#2d3a4a] text-sm text-left"
          />
          <span className="text-[#94a3b8] text-xs">تا</span>
          <Input
            type="text" inputMode="numeric"
            value={priceMaxInput}
            onChange={(e) => setPriceMaxInput(e.target.value)}
            placeholder="تا"
            className="bg-white dark:bg-[#1a232e] border-[#e2e8f0] dark:border-[#2d3a4a] text-sm text-left"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={clearPrice} className="flex-1 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-xs">حذف قیمت</button>
        <button onClick={applyPrice} className="flex-1 py-2 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-xs font-medium">اعمال فیلتر</button>
      </div>

      <div className="flex gap-2">
        <button onClick={clearSearch} className="flex-1 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-xs">حذف جستجو</button>
        <button onClick={applySearch} className="flex-1 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium">جستجو</button>
      </div>
    </div>
  )
}

export default function ShopLayoutClient({
  shopId,
  slug,
  children,
}: {
  shopId: number
  slug: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isProductPage = pathname.endsWith("/product")
  const { data: shop, isPending, error } = useGetShop(shopId)

  const shopPath = `/shop/${shopId}/${slug}`
  const productPath = `/shop/${shopId}/${slug}/product`

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#15202b] bg-[#f1f5f9]">
        <Spinner className="size-10 text-[#d73948]" />
      </div>
    )
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center dark:bg-[#15202b] bg-[#f1f5f9] text-center px-4">
        <div className="mb-6">
          <svg className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-[#1e293b] dark:text-white mb-2">فروشگاه مورد نظر یافت نشد</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">فروشگاهی که به دنبال آن هستید وجود ندارد یا حذف شده است</p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-sm font-medium hover:opacity-90 transition">
          <Home className="w-4 h-4" />
          برگشت به صفحه اصلی
        </Link>
      </div>
    )
  }

  return (
    <div className="flex">
      <aside className="shrink-0 w-96">
        <div className="dark:bg-[#212b36] border-t border-b border-[#f1f5f9] dark:border-[#15202b] space-y-6 bg-[#ffffff] dark:text-white text-black py-16">
          <Breadcrumb>
            <BreadcrumbList className="text-xs px-8">
              <BreadcrumbItem>
                <BreadcrumbLink href="/shop-list">فروشگاه‌های ترب</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="rotate-180" />
              <BreadcrumbItem>
                <BreadcrumbPage>{shop.shop_name || "فروشگاه"}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center py-10 gap-4 px-8">
            <img className="w-20 h-20 rounded-xl object-cover bg-gray-100" src={shop.shop_logo || "/placeholder-shop.png"} alt={shop.shop_name} />
            <div className="space-y-2">
              <h1 className="font-bold text-lg">{shop.shop_name}</h1>
              {shop.domain && (
                <a href={`https://${shop.domain}`} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs text-blue-500 block">{shop.domain}</a>
              )}
              {(shop.province || shop.city) && (
                <div className="flex items-center text-[#94a3b8] mt-1 text-xs gap-1">
                  <MapPin className="w-3 h-3" />
                  <p>{shop.province}</p>
                  {shop.city && <span>,</span>}
                  <p>{shop.city}</p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex flex-col">
            <TabLink href={shopPath} label="اطلاعات تکمیلی و پیگیری سفارش" />
            <TabLink href={productPath} label="محصولات فروشگاه" />
          </nav>

          {isProductPage && <ShopSidebarFilters />}
        </div>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  )
}