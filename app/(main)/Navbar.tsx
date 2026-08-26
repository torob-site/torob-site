// ─── Navbar.tsx ───
"use client";

import Menu from "@/components/menu";
import Theme from "@/components/theme";
import User from "@/components/user";
import SearchBox from "@/components/SearchBox";

import { Camera, Search, History } from "lucide-react";

import Link from "next/link";

export default function Navbar() {

  return (
    <div className="w-full flex items-center dark:bg-[#212b36] h-auto px-12 py-4 bg-[#ffffff]">
      <div className="flex flex-col w-full">
        <div className="flex items-center w-full justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div>
                <img
                  className="hidden dark:flex w-12"
                  src="/icons/logo-dark.svg"
                />
                <img
                  className="flex dark:hidden w-12"
                  src="/icons/logo-light.svg"
                />
              </div>
              <h1 className="text-2xl mr-3 font-black tracking-tight dark:text-white text-[#e91e33]">
                ترب
              </h1>
            </Link>

            <div className="flex items-center mr-12">
              <SearchBox>
                {({
                  query,
                  setQuery,
                  isDirty,
                  setIsDirty,
                  open,
                  setOpen,
                  suggestions,
                  isPending,
                  fileInputRef,
                  handleFileChange,
                  handleSearch,
                  selectSuggestion,
                  handleKeyDown,
                  selectedIndex,
                  resetSelectedIndex,
                  wrapperRef,
                }) => (
                  <div className="flex items-center">
                    <div ref={wrapperRef} className="relative w-96">
                      <input
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          setIsDirty(true);        // ← از اینجا فعال می‌شه
                          setOpen(true);
                          resetSelectedIndex();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="نام کالا یا فروشگاه را وارد کنید"
                        className="h-12 w-full rounded-r-sm border border-l-0 border-gray-400 bg-white pr-3 pl-12 text-right outline-none dark:bg-[#0f172b] dark:text-white"
                      />

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        <Camera size={22} />
                      </button>

                      {/* فقط وقتی isDirty باشه dropdown نشون داده می‌شه */}
                      {open && query && isDirty && (
                        <div className="absolute top-14 right-0 z-50 w-full overflow-hidden rounded-md border bg-white shadow-lg dark:border-slate-700 dark:bg-[#212b36]">
                          {isPending ? (
                            <div className="p-4 text-center text-sm text-slate-400">
                              در حال جستجو...
                            </div>
                          ) : suggestions.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-400">
                              نتیجه‌ای پیدا نشد
                            </div>
                          ) : (
                            suggestions.map((item, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => selectSuggestion(item.text)}
                                className={`flex w-full items-center gap-3 px-4 py-3 text-right ${selectedIndex === index
                                    ? "bg-slate-100 dark:bg-slate-800"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                                  }`}
                              >
                                {item.type === "shop" ? (
                                  <img
                                    src={item.logo}
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                ) : item.is_history ? (
                                  <History size={18} className="text-slate-400" />
                                ) : (
                                  <Search size={18} className="text-slate-400" />
                                )}

                                <span className="dark:text-white text-sm">
                                  {item.text}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center -ml-1">
                      <button
                        type="button"
                        onClick={() => {
                          handleSearch();
                          setOpen(false);
                        }}
                        className="text-white bg-[#d73948] px-4 rounded-l-sm h-12"
                      >
                        <Search size={25} />
                      </button>
                    </div>
                  </div>
                )}
              </SearchBox>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Theme />
            <User />
          </div>
        </div>

        <Menu />
      </div>
    </div>
  );
}