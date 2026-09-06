"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search, Plus, Check, Loader2 } from "lucide-react";

import {
  useGetBusinessBackground,
  useUpdateBusinessBackground,
} from "@/lib/apis";

export type ApiCategory = {
  id: string;
  title: string;
  url: string;
  children?: ApiCategory[];
};

type Props = {
  categories: ApiCategory[];
};

export default function BusinessBackgroundClient({ categories }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  // دسته اصلی انتخاب شده
  const [selectedCategory, setSelectedCategory] = useState<ApiCategory | null>(
    null,
  );

  // آیتم‌های انتخاب شده
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { data: saved } = useGetBusinessBackground();
  const updateMutation = useUpdateBusinessBackground();

  // بارگذاری انتخاب‌های ذخیره‌شده کاربر
  const selectedIdsKey = saved?.selected_category_ids?.join(",");
  useEffect(() => {
    if (!selectedIdsKey) {
      return;
    }

    setSelectedItems((prev) => {
      const serverIds = selectedIdsKey.split(",");
      const merged = new Set([...prev, ...serverIds]);
      return [...merged];
    });
  }, [selectedIdsKey]);

  // سکشن‌هایی که باز شده‌اند
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  /*
   * ================================
   * جستجوی دسته‌های اصلی
   * ================================
   */

  const filteredCategories = useMemo(() => {
    const value = searchTerm.trim();

    if (!value) {
      return categories;
    }

    return categories.filter((category) => category.title.includes(value));
  }, [categories, searchTerm]);

  /*
   * ================================
   * انتخاب دسته اصلی
   * ================================
   */

  const handleCategoryClick = (category: ApiCategory) => {
    setSelectedCategory(category);
    setSearchTerm("");
  };

  /*
   * ================================
   * انتخاب / حذف یک آیتم
   * ================================
   */

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  /*
   * ================================
   * انتخاب / حذف همه آیتم‌های یک سکشن
   * ================================
   */

  const toggleAllItems = (items: ApiCategory[]) => {
    const itemIds = items.map((item) => item.id);

    setSelectedItems((prev) => {
      const allSelected =
        itemIds.length > 0 && itemIds.every((id) => prev.includes(id));

      // اگر همه انتخاب شده‌اند → همه را حذف کن
      if (allSelected) {
        return prev.filter((id) => !itemIds.includes(id));
      }

      // اگر همه انتخاب نشده‌اند → همه را اضافه کن
      const newIds = itemIds.filter((id) => !prev.includes(id));

      return [...prev, ...newIds];
    });
  };

  /*
   * ================================
   * باز / بسته کردن «بیشتر»
   * ================================
   */

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  /*
   * ================================
   * تعداد انتخاب‌ها
   * ================================
   */

  const selectedCount = selectedItems.length;

  return (
    <div dir="rtl" className="min-h-screen bg-white">
      <main
        className="
          mx-auto
          min-h-screen
          w-full
          max-w-[868px]
          border-x
          border-[#eeeeee]
        "
      >

        {/* ================= CONTENT ================= */}

        <div className="px-[26px]">
          {/* Description */}

          <div className="py-[24px]">
            <p
              className="
                text-center
                text-[15px]
                font-medium
                leading-7
                text-[#444444]
              "
            >
              انتخاب دقیق‌تر زمینه‌ی کاری، دریافت مشاوره فروش دقیق‌تر
            </p>
          </div>

          {/* ================= SEARCH ================= */}

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی زمینه‌ی کاری مورد نظر"
              className="
                h-[51px]
                w-full
                rounded-[10px]
                border-0
                bg-[#f4f6f9]
                px-12
                text-right
                text-[15px]
                font-medium
                text-[#333333]
                outline-none
                placeholder:text-[#777777]
                focus:ring-2
                focus:ring-blue-500/20
              "
            />

            <Search
              size={24}
              strokeWidth={2}
              className="
                pointer-events-none
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                text-[#858585]
              "
            />
          </div>

          {/* ================================================= */}
          {/*                    حالت اول                       */}
          {/* ================================================= */}

          {!selectedCategory && (
            <>
              {/* Divider */}

              <div className="mt-[27px] border-t border-[#eeeeee]" />

              {/* Selected Counter */}

              <div
                className="
                  flex
                  h-[53px]
                  items-center
                  justify-start
                  border-b
                  border-[#eeeeee]
                "
              >
                <span className="text-[14px] font-medium text-[#333333]">
                  تعداد زمینه‌های انتخاب شده:{" "}
                  <span className="font-bold">{selectedCount}</span>
                </span>
              </div>

              {/* Categories */}

              <div className="space-y-[8px] pt-[12px] pb-[130px]">
                {filteredCategories.map((category) => {
                  const isSelected = selectedItems.includes(category.id);

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategoryClick(category)}
                      className={`
                        flex
                        h-[52px]
                        w-full
                        items-center
                        justify-between
                        rounded-[9px]
                        border
                        px-[16px]
                        text-right
                        transition-all
                        duration-150

                        ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-[#e5e5e5] bg-white hover:border-[#cccccc] hover:bg-[#fafafa]"
                        }
                      `}
                    >
                      <span
                        className={`
                          text-[15px]
                          font-semibold
                          ${isSelected ? "text-blue-700" : "text-[#222222]"}
                        `}
                      >
                        {category.title}
                      </span>

                      <span
                        className={`
                          flex
                          h-[21px]
                          w-[21px]
                          items-center
                          justify-center
                          rounded-full
                          border

                          ${
                            isSelected
                              ? "border-blue-500 bg-blue-500"
                              : "border-[#d5d5d5] bg-white"
                          }
                        `}
                      >
                        {isSelected && (
                          <Check
                            size={13}
                            strokeWidth={3}
                            className="text-white"
                          />
                        )}
                      </span>
                    </button>
                  );
                })}

                {filteredCategories.length === 0 && (
                  <div className="flex h-[150px] items-center justify-center">
                    <span className="text-sm text-gray-500">
                      نتیجه‌ای یافت نشد
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ================================================= */}
          {/*                    حالت دوم                       */}
          {/* ================================================= */}

          {selectedCategory && (
            <>
              {/* Category Chips */}

              <div
                className="
                  mt-[20px]
                  flex
                  gap-[7px]
                  overflow-x-auto
                  pb-[8px]
                  scrollbar-thin
                "
              >
                {categories.map((category) => {
                  const active = selectedCategory.id === category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategoryClick(category)}
                      className={`
                        shrink-0
                        whitespace-nowrap
                        rounded-full
                        border
                        px-[14px]
                        py-[7px]
                        text-[14px]
                        font-medium
                        transition

                        ${
                          active
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-[#e1e1e1] bg-white text-[#666666] hover:bg-gray-50"
                        }
                      `}
                    >
                      {category.title}
                    </button>
                  );
                })}
              </div>

              {/* Sub Categories */}

              <div className="pb-[135px]">
                {selectedCategory.children?.map((section) => {
                  // آیتم‌های نهایی این سکشن
                  const items = section.children ?? [];

                  // آیا این سکشن باز شده؟
                  const isExpanded = expandedSections.includes(section.id);

                  // فقط ۴ مورد
                  const visibleItems = isExpanded ? items : items.slice(0, 4);

                  // آیا همه آیتم‌های این سکشن انتخاب شده‌اند؟
                  const allSelected =
                    items.length > 0 &&
                    items.every((item) => selectedItems.includes(item.id));

                  return (
                    <div key={section.id} className="pt-[22px]">
                      {/* Section Header */}

                      <div
                        className="
                            flex
                            items-center
                            justify-between
                            border-b
                            border-[#e5e5e5]
                            pb-[10px]
                          "
                      >
                        {/* ALL */}

                        <button
                          type="button"
                          onClick={() => toggleAllItems(items)}
                          className="
                              flex
                              items-center
                              gap-[8px]
                              text-[13px]
                              font-medium
                              text-[#333333]
                            "
                        >
                          <span>همه</span>

                          <span
                            className={`
                                flex
                                h-[21px]
                                w-[21px]
                                items-center
                                justify-center
                                rounded-[5px]
                                border
                                transition

                                ${
                                  allSelected
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-[#d8d8d8] bg-white"
                                }
                              `}
                          >
                            {allSelected && (
                              <Check
                                size={14}
                                strokeWidth={3}
                                className="text-white"
                              />
                            )}
                          </span>
                        </button>

                        {/* TITLE */}

                        <h2
                          className="
                              text-[15px]
                              font-bold
                              text-[#222222]
                            "
                        >
                          {section.title}
                        </h2>
                      </div>

                      {/* Items */}

                      <div
                        className="
                            mt-[12px]
                            flex
                            flex-wrap
                            justify-end
                            gap-[7px]
                          "
                      >
                        {visibleItems.map((item) => {
                          const active = selectedItems.includes(item.id);

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleItem(item.id)}
                              className={`
                                  flex
                                  items-center
                                  gap-[6px]
                                  rounded-full
                                  border
                                  px-[12px]
                                  py-[7px]
                                  text-[14px]
                                  font-medium
                                  transition

                                  ${
                                    active
                                      ? "border-blue-500 bg-blue-50 text-blue-600"
                                      : "border-[#e4e4e4] bg-white text-blue-600 hover:bg-blue-50"
                                  }
                                `}
                            >
                              {active ? (
                                <Check size={17} strokeWidth={2} />
                              ) : (
                                <Plus size={18} strokeWidth={1.8} />
                              )}

                              {item.title}
                            </button>
                          );
                        })}
                      </div>

                      {/* More */}

                      {items.length > 4 && (
                        <div className="mt-[10px] flex justify-end">
                          <button
                            type="button"
                            onClick={() => toggleSection(section.id)}
                            className="
                                rounded-full
                                border
                                border-[#e4e4e4]
                                px-[14px]
                                py-[7px]
                                text-[13px]
                                font-medium
                                text-blue-600
                                transition
                                hover:bg-blue-50
                              "
                          >
                            {isExpanded ? "کمتر" : "بیشتر ..."}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {/* ================================================= */}
      {/*                  FIXED SUBMIT                     */}
      {/* ================================================= */}

      <div
        className="
          fixed
          bottom-0
          left-1/2
          z-50
          w-full
          max-w-[868px]
          -translate-x-1/2
          rounded-t-[18px]
          border
          border-b-0
          border-[#e8e8e8]
          bg-white
          px-[26px]
          pb-[14px]
          pt-[25px]
          shadow-[0_-4px_18px_rgba(0,0,0,0.10)]
        "
      >
        <button
          type="button"
          onClick={() =>
            updateMutation.mutate({
              category_ids: selectedItems.map((id) => Number(id)),
            })
          }
          disabled={selectedItems.length === 0 || updateMutation.isPending}
          className="
            h-[43px]
            w-full
            rounded-[9px]
            bg-[#3975dc]
            text-[14px]
            font-bold
            text-white
            transition
            hover:bg-[#3269ca]
            active:scale-[0.99]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "ثبت"
          )}
        </button>
      </div>
    </div>
  );
}
