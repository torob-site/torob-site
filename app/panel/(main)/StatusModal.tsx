"use client";

import { Check, X } from "lucide-react";

interface StatusModalProps {
  currentShop: {
    id: number;
    shop_name: string;
    is_active: boolean;
  };
  isUpdating: boolean;
  onChangeStatus: (is_active: boolean) => void;
  onClose: () => void;
}

export default function StatusModal({
  currentShop,
  isUpdating,
  onChangeStatus,
  onClose,
}: StatusModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex justify-center">
      {/* محیط اصلی سایت - فقط 700px */}
      <div className="relative h-full w-full max-w-[700px] overflow-hidden">

        {/* Overlay */}
        <button
          type="button"
          aria-label="بستن"
          onClick={onClose}
          disabled={isUpdating}
          className="
            absolute
            inset-0
            z-0
            h-full
            w-full
            bg-black/60
          "
        />

        {/* Bottom Sheet */}
        <div
          className="
            absolute
            bottom-0
            left-0
            z-10
            w-full
            rounded-t-2xl
            bg-white
            px-3
            pb-8
            pt-5
            dark:bg-[#212b36]
          "
        >
          {/* Header */}
          <div className="relative mb-6 flex items-center justify-center">
            <h2
              className="
                text-base
                font-bold
                text-[#1e293b]
                dark:text-white
              "
            >
              وضعیت فعالیت فروشگاه
            </h2>

            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="
                absolute
                left-2
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                text-gray-500
                hover:bg-gray-100
                disabled:cursor-not-allowed
                disabled:opacity-50
                dark:hover:bg-gray-800
              "
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* فعال */}
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onChangeStatus(true)}
            className={`
              flex
              w-full
              items-center
              justify-between
              rounded-lg
              border
              px-4
              py-4
              text-sm
              font-medium
              text-[#1e293b]
              transition
              disabled:cursor-not-allowed
              disabled:opacity-60
              dark:text-white
              ${
                currentShop.is_active
                  ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/20"
                  : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-[#212b36] dark:hover:bg-gray-800"
              }
            `}
          >
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500" />

              <span>فعال</span>
            </div>

            {currentShop.is_active && (
              <div
                className="
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded
                  bg-blue-500
                  text-white
                "
              >
                <Check className="h-4 w-4" />
              </div>
            )}
          </button>

          {/* غیرفعال */}
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onChangeStatus(false)}
            className={`
              mt-3
              flex
              w-full
              items-center
              justify-between
              rounded-lg
              border
              px-4
              py-4
              text-sm
              font-medium
              text-[#1e293b]
              transition
              disabled:cursor-not-allowed
              disabled:opacity-60
              dark:text-white
              ${
                !currentShop.is_active
                  ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/20"
                  : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-[#212b36] dark:hover:bg-gray-800"
              }
            `}
          >
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />

              <div className="flex items-center gap-1.5">
                <span>غیرفعال</span>

                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  (عدم نمایش محصولات)
                </span>
              </div>
            </div>

            {!currentShop.is_active && (
              <div
                className="
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded
                  bg-blue-500
                  text-white
                "
              >
                <Check className="h-4 w-4" />
              </div>
            )}
          </button>

          {/* Loading */}
          {isUpdating && (
            <div className="mt-4 text-center text-xs text-gray-500">
              در حال تغییر وضعیت...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
