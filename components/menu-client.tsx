"use client";

import Link from "next/link";
import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import type { ApiCategory } from "@/components/menu";

type MenuClientProps = {
  menus: ApiCategory[];
};

function CategoryCount({ count }: { count?: number }) {
  if (count === undefined || count === null) return null;
  return (
    <span
      className="
        shrink-0
        rounded-full
        bg-[#f1f5f9]
        px-2
        py-0.5
        text-[11px]
        font-medium
        text-[#64748b]
        dark:bg-[#334155]
        dark:text-[#94a3b8]
      "
    >
      {count.toLocaleString("fa-IR")}
    </span>
  );
}

export default function MenuClient({ menus }: MenuClientProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const handleLinkClick = () => {
    setOpenMenu(null);
  };

  return (
    <div className="flex items-center gap-10 bg-[#ffffff] dark:bg-[#212b36] px-10">
      <nav className="hidden items-center gap-2 xl:flex">
        {menus.map((menu) => {
          const hasChildren = !!menu.children?.length;

          return (
            <Popover
              key={menu.id}
              open={openMenu === menu.id}
              onOpenChange={(open) => {
                setOpenMenu(open ? menu.id : null);
              }}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="
                    group
                    flex
                    h-14
                    cursor-pointer
                    items-center
                    gap-1
                    rounded-md
                    px-2
                    text-[15px]
                    font-medium
                    text-[#64748b]
                    outline-none
                    transition-colors
                    duration-150
                    hover:text-black
                    dark:text-[#94a3b8]
                    dark:hover:text-white
                    dark:data-[state=open]:text-white
                    data-[state=open]:text-black
                  "
                >
                  <span>{menu.title}</span>
                </button>
              </PopoverTrigger>

              {hasChildren && (
                <PopoverContent
                  side="bottom"
                  align="center"
                  sideOffset={10}
                  collisionPadding={40}
                  dir="rtl"
                  className="
                    w-[calc(100vw-5rem)]
                    max-w-none
                    max-h-[75vh]
                    overflow-y-auto
                    [&::-webkit-scrollbar]:hidden
                    [-ms-overflow-style:none]
                    [scrollbar-width:none]
                    rounded-md
                    border
                    border-[#f1f5f9]
                    bg-white
                    p-4
                    shadow-xl
                    dark:border-slate-700
                    dark:bg-[#212b36]
                  "
                >
                  {/* دسته‌بندی اصلی */}

                  <Link
                    href={`/browse/${menu.id}/${menu.url}`}
                    onClick={handleLinkClick}
                    className="
                      mb-3
                      flex
                      items-center
                      justify-between
                      gap-2
                      text-sm
                      font-bold
                      text-[#1e293b]
                      dark:text-white
                    "
                  >
                    <span>{menu.title}</span>
                    <CategoryCount count={menu.product_count} />
                  </Link>

                  {/* زیر دسته‌ها */}

                  <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
                    {menu.children?.map((sub) => (
                      <div
                        key={sub.id}
                        className="mb-4 break-inside-avoid-column"
                      >
                        {/* زیر دسته */}

                        <Link
                          href={`/browse/${sub.id}/${sub.url}`}
                          onClick={handleLinkClick}
                          className="
                            mb-2
                            flex
                            items-center
                            justify-between
                            gap-2
                            text-xs
                            font-semibold
                            text-[#1e293b]
                            dark:text-white
                          "
                        >
                          <span>{sub.title}</span>
                          <CategoryCount count={sub.product_count} />
                        </Link>

                        {/* زیرمجموعه */}

                        <ul className="flex flex-col gap-1">
                          {sub.children?.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={`/browse/${sub.id}/${sub.url}/${child.id}/${child.url}`}
                                onClick={handleLinkClick}
                                className="
                                  flex
                                  items-center
                                  justify-between
                                  gap-2
                                  rounded-md
                                  px-1.5
                                  py-1
                                  text-[12px]
                                  text-[#64748b]
                                  hover:text-black
                                  dark:text-slate-400
                                  dark:hover:text-white
                                "
                              >
                                <span>{child.title}</span>
                                <CategoryCount count={child.product_count} />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              )}
            </Popover>
          );
        })}
      </nav>
    </div>
  );
}
