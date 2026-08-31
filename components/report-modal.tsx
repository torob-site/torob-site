"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

import { useGetReportOptions, usePostUserReport } from "@/lib/apis";

// =====================================================
// Types
// =====================================================

type ReportReasonType = "OPTION" | "OPTION_LIST" | "REDIRECT_TO_COMPLAINT";

type ShopType = "ONLINE_SHOP" | "OFFLINE_SHOP";

interface ReportReason {
  id: number;
  title: string;
  type: ReportReasonType;
  shop_type: ShopType;
  report_type: string | null;
  needs_description: boolean;
  parent_id: number | null;
  children: ReportReason[];
}

interface Shop {
  id: number;
  shop_name: string;
  shop_logo?: string | null;
  type: ShopType;
  city?: {
    id: number;
    name: string;
  } | null;
}

interface Warranty {
  title: string;
  description?: string | null;
}

interface Offer {
  id: number;

  /**
   * برای ساخت Report لازم است.
   */
  product_id: number;

  price: number;

  shop: Shop;

  warranty: Warranty | null;

  warranty_duration: number | null;

  is_available: boolean;
}

interface ReportModalProps {
  open: boolean;

  onClose: () => void;

  offer: Offer | null;

  productName: string;
  productImage?: string | null;
}

// =====================================================
// Component
// =====================================================

export default function ReportModal({
  open,
  onClose,
  offer,
  productName,
  productImage,
}: ReportModalProps) {
  const router = useRouter();

  // ===================================================
  // Step
  // ===================================================

  const [step, setStep] = useState<"reasons" | "option-list" | "description">(
    "reasons",
  );

  // ===================================================
  // Current OPTION_LIST
  // ===================================================

  const [currentOptionList, setCurrentOptionList] =
    useState<ReportReason | null>(null);

  // ===================================================
  // Selected reason
  // ===================================================

  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(
    null,
  );

  // ===================================================
  // Description
  // ===================================================

  const [description, setDescription] = useState("");

  // ===================================================
  // Get report options
  // ===================================================

  const {
    data: reasons,
    isPending: isReasonsLoading,
    isError: isReasonsError,
    refetch,
  } = useGetReportOptions(offer?.shop.type);

  // ===================================================
  // Create report mutation
  // ===================================================

  const { mutate: createReport, isPending: isCreatingReport } =
    usePostUserReport();

  // ===================================================
  // Reset modal
  // ===================================================

  useEffect(() => {
    if (!open) {
      setStep("reasons");

      setCurrentOptionList(null);

      setSelectedReason(null);

      setDescription("");
    }
  }, [open]);

  // ===================================================
  // Refetch options when modal opens
  // ===================================================

  useEffect(() => {
    if (!open || !offer?.shop.type) {
      return;
    }

    refetch();
  }, [open, offer?.shop.type, refetch]);

  // ===================================================
  // Guard
  // ===================================================

  if (!open || !offer) {
    return null;
  }

  // ===================================================
  // Select reason
  // ===================================================

  const handleReasonClick = (reason: ReportReason) => {
    /**
     * هیچ navigation اینجا انجام نمی‌شود.
     *
     * حتی OPTION_LIST هم فقط انتخاب می‌شود.
     *
     * برای رفتن به مرحله بعد باید
     * روی دکمه «مرحله بعد» کلیک شود.
     */

    setSelectedReason(reason);
  };

  // ===================================================
  // Next
  // ===================================================

  const handleNext = () => {
    if (!selectedReason) {
      return;
    }

    // =================================================
    // REDIRECT_TO_COMPLAINT
    // =================================================

    if (selectedReason.type === "REDIRECT_TO_COMPLAINT") {
      onClose();

      router.push(
        `/user/purchases/detail?product_id=${offer.product_id}&shop_id=${offer.shop.id}`,
      );

      return;
    }

    // =================================================
    // OPTION_LIST
    // =================================================

    if (selectedReason.type === "OPTION_LIST") {
      setCurrentOptionList(selectedReason);

      setSelectedReason(null);

      setStep("option-list");

      return;
    }

    // =================================================
    // OPTION
    // =================================================

    if (selectedReason.needs_description) {
      setStep("description");

      return;
    }

    // =================================================
    // OPTION without description
    // =================================================

    handleSubmit();
  };

  // ===================================================
  // Back from OPTION_LIST
  // ===================================================

  const handleBackFromOptionList = () => {
    setStep("reasons");

    setCurrentOptionList(null);

    setSelectedReason(null);
  };

  // ===================================================
  // Back from description
  // ===================================================

  const handleBackFromDescription = () => {
    if (currentOptionList) {
      setStep("option-list");
    } else {
      setStep("reasons");
    }

    setDescription("");
  };

  // ===================================================
  // Submit report
  // ===================================================

  const handleSubmit = () => {
    if (!offer || !selectedReason) {
      return;
    }

    createReport(
      {
        shop_id: offer.shop.id,

        product_id: offer.product_id,

        report_reason_id: selectedReason.id,

        description: description.trim() || null,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  // ===================================================
  // Render
  // ===================================================

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4"
      onMouseDown={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-bold text-[#1e293b]">گزارش مشکل</h2>

          <button
            type="button"
            onClick={onClose}
            disabled={isCreatingReport}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#334155] transition hover:bg-[#f1f5f9] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ================================================= */}
        {/* PRODUCT / SHOP INFO */}
        {/* فقط صفحه اصلی */}
        {/* ================================================= */}

        {step === "reasons" && !currentOptionList && (
          <div className="shrink-0 border-b border-gray-200 px-5 py-4">
            <div className="flex gap-3">
              {/* Product image */}

              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {productImage ? (
                  <img
                    src={productImage}
                    alt={productName}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                    بدون تصویر
                  </div>
                )}
              </div>

              {/* Product / Shop */}

              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-sm font-bold leading-6 text-[#1e293b]">
                  {productName}
                </h3>

                <p className="mt-1 text-xs text-[#64748b]">
                  {offer.shop.shop_name}
                </p>

                <p className="mt-2 text-sm font-bold text-[#1e293b]">
                  {offer.price.toLocaleString("fa-IR")} تومان
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* BODY */}
        {/* ================================================= */}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {/* ================================================= */}
          {/* MAIN REASONS */}
          {/* ================================================= */}

          {step === "reasons" && !currentOptionList && (
            <>
              <h3 className="mb-4 text-sm font-bold text-[#1e293b]">
                به چه مشکلی برخوردید؟
              </h3>

              {/* Loading */}

              {isReasonsLoading && (
                <div className="flex items-center justify-center py-10">
                  <Spinner className="size-7" />
                </div>
              )}

              {/* Error */}

              {isReasonsError && (
                <div className="py-8 text-center">
                  <p className="text-sm text-red-500">
                    دریافت گزینه‌های گزارش با خطا مواجه شد.
                  </p>

                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-3 text-sm font-medium text-blue-600"
                  >
                    تلاش مجدد
                  </button>
                </div>
              )}

              {/* Empty */}

              {!isReasonsLoading &&
                !isReasonsError &&
                Array.isArray(reasons) &&
                reasons.length === 0 && (
                  <div className="py-8 text-center text-sm text-gray-500">
                    گزینه‌ای برای گزارش وجود ندارد.
                  </div>
                )}

              {/* Reasons */}

              {!isReasonsLoading &&
                !isReasonsError &&
                Array.isArray(reasons) &&
                reasons.length > 0 && (
                  <div className="space-y-2">
                    {reasons.map((reason: ReportReason) => (
                      <ReportReasonItem
                        key={reason.id}
                        reason={reason}
                        selectedReasonId={selectedReason?.id ?? null}
                        onSelect={handleReasonClick}
                      />
                    ))}
                  </div>
                )}
            </>
          )}

          {/* ================================================= */}
          {/* OPTION LIST */}
          {/* ================================================= */}

          {step === "option-list" && currentOptionList && (
            <>
              {/* Back */}

              <button
                type="button"
                onClick={handleBackFromOptionList}
                className="mb-5 flex items-center gap-1 text-sm font-medium text-[#475569] transition hover:text-[#1e293b]"
              >
                <ChevronRight className="h-4 w-4" />

                <span>مرحله قبل</span>
              </button>

              {/* Title */}

              <h3 className="mb-4 text-sm font-bold leading-6 text-[#1e293b]">
                {currentOptionList.title}
              </h3>

              {/* Children */}

              {currentOptionList.children &&
              currentOptionList.children.length > 0 ? (
                <div className="space-y-2">
                  {currentOptionList.children.map((child: ReportReason) => (
                    <ReportReasonItem
                      key={child.id}
                      reason={child}
                      selectedReasonId={selectedReason?.id ?? null}
                      onSelect={handleReasonClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-gray-500">
                  گزینه‌ای برای این بخش وجود ندارد.
                </div>
              )}
            </>
          )}

          {/* ================================================= */}
          {/* DESCRIPTION */}
          {/* ================================================= */}

          {step === "description" && (
            <div className="space-y-6">
              {/* Back */}

              <button
                type="button"
                onClick={handleBackFromDescription}
                disabled={isCreatingReport}
                className="flex items-center gap-1 text-sm font-medium text-[#475569] transition hover:text-[#1e293b] disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />

                <span>مرحله قبل</span>
              </button>

              {/* Textarea */}

              <div>
                <label
                  htmlFor="report-description"
                  className="mb-3 block text-sm font-bold text-[#1e293b]"
                >
                  توضیحات شما
                </label>

                <Textarea
                  id="report-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value.slice(0, 400))
                  }
                  maxLength={400}
                  disabled={isCreatingReport}
                  placeholder="مشکل خود را با جزئیات توضیح دهید."
                  className="min-h-[140px] resize-none rounded-xl border-[#cbd5e1] bg-[#f8fafc] text-sm leading-6 placeholder:text-[#94a3b8] focus-visible:ring-1 focus-visible:ring-[#64748b]"
                />

                <div className="mt-1 text-left text-xs text-[#64748b]">
                  {description.length} / 400
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        {/* NEXT BUTTON */}

        {step !== "description" && selectedReason && (
          <div className="shrink-0 border-t border-gray-200 bg-white p-4">
            <Button
              type="button"
              disabled={isCreatingReport}
              onClick={handleNext}
              className="w-full rounded-xl bg-[#919eab] py-6 text-sm font-bold text-white transition hover:bg-[#64748b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              مرحله بعد
            </Button>
          </div>
        )}

        {/* SUBMIT BUTTON */}

        {step === "description" && (
          <div className="shrink-0 border-t border-gray-200 bg-white p-4">
            <Button
              type="button"
              disabled={!description.trim() || isCreatingReport}
              onClick={handleSubmit}
              className="w-full rounded-xl bg-[#94a3b8] py-6 text-sm font-bold text-white transition hover:bg-[#64748b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreatingReport ? "در حال ثبت..." : "ثبت گزارش"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// Report Reason Item
// =====================================================

function ReportReasonItem({
  reason,
  selectedReasonId,
  onSelect,
}: {
  reason: ReportReason;

  selectedReasonId: number | null;

  onSelect: (reason: ReportReason) => void;
}) {
  const isSelected = selectedReasonId === reason.id;

  const isOptionList = reason.type === "OPTION_LIST";

  const isRedirect = reason.type === "REDIRECT_TO_COMPLAINT";

  return (
    <button
      type="button"
      onClick={() => onSelect(reason)}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-right transition ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        {/* Radio */}

        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            isSelected ? "border-blue-500" : "border-gray-300"
          }`}
        >
          {isSelected && (
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          )}
        </span>

        {/* Title */}

        <span
          className={`text-sm leading-6 ${
            isSelected ? "font-bold text-blue-600" : "text-[#1e293b]"
          }`}
        >
          {reason.title}
        </span>
      </div>
    </button>
  );
}
