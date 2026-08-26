"use client";
import { Spinner } from "@/components/ui/spinner";
import { useGetAddress } from "@/lib/apis";
import { CheckCircle2, Upload } from "lucide-react";

export default function Address() {
  const { data, isPending, error } = useGetAddress();

  if (isPending) {
    return (
      <div className="flex mt-10 justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <main dir="rtl" className="mx-auto w-full max-w-[700px] px-6 py-6">
        <p className="text-center text-sm text-red-500">
          دریافت احراز ادرس با خطا مواجه شد.
        </p>
      </main>
    );
  }
  return (
    <>
      <p className="flex items-center justify-center text-xs text-gray-500 mt-8">
        اجاره نامه و سند ملکی باید به نام مالک فروشگاه باشد و این اطلاعات به
        کاربران نمایش داده نمی‌شود.
      </p>
      <div className="mt-10 space-y-4 px-10">
        <h1 className="font-bold text-[#333333]">اجاره نامه یا سند ملکی</h1>
        {data.document_url ? (
          <div className="flex justify-center">
            <img className="w-32 h-32" src={data.document_url} />
          </div>
        ) : (
          <div className="flex justify-center py-10">
            <button
              className="
                  inline-flex items-center gap-2
                  px-6 py-2.5
                  bg-blue-500 hover:bg-blue-600
                  text-white text-sm font-medium
                  rounded-xl
                  transition
                  shadow-lg shadow-blue-500/20
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
            >
              <Upload className="h-4 w-4" />
              انتخاب فایل
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
          <p className="text-[#808080] text-xs font-bold">
            فرمت مجاز: PNG,JPG,JPEG
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
          <p className="text-[#808080] text-xs font-bold">
            حجم مجاز: حداکثر ۵MB
          </p>
        </div>
      </div>

      <div
        className="
                    fixed
                    bottom-0
                    left-1/2
                    z-30
                    w-full
                    max-w-[700px]
                    -translate-x-1/2
                    border-t
                    border-gray-200
                    bg-white
                    px-5
                    py-4
                    shadow-[0_-4px_15px_rgba(0,0,0,0.08)]
                "
      >
        <button
          type="button"
          className="
                        flex
                        h-11
                        w-full
                        items-center
                        justify-center
                        rounded-lg
                        bg-blue-600
                        text-sm
                        font-medium
                        text-white
                        transition
                        hover:bg-blue-700
                        disabled:cursor-not-allowed
                        disabled:bg-gray-300
                    "
        >
          ثبت
        </button>
      </div>
    </>
  );
}
