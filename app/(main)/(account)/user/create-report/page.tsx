"use client";

import { useMemo, useState } from "react";
import { Flag, Search, Trash2, Store } from "lucide-react";

import { useGetRecentOfferClicks } from "@/lib/apis";
import { PageSpinner } from "@/components/ui/page-spinner";
import ReportModal from "@/components/report-modal";

// =====================================================
// Types
// =====================================================

interface Shop {
  id: number;
  shop_name: string;
  type: "ONLINE_SHOP" | "OFFLINE_SHOP";
  city?: {
    id: number;
    name: string;
  } | null;
}

interface OfferClickItem {
  id: number;
  created_at: string;

  offer: {
    id: number;
    product_id: number;
    price: number;
    is_available: boolean;
    is_active: boolean;

    warranty: {
      title: string;
    } | null;

    warranty_duration: number | null;

    shop: Shop;
  };

  product: {
    id: number;
    name: string;
    slug: string;
    image: string | null;
  };

  shop: {
    id: number;
    shop_name: string;
    shop_logo: string | null;
  };
}

// =====================================================
// Component
// =====================================================

export default function CreateReportPage() {
  const { data: clicks = [], isPending } = useGetRecentOfferClicks();

  const [reportModalOpen, setReportModalOpen] = useState(false);

  const [selectedClick, setSelectedClick] = useState<OfferClickItem | null>(
    null,
  );

  const [searchShop, setSearchShop] = useState("");

  // =====================================================
  // Filter shops
  // =====================================================

  const filteredClicks = useMemo(() => {
    const query = searchShop.trim().toLowerCase();

    if (!query) {
      return clicks;
    }

    return clicks.filter((click: OfferClickItem) =>
      click.shop.shop_name.toLowerCase().includes(query),
    );
  }, [clicks, searchShop]);

  // =====================================================
  // Report
  // =====================================================

  const handleReport = (click: OfferClickItem) => {
    setSelectedClick(click);
    setReportModalOpen(true);
  };

  const closeReportModal = () => {
    setReportModalOpen(false);
    setSelectedClick(null);
  };

  // =====================================================
  // Loading
  // =====================================================

  if (isPending) {
    return <PageSpinner />;
  }

  // =====================================================
  // Empty
  // =====================================================

  if (!clicks || clicks.length === 0) {
    return (
      <div
        dir="rtl"
        className="flex w-full items-center justify-center px-4 py-16"
      >
        <div className="flex w-full max-w-[480px] flex-col items-center text-center">
          <img
            src="https://assets.torob.com/public/main/images/empty_history-min.png"
            alt="بدون بازدید"
            className="h-52 w-auto object-contain"
          />

          <p className="mt-5 text-sm text-[#667085]">
            فروشگاهی برای گزارش‌دهی وجود ندارد.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <div dir="rtl" className="flex w-full justify-center bg-white">
        <main className="w-full max-w-[520px] px-5 pb-12 pt-10 sm:px-0">
          {/* =================================================
              Description
          ================================================= */}

          <p className="mb-3 text-center text-[14px] leading-7 font-medium text-[#344054]">
            نام فروشگاهی که در موتور جستجوی ترب از آن خرید کرده‌اید را وارد
            نمایید.
          </p>

          {/* =================================================
              Search
          ================================================= */}

          <div className="relative mb-4">
            <Search
              className="
                pointer-events-none
                absolute
                right-3
                top-1/2
                h-[18px]
                w-[18px]
                -translate-y-1/2
                text-[#98A2B3]
              "
              strokeWidth={1.8}
            />

            <input
              type="text"
              value={searchShop}
              onChange={(e) => setSearchShop(e.target.value)}
              placeholder="جستجوی نام فروشگاه"
              className="
                h-[44px]
                w-full
                rounded-[5px]
                border
                border-[#98A2B3]
                bg-white
                pr-10
                pl-4
                text-right
                text-[13px]
                text-[#344054]
                outline-none
                transition
                placeholder:text-[#98A2B3]
                focus:border-[#6EA8FE]
                focus:ring-1
                focus:ring-[#6EA8FE]
              "
            />
          </div>

          {/* =================================================
              Recent visits header
          ================================================= */}

          <div
            className="
              flex
              h-[44px]
              w-full
              items-center
              justify-between
              rounded-[5px]
              bg-[#F1F5F9]
              px-4
            "
          >
            <span
              className="
                text-[14px]
                font-bold
                text-[#344054]
              "
            >
              بازدیدهای اخیر
            </span>

            <button
              type="button"
              aria-label="حذف بازدیدهای اخیر"
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-md
                text-[#344054]
                transition
                hover:bg-white
                hover:text-[#D70040]
              "
            >
              <Trash2 className="h-[20px] w-[20px]" strokeWidth={1.8} />
            </button>
          </div>

          {/* =================================================
              Shops
          ================================================= */}

          <div className="w-full">
            {filteredClicks.map((click: OfferClickItem, index: number) => (
              <button
                key={click.id}
                type="button"
                onClick={() => handleReport(click)}
                className={`
                    group
                    flex
                    min-h-[76px]
                    w-full
                    items-center
                    justify-between
                    gap-3
                    border-b
                    border-[#F2F4F7]
                    bg-white
                    px-3
                    text-right
                    transition
                    hover:bg-[#FAFAFA]
                  `}
              >
                {/* =================================================
                      Report
                  ================================================= */}

                {/* =================================================
                      Shop / Product
                  ================================================= */}

                <div className="min-w-0 flex-1">
                  {/* Shop */}
                  <div className="flex items-center gap-2">
                    {click.shop.shop_logo ? (
                      <div
                        className="
                            flex
                            h-[34px]
                            w-[34px]
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-full
                            border
                            border-[#EAECF0]
                            bg-white
                          "
                      >
                        <img
                          src={click.shop.shop_logo}
                          alt={click.shop.shop_name}
                          className="
                              h-full
                              w-full
                              object-contain
                            "
                        />
                      </div>
                    ) : (
                      <div
                        className="
                            flex
                            h-[34px]
                            w-[34px]
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-[#EAECF0]
                            bg-[#F8FAFC]
                          "
                      >
                        <Store
                          className="
                              h-[17px]
                              w-[17px]
                              text-[#98A2B3]
                            "
                          strokeWidth={1.7}
                        />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p
                        className="
                            truncate
                            text-[14px]
                            font-bold
                            leading-6
                            text-[#344054]
                          "
                      >
                        {click.shop.shop_name}
                      </p>

                      {/* Product */}
                      <p
                        className="
                            mt-0.5
                            truncate
                            text-[12px]
                            leading-5
                            text-[#98A2B3]
                          "
                      >
                        {click.product.name}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="
                      flex
                      w-[58px]
                      shrink-0
                      items-center
                      justify-center
                    "
                >
                  <div
                    className="
                        flex
                        items-center
                        gap-1
                        rounded-full
                        bg-[#F8FAFC]
                        px-2
                        py-1
                        text-[11px]
                        text-[#98A2B3]
                        transition
                        group-hover:bg-[#FFF1F2]
                        group-hover:text-[#D70040]
                      "
                  >
                    <Flag className="h-[14px] w-[14px]" strokeWidth={1.7} />

                    <span>گزارش</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* =================================================
              No search result
          ================================================= */}

          {filteredClicks.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-[#98A2B3]">
                فروشگاهی با این نام پیدا نشد.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* =====================================================
          Report Modal
      ===================================================== */}

      {reportModalOpen && selectedClick && (
        <ReportModal
          open={reportModalOpen}
          onClose={closeReportModal}
          offer={{
            id: selectedClick.offer.id,
            product_id: selectedClick.offer.product_id,
            price: selectedClick.offer.price,
            shop: selectedClick.offer.shop,
            warranty: selectedClick.offer.warranty,
            warranty_duration: selectedClick.offer.warranty_duration,
            is_available: selectedClick.offer.is_available,
          }}
          productName={selectedClick.product.name}
          productImage={selectedClick.product.image}
        />
      )}
    </>
  );
}
