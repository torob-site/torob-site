import Link from "next/link";
import enamad from "../../public/enamad.png";
export default function Footer() {
  return (
    <div className="w-full flex flex-col px-16 py-10 bg-[#ffffff] dark:bg-[#212b36] text-[#64748b] dark:text-[#94a3b8] relative">
      <div className="flex items-center w-full justify-between mb-6">
        <div className="flex items-center gap-20">
          <div className="flex flex-col text-sm space-y-3">
            <Link href="/panel">پنل فروشگاه‌ها</Link>
            <Link href="/sell/register">ثبت‌ فروشگاه</Link>
            <Link href="/shop-list">فروشگاه‌ها</Link>
            <Link href="/user/tickets"> پیگیری سفارش از فروشگاه </Link>
          </div>
          <div className="flex flex-col text-sm space-y-3">
            <Link href="/pages/terms"> قوانین و مقررات </Link>
            <Link href="/pages/about-us"> درباره ترب </Link>
            <Link href="/pages/support"> پشتیبانی </Link>
            <Link href="/feedback"> پیشنهادات و گزارش خطا </Link>
          </div>
        </div>
        <img className="w-32 h-32" src={enamad.src} />
      </div>
      <div className="border-b border-black"></div>
      <div className="flex items-center w-full justify-between mt-12">
        <div className="flex items-center">
          <h1 className="text-lg">ترب، موتور جستجوی هوشمند خرید</h1>
          <div className="flex items-center gap-5 mr-10">
            <svg
              className="fill-[#64748b] dark:fill-[#94a3b8]"
              width="20"
              height="20"
              viewBox="0 0 1792 1792"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M1684 408q-67 98-162 167 1 14 1 42 0 130-38 259.5t-115.5 248.5-184.5 210.5-258 146-323 54.5q-271 0-496-145 35 4 78 4 225 0 401-138-105-2-188-64.5t-114-159.5q33 5 61 5 43 0 85-11-112-23-185.5-111.5t-73.5-205.5v-4q68 38 146 41-66-44-105-115t-39-154q0-88 44-163 121 149 294.5 238.5t371.5 99.5q-8-38-8-74 0-134 94.5-228.5t228.5-94.5q140 0 236 102 109-21 205-78-37 115-142 178 93-10 186-50z"></path>{" "}
            </svg>
            <svg
              className="fill-[#64748b] dark:fill-[#94a3b8]"
              width="20"
              height="20"
              viewBox="0 0 1792 1792"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M477 625v991h-330v-991h330zm21-306q1 73-50.5 122t-135.5 49h-2q-82 0-132-49t-50-122q0-74 51.5-122.5t134.5-48.5 133 48.5 51 122.5zm1166 729v568h-329v-530q0-105-40.5-164.5t-126.5-59.5q-63 0-105.5 34.5t-63.5 85.5q-11 30-11 81v553h-329q2-399 2-647t-1-296l-1-48h329v144h-2q20-32 41-56t56.5-52 87-43.5 114.5-15.5q171 0 275 113.5t104 332.5z"></path>{" "}
            </svg>
            <svg
              className="fill-[#64748b] dark:fill-[#94a3b8]"
              width="20"
              height="20"
              viewBox="0 0 1792 1792"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M1152 896q0-106-75-181t-181-75-181 75-75 181 75 181 181 75 181-75 75-181zm138 0q0 164-115 279t-279 115-279-115-115-279 115-279 279-115 279 115 115 279zm108-410q0 38-27 65t-65 27-65-27-27-65 27-65 65-27 65 27 27 65zm-502-220q-7 0-76.5-.5t-105.5 0-96.5 3-103 10-71.5 18.5q-50 20-88 58t-58 88q-11 29-18.5 71.5t-10 103-3 96.5 0 105.5.5 76.5-.5 76.5 0 105.5 3 96.5 10 103 18.5 71.5q20 50 58 88t88 58q29 11 71.5 18.5t103 10 96.5 3 105.5 0 76.5-.5 76.5.5 105.5 0 96.5-3 103-10 71.5-18.5q50-20 88-58t58-88q11-29 18.5-71.5t10-103 3-96.5 0-105.5-.5-76.5.5-76.5 0-105.5-3-96.5-10-103-18.5-71.5q-20-50-58-88t-88-58q-29-11-71.5-18.5t-103-10-96.5-3-105.5 0-76.5.5zm768 630q0 229-5 317-10 208-124 322t-322 124q-88 5-317 5t-317-5q-208-10-322-124t-124-322q-5-88-5-317t5-317q10-208 124-322t322-124q88-5 317-5t317 5q208 10 322 124t124 322q5 88 5 317z"></path>{" "}
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <img
            className="w-40"
            src="https://assets.torob.com/public/main/images/bazaar-badge.png"
          />
          <img
            className="w-40"
            src="https://assets.torob.com/public/main/images/svg/myket.svg"
          />
        </div>
      </div>
    </div>
  );
}
