"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Camera,
  ChevronRight,
  CircleHelp,
  Mic,
  Star,
  X,
  Search,
  Store,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  useGetAutoComplete,
  usePostfindMergeCandidates,
  usePostCreateOffer,
  useGetSuggestCategory,
} from "@/lib/apis";

export default function AddProductPage() {
  const router = useRouter();

  // =====================================================
  // STATE
  // =====================================================

  const [title, setTitle] = useState("");

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [showSuggestions, setShowSuggestions] = useState(false);

  const [showProductModal, setShowProductModal] = useState(false);

  const [showMergeList, setShowMergeList] = useState(false);

  const [mergeCandidates, setMergeCandidates] = useState<any[]>([]);

  const [selectedMergeProduct, setSelectedMergeProduct] = useState<any | null>(
    null,
  );

  const [mergeDetailsMode, setMergeDetailsMode] = useState(false);

  const [price, setPrice] = useState("");

  const [description, setDescription] = useState("");

  // =====================================================
  // AUTO COMPLETE
  // =====================================================

  const { data: autoCompleteData, isLoading: isAutoCompleteLoading } =
    useGetAutoComplete(title);

  const suggestions = Array.isArray(autoCompleteData)
    ? autoCompleteData.filter((item: any) => item.type === "text")
    : [];

  // =====================================================
  // FIND MERGE CANDIDATES
  // =====================================================

  const { mutate: postFindMergeCandidates, isPending: isFindingMerge } =
    usePostfindMergeCandidates();

  const { mutate: createOffer, isPending: isCreatingOffer } =
    usePostCreateOffer();

  const { mutate: suggestCategory } = useGetSuggestCategory();

  const [suggestedCategories, setSuggestedCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  // =====================================================
  // IMAGE
  // =====================================================

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // اگر عکس قبلی blob بوده، آزادش کن
    if (selectedImage?.startsWith("blob:")) {
      URL.revokeObjectURL(selectedImage);
    }

    const imageUrl = URL.createObjectURL(file);

    setSelectedImage(imageUrl);
  };

  const removeImage = () => {
    if (selectedImage?.startsWith("blob:")) {
      URL.revokeObjectURL(selectedImage);
    }

    setSelectedImage(null);
  };

  // =====================================================
  // PRICE
  // =====================================================

  const formatPrice = (value: string) => {
    const numbers = value.replace(/\D/g, "");

    if (!numbers) return "";

    return Number(numbers).toLocaleString("en-US");
  };

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(formatPrice(event.target.value));
  };

  // =====================================================
  // BUTTON STATES
  // =====================================================

  const canContinue = title.trim().length > 0 && selectedImage !== null;

  const canAddProduct = price.replace(/\D/g, "").length > 0;

  // =====================================================
  // CONTINUE
  // =====================================================

  const handleContinue = () => {
    if (!canContinue) return;

    setShowSuggestions(false);

    // درخواست دسته‌بندی پیشنهادی
    suggestCategory(
      { title: title.trim() },
      {
        onSuccess: (catData) => {
          setSuggestedCategories(catData?.categories ?? []);
          setSelectedCategoryId(null);
        },
      },
    );

    postFindMergeCandidates(
      {
        title: title.trim(),
      },
      {
        onSuccess: (data) => {
          if (
            data &&
            Array.isArray(data.candidates) &&
            data.candidates.length > 0
          ) {
            setMergeCandidates(data.candidates);

            // هیچ محصولی در ابتدا انتخاب نشده
            setSelectedMergeProduct(null);

            // حالت ساده
            setMergeDetailsMode(false);

            // نمایش لیست محصولات مشابه
            setShowMergeList(true);
          } else {
            // اگر محصول مشابهی پیدا نشد
            // مستقیم مودال قیمت را باز کن
            setSelectedMergeProduct(null);
            setShowProductModal(true);
          }
        },

        onError: () => {
          // در صورت خطا هم مودال اصلی باز شود
          setSelectedMergeProduct(null);
          setShowProductModal(true);
        },
      },
    );
  };

  // =====================================================
  // SELECT MERGE PRODUCT
  // =====================================================

  const handleSelectProduct = (product: any) => {
    // محصول انتخاب شده
    setSelectedMergeProduct(product);

    // عنوان و عکس اصلی صفحه را تغییر نمی‌دهیم
    // چون فقط داخل مودال باید محصول انتخاب شده نمایش داده شود

    // لیست محصولات را نمی‌بندیم
    setShowMergeList(true);

    // فقط مودال را باز می‌کنیم
    setShowProductModal(true);
  };

  // =====================================================
  // SELECT NONE
  // =====================================================

  const handleSelectNone = () => {
    // هیچ محصول مشابهی انتخاب نشده
    setSelectedMergeProduct(null);

    // لیست همچنان باز می‌ماند
    setShowMergeList(true);

    // مودال باز می‌شود
    setShowProductModal(true);
  };

  // =====================================================
  // ADD PRICE FROM BOTTOM BUTTON
  // =====================================================

  const handleAddPrice = () => {
    if (!selectedMergeProduct) return;

    // عنوان محصول انتخاب شده
    if (selectedMergeProduct.name) {
      setTitle(selectedMergeProduct.name);
    }

    // عکس محصول انتخاب شده
    if (selectedMergeProduct.image) {
      setSelectedImage(selectedMergeProduct.image);
    }

    setShowMergeList(false);
    setShowProductModal(true);
  };

  // =====================================================
  // ADD PRODUCT
  // =====================================================

  const handleAddProduct = async () => {
    if (!canAddProduct) return;

    const numericPrice = Number(price.replace(/\D/g, ""));

    // تبدیل blob URL به File
    let imageFile: File | undefined;
    if (selectedImage && selectedImage.startsWith("blob:")) {
      try {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        imageFile = new File([blob], "product-image.jpg", { type: blob.type });
      } catch {
        // اگر تبدیل نشد، بدون عکس ادامه بده
      }
    }

    createOffer(
      {
        title: !selectedMergeProduct ? title : undefined,
        product_id: selectedMergeProduct?.id,
        category_id: !selectedMergeProduct
          ? (selectedCategoryId ?? undefined)
          : undefined,
        price: numericPrice,
        description: description || undefined,
      },
      {
        onSuccess: (data) => {
          router.push("/panel");
        },
        onError: (error) => {
          console.error("خطا در افزودن محصول:", error);
        },
      },
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div dir="rtl" className="min-h-screen bg-white text-gray-900">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="h-[58px] w-full border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-full max-w-[700px] items-center px-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-3 text-[15px] font-bold text-gray-900"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.2} />

            <span>بارگذاری محصول</span>
          </button>
        </div>
      </header>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <main className="mx-auto min-h-[calc(100vh-58px)] max-w-[700px] border-x border-gray-200 px-6 pb-32 pt-7">
        {/* ================================================= */}
        {/* PROGRESS */}
        {/* ================================================= */}

        <div className="mb-8">
          <div className="flex gap-2">
            <div className="h-[7px] flex-1 rounded-full bg-[#4b91e8]" />

            <div className="h-[7px] flex-1 rounded-full bg-gray-200" />
          </div>

          <div className="mt-2 text-[13px] text-gray-500">مرحله ۱ از ۲</div>
        </div>

        {/* ================================================= */}
        {/* PRODUCT TITLE */}
        {/* ================================================= */}

        <section>
          <h2 className="mb-2 text-[18px] font-extrabold">عنوان محصول</h2>

          <div className="relative">
            {/* INPUT */}

            <div className="flex h-[56px] items-center overflow-hidden rounded-xl border border-gray-300 bg-white transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <input
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (title.trim()) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder="مثلاً گوشی موبایل سامسونگ Galaxy A55"
                className="h-full min-w-0 flex-1 bg-transparent px-4 text-[15px] outline-none placeholder:text-gray-400"
              />

              {/* CLEAR */}

              {title && (
                <button
                  type="button"
                  onClick={() => {
                    setTitle("");
                    setShowSuggestions(false);
                  }}
                  className="flex h-full w-12 shrink-0 items-center justify-center text-gray-500 transition hover:text-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              {/* MICROPHONE */}

              <button
                type="button"
                className="ml-1 mr-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 transition hover:bg-purple-200"
              >
                <Mic className="h-6 w-6" />
              </button>
            </div>

            {/* ================================================= */}
            {/* API SUGGESTIONS */}
            {/* ================================================= */}

            {showSuggestions &&
              title.trim() &&
              (isAutoCompleteLoading || suggestions.length > 0) && (
                <div className="absolute left-0 right-0 top-[62px] z-50 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                  <div className="border-b border-gray-100 px-4 py-3 text-[13px] font-semibold text-gray-500">
                    پیشنهاد عنوان
                  </div>

                  {/* LOADING */}

                  {isAutoCompleteLoading && (
                    <div className="flex items-center justify-center gap-2 px-4 py-4 text-[13px] text-gray-500">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />

                      <span>در حال دریافت پیشنهادها...</span>
                    </div>
                  )}

                  {/* SUGGESTIONS */}

                  {!isAutoCompleteLoading &&
                    suggestions.map((suggestion: any, index: number) => (
                      <button
                        key={`${suggestion.type}-${suggestion.text}-${index}`}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setTitle(suggestion.text);
                          setShowSuggestions(false);
                        }}
                        className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-right transition last:border-b-0 hover:bg-gray-50"
                      >
                        {suggestion.type === "shop" && suggestion.logo ? (
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                            <Image
                              src={suggestion.logo}
                              alt=""
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                            {suggestion.type === "shop" ? (
                              <Store className="h-4 w-4" />
                            ) : (
                              <Search className="h-4 w-4" />
                            )}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14px] font-medium text-gray-800">
                            {suggestion.text}
                          </div>

                          {suggestion.type === "shop" && (
                            <div className="mt-0.5 text-[11px] text-gray-400">
                              فروشگاه
                            </div>
                          )}
                        </div>
                      </button>
                    ))}

                  {/* EMPTY */}

                  {!isAutoCompleteLoading && suggestions.length === 0 && (
                    <div className="px-4 py-4 text-center text-[13px] text-gray-500">
                      پیشنهادی پیدا نشد
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* ================================================= */}
          {/* TITLE LENGTH */}
          {/* ================================================= */}

          {title.length > 0 && (
            <div className="mt-5 flex items-center gap-3">
              {(() => {
                const length = title.length;

                let label = "";
                let colorClass = "";
                let bgClass = "";
                let width = 0;

                if (length < 20) {
                  label = "طول عنوان کوتاه";
                  colorClass = "bg-red-500";
                  bgClass = "bg-red-100";
                  width = Math.max((length / 20) * 33, 10);
                } else if (length < 40) {
                  label = "طول عنوان متوسط";
                  colorClass = "bg-yellow-500";
                  bgClass = "bg-yellow-100";
                  width = 50;
                } else if (length <= 60) {
                  label = "طول عنوان عالی";
                  colorClass = "bg-green-500";
                  bgClass = "bg-green-100";
                  width = Math.min(100, ((length - 40) / 20) * 50 + 50);
                } else {
                  label = "طول عنوان زیاد";
                  colorClass = "bg-red-500";
                  bgClass = "bg-red-100";
                  width = 100;
                }

                return (
                  <>
                    <div
                      className={`h-[8px] w-[86px] overflow-hidden rounded-full ${bgClass}`}
                    >
                      <div
                        className={`h-full rounded-full transition-all ${colorClass}`}
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>

                    <span
                      className={`text-[12px] font-medium ${colorClass.replace(
                        "bg-",
                        "text-",
                      )}`}
                    >
                      {label}
                    </span>
                  </>
                );
              })()}
            </div>
          )}
        </section>

        {/* ================================================= */}
        {/* PRODUCT IMAGE */}
        {/* ================================================= */}

        <section className="mt-9">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-extrabold">عکس محصول</h2>

            <button
              type="button"
              className="flex items-center gap-1 text-[13px] font-medium text-blue-600"
            >
              <CircleHelp className="h-4 w-4" />

              <span>قوانین</span>
            </button>
          </div>

          <div className="flex items-start gap-3">
            {/* ADD IMAGE */}

            <label className="flex h-[105px] w-[105px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white transition hover:border-blue-400 hover:bg-blue-50/30">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              <div className="relative">
                <Camera className="h-8 w-8 text-gray-700" />

                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[12px] font-bold text-white">
                  +
                </span>
              </div>

              <span className="mt-2 text-[13px] font-semibold">افزودن عکس</span>
            </label>

            {/* SELECTED IMAGE */}

            {selectedImage && (
              <div className="relative h-[105px] w-[105px] overflow-hidden rounded-xl border border-gray-300 bg-gray-100">
                <Image
                  src={selectedImage}
                  alt="عکس محصول"
                  fill
                  unoptimized
                  className="object-cover"
                />

                <div className="absolute bottom-0 left-0 right-0 flex h-7 items-center justify-center bg-black/65 text-[13px] font-bold text-white">
                  اصلی
                  <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ================================================= */}
      {/* BOTTOM CONTINUE BUTTON */}
      {/* ================================================= */}

      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[700px] -translate-x-1/2 rounded-t-2xl border border-gray-200 bg-white px-6 py-5 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          disabled={!canContinue || isFindingMerge}
          onClick={handleContinue}
          className="h-[48px] w-full rounded-lg bg-[#3f7de0] text-[15px] font-bold text-white transition hover:bg-[#3472d6] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isFindingMerge ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              در حال بررسی...
            </span>
          ) : (
            "ادامه"
          )}
        </button>
      </div>

      {/* ================================================= */}
      {/* MERGE CANDIDATES */}
      {/* ================================================= */}

      {showMergeList && (
        <div className="fixed inset-0 z-[100] flex justify-center bg-white">
          <div
            dir="rtl"
            className="relative h-full w-full max-w-[700px] overflow-y-auto bg-white px-6 pb-32"
          >
            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <header className="sticky top-0 z-20 -mx-6 border-b border-gray-200 bg-white">
              <div className="flex h-[58px] items-center px-6">
                <button
                  type="button"
                  onClick={() => setShowMergeList(false)}
                  className="flex items-center gap-3 text-[15px] font-bold text-gray-900"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={2.2} />

                  <span>بارگذاری محصول</span>
                </button>
              </div>
            </header>

            {/* ================================================= */}
            {/* CONTENT */}
            {/* ================================================= */}

            <div className="pt-6">
              {/* ================================================= */}
              {/* PROGRESS */}
              {/* ================================================= */}

              <div className="mb-7">
                <div className="flex gap-2">
                  <div className="h-[7px] flex-1 rounded-full bg-[#4b91e8]" />

                  <div className="h-[7px] flex-1 rounded-full bg-[#4b91e8]" />
                </div>

                <div className="mt-2 text-[13px] text-gray-500">
                  مرحله ۲ از ۲
                </div>
              </div>

              {/* ================================================= */}
              {/* TITLE */}
              {/* ================================================= */}

              <div className="mb-6 flex w-full justify-end">
                <div
                  dir="ltr"
                  className="inline-flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setMergeDetailsMode(true)}
                    className={`rounded-lg px-4 py-2 text-[13px] font-semibold transition ${
                      mergeDetailsMode
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    جزئیات بیشتر
                  </button>

                  <button
                    type="button"
                    onClick={() => setMergeDetailsMode(false)}
                    className={`rounded-lg px-4 py-2 text-[13px] font-semibold transition ${
                      !mergeDetailsMode
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    ساده
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <h2 className="text-[18px] font-extrabold text-gray-900">
                  محصول خود را انتخاب کنید
                </h2>

                <p className="mt-1 text-[13px] leading-6 text-gray-500">
                  اگر محصولات در فهرست نیست گزینه «هیچکدام» را بزنید.
                </p>
              </div>

              {/* ================================================= */}
              {/* SIMPLE / DETAILS */}
              {/* ================================================= */}

              {/* ================================================= */}
              {/* PRODUCTS */}
              {/* ================================================= */}

              <div className="space-y-3">
                {mergeCandidates.map((product: any, index: number) => {
                  const isSelected = selectedMergeProduct?.id === product.id;

                  return (
                    <button
                      key={product.id || index}
                      type="button"
                      onClick={() => handleSelectProduct(product)}
                      className={`relative flex w-full items-center gap-4 rounded-xl border bg-white px-3 py-3 text-right transition ${
                        isSelected
                          ? "border-[#4b91e8] ring-1 ring-[#4b91e8]"
                          : "border-[#dbe2ea] hover:border-[#9bbff0]"
                      }`}
                    >
                      {/* ================================================= */}
                      {/* RADIO */}
                      {/* ================================================= */}

                      <div
                        className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white ${
                          isSelected ? "border-[#3f7de0]" : "border-[#76a8eb]"
                        }`}
                      >
                        {isSelected && (
                          <div className="h-3 w-3 rounded-full bg-[#3f7de0]" />
                        )}
                      </div>

                      {/* ================================================= */}
                      {/* IMAGE */}
                      {/* ================================================= */}

                      <div className="relative h-[92px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-gray-50">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name || "محصول"}
                            fill
                            unoptimized
                            className="object-contain"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Camera className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* ================================================= */}
                      {/* INFO */}
                      {/* ================================================= */}

                      <div className="min-w-0 flex-1 pt-1">
                        <h3 className="pr-8 text-[15px] font-bold leading-6 text-gray-900">
                          {product.name}
                        </h3>

                        {/* ================================================= */}
                        {/* SIMPLE MODE */}
                        {/* ================================================= */}

                        {!mergeDetailsMode && (
                          <>
                            {product.shop_price && (
                              <p className="mt-2 text-[13px] font-semibold text-gray-700">
                                کف قیمت{" "}
                                <span className="font-bold">
                                  {product.shop_price}
                                </span>
                              </p>
                            )}

                            {product.shop_text && (
                              <p className="mt-1 text-[12px] text-gray-500">
                                {product.shop_text}
                              </p>
                            )}
                          </>
                        )}

                        {/* ================================================= */}
                        {/* DETAILS MODE */}
                        {/* ================================================= */}

                        {mergeDetailsMode && (
                          <div className="mt-2 space-y-2 text-[12px] text-gray-500">
                            {product.shop_price && (
                              <p>
                                کف قیمت:{" "}
                                <span className="font-semibold text-gray-800">
                                  {product.shop_price}
                                </span>
                              </p>
                            )}

                            {product.shop_text && <p>{product.shop_text}</p>}

                            {Array.isArray(product.specifications) &&
                              product.specifications.length > 0 && (
                                <div className="space-y-1.5">
                                  {product.specifications.map(
                                    (
                                      specification: any,
                                      specificationIndex: number,
                                    ) => {
                                      if (typeof specification === "string") {
                                        return (
                                          <p key={specificationIndex}>
                                            {specification}
                                          </p>
                                        );
                                      }

                                      return (
                                        <p key={specificationIndex}>
                                          {specification.name ??
                                            specification.key ??
                                            ""}

                                          {": "}

                                          {specification.value ?? ""}
                                        </p>
                                      );
                                    },
                                  )}
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ================================================= */}
              {/* NONE */}
              {/* ================================================= */}

              <button
                type="button"
                onClick={handleSelectNone}
                className="mt-5 w-full rounded-xl border border-gray-300 bg-white py-3.5 text-[14px] font-bold text-gray-700 transition hover:bg-gray-50"
              >
                هیچکدام
              </button>
            </div>

            {/* ================================================= */}
            {/* FIXED BOTTOM */}
            {/* ================================================= */}

            <div className="fixed bottom-0 left-1/2 z-[110] w-full max-w-[700px] -translate-x-1/2 rounded-t-2xl border border-gray-200 bg-white px-6 py-5 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
              <button
                type="button"
                disabled={!selectedMergeProduct}
                onClick={handleAddPrice}
                className="flex h-[48px] w-full items-center justify-center rounded-lg bg-[#3f7de0] text-[15px] font-bold text-white transition hover:bg-[#3472d6] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                افزودن قیمت
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* PRODUCT MODAL */}
      {/* ================================================= */}

      {showProductModal && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center"
          dir="rtl"
        >
          {/* ================================================= */}
          {/* OVERLAY */}
          {/* ================================================= */}

          <button
            type="button"
            aria-label="بستن"
            onClick={() => {
              setShowProductModal(false);
            }}
            className="absolute inset-0 cursor-default bg-black/40"
          />

          {/* ================================================= */}
          {/* MODAL */}
          {/* ================================================= */}

          <div className="relative z-10 w-full max-w-[700px] rounded-t-2xl bg-white px-6 pb-6 pt-5 shadow-2xl">
            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[17px] font-extrabold text-gray-900">
                {selectedMergeProduct ? "تکمیل اطلاعات محصول" : "افزودن محصول"}
              </h2>

              <button
                type="button"
                onClick={() => {
                  setShowProductModal(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ================================================= */}
            {/* SELECTED PRODUCT */}
            {/* ================================================= */}

            {selectedMergeProduct ? (
              <>
                {/* SELECTED PRODUCT INFO */}
                <div className="rounded-xl border border-gray-200 bg-white p-3">
                  <div className="flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-bold leading-6 text-gray-900">
                        {selectedMergeProduct.name}
                      </h3>

                      {selectedMergeProduct.shop_price && (
                        <p className="mt-2 text-[12px] text-gray-500">
                          کف قیمت:{" "}
                          <span className="font-semibold text-gray-700">
                            {selectedMergeProduct.shop_price}
                          </span>
                        </p>
                      )}

                      {selectedMergeProduct.shop_text && (
                        <p className="mt-1 text-[12px] text-gray-500">
                          {selectedMergeProduct.shop_text}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* USER IMAGES */}
                <div className="mt-4">
                  <div className="flex items-start gap-3">
                    <label className="flex h-[105px] w-[105px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white transition hover:border-blue-400 hover:bg-blue-50/30">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="relative">
                        <Camera className="h-8 w-8 text-gray-700" />
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[12px] font-bold text-white">
                          +
                        </span>
                      </div>
                      <span className="mt-2 text-[13px] font-semibold">
                        افزودن عکس
                      </span>
                    </label>

                    {selectedImage && (
                      <div className="relative h-[105px] w-[105px] overflow-hidden rounded-xl border border-gray-300 bg-gray-100">
                        <Image
                          src={selectedImage}
                          alt="عکس محصول"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 flex h-7 items-center justify-center bg-black/65 text-[13px] font-bold text-white">
                          اصلی
                          <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ================================================= */}
                {/* PRICE */}
                {/* ================================================= */}

                <div className="mt-5">
                  <label className="mb-2 block text-[14px] font-bold text-gray-900">
                    قیمت فروش شما
                  </label>

                  <div className="flex h-[54px] items-center rounded-xl border-2 border-blue-200 bg-white px-3 transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                    <input
                      value={price}
                      onChange={handlePriceChange}
                      inputMode="numeric"
                      placeholder="مثلاً ۱۵,۰۰۰,۰۰۰"
                      className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-400"
                    />

                    <span className="mr-3 text-[14px] text-gray-600">
                      تومان
                    </span>
                  </div>
                </div>

                {/* ================================================= */}
                {/* DESCRIPTION */}
                {/* ================================================= */}

                <div className="mt-4">
                  <label className="mb-2 block text-[14px] font-bold text-gray-900">
                    توضیحات
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="توضیحات محصول (اختیاری)"
                    rows={3}
                    className="w-full resize-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-[14px] outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* ================================================= */}
                {/* ADD PRODUCT */}
                {/* ================================================= */}

                <button
                  type="button"
                  disabled={!canAddProduct || isCreatingOffer}
                  onClick={handleAddProduct}
                  className="mt-5 flex h-[48px] w-full items-center justify-center rounded-lg bg-[#3f7de0] text-[15px] font-bold text-white transition hover:bg-[#3472d6] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                >
                  {isCreatingOffer ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      در حال افزودن...
                    </span>
                  ) : (
                    "افزودن محصول"
                  )}
                </button>
              </>
            ) : (
              /* ================================================= */
              /* NONE SELECTED */
              /* ================================================= */

              <>
                {/* ================================================= */}
                {/* DISABLED TITLE INPUT */}
                {/* ================================================= */}

                <div className="mb-4">
                  <label className="mb-2 block text-[14px] font-bold text-gray-900">
                    عنوان محصول
                  </label>
                  <input
                    value={title}
                    disabled
                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-[15px] font-bold text-gray-700 outline-none"
                  />
                </div>

                {/* ================================================= */}
                {/* USER IMAGES */}
                {/* ================================================= */}

                <div>
                  <div className="flex items-start gap-3">
                    <label className="flex h-[105px] w-[105px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white transition hover:border-blue-400 hover:bg-blue-50/30">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="relative">
                        <Camera className="h-8 w-8 text-gray-700" />
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[12px] font-bold text-white">
                          +
                        </span>
                      </div>
                      <span className="mt-2 text-[13px] font-semibold">
                        افزودن عکس
                      </span>
                    </label>

                    {selectedImage && (
                      <div className="relative h-[105px] w-[105px] overflow-hidden rounded-xl border border-gray-300 bg-gray-100">
                        <Image
                          src={selectedImage}
                          alt="عکس محصول"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 flex h-7 items-center justify-center bg-black/65 text-[13px] font-bold text-white">
                          اصلی
                          <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ================================================= */}
                {/* CATEGORY SELECTOR */}
                {/* ================================================= */}

                {suggestedCategories.length > 0 && (
                  <div className="mt-5">
                    <label className="mb-2 block text-[14px] font-bold text-gray-900">
                      دسته‌بندی پیشنهادی
                    </label>
                    <div className="border border-gray-200 rounded-sm">
                      {suggestedCategories.map((cat: any) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() =>
                            setSelectedCategoryId(
                              selectedCategoryId === cat.id ? null : cat.id,
                            )
                          }
                          className={`flex w-full items-center px-4 py-3 border-b text-right text-[14px] transition ${
                            selectedCategoryId === cat.id
                              ? "bg-[#f1f5f9] font-bold text-[#4167c5]"
                              : "bg-white text-gray-700 hover:bg-[#f1f5f9]"
                          }`}
                        >
                          {cat.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ================================================= */}
                {/* PRICE */}
                {/* ================================================= */}

                <div className="mt-5">
                  <label className="mb-2 block text-[14px] font-bold text-gray-900">
                    قیمت فروش شما
                  </label>

                  <div className="flex h-[54px] items-center rounded-xl border-2 border-blue-200 bg-white px-3 transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                    <input
                      value={price}
                      onChange={handlePriceChange}
                      inputMode="numeric"
                      placeholder="مثلاً ۱۵,۰۰۰,۰۰۰"
                      className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-400"
                    />

                    <span className="mr-3 text-[14px] text-gray-600">
                      تومان
                    </span>
                  </div>
                </div>

                {/* ================================================= */}
                {/* DESCRIPTION */}
                {/* ================================================= */}

                <div className="mt-4">
                  <label className="mb-2 block text-[14px] font-bold text-gray-900">
                    توضیحات
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="توضیحات محصول (اختیاری)"
                    rows={3}
                    className="w-full resize-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-[14px] outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* ================================================= */}
                {/* ADD PRODUCT */}
                {/* ================================================= */}

                <button
                  type="button"
                  disabled={!canAddProduct || isCreatingOffer}
                  onClick={handleAddProduct}
                  className="mt-5 flex h-[48px] w-full items-center justify-center rounded-lg bg-[#3f7de0] text-[15px] font-bold text-white transition hover:bg-[#3472d6] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                >
                  {isCreatingOffer ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      در حال افزودن...
                    </span>
                  ) : (
                    "افزودن محصول"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
