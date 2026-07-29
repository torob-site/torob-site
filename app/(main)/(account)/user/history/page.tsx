"use client";

import ProductCard from "@/components/product-card";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteUserHistories, useGetUser, useGetUserAlerts, useGetUserFavorites, useGetUserHistories } from "@/lib/apis";

export default function History() {
  const { data, isPending, error } = useGetUserHistories()
  const { data: user } = useGetUser();
  const { data: favoriteIds = [] } = useGetUserFavorites(true, { enabled: !!user?.phone, });
  const { data: alertIds = [] } = useGetUserAlerts(true, { enabled: !!user?.phone, });
  const { mutate: deleteHistories, isPending: isDeleting } = useDeleteUserHistories();
  const favoriteSet = new Set(favoriteIds);
  const alertSet = new Set(alertIds);
  
  if (isPending) {
    return (
      <div className="flex items-center w-full justify-center py-20">
        <Spinner className="size-8 text-blue-500" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col w-full items-center justify-center">
        <img
          src="https://assets.torob.com/public/main/images/empty_history-min.png"
          className="h-72"
        />

        <p className="mt-5 text-sm dark:text-white text-black">
          آخرین محصولاتی که دیده‌اید را می‌توانید اینجا پیدا کنید.
        </p>
      </div>
    );
  }

  const products = data.map((product: any) => ({
    ...product,
    is_favorite: favoriteSet.has(product.id),
    is_alert: alertSet.has(product.id),
  }));

  return <div className="flex flex-col items-center w-full px-10 py-10">
    <div className="flex w-full items-center justify-between">
      <h1 className="text-2xl font-bold text-[#1e293b] dark:text-white">
        مشاهدات اخیر
      </h1>

      <p   onClick={() => deleteHistories({})}
 className="cursor-pointer text-sm font-bold text-[#d70040]">
        حذف مشاهدات اخیر
      </p>
    </div>

    <div className="grid mt-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 grid-cols-2 gap-6">
      {products.map((product: any) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  </div>

}
