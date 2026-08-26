"use client";

import { Camera, Plus, Loader2 } from "lucide-react";
import { useGetShopImages } from "@/lib/apis";

interface ShopImagesProps {
  shopId: number;
}

export default function ShopImages() {
  const {
    data: images = [],
    isPending,
  } = useGetShopImages();

  return (
    <div
      dir="rtl"
      className="
        rounded-2xl
        bg-white
        p-6
        dark:bg-[#1e293b]
      "
    >
      <div className="mb-5 flex items-center justify-between">
        <h3
          className="
            text-base
            font-bold
            text-[#1e293b]
            dark:text-[#f1f5f9]
          "
        >
          عکس فروشگاه
        </h3>

        <button
          type="button"
          disabled
          className="
            flex
            h-10
            items-center
            gap-2
            rounded-xl
            border
            border-gray-200
            bg-white
            px-4
            text-sm
            font-medium
            text-gray-400
            opacity-70
            dark:border-gray-700
            dark:bg-[#0f172a]
            dark:text-gray-500
          "
        >
          <Plus className="h-4 w-4" />
          افزودن عکس
        </button>
      </div>

      {isPending ? (
        <div className="flex h-[220px] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
        </div>
      ) : images.length > 0 ? (
        <div
          className="
            overflow-x-auto
            overflow-y-hidden
            pb-3
            [&::-webkit-scrollbar]:h-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-300
            dark:[&::-webkit-scrollbar-thumb]:bg-gray-700
          "
        >
          <div className="flex w-max gap-4">
            {images.map((image: any) => (
              <div
                key={image.id}
                className="
                  h-[220px]
                  w-[330px]
                  shrink-0
                  overflow-hidden
                  rounded-xl
                  bg-gray-100
                  dark:bg-gray-800
                "
              >
                <img
                  src={image.url}
                  alt="تصویر فروشگاه"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="
            flex
            h-[220px]
            items-center
            justify-center
            rounded-xl
            border
            border-dashed
            border-gray-200
            dark:border-gray-700
          "
        >
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Camera className="h-8 w-8" />
            <span className="text-sm">
              تصویری برای نمایش وجود ندارد
            </span>
          </div>
        </div>
      )}
    </div>
  );
}