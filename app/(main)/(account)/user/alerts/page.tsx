'use client'
import ProductCard from "@/components/product-card";
import { Spinner } from "@/components/ui/spinner";
import { useGetUser, useGetUserAlerts, useGetUserFavorites } from "@/lib/apis";

export default function Analytics() {
  const { data, isPending, error } = useGetUserAlerts()
  const { data: user } = useGetUser();
  const { data: favoriteIds = [] } = useGetUserFavorites(true, { enabled: !!user?.phone, });
  const favoriteSet = new Set(favoriteIds);
  if (isPending) {
    return (
      <div className="flex items-center w-full justify-center py-20">
        <Spinner className="size-8 text-blue-500" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full px-10 mt-20">
        <div className="w-full flex flex-col items-center py-4 justify-center bg-[#ffffff] dark:bg-[#212b36]">
          <img className="w-96" src='https://assets.torob.com/public/main/images/empty_watched.PNG' />
          <p className="text-center text-xs mt-6 max-w-sm text-[#919eab]">اعلان قیمت را برای محصولات دلخواه خود فعال کنید تا از موجودی و تغییرات قیمت‌شان مطلع شوید.</p>
        </div>
      </div>
    );
  }
  const products = data.map((product: any) => ({
    ...product,
    is_favorite: favoriteSet.has(product.id),
    is_alert: true,
  }));

  return <div className="flex flex-col items-center justify-center w-full px-10">
    {products.map((product: any) => (
      <ProductCard
        key={product.id}
        product={product}
      />
    ))}
    <div className="w-full bg-white/40">asd</div>
  </div>
}
