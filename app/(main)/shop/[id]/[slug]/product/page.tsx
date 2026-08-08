export default function ShopProductsPage() {
  return (
    <div className="space-y-6 dark:text-white">
      <h2 className="text-xl font-bold">محصولات فروشگاه</h2>
      <div className="grid grid-cols-3 gap-4">
        {/* اینجا محصولات رو map بزن */}
        <div className="p-4 border rounded-lg dark:border-[#15202b]">محصول ۱</div>
        <div className="p-4 border rounded-lg dark:border-[#15202b]">محصول ۲</div>
        <div className="p-4 border rounded-lg dark:border-[#15202b]">محصول ۳</div>
      </div>
    </div>
  );
}