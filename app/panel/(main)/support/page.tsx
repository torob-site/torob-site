"use client";

import { MessageCircle } from "lucide-react";

export default function SupportPage() {
  return (
    <main
      dir="rtl"
      className="
        w-full
        max-w-[700px]
        mx-auto
        px-4
        pt-8
        pb-4
        min-h-[calc(100vh-120px)]
        flex
        flex-col
      "
    >
      {/* ========================= */}
      {/* محتوای وسط */}
      {/* ========================= */}

      <div className="flex-1 flex flex-col items-center">
        {/* عکس */}
        <img
          src="https://panel.torob.com/o/assets/images/customer-service-327x368.png"
          alt="پشتیبانی"
          className="
            w-[220px]
            h-auto
            object-contain
            mt-8
          "
        />

        {/* متن */}
        <div
          className="
            mt-5
            text-center
            text-[14px]
            leading-7
            text-gray-900
          "
        >
          <p>
            ساعات پاسخگویی تیم پشتیبانی ترب
          </p>

          <p>
            همه روزه از ساعت ۸ الی ۲۲ می‌باشد.
          </p>
        </div>
      </div>

      {/* ========================= */}
      {/* پایین صفحه */}
      {/* ========================= */}

      <div className="w-full">
        {/* ارسال پیام */}

        <button
          type="button"
          className="
            w-full
            h-[44px]
            rounded-lg
            bg-blue-600
            hover:bg-blue-700
            text-white
            flex
            items-center
            justify-center
            gap-2
            text-[14px]
            font-bold
          "
        >
          <span>
            ارسال پیام
          </span>

          <MessageCircle className="h-5 w-5" />
        </button>

        {/* تماس با پشتیبانی */}

        <button
          type="button"
          className="
            w-full
            h-[44px]
            flex
            items-center
            justify-center
            text-blue-600
            text-[14px]
            font-medium
          "
        >
          تماس با پشتیبانی
        </button>
      </div>
    </main>
  );
}