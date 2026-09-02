"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageSpinner } from "@/components/ui/page-spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  StatisticsRange,
  useDeleteShopProduct,
  useGetShopProductDetails,
  useGetShopStatistics,
  useGetWarranties,
} from "@/lib/apis";

import {
  ArrowRight,
  ArrowUpLeftFromSquare,
  BadgeInfo,
  Camera,
  CheckCircle2,
  Copy,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPriceNumber as toPersianNumber } from "@/lib/format";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useUpdateProduct } from "../../(main)/page";

const tabs: {
  label: string;
  value: StatisticsRange;
}[] = [
  {
    label: "۲۴ ساعت",
    value: "24h",
  },
  {
    label: "۷ روز",
    value: "7d",
  },
  {
    label: "۳۰ روز",
    value: "30d",
  },
];

const WARRANTY_DURATIONS = [6, 12, 18, 24, 36, 48, 60, 120];



function formatDate(date: { year: number; month: number; day: number }) {
  return `${toPersianNumber(date.year)}/${toPersianNumber(
    date.month,
  )}/${toPersianNumber(date.day)}`;
}

export default function ProductsDetails() {
  const router = useRouter();
  const params = useParams();

  const productId = Number(params.id);

  /* =========================================================
     STATES
  ========================================================= */

  const [removeProductOpen, setRemoveProductOpen] = useState(false);

  const [priceOpen, setPriceOpen] = useState(false);

  const [descriptionOpen, setDescriptionOpen] = useState(false);

  const [warrantyDurationOpen, setWarrantyDurationOpen] = useState(false);

  const [price, setPrice] = useState("");

  const [description, setDescription] = useState("");

  const [selectedWarranty, setSelectedWarranty] = useState("");

  const [warrantyDuration, setWarrantyDuration] = useState<number | null>(null);

  const [range, setRange] = useState<StatisticsRange>("30d");

  /* =========================================================
     PRODUCT
  ========================================================= */

  const { data, isPending, error, refetch } =
    useGetShopProductDetails(productId);

  const { data: warranties = [] } = useGetWarranties();

  const deleteProduct = useDeleteShopProduct(productId);

  const updateProduct = useUpdateProduct();

  /* =========================================================
     STATISTICS
  ========================================================= */

  const {
    data: statistics,
    isLoading: statisticsLoading,
    isFetching: statisticsFetching,
    isError: statisticsError,
  } = useGetShopStatistics(range, productId);

  /* =========================================================
     INITIAL VALUES
  ========================================================= */

  useEffect(() => {
    if (!data) {
      return;
    }

    setPrice(String(data.price ?? ""));

    setDescription(data.description ?? "");

    setSelectedWarranty(data.warranty?.id ? String(data.warranty.id) : "");

    setWarrantyDuration(data.warranty_duration ?? null);
  }, [data]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (isPending) return <PageSpinner />;

  if (error || !data) {
    return (
      <div
        dir="rtl"
        className="
          flex
          min-h-[300px]
          items-center
          justify-center
          text-sm
          text-red-500
        "
      >
        دریافت اطلاعات محصول با خطا مواجه شد.
      </div>
    );
  }

  /* =========================================================
     UPDATE STATUS
  ========================================================= */

  const handleToggleStatus = async () => {
    await updateProduct.mutateAsync({
      productId: data.id,
      data: {
        is_active: !data.is_active,
      },
    });

    await refetch();
  };

  /* =========================================================
     UPDATE PRICE
  ========================================================= */

  const handleUpdatePrice = async () => {
    const numericPrice = Number(price.replace(/,/g, ""));

    if (!price.trim() || Number.isNaN(numericPrice)) {
      return;
    }

    await updateProduct.mutateAsync({
      productId: data.id,
      data: {
        price: numericPrice,
      },
    });

    await refetch();

    setPriceOpen(false);
  };

  /* =========================================================
     UPDATE DESCRIPTION
  ========================================================= */

  const handleUpdateDescription = async () => {
    await updateProduct.mutateAsync({
      productId: data.id,
      data: {
        description,
      },
    });

    await refetch();

    setDescriptionOpen(false);
  };

  /* =========================================================
     UPDATE WARRANTY
  ========================================================= */

  const handleWarrantyChange = async (warrantyId: string) => {
    setSelectedWarranty(warrantyId);

    await updateProduct.mutateAsync({
      productId: data.id,
      data: {
        warranty_id: Number(warrantyId),
      },
    });

    setWarrantyDuration(null);

    await refetch();
  };

  /* =========================================================
     UPDATE WARRANTY DURATION
  ========================================================= */

  const handleWarrantyDuration = async (duration: number) => {
    if (!selectedWarranty) {
      return;
    }

    await updateProduct.mutateAsync({
      productId: data.id,
      data: {
        warranty_id: Number(selectedWarranty),
        warranty_duration: duration,
      },
    });

    setWarrantyDuration(duration);

    setWarrantyDurationOpen(false);

    await refetch();
  };

  /* =========================================================
     PRODUCT IMAGES
  ========================================================= */

  const imageUrls: string[] = [
    ...(Array.isArray(data.image_url)
      ? data.image_url
          .map((item: { url?: string }) => item.url)
          .filter((url): url is string => Boolean(url))
      : []),

    ...(Array.isArray(data.images)
      ? data.images
          .map((item: any) => {
            if (typeof item === "string") {
              return item;
            }

            return item?.url ?? item?.image_url ?? null;
          })
          .filter((url): url is string => Boolean(url))
      : []),
  ];

  /* =========================================================
     PRODUCT VIDEOS
  ========================================================= */

  const videoUrls: string[] = Array.isArray(data.videos)
    ? data.videos
        .map((item: any) => {
          if (typeof item === "string") {
            return item;
          }

          return item?.url ?? item?.video_url ?? item?.link ?? null;
        })
        .filter((url): url is string => Boolean(url))
    : [];

  /* =========================================================
     STATISTICS DATA
  ========================================================= */

  const chart = statistics?.chart ?? [];

  const summary = statistics?.summary;

  const period = statistics?.period;

  let maxValue = 0;

  for (const item of chart) {
    const value = Number(item.value ?? 0);

    if (value > maxValue) {
      maxValue = value;
    }
  }

  const yMax = maxValue <= 5 ? 5 : Math.ceil(maxValue / 5) * 5;

  const yTicks: number[] = [];

  for (let value = 0; value <= yMax; value += yMax / 5) {
    yTicks.push(Math.round(value));
  }

  /* =========================================================
     X AXIS
  ========================================================= */

  const getXAxisTick = (props: any) => {
    const { x, y, payload, index } = props;

    let show = false;

    if (range === "24h") {
      show = index % 4 === 0;
    }

    if (range === "7d") {
      show = true;
    }

    if (range === "30d") {
      show = index % 5 === 0;
    }

    if (!show) {
      return null;
    }

    return (
      <text
        x={x}
        y={Number(y) + 18}
        textAnchor="middle"
        className="
          fill-gray-500
          text-[11px]
        "
      >
        {payload.value}
      </text>
    );
  };

  return (
    <>
      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {removeProductOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            justify-center
          "
        >
          <div
            className="
              relative
              h-full
              w-full
              max-w-[700px]
            "
          >
            <div
              className="
                absolute
                inset-0
                bg-black/60
              "
              onClick={() => setRemoveProductOpen(false)}
            />

            <div
              dir="rtl"
              className="
                absolute
                bottom-0
                left-0
                w-full
                rounded-t-2xl
                bg-white
                px-6
                py-5
              "
            >
              <button
                type="button"
                onClick={() => setRemoveProductOpen(false)}
                className="
                  absolute
                  right-5
                  top-5
                  text-gray-500
                "
              >
                <X className="h-5 w-5" />
              </button>

              <div
                className="
                  mb-3
                  flex
                  justify-center
                "
              >
                <Trash2 className="h-8 w-8" />
              </div>

              <h2
                className="
                  text-center
                  text-base
                  font-bold
                "
              >
                حذف محصول
              </h2>

              <p
                className="
                  mt-3
                  text-center
                  text-sm
                  text-gray-700
                "
              >
                آیا می‌خواهید محصول مدنظرتان را حذف کنید؟
              </p>

              <button
                type="button"
                onClick={() => deleteProduct.mutate({})}
                disabled={deleteProduct.isPending}
                className="
                  mt-5
                  flex
                  w-full
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-red-400
                  py-2.5
                  text-sm
                  font-bold
                  text-red-400
                  disabled:opacity-50
                "
              >
                {deleteProduct.isPending ? (
                  <Loader2
                    className="
                      h-5
                      w-5
                      animate-spin
                    "
                  />
                ) : (
                  "حذف محصول"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PRICE MODAL
      ===================================================== */}

      {priceOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            justify-center
          "
        >
          <div
            className="
              relative
              h-full
              w-full
              max-w-[700px]
            "
          >
            <div
              className="
                absolute
                inset-0
                bg-black/60
              "
              onClick={() => setPriceOpen(false)}
            />

            <div
              dir="rtl"
              className="
                absolute
                bottom-0
                left-0
                w-full
                rounded-t-2xl
                bg-white
                px-6
                py-5
              "
            >
              <button
                type="button"
                onClick={() => setPriceOpen(false)}
                className="
                  absolute
                  right-5
                  top-5
                  text-gray-500
                "
              >
                <X className="h-5 w-5" />
              </button>

              <h2
                className="
                  text-center
                  text-base
                  font-bold
                "
              >
                قیمت محصول
              </h2>

              <div
                className="
                  mt-4
                  flex
                  h-10
                  w-full
                  items-center
                  rounded
                  border
                "
              >
                <Input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="
                    h-full
                    rounded
                    border-none
                    text-center
                  "
                  dir="ltr"
                />

                <span
                  className="
                    flex
                    h-full
                    w-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-l
                    bg-[#f9fafb]
                    text-sm
                  "
                >
                  تومان
                </span>
              </div>

              <button
                type="button"
                onClick={handleUpdatePrice}
                disabled={updateProduct.isPending}
                className="
                  mt-5
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-blue-600
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  disabled:bg-gray-300
                "
              >
                {updateProduct.isPending ? (
                  <Loader2
                    className="
                      h-5
                      w-5
                      animate-spin
                    "
                  />
                ) : (
                  "ثبت"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DESCRIPTION MODAL
      ===================================================== */}

      {descriptionOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            justify-center
          "
        >
          <div
            className="
              relative
              h-full
              w-full
              max-w-[700px]
            "
          >
            <div
              className="
                absolute
                inset-0
                bg-black/60
              "
              onClick={() => setDescriptionOpen(false)}
            />

            <div
              dir="rtl"
              className="
                absolute
                bottom-0
                left-0
                w-full
                rounded-t-2xl
                bg-white
                px-6
                py-5
              "
            >
              <button
                type="button"
                onClick={() => setDescriptionOpen(false)}
                className="
                  absolute
                  right-5
                  top-5
                  text-gray-500
                "
              >
                <X className="h-5 w-5" />
              </button>

              <h2
                className="
                  text-center
                  text-base
                  font-bold
                "
              >
                توضیحات محصول
              </h2>

              <Textarea
                className="mt-4"
                maxLength={150}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="به عنوان مثال تاریخ انقضا تا بهمن 1404 است"
              />

              <div
                className="
                  mt-6
                  flex
                  items-center
                  gap-2
                "
              >
                <CheckCircle2
                  className="
                    h-5
                    w-5
                    shrink-0
                    text-green-500
                  "
                />

                <p
                  className="
                    text-sm
                    font-bold
                    text-[#808080]
                  "
                >
                  اگر کالای شما شرایط یا ویژگی خاصی دارد بنویسید
                </p>
              </div>

              <div
                className="
                  mt-6
                  flex
                  items-center
                  gap-2
                "
              >
                <CheckCircle2
                  className="
                    h-5
                    w-5
                    shrink-0
                    text-green-500
                  "
                />

                <p
                  className="
                    text-sm
                    font-bold
                    text-[#808080]
                  "
                >
                  از درج قیمت، آدرس و تلفن خودداری فرمائید
                </p>
              </div>

              <div
                className="
                  mt-6
                  flex
                  items-center
                  gap-2
                "
              >
                <CheckCircle2
                  className="
                    h-5
                    w-5
                    shrink-0
                    text-green-500
                  "
                />

                <p
                  className="
                    text-sm
                    font-bold
                    text-[#808080]
                  "
                >
                  از توضیحات کلی و عامیانه پرهیز کنید
                </p>
              </div>

              <button
                type="button"
                onClick={handleUpdateDescription}
                disabled={updateProduct.isPending}
                className="
                  mt-5
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-blue-600
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  disabled:bg-gray-300
                "
              >
                {updateProduct.isPending ? (
                  <Loader2
                    className="
                      h-5
                      w-5
                      animate-spin
                    "
                  />
                ) : (
                  "ثبت"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          WARRANTY DURATION MODAL
      ===================================================== */}

      {warrantyDurationOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            justify-center
          "
        >
          <div
            className="
              relative
              h-full
              w-full
              max-w-[700px]
            "
          >
            <div
              className="
                absolute
                inset-0
                bg-black/60
              "
              onClick={() => setWarrantyDurationOpen(false)}
            />

            <div
              dir="rtl"
              className="
                absolute
                bottom-0
                left-0
                w-full
                rounded-t-2xl
                bg-white
                px-6
                py-5
              "
            >
              <button
                type="button"
                onClick={() => setWarrantyDurationOpen(false)}
                className="
                  absolute
                  right-5
                  top-5
                  text-gray-500
                "
              >
                <X className="h-5 w-5" />
              </button>

              <h2
                className="
                  text-center
                  text-base
                  font-bold
                "
              >
                مدت زمان گارانتی
              </h2>

              <div
                className="
                  mt-6
                  grid
                  grid-cols-2
                  gap-3
                "
              >
                {WARRANTY_DURATIONS.map((duration) => (
                  <button
                    key={duration}
                    type="button"
                    disabled={updateProduct.isPending}
                    onClick={() => handleWarrantyDuration(duration)}
                    className={`
                        flex
                        h-12
                        items-center
                        justify-center
                        rounded-lg
                        border
                        text-sm
                        font-medium
                        ${
                          warrantyDuration === duration
                            ? "border-blue-600 bg-blue-50 text-blue-600"
                            : "border-gray-200 bg-white text-gray-700"
                        }
                      `}
                  >
                    {toPersianNumber(duration)} ماه
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          flex
          w-full
          items-center
          justify-between
          border-b
          px-4
          py-3
        "
      >
        <ArrowRight className="cursor-pointer" onClick={() => router.back()} />

        <h1
          className="
            text-xs
            font-bold
            text-[#333333]
          "
        >
          مدیریت محصول
        </h1>

        <Link target="_blank" href={`/p/${data.product_id}/${data.slug}`}>
          <ArrowUpLeftFromSquare size={20} />
        </Link>
      </div>

      {/* =====================================================
          PRODUCT IMAGES
      ===================================================== */}

      {imageUrls.length > 0 && (
        <div
          className="
            flex
            w-full
            items-center
            justify-center
            gap-3
            overflow-x-auto
            px-4
            py-6
          "
        >
          {imageUrls.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="
                  h-[140px]
                  w-[140px]
                  shrink-0
                  overflow-hidden
                  rounded-lg
                  border
                  bg-gray-50
                "
            >
              <img
                src={image}
                alt={`${data.name}-${index + 1}`}
                className="
                    h-full
                    w-full
                    object-cover
                  "
              />
            </div>
          ))}
        </div>
      )}

      {/* =====================================================
          STATUS
      ===================================================== */}

      <div
        className="
          flex
          w-full
          items-center
          justify-between
          border-b
          px-4
          py-5
        "
      >
        <div className="space-y-2">
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <span className="text-sm">
              {data.is_active ? "فعال" : "غیرفعال"}
            </span>

            <span
              className={`
                h-2.5
                w-2.5
                rounded-full
                ${data.is_active ? "bg-green-500" : "bg-red-500"}
              `}
            />
          </div>

          <p
            className="
              text-xs
              text-[#737373]
            "
          >
            اضافه شده از طریق محصولات موجود در ترب
          </p>
        </div>

        <div
          className="
            flex
            items-center
            gap-6
          "
        >
          <Trash2
            className="cursor-pointer"
            onClick={() => setRemoveProductOpen(true)}
          />

          <Switch
            checked={data.is_active}
            onCheckedChange={handleToggleStatus}
            dir="ltr"
          />
        </div>
      </div>

      {/* =====================================================
          PRODUCT FIELDS
      ===================================================== */}

      <div
        dir="rtl"
        className="
          space-y-6
          px-4
          py-4
        "
      >
        {/* NAME */}

        <div>
          <h1
            className="
              text-sm
              font-bold
              text-[#333333]
            "
          >
            عنوان محصول
          </h1>

          <Textarea
            disabled
            className="
              mt-2
              border
              border-[#ced4da]
              bg-[#f8fafc]
              text-[#1e293b]
            "
            value={data.name}
            readOnly
          />
        </div>

        {/* PRICE */}

        <div>
          <h1
            className="
              text-sm
              font-bold
              text-[#333333]
            "
          >
            قیمت
          </h1>

          <Input
            readOnly
            onClick={() => setPriceOpen(true)}
            className="
              mt-2
              cursor-pointer
              border
              border-[#ced4da]
              bg-[#f8fafc]
              px-4
              py-5
            "
            value={Number(data.price).toLocaleString("fa-IR")}
          />
        </div>

        {/* WARRANTY */}

        <div>
          <h1
            className="
              text-sm
              font-bold
              text-[#333333]
            "
          >
            وضعیت گارانتی
          </h1>

          <Select
            value={selectedWarranty}
            onValueChange={handleWarrantyChange}
            dir="rtl"
          >
            <SelectTrigger
              className="
                mt-2
                w-full
                py-5
              "
            >
              <SelectValue placeholder="انتخاب گارانتی" />
            </SelectTrigger>

            <SelectContent
              dir="rtl"
              className="
                w-[var(--radix-select-trigger-width)]
              "
            >
              <SelectGroup>
                {warranties.map((item: any) => (
                  <SelectItem
                    key={item.id}
                    value={String(item.id)}
                    className="py-3"
                  >
                    {item.title}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* WARRANTY DURATION */}

          <div className="mt-5">
            <h2
              className="
                text-sm
                font-bold
                text-[#333333]
              "
            >
              مدت زمان گارانتی
            </h2>

            <button
              type="button"
              disabled={!selectedWarranty}
              onClick={() => setWarrantyDurationOpen(true)}
              className={`
                mt-2
                flex
                w-full
                items-center
                justify-between
                rounded-md
                border
                px-4
                py-3
                text-sm
                ${
                  selectedWarranty
                    ? "border-[#ced4da] bg-[#f8fafc] text-[#1e293b]"
                    : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                }
              `}
            >
              <span>
                {warrantyDuration
                  ? `${toPersianNumber(warrantyDuration)} ماه`
                  : "انتخاب مدت گارانتی"}
              </span>

              {selectedWarranty && (
                <span
                  className="
                    text-xs
                    text-gray-400
                  "
                >
                  تغییر
                </span>
              )}
            </button>
          </div>
        </div>

        {/* DESCRIPTION */}

        <div>
          <h1
            className="
              text-sm
              font-bold
              text-[#333333]
            "
          >
            توضیحات محصول
          </h1>

          <Input
            readOnly
            onClick={() => setDescriptionOpen(true)}
            className="
              mt-2
              cursor-pointer
              border
              border-[#ced4da]
              px-4
              py-5
            "
            value={data.description ?? ""}
          />
        </div>

        {/* =====================================================
            INSTAGRAM VIDEO
        ===================================================== */}

        <div>
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <h1
              className="
                text-sm
                font-bold
                text-[#333333]
              "
            >
              لینک ویدئو از اینستاگرام
            </h1>

            <div
              className="
                flex
                items-center
                gap-0.5
              "
            >
              <BadgeInfo size={18} className="text-[#3468cc]" />

              <p
                className="
                  text-xs
                  text-[#3468cc]
                "
              >
                قوانین
              </p>
            </div>
          </div>

          <div
            className="
              relative
              flex
              items-center
            "
          >
            <Copy
              className="
                absolute
                right-2
                top-1/2
                z-10
                -translate-y-1/2
              "
              size={18}
            />

            <Input
              className="
                mt-2
                border
                border-[#ced4da]
                px-10
                py-5
              "
              placeholder="لینک ویدئو اینستاگرام"
            />
          </div>

          {videoUrls.length > 0 && (
            <div
              className="
                mt-3
                space-y-2
              "
            >
              {videoUrls.map((video, index) => (
                <a
                  key={`${video}-${index}`}
                  href={video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                      block
                      truncate
                      text-sm
                      text-blue-600
                    "
                >
                  {video}
                </a>
              ))}
            </div>
          )}

          <div
            className="
              mt-3
              flex
              w-full
              items-center
              justify-between
            "
          >
            <p
              className="
                text-sm
                text-[#333333]
              "
            >
              لینک ویدیو محصول را ندارید؟
            </p>

            <div
              className="
                flex
                items-center
                gap-1
              "
            >
              <Upload size={18} className="text-[#3468CC]" />

              <p
                className="
                  text-sm
                  text-[#3468CC]
                "
              >
                دریافت از گالری
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            PRODUCT PHOTOS
        ===================================================== */}

        <div>
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <h1
              className="
                text-sm
                font-bold
                text-[#333333]
              "
            >
              عکس محصول
            </h1>

            <div
              className="
                flex
                items-center
                gap-0.5
              "
            >
              <BadgeInfo size={18} className="text-[#3468cc]" />

              <p
                className="
                  text-xs
                  text-[#3468cc]
                "
              >
                قوانین
              </p>
            </div>
          </div>

          <div
            className="
              mt-6
              flex
              gap-3
              overflow-x-auto
              pb-2
            "
          >
            <div
              className="
                flex
                h-[100px]
                w-[100px]
                shrink-0
                flex-col
                items-center
                justify-center
                space-y-2
                rounded-lg
                border-2
                border-dashed
              "
            >
              <Camera />

              <p
                className="
                  text-xs
                  font-bold
                  text-[#333]
                "
              >
                افزودن عکس
              </p>
            </div>

            {imageUrls.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="
                    h-[100px]
                    w-[100px]
                    shrink-0
                    overflow-hidden
                    rounded-lg
                    border
                  "
              >
                <img
                  src={image}
                  alt={data.name}
                  className="
                      h-full
                      w-full
                      object-cover
                    "
                />
              </div>
            ))}
          </div>

          <div
            className="
              mt-6
              flex
              items-center
              gap-2
            "
          >
            <CheckCircle2
              className="
                h-5
                w-5
                shrink-0
                text-green-500
              "
            />

            <p
              className="
                text-sm
                font-bold
                text-[#808080]
              "
            >
              توصیه ترب انتخاب عکس‌هایی با ابعاد مربعی است.
            </p>
          </div>
        </div>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div
          className="
            mt-8
            border-t
            border-gray-200
            pt-6
          "
        >
          {/* TABS + PERIOD */}

          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <div
              className="
                flex
                items-center
                gap-5
                text-sm
                font-medium
              "
            >
              {tabs.map((tab) => {
                const isActive = range === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setRange(tab.value)}
                    className={`
                      relative
                      pb-3
                      ${isActive ? "text-blue-600" : "text-gray-900"}
                    `}
                  >
                    {tab.label}

                    {isActive && (
                      <span
                        className="
                          absolute
                          bottom-0
                          right-0
                          left-0
                          h-[2px]
                          rounded-full
                          bg-blue-600
                        "
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <span
              className="
                text-sm
                font-medium
                text-gray-900
              "
            >
              {period?.label ?? ""}
            </span>
          </div>

          {/* CHART */}

          <div
            className="
              relative
              mt-6
              h-[280px]
              w-full
            "
          >
            {statisticsLoading || statisticsFetching ? (
              <div
                className="
                  absolute
                  inset-0
                  z-10
                  flex
                  items-center
                  justify-center
                  bg-white/70
                "
              >
                <Loader2
                  className="
                    h-6
                    w-6
                    animate-spin
                    text-blue-600
                  "
                />
              </div>
            ) : null}

            {statisticsError ? (
              <div
                className="
                  flex
                  h-full
                  items-center
                  justify-center
                  text-sm
                  text-red-500
                "
              >
                دریافت آمار با خطا مواجه شد.
              </div>
            ) : chart.length === 0 ? (
              <div
                className="
                  flex
                  h-full
                  items-center
                  justify-center
                  text-sm
                  text-gray-400
                "
              >
                آماری برای نمایش وجود ندارد.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chart}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 25,
                  }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    tick={getXAxisTick}
                  />

                  <YAxis
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    domain={[0, yMax]}
                    ticks={yTicks}
                    tickFormatter={(value) => toPersianNumber(Number(value))}
                    width={35}
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <Tooltip
                    cursor={{
                      fill: "rgba(0,0,0,0.03)",
                    }}
                    formatter={(value) => [
                      toPersianNumber(Number(value)),
                      "کلیک",
                    ]}
                    labelFormatter={(label) => `بازه: ${label}`}
                  />

                  <Bar
                    dataKey="value"
                    name="کلیک"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* SUMMARY */}

          {summary && (
            <div
              className="
                mt-6
               flex items-center justify-center
              "
            >
              <div
                className="
                  text-center
                "
              >
                <p
                  className="
                    text-xs
                    text-gray-500
                  "
                >
                  کل کلیک‌ها
                </p>

                <p
                  className="
                    mt-2
                    text-lg
                    font-bold
                    text-gray-900
                  "
                >
                  {toPersianNumber(Number(summary.total_clicks ?? 0))}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
