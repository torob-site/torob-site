"use client";

import { useState, useCallback } from "react";
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImage {
  id: number;
  src: string;
  alt: string;
}

const productImages: ProductImage[] = [
  {
    id: 1,
    src: "https://image.torob.com/base/images/OQ/VS/OQVSCl6l72I6CEVv.webp",
    alt: "گوشی سامسونگ S26 Ultra - مشکی",
  },
  {
    id: 2,
    src: "https://image.torob.com/base/images/mV/15/mV15zgXvnOCBoSVs.webp",
    alt: "گوشی سامسونگ S26 Ultra - بنفش",
  },
  {
    id: 3,
    src: "https://image.torob.com/base/images/Ki/LC/KiLC4USrByg9LXUV.webp",
    alt: "گوشی سامسونگ S26 Ultra - صورتی",
  },
  {
    id: 4,
    src: "https://image.torob.com/base/images/Ip/XM/IpXMKTkjUBWrRnVY.webp",
    alt: "گوشی سامسونگ S26 Ultra - طلایی",
  },
];

const visibleThumbnails = productImages.slice(0, 3);
const remainingCount = productImages.length - visibleThumbnails.length;

export default function ProductImages() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const activeImage = productImages[activeIndex];

  const openGallery = useCallback((startIndex: number) => {
    setGalleryIndex(startIndex);
    setIsGalleryOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeGallery = useCallback(() => {
    setIsGalleryOpen(false);
    document.body.style.overflow = "";
  }, []);

  const goToNext = useCallback(() => {
    setGalleryIndex((prev) => (prev + 1) % productImages.length);
  }, []);

  const goToPrev = useCallback(() => {
    setGalleryIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  }, []);

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  const handleMoreClick = () => {
    openGallery(3);
  };

  const handleGalleryImageChange = (index: number) => {
    setGalleryIndex(index);
    setActiveIndex(index);
  };

  return (
    <>
      {/* Product Images Section - Thumbnails Left, Main Image Right */}
      <div className="flex items-start gap-2">
        {/* Thumbnails - Left Side (flex-col) */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          {visibleThumbnails.map((thumb, i) => (
            <button
              key={thumb.id}
              onClick={() => handleThumbnailClick(i)}
              className={`w-11 h-11 rounded-lg border p-0.5 cursor-pointer transition overflow-hidden ${
                activeIndex === i
                  ? "border-blue-500"
                  : "border-gray-600 hover:border-gray-500"
              }`}
            >
              <img
                src={thumb.src}
                alt={thumb.alt}
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    const placeholder = document.createElement("div");
                    placeholder.className = "w-full h-full bg-gray-700 rounded flex items-center justify-center";
                    placeholder.innerHTML = `<span class="text-[8px] text-gray-400">${i + 1}</span>`;
                    parent.appendChild(placeholder);
                  }
                }}
              />
            </button>
          ))}

          {/* More button */}
          {remainingCount > 0 && (
            <button
              onClick={handleMoreClick}
              className="w-11 h-11 rounded-lg border border-gray-600 flex items-center justify-center cursor-pointer hover:border-gray-500 text-xs text-gray-400 hover:text-white transition"
            >
              +{remainingCount}
            </button>
          )}
        </div>

        {/* Main Image - Right Side */}
        <div
          className="flex-1 flex items-center justify-center cursor-pointer relative"
          onClick={() => openGallery(activeIndex)}
        >
          <div className="w-48 h-56 relative">
            <img
              src={activeImage.src}
              alt={activeImage.alt}
              className="w-full h-full object-center object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  const placeholder = document.createElement("div");
                  placeholder.className = "w-full h-full flex items-center justify-center";
                  placeholder.innerHTML = `<span class="text-gray-500 text-xs">${activeImage.alt}</span>`;
                  parent.appendChild(placeholder);
                }
              }}
            />
            <button
              className="absolute bottom-2 right-2 w-7 h-7 bg-black/60 rounded-md flex items-center justify-center hover:bg-black/80 transition"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Gallery Slider */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <div className="text-sm text-gray-400">
              {galleryIndex + 1} / {productImages.length}
            </div>
            <button
              onClick={closeGallery}
              className="p-2 rounded-lg hover:bg-gray-800 transition text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Image Area */}
          <div className="flex-1 flex items-center justify-center relative px-20">
            {/* Prev button */}
            <button
              onClick={goToPrev}
              className="absolute left-6 p-3 rounded-full bg-gray-800/80 hover:bg-gray-700 transition text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Image */}
            <div className="max-w-2xl max-h-[70vh] w-full h-full flex items-center justify-center">
              <img
                src={productImages[galleryIndex].src}
                alt={productImages[galleryIndex].alt}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    const placeholder = document.createElement("div");
                    placeholder.className = "w-80 h-96 flex items-center justify-center";
                    placeholder.innerHTML = `<span class="text-gray-400">${productImages[galleryIndex].alt}</span>`;
                    parent.appendChild(placeholder);
                  }
                }}
              />
            </div>

            {/* Next button */}
            <button
              onClick={goToNext}
              className="absolute right-6 p-3 rounded-full bg-gray-800/80 hover:bg-gray-700 transition text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Thumbnails strip at bottom */}
          <div className="p-4 flex justify-center gap-2 overflow-x-auto">
            {productImages.map((img, i) => (
              <button
                key={img.id}
                onClick={() => handleGalleryImageChange(i)}
                className={`w-16 h-16 rounded-lg border-2 overflow-hidden shrink-0 transition ${
                  galleryIndex === i
                    ? "border-blue-500"
                    : "border-gray-600 hover:border-gray-400"
                }`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      const placeholder = document.createElement("div");
                      placeholder.className = "w-full h-full bg-gray-700 flex items-center justify-center";
                      placeholder.innerHTML = `<span class="text-[10px] text-gray-400">${i + 1}</span>`;
                      parent.appendChild(placeholder);
                    }
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}