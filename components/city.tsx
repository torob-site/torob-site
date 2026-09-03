"use client";

import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
  getProvinceCities,
  useGetPopularCities,
  useGetProvinces,
  useGetUser,
  useSelectCity,
} from "@/lib/apis";

interface CitySelectorProps {
  children: ReactNode;
  className?: string;
}

type TempCity = {
  id: number | null;
  name: string;
};

type Province = {
  id: number;
  name: string;
};

type City = {
  id: number;
  name: string;
};

type PopularCity = {
  id: number;
  name: string;
};

export default function CitySelector({
  children,
  className,
}: CitySelectorProps) {
  const queryClient = useQueryClient();

  const [cityDialog, setCityDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedProvince, setExpandedProvince] =
    useState<number | null>(null);

  const [tempCity, setTempCity] = useState<TempCity>({
    id: null,
    name: "",
  });

  // =========================
  // User
  // =========================

  const { data: user } = useGetUser();

  // =========================
  // Provinces
  // =========================

  const {
    data: provinces = [],
    isLoading: provincesLoading,
    isError: provincesError,
  } = useGetProvinces() as {
    data: Province[] | undefined;
    isLoading: boolean;
    isError: boolean;
  };

  // =========================
  // Cities
  // =========================

  const {
    data: cities = [],
    isLoading: citiesLoading,
    isError: citiesError,
  } = getProvinceCities(expandedProvince ?? undefined) as {
    data: City[] | undefined;
    isLoading: boolean;
    isError: boolean;
  };

  // =========================
  // Popular cities
  // =========================

  const {
    data: popularCities = [],
    isLoading: popularLoading,
    isError: popularError,
  } = useGetPopularCities() as {
    data: PopularCity[] | undefined;
    isLoading: boolean;
    isError: boolean;
  };

  // =========================
  // Mutation
  // =========================

  const {
    mutate: selectCity,
    isPending: saving,
  } = useSelectCity();

  // =========================
  // Current city
  // =========================

  const currentCity = user?.city;

  // =========================
  // Search provinces
  // =========================

const filteredProvinces = search.trim()
  ? provinces.filter((province) => province.name.includes(search.trim()))
  : [];

  // =========================
  // Open dialog
  // =========================

  const openDialog = () => {
    setTempCity({
      id: currentCity?.id ?? null,
      name: currentCity?.name ?? "",
    });

    setExpandedProvince(null);
    setSearch("");
    setCityDialog(true);
  };

  // =========================
  // Close dialog
  // =========================

  const closeDialog = () => {
    if (saving) {
      return;
    }

    setCityDialog(false);
  };

  // =========================
  // Confirm city
  // =========================

  const confirmCity = () => {
    if (!tempCity.id || saving) {
      return;
    }

    selectCity(tempCity.id, {
      onSuccess: async () => {
        setCityDialog(false);

        await queryClient.invalidateQueries({
          queryKey: ["user"],
        });
      },
    });
  };

  // =========================
  // Toggle province
  // =========================

  const toggleProvince = (provinceId: number) => {
    setExpandedProvince((prev) =>
      prev === provinceId ? null : provinceId,
    );
  };

  return (
    <>
      {/* ========================= */}
      {/* Trigger */}
      {/* ========================= */}

      <button
        type="button"
        onClick={openDialog}
        className={className}
      >
        {children}
      </button>

      {/* ========================= */}
      {/* Dialog */}
      {/* ========================= */}

      <Dialog
        open={cityDialog}
        onOpenChange={(open) => {
          if (!saving) {
            setCityDialog(open);
          }
        }}
      >
        <DialogContent
          dir="rtl"
          className="
            max-w-md
            border-0
            bg-white/95
            p-0
            shadow-2xl
            backdrop-blur-sm
            dark:bg-slate-900/95
            [&>button]:hidden
            sm:rounded-2xl
          "
        >
          <style>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }

            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>

          {/* ========================= */}
          {/* Header */}
          {/* ========================= */}

          <DialogHeader
            className="
              !flex-row
              items-center
              justify-between
              border-b
              border-slate-100
              px-6
              py-5
              dark:border-slate-800
            "
          >
            <DialogTitle
              className="
                text-right
                text-lg
                font-bold
                text-slate-800
                dark:text-slate-100
              "
            >
              انتخاب شهر
            </DialogTitle>

            <button
              type="button"
              onClick={closeDialog}
              disabled={saving}
              aria-label="بستن"
              className="
                rounded-full
                p-1.5
                text-slate-400
                transition-colors
                hover:bg-slate-100
                hover:text-slate-600
                disabled:cursor-not-allowed
                disabled:opacity-50
                dark:hover:bg-slate-800
                dark:hover:text-slate-300
              "
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </DialogHeader>

          {/* ========================= */}
          {/* Search */}
          {/* ========================= */}

          <div className="px-6 pt-5">
            <div className="relative">
              <svg
                className="
                  absolute
                  right-3.5
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="جستجوی شهر یا استان..."
                disabled={saving}
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  pr-11
                  pl-4
                  text-right
                  text-sm
                  text-slate-700
                  outline-none
                  transition-all
                  placeholder:text-slate-400
                  focus:border-blue-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-blue-50
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:text-slate-200
                  dark:placeholder:text-slate-500
                  dark:focus:border-blue-500
                  dark:focus:bg-slate-800
                  dark:focus:ring-blue-900/30
                "
              />
            </div>
          </div>

          {/* ========================= */}
          {/* Main content */}
          {/* ========================= */}

          <div className="no-scrollbar max-h-80 overflow-y-auto px-6 py-4">
            {provincesLoading ? (
              <div className="flex justify-center py-10">
                <div
                  className="
                    h-6
                    w-6
                    animate-spin
                    rounded-full
                    border-2
                    border-slate-300
                    border-t-blue-500
                  "
                />
              </div>
            ) : provincesError ? (
              <div className="py-10 text-center text-sm text-red-500">
                خطا در دریافت استان‌ها
              </div>
            ) : search.trim() ? (
              /* ========================= */
              /* Search results */
              /* ========================= */

              filteredProvinces.length > 0 ? (
                <div className="space-y-1.5">
                  {filteredProvinces.map((province) => (
                    <button
                      key={province.id}
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        setSearch("");
                        setExpandedProvince(province.id);
                      }}
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        border
                        border-transparent
                        p-3.5
                        text-right
                        text-slate-600
                        transition-all
                        hover:bg-slate-50
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        dark:text-slate-300
                        dark:hover:bg-slate-800/60
                      "
                    >
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-lg
                          bg-slate-100
                          text-slate-500
                          dark:bg-slate-800
                          dark:text-slate-400
                        "
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>

                      <span className="text-sm font-medium">
                        {province.name}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div
                  className="
                    flex
                    flex-col
                    items-center
                    gap-3
                    py-12
                    text-slate-400
                  "
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>

                  <p className="text-sm">
                    نتیجه‌ای یافت نشد
                  </p>
                </div>
              )
            ) : (
              /* ========================= */
              /* Default content */
              /* ========================= */

              <div className="space-y-5">
                {/* شهرهای پربازدید */}

                {popularCities.length > 0 &&
                  !popularLoading &&
                  !popularError && (
                    <div>
                      <h3
                        className="
                          mb-2
                          text-right
                          text-xs
                          font-semibold
                          text-slate-400
                          dark:text-slate-500
                        "
                      >
                        شهرهای پربازدید
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {popularCities.map((city) => {
                          const isSelected =
                            tempCity.id === city.id;

                          return (
                            <button
                              key={city.id}
                              type="button"
                              disabled={saving}
                              onClick={() =>
                                setTempCity({
                                  id: city.id,
                                  name: city.name,
                                })
                              }
                              className={`
                                rounded-lg
                                border
                                px-3
                                py-1.5
                                text-sm
                                transition-all
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                                ${
                                  isSelected
                                    ? "border-blue-500 bg-blue-50 font-medium text-blue-700 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-300"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
                                }
                              `}
                            >
                              {city.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* استان‌ها */}

                <div>
                  <h3
                    className="
                      mb-2
                      text-right
                      text-xs
                      font-semibold
                      text-slate-400
                      dark:text-slate-500
                    "
                  >
                    استان‌ها به ترتیب حروف الفبا
                  </h3>

                  <div className="space-y-2">
                    {provinces.map((province) => {
                      const isExpanded =
                        expandedProvince === province.id;

                      return (
                        <div
                          key={province.id}
                          className="
                            overflow-hidden
                            rounded-xl
                            border
                            border-slate-100
                            dark:border-slate-800
                          "
                        >
                          {/* Province button */}

                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              toggleProvince(province.id)
                            }
                            className={`
                              flex
                              w-full
                              items-center
                              justify-between
                              px-4
                              py-3.5
                              text-right
                              transition-colors
                              disabled:cursor-not-allowed
                              disabled:opacity-60
                              ${
                                isExpanded
                                  ? "bg-slate-50 dark:bg-slate-800/50"
                                  : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                              }
                            `}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className="
                                  flex
                                  h-8
                                  w-8
                                  items-center
                                  justify-center
                                  rounded-lg
                                  bg-slate-100
                                  text-slate-500
                                  dark:bg-slate-800
                                  dark:text-slate-400
                                "
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                  <circle cx="12" cy="10" r="3" />
                                </svg>
                              </div>

                              <span
                                className="
                                  font-medium
                                  text-slate-700
                                  dark:text-slate-200
                                "
                              >
                                {province.name}
                              </span>
                            </div>

                            <svg
                              className={`
                                shrink-0
                                text-slate-400
                                transition-transform
                                duration-300
                                ${
                                  isExpanded
                                    ? "rotate-180"
                                    : ""
                                }
                              `}
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </button>

                          {/* Cities */}

                          <div
                            className={`
                              grid
                              transition-all
                              duration-300
                              ease-in-out
                              ${
                                isExpanded
                                  ? "grid-rows-[1fr] opacity-100"
                                  : "grid-rows-[0fr] opacity-0"
                              }
                            `}
                          >
                            <div className="overflow-hidden">
                              <div
                                className="
                                  space-y-1
                                  border-t
                                  border-slate-50
                                  bg-slate-50/30
                                  px-4
                                  py-3
                                  dark:border-slate-800
                                  dark:bg-slate-800/20
                                "
                              >
                                {citiesLoading ? (
                                  <div className="flex justify-center py-4">
                                    <div
                                      className="
                                        h-5
                                        w-5
                                        animate-spin
                                        rounded-full
                                        border-2
                                        border-slate-300
                                        border-t-blue-500
                                      "
                                    />
                                  </div>
                                ) : citiesError ? (
                                  <div
                                    className="
                                      py-4
                                      text-center
                                      text-xs
                                      text-red-500
                                    "
                                  >
                                    خطا در دریافت شهرها
                                  </div>
                                ) : cities.length > 0 ? (
                                  cities.map((city) => {
                                    const isSelected =
                                      tempCity.id === city.id;

                                    return (
                                      <button
                                        key={city.id}
                                        type="button"
                                        disabled={saving}
                                        onClick={() =>
                                          setTempCity({
                                            id: city.id,
                                            name: city.name,
                                          })
                                        }
                                        className={`
                                          flex
                                          w-full
                                          cursor-pointer
                                          items-center
                                          gap-3
                                          rounded-lg
                                          px-3
                                          py-2.5
                                          text-right
                                          transition-all
                                          disabled:cursor-not-allowed
                                          disabled:opacity-60
                                          ${
                                            isSelected
                                              ? "bg-blue-50 font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                              : "text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700/50"
                                          }
                                        `}
                                      >
                                        <div
                                          className={`
                                            flex
                                            h-4
                                            w-4
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            border-2
                                            transition-colors
                                            ${
                                              isSelected
                                                ? "border-blue-500 bg-blue-500"
                                                : "border-slate-300 dark:border-slate-600"
                                            }
                                          `}
                                        >
                                          {isSelected && (
                                            <div
                                              className="
                                                h-1.5
                                                w-1.5
                                                rounded-full
                                                bg-white
                                              "
                                            />
                                          )}
                                        </div>

                                        <span className="text-sm">
                                          {city.name}
                                        </span>
                                      </button>
                                    );
                                  })
                                ) : (
                                  <div className="py-4 text-center text-xs text-slate-400">
                                    شهری پیدا نشد
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================= */}
          {/* Footer */}
          {/* ========================= */}

          <div
            className="
              flex
              gap-3
              border-t
              border-slate-100
              px-6
              py-5
              dark:border-slate-800
            "
          >
            <Button
              type="button"
              onClick={confirmCity}
              disabled={!tempCity.id || saving}
              className="
                h-11
                flex-1
                rounded-xl
                bg-blue-600
                text-sm
                font-medium
                shadow-lg
                shadow-blue-600/20
                transition-all
                hover:bg-blue-700
                hover:shadow-blue-600/30
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span
                    className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-white/30
                      border-t-white
                    "
                  />
                  در حال ذخیره...
                </span>
              ) : (
                "تایید"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={saving}
              className="
                h-11
                w-24
                rounded-xl
                border-slate-200
                text-sm
                font-medium
                text-slate-600
                transition-all
                hover:bg-slate-50
                hover:text-slate-800
                disabled:cursor-not-allowed
                disabled:opacity-50
                dark:border-slate-700
                dark:text-slate-300
                dark:hover:bg-slate-800
              "
            >
              انصراف
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}