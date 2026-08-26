"use client";
import ProductCard from "@/components/product-card";
import { Spinner } from "@/components/ui/spinner";
import { useGetUser, useGetUserAlerts, useGetUserFavorites } from "@/lib/apis";

export default function Favorites() {
  const { data: favorites = [], isPending, error } = useGetUserFavorites();
  const { data: user } = useGetUser();
  const { data: alertIds = [] } = useGetUserAlerts(true, {
    enabled: !!user?.phone && favorites.length > 0,
  });
  const alertSet = new Set(alertIds);
  if (isPending) {
    return (
      <div className="flex items-center w-full justify-center py-20">
        <Spinner className="size-8 text-blue-500" />
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center py-4 bg-[#ffffff] dark:bg-[#212b36]">
        <img
          className="w-96"
          src="https://assets.torob.com/public/main/images/empty_likes.PNG"
        />
        <p className="text-center text-sm mt-6 max-w-xs text-[#919eab]">
          محصولات محبوب خود را انتخاب کنید تا بعدا راحت‌تر پیدایشان کنید.
        </p>
      </div>
    );
  }
  const products = favorites.map((product: any) => ({
    ...product,
    is_favorite: true,
    is_alert: alertSet.has(product.id),
  }));
  return (
    <>
      <div className="px-8 mt-8">
        <h1 className="font-bold text-2xl text-[#1e293b]">محبوب‌ها</h1>
        <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 grid-cols-2 gap-6 mt-5">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </>
  );
}
