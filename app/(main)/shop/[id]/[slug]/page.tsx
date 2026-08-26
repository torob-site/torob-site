'use client'
import { useShop } from "./ShopContext";

export default function ShopInfoPage() {
  const shop = useShop()
  return (
    <div className="space-y-6 dark:text-white">
      <h2 className="text-xl font-bold">اطلاعات تکمیلی فروشگاه</h2>
      {shop.shop_name}
      <div className="space-y-4 text-sm text-[#64748b] dark:text-[#94a3b8]">
        <p>این بخش مربوط به توضیحات و اطلاعات تکمیلی فروشگاه است.</p>
        <p>شما می‌توانید در اینجا قوانین، شرایط ارسال، و سایر اطلاعات مربوط به فروشگاه را نمایش دهید.</p>
      </div>
    </div>
  );
}