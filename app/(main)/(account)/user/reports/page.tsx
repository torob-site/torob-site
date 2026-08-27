"use client";
import { Badge } from "@/components/ui/badge";
import { useGetUserReports } from "@/lib/apis";
import { ArrowRight, ChevronLeft, CircleQuestionMark } from "lucide-react";
import Link from "next/link";


function getStatusImage(userStatus: string) {
  switch (userStatus) {
    case "بد":
      return "https://assets.torob.com/public/main/images/reports-red-state.png";
    case "خوب":
      return "https://assets.torob.com/public/main/images/reports-yellow-state.png";
    case "عالی":
      return "https://assets.torob.com/public/main/images/reports-green-state.png";
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return { label: "در انتظار بررسی", variant: "secondary" as const };
    case "REVIEWED":
      return { label: "تأیید شده", variant: "default" as const };
    case "RESOLVED":
      return { label: "تأیید شده", variant: "default" as const };
    case "REJECTED":
      return { label: "رد شده", variant: "destructive" as const };
    default:
      return { label: status, variant: "secondary" as const };
  }
}

export default function Reports() {
  const { data, isPending, error } = useGetUserReports();

  const reports = data?.results ?? [];
  const userStatus = data?.user_status ?? "good";

  return (
    <>
      <div className="flex justify-center w-full">
        <div className="max-w-lg px-10 py-10 w-full">
          {/* Header */}
          <div className="flex items-center justify-between w-full">
            <ArrowRight />
            <p className="text-sm">گزارش‌های من</p>
            <CircleQuestionMark />
          </div>

          {isPending ? (
            <div className="flex items-center justify-center mt-10">
              <img
                className="w-40 h-40"
                src="https://assets.torob.com/public/main/images/loading.gif"
              />
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <img
                className="w-56"
                src="https://api.torob.com/static/price_report_assets/neutral.png"
                alt="گزارش‌ی ندارید"
              />
              <p className="mt-4 text-sm text-[#64748b] text-center">
                هنوز گزارشی ندارید.
              </p>
              <p className="mt-1 text-xs text-[#94a3b8] text-center">
                اگر مشکلی در قیمت یا موجودی محصولی مشاهده کردید، از صفحه گزارش
                دهید.
              </p>
              <Link href="/user/create-report" className="w-full">
                <div className="flex items-center gap-2 justify-center py-3 mt-4 bg-[#1e293b] text-[#f8fafc] rounded-lg">
                  <p className="font-bold text-sm">ثبت گزارش از مشاهدات اخیر</p>
                  <ChevronLeft size={18} />
                </div>
              </Link>
            </div>
          ) : (
            <>
              {/* Status Card */}
              <div className="bg-white py-4 space-y-3 rounded-lg flex flex-col items-center w-auto mt-10">
                <div className="flex items-center gap-2">
                  <p>دقت گزارش‌ها: </p>
                  <p className="font-bold">{userStatus}</p>
                </div>
                <img width={255} height={53} src={getStatusImage(userStatus)} />
              </div>

              {/* Reports List Header */}
              <h1 className="text-center mt-4 font-bold">
                گزارش‌های یک ماه اخیر شما
              </h1>

              {/* Reports List */}
              <div className="mt-10">
                {reports.map((x: any) => {
                  const badge = getStatusBadge(x.status);
                  return (
                    <Link key={x.id} href={"/p/" + x.id + "/" + x.slug}>
                      <div className="flex gap-4 items-center border-b">
                        <img width={48} height={48} src={x.main_image} />
                        <div className="py-1">
                          <p className="truncate max-w-xs text-sm text-[#1e293b]">
                            {x.product_name}
                          </p>
                          <div className="flex mt-1 items-center gap-2">
                            <p className="text-sm text-[#1e293b]">
                              {x.product_shop_name}
                            </p>
                            <p className="text-xs text-[#64748b]">
                              {x.created_at}
                            </p>
                          </div>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Create Report Button */}
              <Link href="/user/create-report">
                <div className="flex items-center gap-2 justify-center py-3 mt-4 bg-[#1e293b] text-[#f8fafc] rounded-lg">
                  <p className="font-bold text-sm">ثبت گزارش از مشاهدات اخیر</p>
                  <ChevronLeft size={18} />
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}