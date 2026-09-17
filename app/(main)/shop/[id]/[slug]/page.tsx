'use client'
import { useShop } from "./ShopContext";

export default function ShopInfoPage() {
  const shop = useShop()
  return (
    <div className="flex items-center h-screen justify-center w-full">
      <p>در حال پیاده سازی</p>
    </div>
  );
}