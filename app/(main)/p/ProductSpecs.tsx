const keySpecs = [
  { label: "حافظه داخلی", value: "۲۵۶ گیگابایت" },
  { label: "حافظه RAM", value: "۱۲ گیگابایت" },
  { label: "اندازه صفحه نمایش", value: "۶.۹ اینچ" },
  { label: "کیفیت دوربین اصلی", value: "۲۰۰ مگاپیکسل" },
  { label: "کیفیت دوربین جلو", value: "۱۲ مگاپیکسل" },
  { label: "ظرفیت باتری", value: "۵۰۰۰ میلی‌آمپرساعت" },
  { label: "شبکه‌های ارتباطی", value: "5G" },
  { label: "سیستم عامل", value: "android ۱۴" },
  { label: "سیم کارت", value: "۲ سیم کارت" },
  { label: "کشور ROM", value: "ویتنام" },
  { label: "وضعیت رجیستر", value: "رجیستر شده" },
  { label: "وضعیت فعال بودن", value: "نات اکتیو" },
  { label: "سال تولید", value: "۲۰۲۶" },
];

const generalSpecs = [
  { label: "برند", value: "Samsung" },
  { label: "مدل", value: "Samsung Galaxy S26 Ultra" },
  { label: "تاریخ معرفی", value: "۰۶ فوریه ۲۰۲۶" },
  { label: "ابعاد", value: "۱۶۳.۶x۷۸.۱x۷.۹ میلی‌متر" },
];

export default function ProductSpecs() {
  return (
    <div className="dark:bg-[#1e293b] bg-[#ffffff] rounded-2xl p-6">
      <h3 className="text-lg font-bold mb-6 text-[#1e293b] dark:text-[#f1f5f9]">مشخصات محصول</h3>

      <div className="mb-6">
        <h4 className="text-sm font-bold text-[#1e293b] dark:text-[#f1f5f9] mb-5">
          مشخصات کلیدی
        </h4>
        <div className="space-y-3 text-sm">
          {keySpecs.map((spec) => (
            <div key={spec.label} className="flex justify-between">
                 <span className="text-[#1e293b] dark:text-[#f1f5f9]">{spec.label}</span>
                 <span className="text-[#64748b] dark:text-[#94a3b8]">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h4 className="text-sm font-bold text-[#1e293b] dark:text-[#f1f5f9] mb-5">
          مشخصات کلی
        </h4>
        <div className="space-y-3 text-sm">
          {generalSpecs.map((spec) => (
            <div key={spec.label} className="flex justify-between">
              <span className="text-[#1e293b] dark:text-[#f1f5f9]">{spec.label}</span>
              <span className="text-[#64748b] dark:text-[#94a3b8]">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}