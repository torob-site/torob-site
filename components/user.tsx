"use client";

import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { useGetUser } from "@/lib/apis";
import AuthModal from "./auth-modal";
import { useState } from "react";
import CitySelector from "./city";

export default function User() {
  const [openAuth, setOpenAuth] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);

  const {
    data,
    isPending,
    error,
  } = useGetUser();

  const handleLinkClick = () => {
    setOpenUserMenu(false);
  };

  if (data?.phone) {
    return (
      <Popover
        open={openUserMenu}
        onOpenChange={setOpenUserMenu}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className="
              rounded-lg
              border
              border-[#1e293b]
              px-3
              py-1.5
              text-xs
              text-[#1e293b]
              dark:border-[#f1f5f9]
              dark:text-[#f1f5f9]
            "
          >
            {data.phone}
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          align="end"
          sideOffset={6}
          className="
            w-44
            border
            border-[#f1f5f9]
            bg-white
            p-2
            text-right
            dark:border-[#15202b]
            dark:bg-[#212b36]
          "
        >
          <div className="flex flex-col">
            {/* تغییرات قیمت */}
            <Link
              href="/user/alerts"
              onClick={handleLinkClick}
              className="
                rounded-md
                px-3
                py-2
                text-right
                text-sm
                text-[#1e293b]
                transition
                hover:bg-slate-700
                hover:text-white
                dark:text-slate-300
              "
            >
              تغییرات قیمت
            </Link>

            {/* محبوب‌ها */}
            <Link
              href="/user/favorites"
              onClick={handleLinkClick}
              className="
                rounded-md
                px-3
                py-2
                text-right
                text-sm
                text-[#1e293b]
                transition
                hover:bg-slate-700
                hover:text-white
                dark:text-slate-300
              "
            >
              محبوب‌ها
            </Link>

            {/* مشاهده‌های اخیر */}
            <Link
              href="/user/history"
              onClick={handleLinkClick}
              className="
                rounded-md
                px-3
                py-2
                text-right
                text-sm
                text-[#1e293b]
                transition
                hover:bg-slate-700
                hover:text-white
                dark:text-slate-300
              "
            >
              مشاهده‌های اخیر
            </Link>

            {/* گزارش‌های من */}
            <Link
              href="/user/reports"
              onClick={handleLinkClick}
              className="
                rounded-md
                px-3
                py-2
                text-right
                text-sm
                text-[#1e293b]
                transition
                hover:bg-slate-700
                hover:text-white
                dark:text-slate-300
              "
            >
              گزارش‌های من
            </Link>

            {/* پیگیری‌های من */}
            <Link
              href="/user/tickets"
              onClick={handleLinkClick}
              className="
                rounded-md
                px-3
                py-2
                text-right
                text-sm
                text-[#1e293b]
                transition
                hover:bg-slate-700
                hover:text-white
                dark:text-slate-300
              "
            >
              پیگیری‌های من
            </Link>

            <CitySelector
              className="
    w-full
    rounded-md
    px-3
    py-2
    text-right
    text-sm
    text-[#1e293b]
    transition
    hover:bg-slate-700
    hover:text-white
    dark:text-slate-300
  "
            >
              شهر من
            </CitySelector>
            <div className="my-2 h-px bg-slate-700" />

            {/* خروج */}
            <button
              type="button"
              onClick={() => {
                setOpenUserMenu(false);
              }}
              className="
                rounded-md
                px-3
                py-2
                text-right
                text-sm
                text-red-400
                hover:bg-red-500/10
              "
            >
              خروج
            </button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenAuth(true)}
        className="
          rounded-lg
          border
          border-[#1e293b]
          px-3
          py-1.5
          text-xs
          text-[#1e293b]
          dark:border-[#f1f5f9]
          dark:text-[#f1f5f9]
        "
      >
        ورود / ثبت نام
      </button>

      <AuthModal
        open={openAuth}
        onOpenChange={setOpenAuth}
      />
    </>
  );
}