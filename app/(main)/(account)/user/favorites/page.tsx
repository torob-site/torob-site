'use client'
import ProductCard from "@/components/product-card";
import { Spinner } from "@/components/ui/spinner";
import { useGetUser, useGetUserAlerts, useGetUserFavorites } from "@/lib/apis"

export default function Favorites() {
  const { data, isPending, error } = useGetUserFavorites()
  const { data: user } = useGetUser();
  const { data: alertIds = [] } = useGetUserAlerts(true, { enabled: !!user?.phone, });
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
      <div className="w-full h-full flex flex-col items-center py-4 bg-[#ffffff] dark:bg-[#212b36]">
        <img className="w-96" src='https://assets.torob.com/public/main/images/empty_likes.PNG' />
        <p className="text-center text-sm mt-6 max-w-xs text-[#919eab]">محصولات محبوب خود را انتخاب کنید تا بعدا راحت‌تر پیدایشان کنید.</p>
      </div>
    );
  }
  const products = data.map((product: any) => ({
    ...product,
    is_favorite: true,
    is_alert: alertSet.has(product.id),
  }));
  return (
    <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 grid-cols-2 gap-6">
      {products.map((product: any) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}
