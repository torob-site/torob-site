"use client";

import Link from "next/link";

const links = [
  {
    name: "راهنمای خرید امن",
    link: "/pages/safe-shopping-guide/",
  },
  {
    name: "پیگیری سفارش",
    link: "/user/tickets",
  },
  {
    name: "پشتیبانی",
    link: "/pages/support",
  },
  {
    name: "درباره ترب",
    link: "/pages/about-us",
  },
  {
    name: "پیشنهاد ویژه",
    link: "/special-offers",
  },
  {
    name: "نصب اپلیکیشن",
    link: "/install",
  },
  {
    name: "ترب‌پی",
    link: "/",
  },
  {
    name: "لیست فروشگاه‌ها",
    link: "/shop-list",
  },
  {
    name: "ثبت نام فروشگاه",
    link: "/sell/register",
  },
  {
    name: "پنل فروشگاه‌ها",
    link: "/sell/login",
  },
  {
    name: "فرصت‌های شغلی",
    link: "/",
  },
  {
    name: "بلاگ ترب",
    link: "/",
  },
];

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 h-10 dark:bg-[#212b36] bg-[#ffffff]">
      <div className="flex h-full items-center justify-center gap-8 px-6">
        {links.map((item) => (
          <Link
            key={item.name}
            href={item.link}
            className="text-sm dark:text-[#94a3b8] text-[#64748b] hover:text-black dark:hover:text-white transition"
          >
            {item.name}
          </Link>
        ))}
      </div>
    </footer>
  );
}
