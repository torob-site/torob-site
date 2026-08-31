"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Store, ChevronRight } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

import { useGetPriceList } from "@/lib/apis";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Product = {
  id: number;
  name: string;
  slug: string;

  lowest_price: number | null;

  seller_count: number;

  seller_name: string | null;
};

type CategoryItem = {
  id: number;
  title: string;
  url: string;

  total_products: number;

  has_more: boolean;

  products: Product[];
};

type SiblingCategory = {
  id: number;
  title: string;
  url: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type PriceListResponse =
  | {
      type: "leaf";

      title: string;

      category: {
        id: number;
        title: string;
        url: string;
      };

      siblings: SiblingCategory[];

      products: Product[];

      pagination: Pagination;
    }
  | {
      type: "has_children";

      title: string;

      category: {
        id: number;
        title: string;
        url: string;
      };

      siblings: SiblingCategory[];

      categories: CategoryItem[];
    };

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatPrice(price: number | null) {
  if (price === null) {
    return "قیمت موجود نیست";
  }

  return `${price.toLocaleString("fa-IR")} تومان`;
}

/* -------------------------------------------------------------------------- */
/* Sidebar                                                                    */
/* -------------------------------------------------------------------------- */

function Sidebar({
  siblings,
  currentCategoryId,
}: {
  siblings: SiblingCategory[];
  currentCategoryId: number;
}) {
  if (siblings.length === 0) {
    return null;
  }

  return (
    <aside className="w-[250px] shrink-0">
      <div className="sticky top-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-4">
          <h2 className="text-sm font-bold text-slate-800">دسته‌های مشابه</h2>
        </div>

        <nav className="p-2">
          {siblings.map((category) => {
            const isCurrent = category.id === currentCategoryId;

            return (
              <Link
                key={category.id}
                href={`/price-list/${category.id}/${category.url}`}
                className={`
                  group flex items-center justify-between
                  rounded-lg px-3 py-3
                  text-sm transition-colors
                  ${
                    isCurrent
                      ? "bg-red-50 font-bold text-red-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }
                `}
              >
                <span>{category.title}</span>

                <ChevronLeft
                  className={`
                    h-4 w-4
                    ${isCurrent ? "text-red-500" : "text-slate-300"}
                  `}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* Product Row                                                                */
/* -------------------------------------------------------------------------- */

function ProductRow({ product }: { product: Product }) {
  return (
    <Link
      href={`/p/${product.id}/${product.slug}`}
      className="
        group
        grid
        grid-cols-[minmax(0,1fr)_190px_140px]
        items-center
        gap-4
        border-t
        border-slate-100
        px-5
        py-4
        transition-colors
        hover:bg-slate-50
      "
    >
      {/* Product */}
      <div className="min-w-0">
        <div
          className="
            line-clamp-2
            text-sm
            font-medium
            leading-7
            text-slate-700
            group-hover:text-red-600
          "
        >
          {product.name}
        </div>
      </div>

      {/* Price */}
      <div className="text-right">
        {product.lowest_price !== null ? (
          <>
            <div className="text-[15px] font-bold text-slate-900">
              {formatPrice(product.lowest_price)}
            </div>

            {product.seller_count > 1 && (
              <div className="mt-1 text-xs text-slate-400">شروع قیمت</div>
            )}
          </>
        ) : (
          <span className="text-sm text-slate-400">قیمت موجود نیست</span>
        )}
      </div>

      {/* Sellers */}
      <div className="flex min-w-0 items-center justify-end gap-1.5 text-xs text-slate-500">
        <Store className="h-4 w-4 shrink-0 text-slate-400" />

        {product.seller_count === 0 ? (
          <span>فروشنده‌ای ندارد</span>
        ) : product.seller_count === 1 ? (
          <span className="truncate">{product.seller_name}</span>
        ) : (
          <span>{product.seller_count.toLocaleString("fa-IR")} فروشگاه</span>
        )}
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Price Table                                                                */
/* -------------------------------------------------------------------------- */

function PriceTable({
  title,
  products,
  totalProducts,
  hasMore,
  categoryUrl,
  categoryId,
}: {
  title: string;
  products: Product[];
  totalProducts?: number;
  hasMore?: boolean;
  categoryUrl?: string;
  categoryId?: number;
}) {
  if (products.length === 0) {
    return (
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-800">
            لیست قیمت {title}
          </h2>
        </div>

        <div className="px-5 py-10 text-center text-sm text-slate-400">
          محصولی در این دسته وجود ندارد.
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Table Header */}
      <div className="flex items-center justify-between bg-slate-100 px-5 py-3.5">
        <h2 className="text-sm font-bold text-slate-800">لیست قیمت {title}</h2>

        {totalProducts !== undefined && (
          <span className="text-xs text-slate-400">
            {totalProducts.toLocaleString("fa-IR")} محصول
          </span>
        )}
      </div>

      {/* Products */}
      <div>
        {products.map((product) => (
          <ProductRow key={product.id} product={product} />
        ))}
      </div>

      {/* More */}
      {hasMore && categoryId !== undefined && categoryUrl && (
        <div className="border-t border-slate-100">
          <Link
            href={`/price-list/${categoryId}/${categoryUrl}`}
            className="
                flex
                items-center
                justify-center
                gap-1.5
                px-5
                py-3.5
                text-sm
                font-medium
                text-red-600
                transition-colors
                hover:bg-red-50
              "
          >
            مشاهده همه محصولات {title}
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Pagination                                                                 */
/* -------------------------------------------------------------------------- */

function Pagination({
  pagination,
  onPageChange,
}: {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}) {
  const { page, totalPages } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  const pages: number[] = [];

  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      {/* Previous */}
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-lg
          border
          border-slate-200
          bg-white
          text-slate-500
          transition-colors
          hover:bg-slate-50
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* First page */}
      {start > 1 && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            className="
              h-9
              min-w-9
              rounded-lg
              border
              border-slate-200
              bg-white
              px-2
              text-sm
              text-slate-600
              hover:bg-slate-50
            "
          >
            ۱
          </button>

          {start > 2 && <span className="px-1 text-slate-400">...</span>}
        </>
      )}

      {/* Pages */}
      {pages.map((item) => {
        const isActive = item === page;

        return (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={`
              h-9
              min-w-9
              rounded-lg
              px-2
              text-sm
              transition-colors
              ${
                isActive
                  ? "bg-red-500 font-bold text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }
            `}
          >
            {item.toLocaleString("fa-IR")}
          </button>
        );
      })}

      {/* Last page */}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-1 text-slate-400">...</span>
          )}

          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className="
              h-9
              min-w-9
              rounded-lg
              border
              border-slate-200
              bg-white
              px-2
              text-sm
              text-slate-600
              hover:bg-slate-50
            "
          >
            {totalPages.toLocaleString("fa-IR")}
          </button>
        </>
      )}

      {/* Next */}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-lg
          border
          border-slate-200
          bg-white
          text-slate-500
          transition-colors
          hover:bg-slate-50
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading                                                                    */
/* -------------------------------------------------------------------------- */

function LoadingState() {
  return (
    <main dir="rtl" className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-56 rounded bg-slate-200" />

          <div className="grid grid-cols-[250px_minmax(0,1fr)] gap-6">
            <div className="h-96 rounded-xl bg-white" />

            <div className="h-[500px] rounded-xl bg-white" />
          </div>
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function PriceListPage() {
  const params = useParams();

  const categoryId = Number(params.id);

  /* ---------------------------------------------------------------------- */
  /* Pagination from URL                                                    */
  /* ---------------------------------------------------------------------- */

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  /* ---------------------------------------------------------------------- */
  /* API                                                                     */
  /* ---------------------------------------------------------------------- */

  const { data, isLoading, error } = useGetPriceList(categoryId, page, 50);

  const response = data as PriceListResponse | undefined;

  /* ---------------------------------------------------------------------- */
  /* Reset page when category changes                                       */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    setPage(1);
  }, [categoryId, setPage]);

  /* ---------------------------------------------------------------------- */
  /* Loading                                                                 */
  /* ---------------------------------------------------------------------- */

  if (isLoading) {
    return <LoadingState />;
  }

  /* ---------------------------------------------------------------------- */
  /* Error                                                                   */
  /* ---------------------------------------------------------------------- */

  if (error || !response) {
    return (
      <main dir="rtl" className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="rounded-xl border border-red-100 bg-white p-8 text-center">
            <p className="text-sm text-red-500">خطا در بارگذاری لیست قیمت</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        {/* ---------------------------------------------------------------- */}
        {/* Page Header                                                       */}
        {/* ---------------------------------------------------------------- */}

        {/* ---------------------------------------------------------------- */}
        {/* Layout                                                            */}
        {/* ---------------------------------------------------------------- */}

        <div className="flex items-start gap-6">
          {/* Sidebar */}

          <Sidebar
            siblings={response.siblings}
            currentCategoryId={categoryId}
          />

          {/* Main Content */}

          <div className="min-w-0 flex-1">
            {/* ============================================================ */}
            {/* LEAF                                                         */}
            {/* ============================================================ */}

            {response.type === "leaf" && (
              <>
                <PriceTable
                  title={response.category.title}
                  products={response.products}
                  totalProducts={response.pagination.total}
                />

                {/* Pagination */}

                <Pagination
                  pagination={response.pagination}
                  onPageChange={(newPage) => {
                    setPage(newPage);
                  }}
                />
              </>
            )}

            {/* ============================================================ */}
            {/* HAS CHILDREN                                                 */}
            {/* ============================================================ */}

            {response.type === "has_children" && (
              <div className="space-y-6">
                {response.categories.map((category) => (
                  <PriceTable
                    key={category.id}
                    title={category.title}
                    products={category.products}
                    totalProducts={category.total_products}
                    hasMore={category.has_more}
                    categoryId={category.id}
                    categoryUrl={category.url}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
