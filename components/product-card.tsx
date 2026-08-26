"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight, X, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
import { usePostUserFavorite, useGetProductAlert, usePostUserAlert, useDeleteUserAlert } from "@/lib/apis";
import { toast } from "sonner";

import "swiper/css";

interface ProductCardProps {
  product: any;
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [alertPrice, setAlertPrice] = useState("");
  const [hasExistingAlert, setHasExistingAlert] = useState(false);
  const [existingAlertData, setExistingAlertData] = useState<any>(null);
  const [hasExistingAvailabilityAlert, setHasExistingAvailabilityAlert] = useState(false);

  const favoriteMutation = usePostUserFavorite();

  const { refetch: refetchAlert } = useGetProductAlert(
    product.id,
  );

  const createAlertMutation = usePostUserAlert();
  const deleteAlertMutation = useDeleteUserAlert();

  const images = product.productImages || [];
  const badges = product.badges || [];

  const checkExistingAlert = async () => {
    try {
      const result = await refetchAlert();
      if (result.data) {
        setExistingAlertData(result.data);
        setHasExistingAlert(true);
        setHasExistingAvailabilityAlert(result.data.watch_availability === true);
        if (result.data.watch_price) {
          setAlertPrice(result.data.watch_price.toString());
        }
      } else {
        setHasExistingAlert(false);
        setExistingAlertData(null);
        setHasExistingAvailabilityAlert(false);
        setAlertPrice("");
      }
    } catch (error) {
      console.error("Error checking alert:", error);
      setHasExistingAlert(false);
      setExistingAlertData(null);
      setHasExistingAvailabilityAlert(false);
    }
  };

  const toggleFavorite = () => {
    favoriteMutation.mutate({
      product_id: product.id,
    });
  };

  const openAlertModal = async () => {
    if (product.is_available === false) {
      await checkExistingAlert();
      setShowAvailabilityModal(true);
    } else {
      setShowAlertModal(true);
      await checkExistingAlert();
    }
  };

  const closeAlertModal = () => {
    setShowAlertModal(false);
    setAlertPrice("");
    setHasExistingAlert(false);
    setExistingAlertData(null);
  };

  const closeAvailabilityModal = () => {
    setShowAvailabilityModal(false);
    setHasExistingAvailabilityAlert(false);
  };

  const handleAlertSubmit = async () => {
    if (!alertPrice.trim()) return;

    const price = Number(alertPrice.replace(/,/g, ""));
    if (isNaN(price) || price <= 0) {
      toast.error("لطفاً قیمت معتبر وارد کنید");
      return;
    }

    try {
      await createAlertMutation.mutateAsync({
        product_id: product.id,
        watch_price: price,
      });
      closeAlertModal();
    } catch (error: any) {
      const message = error?.response?.data?.message || "خطا در ثبت اعلان قیمت";
      toast.error(message);
    }
  };

  const handleDeleteAlert = async () => {
    if (!existingAlertData) return;

    try {
      await deleteAlertMutation.mutateAsync({
        product_id: product.id,
      });
      setHasExistingAlert(false);
      setExistingAlertData(null);
      setAlertPrice("");
      closeAlertModal();
    } catch (error: any) {
      const message = error?.response?.data?.message || "خطا در حذف اعلان قیمت";
      toast.error(message);
    }
  };

  const handleAvailabilityConfirm = async () => {
    if (hasExistingAvailabilityAlert) {
      closeAvailabilityModal();
      return;
    }

    try {
      await createAlertMutation.mutateAsync({
        product_id: product.id,
        watch_availability: true,
      });
      toast.success("اعلان موجودی با موفقیت ثبت شد");
      closeAvailabilityModal();
    } catch (error: any) {
      const message = error?.response?.data?.message || "خطا در ثبت اعلان موجودی";
      toast.error(message);
    }
  };

  const handleDeleteAvailabilityAlert = async () => {
    if (!hasExistingAvailabilityAlert) return;

    try {
      await deleteAlertMutation.mutateAsync({
        product_id: product.id,
      });
      toast.success("اعلان موجودی با موفقیت حذف شد");
      closeAvailabilityModal();
    } catch (error: any) {
      const message = error?.response?.data?.message || "خطا در حذف اعلان موجودی";
      toast.error(message);
    }
  };

  const handleCancel = () => {
    closeAvailabilityModal();
  };

  return (
    <>
      {/* ========================= */}
      {/* Product Card */}
      {/* ========================= */}

      <Link key={product.id} href={`/p/${product.id}/${product.slug}`}>
        <div
          className="
            group/card
            w-52
            rounded-lg
            bg-white
            px-2.5
            py-2.5
            dark:bg-[#212b36]
          "
        >
          {/* ========================= */}
          {/* Image */}
          {/* ========================= */}

          <div className="group/image relative">
            {images.length > 1 && (
              <div
                className="
                  absolute
                  right-0
                  top-0
                  z-40
                  flex
                  items-center
                  gap-1
                  rounded-sm
                  bg-[#64748b]
                  px-1
                  py-0.5
                  text-xs
                  text-white
                  dark:bg-[#94a3b8]
                "
              >
                <img
                  className="h-3 w-3"
                  src="https://assets.torob.com/public/main/images/camera.svg"
                  alt=""
                />
                {images.length}
              </div>
            )}

            {product.is_authentic === true && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="
                      absolute
                      right-0
                      top-10
                      z-40
                      flex
                      items-center
                      gap-1
                      rounded-l-lg
                      bg-[#eff6ff]
                      px-1
                      py-1
                      shadow-xs
                      shadow-blue-700
                    "
                  >
                    <img
                      className="h-4 w-4"
                      src="https://assets.torob.com/public/main/images/authenticity_badge.svg"
                      alt=""
                    />
                    <span className="text-xs font-bold text-[#1e40af]">
                      اصل
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  hideArrow
                  side="bottom"
                  className="
                    mt-2
                    mr-36
                    bg-[#333]
                    text-xs
                    font-bold
                    text-white
                  "
                >
                  تایید اصالت محصول توسط فروشندگان
                </TooltipContent>
              </Tooltip>
            )}

            {images.length > 1 ? (
              <Swiper
                modules={[Navigation]}
                loop
                onBeforeInit={(swiper) => {
                  // @ts-ignore
                  swiper.params.navigation.prevEl = prevRef.current;
                  // @ts-ignore
                  swiper.params.navigation.nextEl = nextRef.current;
                }}
              >
                {images.map((image: any, index: number) => (
                  <SwiperSlide key={index}>
                    <div className="flex justify-center">
                      <img
                        src={image.url}
                        className="
                          h-44
                          w-44
                          rounded-lg
                          object-contain
                        "
                        alt=""
                      />
                    </div>
                  </SwiperSlide>
                ))}
                <button
                  ref={prevRef}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="
                    absolute
                    bottom-1
                    left-8
                    z-50
                    hidden
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-r
                    bg-[#33333380]
                    text-white
                    hover:bg-[#1E293B]
                    group-hover/image:flex
                  "
                >
                  <ChevronRight size={17} />
                </button>
                <button
                  ref={nextRef}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="
                    absolute
                    bottom-1
                    left-2
                    z-50
                    hidden
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-l
                    bg-[#33333380]
                    text-white
                    hover:bg-[#1E293B]
                    group-hover/image:flex
                  "
                >
                  <ChevronLeft size={17} />
                </button>
              </Swiper>
            ) : (
              <div className="flex justify-center">
                <img
                  src={images[0]?.url}
                  className="
                    h-44
                    w-44
                    rounded-lg
                    object-contain
                  "
                  alt=""
                />
              </div>
            )}

            <div
              className="
                group/similar
                absolute
                bottom-1
                right-2
                z-50
                hidden
                group-hover/card:flex
              "
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded
                  bg-[#33333380]
                  text-white
                  hover:bg-[#1E293B]
                "
              >
                <img
                  className="h-5 w-5"
                  src="https://assets.torob.com/public/main/images/image_w.svg"
                  alt=""
                />
              </button>
            </div>
          </div>

          {/* ========================= */}
          {/* Product Name */}
          {/* ========================= */}

          <h1
            className="
              mt-4
              line-clamp-2
              text-[15px]
              text-[#1e293b]
              dark:text-[#f1f5f9]
            "
          >
            {product.name}
          </h1>

          {/* ========================= */}
          {/* Badges */}
          {/* ========================= */}

          {badges.length > 0 && (
            <div className="mt-4 flex items-center">
              {badges.map((badge: any, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="
                    h-6
                    rounded-md
                    border-none
                    bg-[#f1f5f9]
                    text-[#1e293b]
                    dark:bg-[#15202b]
                    dark:text-[#f1f5f9]
                  "
                >
                  {badge.text}
                </Badge>
              ))}
            </div>
          )}

          {/* ========================= */}
          {/* Price */}
          {/* ========================= */}

          <p
            className="
              mt-4
              text-sm
              font-bold
              text-[#1e293b]
              dark:text-[#f1f5f9]
            "
          >
            {product.shop_price}
          </p>

          {/* ========================= */}
          {/* Bottom */}
          {/* ========================= */}

          <div className="mt-6 flex items-center justify-between">
            <p
              className="
                whitespace-nowrap
                text-[12px]
                text-[#64748b]
                dark:text-[#94a3b8]
              "
            >
              {product.shop_text}
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite();
                }}
                disabled={favoriteMutation.isPending}
                className="cursor-pointer"
              >
                <div
                  className={`
                    h-4
                    w-4
                    ${product.is_favorite ? "like_fill" : "like"}
                  `}
                />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openAlertModal();
                }}
                className="cursor-pointer"
              >
                <div
                  className={`
                    h-4
                    w-4
                    ${product.is_alert ? "bell_fill" : "bell"}
                  `}
                />
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* ========================= */}
      {/* Alert Modal (قیمت دلخواه) */}
      {/* ========================= */}

      {showAlertModal && (
        <div
          className="
            fixed
            inset-0
            z-[999]
            flex
            items-center
            justify-center
            bg-black/60
            px-4
          "
          onMouseDown={closeAlertModal}
        >
          <div
            className="
              relative
              w-full
              max-w-[540px]
              rounded-xl
              bg-white
              px-7
              pb-7
              pt-6
              shadow-2xl
              dark:bg-[#212b36]
            "
            onMouseDown={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <button
              type="button"
              onClick={closeAlertModal}
              className="
                absolute
                left-5
                top-5
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                text-gray-700
                transition
                hover:bg-gray-100
                dark:text-white
                dark:hover:bg-gray-800
              "
              aria-label="بستن"
            >
              <X size={22} />
            </button>

            <div className="pt-1 text-center">
              <h2
                className="
                  text-lg
                  font-bold
                  text-[#1e293b]
                  dark:text-white
                "
              >
                {hasExistingAlert ? "ویرایش اعلان قیمت" : "اطلاع از قیمت دلخواه"}
              </h2>
              <p
                className="
                  mt-4
                  text-sm
                  leading-7
                  text-[#64748b]
                  dark:text-slate-400
                "
              >
                {hasExistingAlert
                  ? "قیمت دلخواه خود را ویرایش کنید"
                  : "قیمت دلخواهتان را ثبت کنید تا شما را مطلع کنیم"}
              </p>
            </div>

            <div className="mt-7">
              <div
                className="
                  flex
                  h-14
                  items-center
                  overflow-hidden
                  rounded-lg
                  border
                  border-red-400
                  bg-white
                  dark:bg-[#212b36]
                "
              >
                <input
                  type="text"
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                  placeholder="تومان"
                  className="
                    h-full
                    w-full
                    border-0
                    px-4
                    text-sm
                    text-[#1e293b]
                    outline-none
                    placeholder:text-gray-400
                    dark:bg-[#212b36]
                    dark:text-white
                  "
                  dir="rtl"
                />
                <span
                  className="
                    shrink-0
                    px-4
                    text-sm
                    text-gray-500
                    dark:text-gray-400
                  "
                >
                  تومان
                </span>
              </div>
              <p
                className="
                  mt-2
                  text-right
                  text-xs
                  text-red-500
                "
              >
                قیمت فعلی: {product.shop_price}
              </p>
            </div>

            <div className="mt-7 flex gap-3">
              {hasExistingAlert ? (
                <>
                  <button
                    type="button"
                    onClick={handleAlertSubmit}
                    disabled={!alertPrice.trim() || createAlertMutation.isPending}
                    className="
                      flex-1
                      h-14
                      rounded-lg
                      bg-[#dc3045]
                      text-base
                      font-bold
                      text-white
                      transition
                      hover:bg-[#c92a3d]
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {createAlertMutation.isPending ? "در حال ثبت..." : "ثبت"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAlert}
                    disabled={deleteAlertMutation.isPending}
                    className="
                      flex-1
                      h-14
                      rounded-lg
                      bg-red-500
                      text-base
                      font-bold
                      text-white
                      transition
                      hover:bg-red-600
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                  >
                    <Trash2 className="h-5 w-5" />
                    {deleteAlertMutation.isPending ? "در حال حذف..." : "حذف"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleAlertSubmit}
                  disabled={!alertPrice.trim() || createAlertMutation.isPending}
                  className="
                    w-full
                    h-14
                    rounded-lg
                    bg-[#dc3045]
                    text-base
                    font-bold
                    text-white
                    transition
                    hover:bg-[#c92a3d]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {createAlertMutation.isPending ? "در حال ثبت..." : "ثبت"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================= */}
      {/* Availability Modal (اطلاع از موجودی) */}
      {/* ========================= */}

      {showAvailabilityModal && (
        <div
          className="
            fixed
            inset-0
            z-[999]
            flex
            items-center
            justify-center
            bg-black/60
            px-4
          "
          onMouseDown={closeAvailabilityModal}
        >
          <div
            className="
              relative
              w-full
              max-w-[540px]
              rounded-xl
              bg-white
              px-7
              pb-7
              pt-6
              shadow-2xl
              dark:bg-[#212b36]
            "
            onMouseDown={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <button
              type="button"
              onClick={closeAvailabilityModal}
              className="
                absolute
                left-5
                top-5
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                text-gray-700
                transition
                hover:bg-gray-100
                dark:text-white
                dark:hover:bg-gray-800
              "
              aria-label="بستن"
            >
              <X size={22} />
            </button>

            <div className="pt-1 text-center">
              <h2
                className="
                  text-lg
                  font-bold
                  text-[#1e293b]
                  dark:text-white
                "
              >
                {hasExistingAvailabilityAlert ? "حذف اعلان موجودی" : "اطلاع از موجودی"}
              </h2>
              <p
                className="
                  mt-4
                  text-sm
                  leading-7
                  text-[#64748b]
                  dark:text-slate-400
                "
              >
                {hasExistingAvailabilityAlert
                  ? "شما قبلاً برای این محصول اعلان موجودی ثبت کرده‌اید. آیا می‌خواهید آن را حذف کنید؟"
                  : "می‌خواهید موجود شدن محصول را از طریق اعلان (نوتیفیکیشن) به شما اطلاع دهیم؟"}
              </p>
            </div>

            <div className="mt-7 flex gap-3">
              {hasExistingAvailabilityAlert ? (
                <>
                  <button
                    type="button"
                    onClick={handleDeleteAvailabilityAlert}
                    disabled={deleteAlertMutation.isPending}
                    className="
                      flex-1
                      h-14
                      rounded-lg
                      bg-red-500
                      text-base
                      font-bold
                      text-white
                      transition
                      hover:bg-red-600
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                  >
                    <Trash2 className="h-5 w-5" />
                    {deleteAlertMutation.isPending ? "در حال حذف..." : "حذف"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="
                      flex-1
                      h-14
                      rounded-lg
                      bg-gray-200
                      text-base
                      font-bold
                      text-gray-700
                      transition
                      hover:bg-gray-300
                      dark:bg-gray-700
                      dark:text-gray-300
                      dark:hover:bg-gray-600
                    "
                  >
                    انصراف
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleAvailabilityConfirm}
                    disabled={createAlertMutation.isPending}
                    className="
                      flex-1
                      h-14
                      rounded-lg
                      bg-[#dc3045]
                      text-base
                      font-bold
                      text-white
                      transition
                      hover:bg-[#c92a3d]
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {createAlertMutation.isPending ? "در حال ثبت..." : "بله، اطلاع بده"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="
                      flex-1
                      h-14
                      rounded-lg
                      bg-gray-200
                      text-base
                      font-bold
                      text-gray-700
                      transition
                      hover:bg-gray-300
                      dark:bg-gray-700
                      dark:text-gray-300
                      dark:hover:bg-gray-600
                    "
                  >
                    خیر
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}