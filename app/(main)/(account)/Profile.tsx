"use client";
import CitySelector from "@/components/city";
import Theme from "@/components/theme";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useGetUser } from "@/lib/apis";
import { ChevronDown, MapPin } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Profile() {
  const { data: user, isPending: userLoading } = useGetUser();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <div className="dark:bg-[#212b36] border-t border-b border-[#f1f5f9] dark:border-[#15202b] space-y-6 px-6 bg-[#ffffff] dark:text-white text-black dark:fill-white fill-black w-64 py-4">
      <Link
        href="/user/alerts"
        className={`flex items-center gap-3 text-sm ${pathname === "/user/alerts" ? "text-[#d73948] fill-[#d73948]" : ""
          }`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <path d="M14.6 21.5C14 22.5 13 23 12 23c-.5 0-1-.1-1.5-.4-.5-.3-.8-.6-1.1-1.1-.3-.5-.1-1.1.4-1.4.5-.3 1.1-.1 1.4.4.1.1.2.3.4.4.5.3 1.1.1 1.4-.4.3-.5.9-.6 1.4-.4.5.2.5.9.2 1.4zM23 17c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1s.4-1 1-1c1.1 0 2-.9 2-2V9c0-4.4 3.6-8 8-8s8 3.6 8 8v5c0 1.1.9 2 2 2 .6 0 1 .4 1 1zm-4.5-1c-.3-.6-.5-1.3-.5-2V9c0-3.3-2.7-6-6-6S6 5.7 6 9v5c0 .7-.2 1.4-.5 2h13z"></path>
          </g>
        </svg>
        <p>تغییرات قیمت</p>
      </Link>
      <Link
        href="/user/favorites"
        className={`flex items-center gap-3 text-sm ${pathname === "/user/favorites" ? "text-[#d73948] fill-[#d73948]" : ""
          }`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <path d="M21.233 3.881C20.077 2.693 18.535 2 16.898 2a6.268 6.268 0 0 0-4.433 1.881l-.385.396-.385-.396a6.104 6.104 0 0 0-8.768 0C1.674 5.07 1 6.752 1 8.436c0 1.683.674 3.366 1.83 4.554l8.48 8.713c.192.198.385.297.674.297.289 0 .481-.099.674-.297l8.479-8.713c1.156-1.188 1.83-2.871 1.83-4.554.193-1.684-.481-3.367-1.734-4.555zm-1.349 7.723l-7.804 8.02-7.804-8.02c-.867-.891-1.253-1.98-1.253-3.168 0-1.188.482-2.278 1.253-3.169.77-.89 1.927-1.287 2.987-1.287 1.156 0 2.216.396 3.083 1.287l1.06 1.09a.914.914 0 0 0 1.349 0l.963-1.09c.867-.792 1.927-1.287 3.18-1.287 1.156 0 2.216.495 3.083 1.287.77.891 1.252 1.98 1.252 3.169 0 1.188-.482 2.277-1.349 3.168z"></path>
          </g>
        </svg>
        <p>محبوب‌ها</p>
      </Link>
      <Link
        href="/user/history"
        className={`flex items-center gap-3 text-sm ${pathname === "/user/history" ? "text-[#d73948] fill-[#d73948]" : ""
          }`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <path d="M12 1C5.9 1 1 5.9 1 12s4.9 11 11 11 11-4.9 11-11S18.1 1 12 1zm0 20c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9zm3.7-6.7c.4.4.4 1 0 1.4-.2.2-.4.3-.7.3-.3 0-.5-.1-.7-.3l-3-3c-.2-.2-.3-.4-.3-.7V6c0-.6.4-1 1-1s1 .4 1 1v5.6l2.7 2.7z"></path>
          </g>
        </svg>
        <p>مشاهدات اخیر</p>
      </Link>
      <Link
        href="/user/reports"
        className={`flex items-center gap-3 text-sm ${pathname === "/user/reports" ? "text-[#d73948] fill-[#d73948]" : ""
          }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 13.5 16.5"
        >
          <g>
            <path d="M0 .5h13.5l-2.7 5.25L13.5 11h-12v6H0V.5ZM11.04 2H1.5v7.5h9.541L9.113 5.75 11.04 2Z"></path>
          </g>
        </svg>
        <p>گزارش‌های من</p>
      </Link>

      <CitySelector
        className="
    flex
    w-full
    items-center
    gap-3
    text-sm
    text-[#1e293b]
    dark:text-white
  "
      >
        <MapPin
          size={22}
          strokeWidth={2}
          className="shrink-0"
        />

        <span>
          شهر من :{" "}
          {userLoading
            ? "در حال بارگذاری..."
            : user?.city?.name ?? "انتخاب شهر"}
        </span>
      </CitySelector>
      <Theme title="ظاهر برنامه" />
      <div className="border-b border-[#f1f5f9] dark:border-[#15202b]"></div>

      <div className="text-sm text-[#1e293b] dark:text-[#f1f5f9]">
        <Link href="/shop-list">
          <p className={`${pathname === "/shop-list" ? "text-[#d73948]" : ""}`}>
            لیست فروشگاه‌های ترب
          </p>
        </Link>
        <Link href="/sell">
          <p className="mt-4">ثبت نام فروشگاه‌</p>
        </Link>
      </div>
      <div className="border-b border-[#f1f5f9] dark:border-[#15202b]"></div>
      <Link
        href="/user/purchases"
        className={`flex items-center gap-3 text-sm ${pathname === "/user/purchases" ? "text-[#d73948] fill-[#d73948]" : ""
          }`}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <g fill="currentColor">
              <path
                d="M15.75,12 L17.25,12 L17.25,13.5 L15.75,13.5 Z M6.75,12 L12.75,12 L12.75,13.5 L6.75,13.5 Z M15.75,9 L17.25,9 L17.25,10.5 L15.75,10.5 Z M6.75,9 L12.75,9 L12.75,10.5 L6.75,10.5 Z M6.75,6 L17.25,6 L17.25,7.5 L6.75,7.5 Z M18.75,1.5 L5.25,1.5 C4.42191561,1.50082684 3.75082684,2.17191561 3.75,3 L3.75,21.75 C3.75,22.1642136 4.08578644,22.5 4.5,22.5 L5.25,22.5 C5.48610423,22.5 5.70846041,22.3889756 5.85,22.2 L7.5,20.00025 L9.15,22.2 C9.29748976,22.3795508 9.51763882,22.4836125 9.75,22.4836125 C9.98236118,22.4836125 10.2025102,22.3795508 10.35,22.2 L12,20.00025 L13.65,22.2 C13.7974898,22.3795508 14.0176388,22.4836125 14.25,22.4836125 C14.4823612,22.4836125 14.7025102,22.3795508 14.85,22.2 L16.5,20.00025 L18.15,22.2 C18.2915863,22.3889196 18.5139125,22.5 18.75,22.5 L19.5,22.5 C19.9142136,22.5 20.25,22.1642136 20.25,21.75 L20.25,3 C20.2490494,2.17196695 19.5780331,1.5009506 18.75,1.5 Z M18.75,20.49975 L17.1,18.3 C16.9525102,18.1204492 16.7323612,18.0163875 16.5,18.0163875 C16.2676388,18.0163875 16.0474898,18.1204492 15.9,18.3 L14.25,20.49975 L12.6,18.3 C12.4525102,18.1204492 12.2323612,18.0163875 12,18.0163875 C11.7676388,18.0163875 11.5474898,18.1204492 11.4,18.3 L9.75,20.49975 L8.1,18.3 C7.95251024,18.1204492 7.73236118,18.0163875 7.5,18.0163875 C7.26763882,18.0163875 7.04748976,18.1204492 6.9,18.3 L5.25,20.49975 L5.25,3 L18.75,3 L18.75,20.49975 Z"
                id="Fill"
              ></path>
            </g>
          </g>
        </svg>
        <p>خریدهای من</p>
      </Link>
      <Link
        href="/user/tickets"
        className={`flex items-center gap-3 text-sm ${pathname === "/user/tickets" ? "text-[#d73948] fill-[#d73948]" : ""
          }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
        >
          <defs>
            <path
              id="_r_3_-path"
              d="M19 2H5C3.3 2 2 3.3 2 5v16c0 .4.2.8.6.9.1.1.3.1.4.1.3 0 .5-.1.7-.3L7.4 18H19c1.7 0 3-1.3 3-3V5c0-1.7-1.3-3-3-3zm1 13c0 .6-.4 1-1 1H7c-.3 0-.5.1-.7.3L4 18.6V5c0-.6.4-1 1-1h14c.6 0 1 .4 1 1v10z"
            ></path>
          </defs>
          <g fill="none" fillRule="evenodd">
            <mask id="_r_3_-mask" fill="#fff">
              <use href="#_r_3_-path"></use>
            </mask>
            <use
              fill="currentColor"
              fillRule="nonzero"
              href="#_r_3_-path"
            ></use>
            <g fill="currentColor" mask="url(#_r_3_-mask)">
              <path d="M0 0H24V24H0z"></path>
            </g>
          </g>
        </svg>
        <p>تیکت‌های من</p>
      </Link>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 text-sm">
            <span>راهنمایی و شرایط</span>

            <ChevronDown
              size={18}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-5 space-y-5 flex flex-col pr-4 text-sm dark:text-white text-black">
          <Link
            href="/pages/safe-shopping-guide"
            className={
              pathname === "/pages/safe-shopping-guide" ? "text-[#d73948]" : ""
            }
          >
            راهنمای خرید امن
          </Link>

          <Link
            href="/pages/terms"
            className={pathname === "/pages/terms" ? "text-[#d73948]" : ""}
          >
            قوانین و مقررات
          </Link>

          <Link
            href="/pages/privacy"
            className={pathname === "/pages/privacy" ? "text-[#d73948]" : ""}
          >
            حریم خصوصی
          </Link>
        </CollapsibleContent>
      </Collapsible>

      <Link href="/pages/support">
        <p className={pathname === "/pages/support" ? "text-[#d73948]" : ""}>
          پشتیبانی
        </p>
      </Link>

      <Link href="/pages/about-us">
        <p
          className={`py-6
            ${pathname === "/pages/about-us" ? "text-[#d73948]" : ""}
          `}
        >
          درباره ترب
        </p>
      </Link>

      <div className="border-b border-[#f1f5f9] dark:border-[#15202b]"></div>
      <div className="space-y-3 text-sm">
        <p className="dark:text-white text-black">خروج از حساب</p>
        <span className="text-[#94a3b8]">09945870013</span>
      </div>
    </div>
  );
}
