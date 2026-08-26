"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import {
  BarChart,
  SquareArrowOutUpLeft,
  PlusIcon,
  X,
  ChevronDown,
  Home,
  Flag,
  Plus,
  BarChart3,
  MoreHorizontal,
  Loader2,
  Package,
  Check,
  Save,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { axiosClient } from "@/lib/axios";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { Switch } from "@/components/ui/switch";

// ============================================
// TYPES
// ============================================

interface Product {
  id: number;
  product_id?: number;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  main_image: string | null;
  views: number;
  time_ago: string;
  is_available: boolean;
  warranty: {
    id: number;
    title: string;
  } | null;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  sorting: {
    sort_by: string;
    sort_label: string;
    sort_order: string;
  };
}

// ============================================
// QUERY HOOKS
// ============================================

export function useGetProducts(params: any = {}) {
  const { currentShop } = useCurrentShop();

  return useQuery({
    queryKey: ["products", currentShop?.id, params],
    queryFn: async () => {
      const { data } = await axiosClient.get(
        `/panel/shops/${currentShop.id}/products`,
        { params },
      );
      return data;
    },
    enabled: !!currentShop?.id,
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { currentShop } = useCurrentShop();

  return useMutation({
    mutationFn: async ({
      productId,
      data,
    }: {
      productId: number;
      data: {
        description?: string | null;
        price?: number;
        is_active?: boolean;
        warranty_id?: number;
        warranty_duration: number;
      };
    }) => {
      const { data: response } = await axiosClient.patch(
        `/panel/shops/${currentShop.id}/products/${productId}`,
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products", currentShop?.id],
      });
    },
  });
}

// ============================================
// FILTERS CONFIG
// ============================================

type FilterKey = "sort" | "registration_status" | "description";

type FilterOption = {
  label: string;
  value: string;
};

const filterOptions: Record<FilterKey, FilterOption[]> = {
  sort: [
    { label: "نام محصول", value: "name" },
    { label: "جدیدترین", value: "created_at" },
    { label: "پربازدیدترین", value: "views" },
    { label: "موجودی", value: "quantity_desc" },
    { label: "ناموجود", value: "quantity_asc" },
  ],
  registration_status: [
    { label: "بدون گارانتی", value: "false" },
    { label: "دارای گارانتی", value: "true" },
  ],
  description: [
    { label: "بدون توضیحات", value: "false" },
    { label: "دارای توضیحات", value: "true" },
  ],
};

const footerItems = [
  { title: "خانه", href: "/panel", icon: Home },
  { title: "گزارش", href: "/panel/reports", icon: Flag },
  {
    title: "افزودن محصول",
    href: "/panel/products/create",
    icon: Plus,
    main: true,
  },
  { title: "آمار", href: "/panel/statistics", icon: BarChart3 },
  { title: "بیشتر", href: "/panel/more", icon: MoreHorizontal },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProductsPage() {
  const pathname = usePathname();
  const { currentShop } = useCurrentShop();

  // ============================================
  // URL FILTERS
  // ============================================

  const [sort, setSort] = useQueryState("sort", {
    defaultValue: "",
    clearOnDefault: true,
  });
  const [registrationStatus, setRegistrationStatus] = useQueryState(
    "registration_status",
    {
      defaultValue: "",
      clearOnDefault: true,
    },
  );
  const [descriptionStatus, setDescriptionStatus] = useQueryState(
    "description",
    {
      defaultValue: "",
      clearOnDefault: true,
    },
  );
  const [page, setPage] = useQueryState("page", {
    defaultValue: "1",
    clearOnDefault: true,
  });
  const [searchQuery, setSearchQuery] = useQueryState("q", {
    defaultValue: "",
    clearOnDefault: true,
  }); // اضافه کردن q

  // ============================================
  // STATE
  // ============================================

  const [activeModal, setActiveModal] = useState<FilterKey | null>(null);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  // State for editing price
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");

  // State for editing description
  const [editingDescriptionId, setEditingDescriptionId] = useState<
    number | null
  >(null);
  const [editDescription, setEditDescription] = useState<string>("");

  // ============================================
  // QUERY
  // ============================================

  const queryParams = {
    sort: sort || undefined,
    q: searchQuery || undefined, // اضافه کردن q به پارامترها
    page: parseInt(page) || 1,
    limit: 10,
    has_warranty:
      registrationStatus === "true"
        ? true
        : registrationStatus === "false"
          ? false
          : undefined,
    has_description:
      descriptionStatus === "true"
        ? true
        : descriptionStatus === "false"
          ? false
          : undefined,
  };

  const { data, isLoading, error, refetch } = useGetProducts(queryParams);
  const updateProduct = useUpdateProduct();

  const products = data?.products || [];
  const pagination = data?.pagination;
  const sorting = data?.sorting;

  // ============================================
  // HANDLERS
  // ============================================

  const closeModal = () => setActiveModal(null);

  const getSelectedValue = (key: FilterKey): string => {
    switch (key) {
      case "sort":
        return sort || "";
      case "registration_status":
        return registrationStatus || "";
      case "description":
        return descriptionStatus || "";
      default:
        return "";
    }
  };

  const handleSelect = async (key: FilterKey, value: string) => {
    const currentValue = getSelectedValue(key);
    const nextValue = currentValue === value ? "" : value;

    switch (key) {
      case "sort":
        await setSort(nextValue);
        break;
      case "registration_status":
        await setRegistrationStatus(nextValue);
        break;
      case "description":
        await setDescriptionStatus(nextValue);
        break;
    }

    setActiveModal(null);
  };

  const handlePageChange = async (newPage: number) => {
    await setPage(String(newPage));
  };

  const handleToggleStatus = async (productId: number, isActive: boolean) => {
    await updateProduct.mutateAsync({
      productId,
      data: { is_active: !isActive },
    });
  };

  // ============================================
  // PRICE HANDLERS
  // ============================================

  const handleEditPrice = (product: Product) => {
    setEditingProductId(product.id);
    setEditPrice(String(product.price));
  };

  const handleSavePrice = async () => {
    if (!editingProductId) return;

    const price = parseInt(editPrice.replace(/,/g, ""));
    if (isNaN(price) || price < 0) {
      alert("لطفاً قیمت معتبر وارد کنید");
      return;
    }

    await updateProduct.mutateAsync({
      productId: editingProductId,
      data: { price },
    });

    setEditingProductId(null);
    setEditPrice("");
  };

  const handleCancelPrice = () => {
    setEditingProductId(null);
    setEditPrice("");
  };

  // ============================================
  // DESCRIPTION HANDLERS
  // ============================================

  const handleEditDescription = (product: Product) => {
    setEditingDescriptionId(product.id);
    setEditDescription(product.description || "");
  };

  const handleSaveDescription = async () => {
    if (!editingDescriptionId) return;

    if (!editDescription.trim()) {
      alert("لطفاً توضیحات را وارد کنید");
      return;
    }

    await updateProduct.mutateAsync({
      productId: editingDescriptionId,
      data: { description: editDescription },
    });

    setEditingDescriptionId(null);
    setEditDescription("");
  };

  const handleCancelDescription = () => {
    setEditingDescriptionId(null);
    setEditDescription("");
  };

  // ============================================
  // MODAL TITLE
  // ============================================

  const getModalTitle = () => {
    if (activeModal === "sort") return "مرتب سازی";
    if (activeModal === "registration_status") return "فیلتر وضعیت گارانتی";
    if (activeModal === "description") return "فیلتر وضعیت توضیحات";
    return "";
  };

  const currentOptions = activeModal ? filterOptions[activeModal] : [];
  const currentValue = activeModal ? getSelectedValue(activeModal) : "";

  // ============================================
  // RENDER
  // ============================================

  if (!currentShop) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">
          لطفاً یک فروشگاه انتخاب کنید
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="mr-3 text-gray-500 dark:text-gray-400">
          در حال بارگذاری...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center">
        <div className="text-red-500">خطا در دریافت اطلاعات</div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gray-50 dark:bg-[#0f172a] pb-[180px]"
    >
      <div className="mx-auto max-w-[700px]">
        {/* ========================================== */}
        {/* BANNER */}
        {/* ========================================== */}

        {isBannerVisible && (
          <div className="relative h-[108px] w-full overflow-hidden">
            <img
              src="https://panel.torob.com/o/assets/images/recommend-banner.svg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => setIsBannerVisible(false)}
              className="absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center text-white transition-opacity hover:opacity-70"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="absolute right-[140px] top-1/2 z-10 -translate-y-1/2 text-right">
              <div className="text-sm font-bold text-blue-600">
                مشاوره‌ی فروش،
              </div>
              <div className="mt-1 text-sm font-medium text-gray-900">
                پیشنهادی برای افزایش فروش
              </div>
            </div>
            <Link
              href="/panel/products/create"
              className="absolute left-[42px] top-1/2 z-10 -translate-y-1/2 text-sm font-bold text-blue-600"
            >
              افزودن محصول
            </Link>
          </div>
        )}

        {/* ========================================== */}
        {/* PRODUCTS LIST */}
        {/* ========================================== */}

        <div className="space-y-3 p-4">
          {products.length === 0 ? (
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                هیچ محصولی یافت نشد
              </p>
            </div>
          ) : (
            products.map((product) => {
              const isEditingPrice = editingProductId === product.id;
              const isEditingDescription = editingDescriptionId === product.id;

              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-4"
                >
                  {/* ==========================================
          PRODUCT
      ========================================== */}

                  <Link
                    href={`/panel/products/${product.id}`}
                    className="block"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        className="w-16 h-16 rounded-xl object-cover bg-gray-100 dark:bg-[#0f172a]"
                        src={product.main_image || ""}
                        alt={product.name}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h1 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {product.name}
                          </h1>

                          <span className="text-xs text-gray-400 whitespace-nowrap mr-2">
                            {product.time_ago}
                          </span>
                        </div>

                        {/* Price Section */}
                        <div
                          className="flex items-center gap-2 mt-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-xs text-gray-400">تومان</span>

                          {isEditingPrice ? (
                            <input
                              type="text"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-28 px-2 py-0.5 text-sm font-bold bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500"
                              dir="ltr"
                              autoFocus
                            />
                          ) : (
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {product.price.toLocaleString()}
                            </p>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEditPrice(product);
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                          >
                            <Pencil className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* ==========================================
          BOTTOM SECTION
      ========================================== */}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <BarChart className="h-4 w-4" />

                        <span className="mt-2">{product.views}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Description Section */}

                      {isEditingDescription ? (
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="توضیحات..."
                          className="w-32 px-2 py-1 text-xs bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500"
                          autoFocus
                        />
                      ) : (
                        !product.description && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEditDescription(product);
                            }}
                            className="flex items-center gap-1 text-xs text-[#d73948] hover:text-red-600 transition"
                          >
                            <PlusIcon className="h-3.5 w-3.5" />

                            <span>توضیحات</span>
                          </button>
                        )
                      )}

                      {/* Product External Link */}

                      <Link
                        href={`/p/${product.product_id}/${product.slug}`}
                        target="_blank"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <SquareArrowOutUpLeft className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </Link>

                      {/* Switch */}

                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <Switch
                          dir="ltr"
                          checked={product.is_active}
                          onCheckedChange={() =>
                            handleToggleStatus(product.id, product.is_active)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* ========================================== */}
          {/* PAGINATION */}
          {/* ========================================== */}

          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.has_previous}
                className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
              >
                قبلی
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                صفحه {pagination.page} از {pagination.total_pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.has_next}
                className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
              >
                بعدی
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* FILTER BAR */}
      {/* ========================================== */}

      <div className="fixed bottom-[82px] z-40 w-full max-w-[700px] border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-[#1e293b]">
        <div className="flex h-[48px] items-center justify-start gap-5 px-4">
          <button
            type="button"
            onClick={() => setActiveModal("sort")}
            className="flex items-center gap-1 text-sm text-gray-800 dark:text-white"
          >
            <span>{sorting?.sort_label || "مرتب سازی"}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveModal("registration_status")}
            className="flex items-center gap-1 text-sm text-gray-800 dark:text-white"
          >
            <span>وضعیت ثبت گارانتی</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveModal("description")}
            className="flex items-center gap-1 text-sm text-gray-800 dark:text-white"
          >
            <span>وضعیت توضیحات</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* OVERLAY */}
      {/* ========================================== */}

      {activeModal !== null && (
        <div
          className="fixed inset-0 z-50 flex justify-center"
          onClick={closeModal}
        >
          <div className="h-full w-full max-w-[700px] bg-black/60" />
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL */}
      {/* ========================================== */}

      {activeModal !== null && (
        <div
          dir="rtl"
          className="fixed bottom-[82px] left-1/2 z-[60] w-full max-w-[700px] -translate-x-1/2 rounded-t-[18px] bg-white dark:bg-[#1e293b] px-4 pt-4 pb-5 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={closeModal}
              className="flex h-9 w-9 items-center justify-center"
              aria-label="بستن"
            >
              <X className="h-5 w-5 text-gray-900 dark:text-white" />
            </button>
            <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">
              {getModalTitle()}
            </h2>
          </div>

          <div className="space-y-2">
            {currentOptions.map((option) => {
              const selected = currentValue === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(activeModal, option.value)}
                  className="flex h-[52px] w-full items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] px-4 text-sm transition hover:bg-gray-50 dark:hover:bg-[#1e293b]"
                >
                  <span className="text-gray-900 dark:text-white">
                    {option.label}
                  </span>
                  {selected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* EDIT PRICE FOOTER */}
      {/* ========================================== */}

      {editingProductId !== null && (
        <div className="fixed bottom-[82px] z-[65] w-full max-w-[700px] bg-white dark:bg-[#1e293b] border-t border-gray-200 dark:border-gray-800 px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleSavePrice}
              disabled={updateProduct.isPending}
              className="flex-1 w-[80%] py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateProduct.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin inline ml-2" />
              ) : (
                <Save className="h-4 w-4 inline ml-2" />
              )}
              ثبت
            </button>
            <button
              onClick={handleCancelPrice}
              className="flex-1 w-[20%] py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition"
            >
              <X className="h-4 w-4 inline ml-2" />
              انصراف
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* EDIT DESCRIPTION FOOTER */}
      {/* ========================================== */}

      {editingDescriptionId !== null && (
        <div className="fixed bottom-[82px] z-[65] w-full max-w-[700px] bg-white dark:bg-[#1e293b] border-t border-gray-200 dark:border-gray-800 px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleSaveDescription}
              disabled={updateProduct.isPending}
              className="flex-1 w-[80%] py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateProduct.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin inline ml-2" />
              ) : (
                <Save className="h-4 w-4 inline ml-2" />
              )}
              ثبت
            </button>
            <button
              onClick={handleCancelDescription}
              className="flex-1 w-[20%] py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition"
            >
              <X className="h-4 w-4 inline ml-2" />
              انصراف
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* FOOTER */}
      {/* ========================================== */}

      <footer
        dir="rtl"
        className="fixed bottom-0 left-1/2 z-[70] h-[82px] w-full max-w-[700px] -translate-x-1/2 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-[#1e293b]"
      >
        <nav className="grid h-full grid-cols-5 px-4">
          {footerItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/panel"
                ? pathname === "/panel"
                : pathname.startsWith(item.href);

            if (item.main) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex h-full flex-col items-center justify-center gap-1"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Plus className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium text-blue-600">
                    {item.title}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-full flex-col items-center justify-center gap-1"
              >
                <div
                  className={`flex h-9 w-14 items-center justify-center rounded-full ${
                    isActive ? "bg-blue-50 dark:bg-blue-950/40" : ""
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  />
                </div>
                <span
                  className={`text-xs ${
                    isActive
                      ? "font-semibold text-blue-600"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </footer>
    </div>
  );
}
