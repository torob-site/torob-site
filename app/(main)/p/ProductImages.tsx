"use client";

import { useCallback, useMemo, useState } from "react";
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react";

interface ApiProductImage {
  id: number;
  url: string;
}

interface ProductImagesProps {
  productImages: ApiProductImage[];
  productName?: string;
}

interface ProductImage {
  id: number;
  src: string;
  alt: string;
}

export default function ProductImages({
  productImages,
  productName = "تصویر محصول",
}: ProductImagesProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  /*
   * تبدیل خروجی API به ساختار مورد نیاز کامپوننت
   */
  const images = useMemo<ProductImage[]>(
    () =>
      productImages.map((image) => ({
        id: image.id,
        src: image.url,
        alt: productName,
      })),
    [productImages, productName],
  );

  /*
   * اگر عکس وجود نداشته باشد
   */
  if (!images.length) {
    return (
      <div className="flex items-center justify-center">
        <div className="flex h-56 w-48 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
          تصویری موجود نیست
        </div>
      </div>
    );
  }

  /*
   * فقط سه thumbnail اول
   */
  const visibleThumbnails = images.slice(0, 3);

  /*
   * تعداد عکس‌های باقی‌مانده
   */
  const remainingCount = Math.max(images.length - visibleThumbnails.length, 0);

  const activeImage = images[activeIndex] ?? images[0];

  /*
   * باز کردن گالری
   */
  const openGallery = useCallback((startIndex: number) => {
    setGalleryIndex(startIndex);
    setIsGalleryOpen(true);

    document.body.style.overflow = "hidden";
  }, []);

  /*
   * بستن گالری
   */
  const closeGallery = useCallback(() => {
    setIsGalleryOpen(false);

    document.body.style.overflow = "";
  }, []);

  /*
   * عکس بعدی
   */
  const goToNext = useCallback(() => {
    setGalleryIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  /*
   * عکس قبلی
   */
  const goToPrev = useCallback(() => {
    setGalleryIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  /*
   * تغییر thumbnail
   */
  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  /*
   * دکمه +N
   */
  const handleMoreClick = () => {
    openGallery(3);
  };

  /*
   * تغییر عکس داخل گالری
   */
  const handleGalleryImageChange = (index: number) => {
    setGalleryIndex(index);
    setActiveIndex(index);
  };

  return (
    <>
      {/* ================================================================ */}
      {/* Product Images                                                    */}
      {/* ================================================================ */}

      <div className="flex items-start gap-2">
        {/* ============================================================ */}
        {/* Thumbnails                                                    */}
        {/* ============================================================ */}

        <div className="flex shrink-0 flex-col items-center gap-1.5">
          {visibleThumbnails.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => handleThumbnailClick(index)}
              className={`
                  h-11
                  w-11
                  cursor-pointer
                  overflow-hidden
                  rounded-lg
                  border
                  p-0.5
                  transition

                  ${
                    activeIndex === index
                      ? "border-blue-500"
                      : "border-gray-600 hover:border-gray-500"
                  }
                `}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full rounded object-cover"
                onError={(event) => {
                  const target = event.currentTarget;

                  target.style.display = "none";

                  const parent = target.parentElement;

                  if (parent) {
                    parent.classList.add(
                      "bg-gray-700",
                      "flex",
                      "items-center",
                      "justify-center",
                    );

                    parent.innerHTML = `
                        <span class="text-[8px] text-gray-400">
                          ${index + 1}
                        </span>
                      `;
                  }
                }}
              />
            </button>
          ))}

          {/* ======================================================== */}
          {/* More                                                       */}
          {/* ======================================================== */}

          {remainingCount > 0 && (
            <button
              type="button"
              onClick={handleMoreClick}
              className="
                flex
                h-11
                w-11
                cursor-pointer
                items-center
                justify-center
                rounded-lg
                border
                border-gray-600
                text-xs
                text-gray-400
                transition
                hover:border-gray-500
                hover:text-white
              "
            >
              +{remainingCount}
            </button>
          )}
        </div>

        {/* ============================================================ */}
        {/* Main Image                                                    */}
        {/* ============================================================ */}

        <div
          className="
            relative
            flex
            flex-1
            cursor-pointer
            items-center
            justify-center
          "
          onClick={() => openGallery(activeIndex)}
        >
          <div className="relative h-56 w-48">
            <img
              src={activeImage.src}
              alt={activeImage.alt}
              className="
                h-full
                w-full
                object-cover
                object-center
              "
              onError={(event) => {
                const target = event.currentTarget;

                target.style.display = "none";

                const parent = target.parentElement;

                if (parent) {
                  parent.classList.add(
                    "flex",
                    "items-center",
                    "justify-center",
                  );

                  parent.innerHTML = `
                    <span class="text-xs text-gray-500">
                      تصویری موجود نیست
                    </span>
                  `;
                }
              }}
            />

            {/* Camera */}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                openGallery(activeIndex);
              }}
              className="
                absolute
                bottom-2
                right-2
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-md
                bg-black/60
                transition
                hover:bg-black/80
              "
            >
              <Camera className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* Fullscreen Gallery                                                */}
      {/* ================================================================ */}

      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
          {/* ============================================================ */}
          {/* Header                                                       */}
          {/* ============================================================ */}

          <div className="flex items-center justify-between p-4">
            <div className="text-sm text-gray-400">
              {(galleryIndex + 1).toLocaleString("fa-IR")} /{" "}
              {images.length.toLocaleString("fa-IR")}
            </div>

            <button
              type="button"
              onClick={closeGallery}
              className="
                rounded-lg
                p-2
                text-gray-400
                transition
                hover:bg-gray-800
                hover:text-white
              "
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* ============================================================ */}
          {/* Main Gallery Image                                            */}
          {/* ============================================================ */}

          <div
            className="
              relative
              flex
              flex-1
              items-center
              justify-center
              px-20
            "
          >
            {/* Previous */}

            {images.length > 1 && (
              <button
                type="button"
                onClick={goToPrev}
                className="
                  absolute
                  left-6
                  rounded-full
                  bg-gray-800/80
                  p-3
                  text-white
                  transition
                  hover:bg-gray-700
                "
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Image */}

            <div
              className="
                flex
                h-full
                max-h-[70vh]
                w-full
                max-w-2xl
                items-center
                justify-center
              "
            >
              <img
                src={images[galleryIndex]?.src}
                alt={images[galleryIndex]?.alt}
                className="
                  max-h-full
                  max-w-full
                  object-contain
                "
                onError={(event) => {
                  const target = event.currentTarget;

                  target.style.display = "none";
                }}
              />
            </div>

            {/* Next */}

            {images.length > 1 && (
              <button
                type="button"
                onClick={goToNext}
                className="
                  absolute
                  right-6
                  rounded-full
                  bg-gray-800/80
                  p-3
                  text-white
                  transition
                  hover:bg-gray-700
                "
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* ============================================================ */}
          {/* Gallery Thumbnails                                            */}
          {/* ============================================================ */}

          <div className="flex justify-center gap-2 overflow-x-auto p-4">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => handleGalleryImageChange(index)}
                className={`
                  h-16
                  w-16
                  shrink-0
                  overflow-hidden
                  rounded-lg
                  border-2
                  transition

                  ${
                    galleryIndex === index
                      ? "border-blue-500"
                      : "border-gray-600 hover:border-gray-400"
                  }
                `}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
