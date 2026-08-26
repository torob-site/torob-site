"use client";
import { useState } from "react";
import {
  Upload,
  X,
  ChevronDown,
  CheckCircle,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { axiosClient } from "@/lib/axios";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { useGetBusinessLicense } from "@/lib/apis";

const items = [
  { label: "پروانه کسب سامانه ملی مجوز‌ها", value: "national-license" },
  { label: "پروانه کسب - ایرانیان اصناف", value: "iranian-asnaf" },
  { label: "مجوز داروخانه", value: "pharmacy-license" },
];

export default function BusinessLicense() {
  const { currentShop } = useCurrentShop();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [link, setLink] = useState("");

  const { data, refetch, isLoading } = useGetBusinessLicense(
    currentShop?.id,
    selectedType,
  );

  const hasDocument =
    data?.document_url !== null && data?.document_url !== undefined;

  // دریافت نام نوع مدرک انتخاب شده
  const getSelectedLabel = () => {
    const item = items.find((i) => i.value === selectedType);
    return item?.label || "";
  };

  // انتخاب نوع مدرک
  const handleSelectType = (value: string) => {
    setSelectedType(value);
    setIsModalOpen(false);
  };

  // کامپوننت مودال
  const Modal = () => {
    if (!isModalOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={() => setIsModalOpen(false)}
      >
        <div
          className="bg-white rounded-2xl w-[500px] max-w-[90vw] p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#333333]">نوع مدرک</h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <button
                key={item.value}
                onClick={() => handleSelectType(item.value)}
                className={`
                  w-full text-right px-4 py-3 rounded-xl transition
                  hover:bg-blue-50 hover:text-blue-600 cursor-pointer
                  ${selectedType === item.value ? "bg-blue-50 text-blue-600" : ""}
                `}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // نمایش محتوای اصلی
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-6">
          <div className="text-gray-500">در حال بارگذاری...</div>
        </div>
      );
    }

    // اگر مدرک وجود داشته باشد - فقط تصویر نمایش داده شود
    if (hasDocument) {
      return (
        <div className="py-4">
          <img
            src={data.document_url}
            alt="مدرک"
            className="w-full max-h-[400px] object-contain rounded-lg border"
          />
        </div>
      );
    }

    // اگر مدرک وجود نداشته باشد و نوعی انتخاب نشده باشد
    if (!selectedType) {
      return (
        <div className="py-2">
          <div
            onClick={() => setIsModalOpen(true)}
            className="w-full text-xs border px-2 rounded-lg py-2.5 flex items-center justify-between cursor-pointer hover:border-blue-500 transition"
          >
            <p className="text-gray-400">لطفا نوع مدرک خود را مشخص کنید</p>
            <ChevronDown size={20} className="text-gray-400" />
          </div>
        </div>
      );
    }

    // اگر مدرک وجود نداشته باشد و نوع انتخاب شده باشد
    const isNationalLicense = selectedType === "national-license";
    const isIRANIANASNAFLicense = selectedType === "iranian-asnaf";
    const isPHARMACYLICENSE = selectedType === "pharmacy-license";

    return (
      <div className="py-2 space-y-4">
        {/* دکمه انتخاب نوع مدرک با نمایش نام انتخاب شده */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="w-full text-xs border px-2 rounded-lg py-2.5 flex items-center justify-between cursor-pointer hover:border-blue-500 transition"
        >
          <p className="text-gray-800 font-medium">{getSelectedLabel()}</p>
          <ChevronDown size={20} className="text-blue-500" />
        </div>

        {/* لینک مجوز برای پروانه کسب سامانه ملی مجوزها */}
        {isNationalLicense && (
          <>
            <div className="w-full">
              <h1 className="text-[#333333] font-bold text-sm">لینک مجوز</h1>
              <Input
                className="w-full border px-4 py-5 mt-3"
                placeholder="مثلا: https://qr.mojavez.ir/track/I123456"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                disabled={isUploading}
              />
            </div>
            <div className="flex items-center gap-4 w-full">
              <div className="border-t border-gray-300 w-full"></div>
              <p className="text-gray-500 text-sm whitespace-nowrap">یا</p>
              <div className="border-t border-gray-300 w-full"></div>
            </div>
          </>
        )}

        {/* دکمه انتخاب فایل - فقط وقتی نوع انتخاب شده باشد نمایش داده می‌شود */}
        <div className="flex justify-center">
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

        {isNationalLicense && (
          <>
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
          </>
        )}

        {isIRANIANASNAFLicense && (
          <>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
              <p className="text-[#808080] text-xs font-bold">
                تصویر پروانه کسب از سایت ایرانیان اصناف
              </p>
            </div>
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
          </>
        )}

        {isPHARMACYLICENSE && (
          <>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
              <p className="text-[#808080] text-xs font-bold">
                تصویر مجوز اینترنتی فروش دارو از سازمان غذا و دارو
              </p>
            </div>
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
          </>
        )}

        {/* نمایش وضعیت آپلود */}
        {isUploading && (
          <div className="text-center text-sm text-gray-500">
            در حال آپلود فایل...
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="px-10 mt-5 space-y-2">
        <h1 className="text-[#333333] font-bold">نوع مدرک</h1>
        {renderContent()}
      </div>

      <Modal />
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
