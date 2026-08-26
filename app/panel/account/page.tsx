"use client";

import { useGetShopStatus } from "@/lib/apis";
import {
  Check,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import PanelHeader from "../(main)/PanelHeader";
import PanelFooter from "../(main)/PanelFooter";

type ShopStatusResponse = {
  shop_name: string;
  shop_logo: string;

  location_status: string;
  owner_info_status: string;
  phone_status: string;
  contact_info_status: string;
  images_status: string;
  category_status: string;
  name_status: string;
  daily_working_hours_status: string;
  business_type_status: string;
  instagram_username_status: string;
  national_card_status: string;
  address_verification_status: string;
  authentication_video_status: string;
  business_license_status: string;
};

type StatusKey =
  | "daily_working_hours_status"
  | "location_status"
  | "owner_info_status"
  | "category_status"
  | "images_status"
  | "business_type_status"
  | "contact_info_status"
  | "name_status"
  | "national_card_status"
  | "address_verification_status"
  | "authentication_video_status"
  | "business_license_status"
  | "instagram_username_status";

type AccountItem = {
  id: string;
  title: string;
  statusKey?: StatusKey;
};

const items: AccountItem[] = [
  {
    id: "working-hours",
    title: "زمان و ساعت کاری",
    statusKey: "daily_working_hours_status",
  },
  {
    id: "address",
    title: "آدرس فروشگاه",
    statusKey: "location_status",
  },
  {
    id: "owner-info",
    title: "مشخصات مالک",
    statusKey: "owner_info_status",
  },
  {
    id: "business-background",
    title: "زمینه‌ی کاری",
    statusKey: "category_status",
  },
  {
    id: "shop-photo",
    title: "عکس فروشگاه",
    statusKey: "images_status",
  },
  {
    id: "business-type",
    title: "نوع کسب و کار",
    statusKey: "business_type_status",
  },
  {
    id: "customer-contact",
    title: "راه ارتباطی مشتریان",
    statusKey: "contact_info_status",
  },
  {
    id: "profile",
    title: "نام و لوگو فروشگاه",
    statusKey: "name_status",
  },
  {
    id: "national-card",
    title: "تصویر کارت ملی",
    statusKey: "national_card_status",
  },
  {
    id: "address-proof",
    title: "احراز آدرس",
    statusKey: "address_verification_status",
  },
  {
    id: "identity-video",
    title: "ویدیو احراز هویت",
    statusKey: "authentication_video_status",
  },
  {
    id: "business-license",
    title: "پروانه کسب",
    statusKey: "business_license_status",
  },
  {
    id: "instagram",
    title: "اینستاگرام",
    statusKey: "instagram_username_status",
  },
  {
    id: "permissions",
    title: "دسترسی‌ها",
  },
  {
    id: "my-shops",
    title: "فروشگاه‌های من",
  },
];

export default function AccountPage() {
  const router = useRouter();

  const {
    data,
    isPending,
    error,
  } = useGetShopStatus() as {
    data: ShopStatusResponse | undefined;
    isPending: boolean;
    error: unknown;
  };

  const handleItemClick = (id: string) => {
    router.push(`/panel/account/${id}`);
  };

  return (
    <>
      <PanelHeader />

      <main
        dir="rtl"
        className="mx-auto w-full max-w-[700px] px-3 py-4"
      >
        {/* ================= خوش آمدگویی ================= */}

        <div
          className="
            relative
            mb-5
            flex
            h-32
            flex-col
            items-center
            justify-center
            rounded-xl
            bg-gray-50
          "
        >
          <div
            className="
              absolute
              -top-4
              flex
              h-16
              w-16
              items-center
              justify-center
              overflow-hidden
              rounded-full
              border-4
              border-white
              bg-gray-100
            "
          >
            <img
              src={
                data?.shop_logo ||
                "https://panel.torob.com/o/assets/images/shopping_icon.png"
              }
              alt={data?.shop_name ?? "فروشگاه"}
              className="h-full w-full object-cover"
            />
          </div>

          <p className="mt-8 text-xs font-bold text-gray-800">
            وقت بخیر {data?.shop_name ?? "فروشگاه"}
          </p>
        </div>

        {/* ================= لیست ================= */}

        <div className="space-y-2">
          {items.map((item) => {
            // فقط آیتم‌هایی که statusKey دارند وضعیتشان بررسی می‌شود
            const status = item.statusKey
              ? data?.[item.statusKey]
              : undefined;

            const completed = status === "verified";

            // این دو آیتم وضعیت ندارند
            const hasStatus = Boolean(item.statusKey);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className="
                  flex
                  h-14
                  w-full
                  items-center
                  justify-between
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-4
                  transition-colors
                  hover:bg-gray-50
                "
              >
                {/* متن */}

                <span
                  className={`
                    text-xs
                    font-medium
                    ${
                      hasStatus && completed
                        ? "text-gray-400"
                        : "text-gray-800"
                    }
                  `}
                >
                  {item.title}
                </span>

                {/* سمت چپ */}

                <div className="flex items-center gap-5">
                  {/* فقط آیتم‌های دارای وضعیت Loading / Check دارند */}

                  {hasStatus &&
                    (isPending ? (
                      <Loader2
                        className="
                          h-5
                          w-5
                          animate-spin
                          text-gray-400
                        "
                      />
                    ) : (
                      completed && (
                        <Check
                          className="
                            h-5
                            w-5
                            stroke-[2]
                            text-green-500
                          "
                        />
                      )
                    ))}

                  {/* همه آیتم‌ها فلش دارند */}

                  <ChevronLeft
                    className="
                      h-5
                      w-5
                      text-gray-600
                    "
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Error */}

        {error && (
          <p className="mt-4 text-center text-xs text-red-500">
            دریافت وضعیت فروشگاه با خطا مواجه شد
          </p>
        )}
      </main>

      <PanelFooter />
    </>
  );
}