"use client";

import { useGetShopTransactions } from "@/lib/apis";
import {
  ChevronLeft,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";


interface Transaction {
  id: number;
  amount: number;
  title: string;
  description: string | null;
  type: "DEPOSIT" | "EXPENSE" | "PROMOTIONAL_CREDIT";
  created_at: string;
  updated_at: string;
  date: {
    year: number;
    month: number;
    day: number;
  };
}

interface TransactionGroup {
  key: string;
  year: number;
  month: number;
  month_name: string;
  title: string;
  transactions: Transaction[];
}

interface TransactionsResponse {
  transactions: TransactionGroup[];
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("fa-IR").format(amount);
}

function formatDate(transaction: Transaction) {
  return `${transaction.date.year}/${String(
    transaction.date.month,
  ).padStart(2, "0")}/${String(
    transaction.date.day,
  ).padStart(2, "0")}`;
}

function getTransactionIcon(
  type: Transaction["type"],
) {
  if (
    type === "DEPOSIT" ||
    type === "PROMOTIONAL_CREDIT"
  ) {
    return TrendingUp;
  }

  return TrendingDown;
}

function getTransactionClassName(
  type: Transaction["type"],
) {
  if (type === "PROMOTIONAL_CREDIT") {
    return {
      container:
        "border-green-100 bg-green-50",

      icon: "text-gray-900",
    };
  }

  return {
    container:
      "border-gray-200 bg-white",

    icon: "text-gray-900",
  };
}

export default function FinancialPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetShopTransactions();

  const transactionGroups =
    (data as TransactionsResponse | undefined)
      ?.transactions ?? [];

  return (
    <main
      dir="rtl"
      className="mx-auto w-full max-w-[700px] px-4 py-5"
    >
      {/* ========================= */}
      {/* موجودی */}
      {/* ========================= */}

      <div
        className="
          mb-5
          flex
          w-full
          items-center
          justify-between
          rounded-xl
          bg-gray-50
          px-4
          py-4
        "
      >
        <span className="text-[14px] text-gray-700">
          موجودی
        </span>

        <div className="flex items-center gap-1">
          <span className="text-[18px] font-bold text-gray-900">
            {formatAmount(data?.balance ?? 0)}
          </span>

          <span className="text-[12px] text-gray-700">
            تومان
          </span>
        </div>
      </div>

      {/* ========================= */}
      {/* افزایش موجودی */}
      {/* ========================= */}
      <Link href='/panel/charge'>
        <button
          type="button"
          className="
          mb-5
          flex
          h-[44px]
          w-full
          items-center
          justify-center
          gap-2
          rounded-lg
          bg-blue-600
          text-[14px]
          font-bold
          text-white
          transition
          hover:bg-blue-700
        "
        >
          <Plus className="h-5 w-5" />

          <span>
            افزایش موجودی
          </span>
        </button>
      </Link>

      {/* ========================= */}
      {/* Loading */}
      {/* ========================= */}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="
                h-[74px]
                w-full
                animate-pulse
                rounded-xl
                bg-gray-100
              "
            />
          ))}
        </div>
      )}

      {/* ========================= */}
      {/* Error */}
      {/* ========================= */}

      {isError && (
        <div
          className="
            rounded-xl
            border
            border-red-100
            bg-red-50
            px-4
            py-5
            text-center
          "
        >
          <p className="mb-3 text-sm text-red-500">
            دریافت تراکنش‌ها با خطا مواجه شد.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="
              rounded-lg
              bg-red-500
              px-4
              py-2
              text-xs
              font-medium
              text-white
            "
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {/* ========================= */}
      {/* Transactions */}
      {/* ========================= */}

      {!isLoading &&
        !isError &&
        transactionGroups.length > 0 && (
          <div className="space-y-5">
            {transactionGroups.map(
              (group) => (
                <section
                  key={group.key}
                >
                  {/* عنوان بازه ماه */}

                  <h2
                    className="
                      mb-3
                      text-[13px]
                      font-bold
                      text-gray-900
                    "
                  >
                    {group.title}
                  </h2>

                  {/* تراکنش‌های این ماه */}

                  <div className="space-y-3">
                    {group.transactions.map(
                      (transaction) => {
                        const Icon =
                          getTransactionIcon(
                            transaction.type,
                          );

                        const styles =
                          getTransactionClassName(
                            transaction.type,
                          );

                        return (
                          <button
                            key={
                              transaction.id
                            }
                            type="button"
                            className={`
                              flex
                              min-h-[58px]
                              w-full
                              items-center
                              justify-between
                              rounded-xl
                              border
                              px-4
                              py-3
                              text-right
                              ${styles.container}
                            `}
                          >
                            {/* سمت راست */}

                            <div className="flex items-center gap-3">
                              <div className="flex flex-col items-start gap-1">
                                <span
                                  className="
                                    text-[14px]
                                    font-medium
                                    text-gray-900
                                  "
                                >
                                  {
                                    transaction.title
                                  }
                                </span>

                                <span
                                  className="
                                    text-[11px]
                                    text-gray-400
                                  "
                                >
                                  {formatDate(
                                    transaction,
                                  )}
                                </span>
                              </div>

                              <Icon
                                className={`
                                  h-5
                                  w-5
                                  ${styles.icon}
                                `}
                              />
                            </div>

                            {/* سمت چپ */}

                            <div className="flex items-center gap-3">
                              <span
                                className="
                                  text-[13px]
                                  font-medium
                                  text-gray-900
                                "
                              >
                                {formatAmount(
                                  transaction.amount,
                                )}{" "}
                                تومان
                              </span>

                              <ChevronLeft
                                className="
                                  h-5
                                  w-5
                                  text-gray-900
                                "
                              />
                            </div>
                          </button>
                        );
                      },
                    )}
                  </div>
                </section>
              ),
            )}
          </div>
        )}

      {/* ========================= */}
      {/* Empty */}
      {/* ========================= */}

      {!isLoading &&
        !isError &&
        transactionGroups.length === 0 && (
          <div
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
              px-4
              py-10
              text-center
            "
          >
            <p className="text-sm text-gray-500">
              هنوز تراکنشی ثبت نشده است.
            </p>
          </div>
        )}
    </main>
  );
}