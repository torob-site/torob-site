"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Clock3,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";
import { axiosClient } from "@/lib/axios";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { useGetWorkingHours, usePostWorkingHours } from "@/lib/apis";

interface Shift {
  id: number;
  from: string;
  to: string;
}

interface WorkingDay {
  id: number;
  name: string;
  shortName: string;
  shifts: Shift[];
  isClosed: boolean;
  isOpen: boolean;
}

interface WorkingHoursResponse {
  daily_working_hours: {
    [key: string]: {
      shift1: {
        start_time: string;
        end_time: string;
      };
      shift2: {
        start_time: string;
        end_time: string;
      };
    };
  };
}

// نگاشت روزهای هفته به ترتیب فارسی
const DAYS_MAP = {
  saturday: { id: 6, name: "شنبه", shortName: "شنبه" },
  sunday: { id: 0, name: "یکشنبه", shortName: "یکشنبه" },
  monday: { id: 1, name: "دوشنبه", shortName: "دوشنبه" },
  tuesday: { id: 2, name: "سه‌شنبه", shortName: "سه‌شنبه" },
  wednesday: { id: 3, name: "چهارشنبه", shortName: "چهارشنبه" },
  thursday: { id: 4, name: "پنجشنبه", shortName: "پنجشنبه" },
  friday: { id: 5, name: "جمعه", shortName: "جمعه" },
};

function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        checked ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
          checked ? "right-0.5" : "right-4.5"
        }`}
      />
    </button>
  );
}

function TimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="
        h-11
        w-full
        rounded-xl
        border
        border-gray-200
        bg-white
        px-4
        text-center
        text-sm
        text-gray-800
        outline-none
        transition
        focus:border-blue-500
        focus:ring-2
        focus:ring-blue-500/10
        dark:border-gray-700
        dark:bg-[#0f172a]
        dark:text-gray-100
      "
    />
  );
}

export default function WorkingHoursPage() {
  const { currentShop } = useCurrentShop();
  const [applyToAll, setApplyToAll] = useState<Record<number, boolean>>({});
  const [days, setDays] = useState<WorkingDay[]>([]);

  // دریافت ساعات کاری
  const { data, isLoading, error } = useGetWorkingHours();

  // Mutation برای ذخیره
  const updateWorkingHours = usePostWorkingHours();

  // تبدیل داده‌های API به فرمت مورد نیاز کامپوننت
  const convertApiDataToDays = (
    apiData: WorkingHoursResponse,
  ): WorkingDay[] => {
    if (!apiData) return [];

    return Object.entries(DAYS_MAP).map(([key, dayInfo]) => {
      const dayData = apiData.daily_working_hours[key];
      const shifts: Shift[] = [];
      let shiftId = 1;

      // اضافه کردن شیفت اول اگر معتبر باشد
      const hasShift1 =
        dayData.shift1.start_time !== "00:00:00" &&
        dayData.shift1.end_time !== "00:00:00";
      const hasShift2 =
        dayData.shift2.start_time !== "00:00:00" &&
        dayData.shift2.end_time !== "00:00:00";

      if (hasShift1) {
        shifts.push({
          id: shiftId++,
          from: dayData.shift1.start_time.substring(0, 5),
          to: dayData.shift1.end_time.substring(0, 5),
        });
      }

      if (hasShift2) {
        shifts.push({
          id: shiftId++,
          from: dayData.shift2.start_time.substring(0, 5),
          to: dayData.shift2.end_time.substring(0, 5),
        });
      }

      // اگر هیچ شیفتی وجود نداشت، روز تعطیل است
      const isClosed = shifts.length === 0;

      return {
        id: dayInfo.id,
        name: dayInfo.name,
        shortName: dayInfo.shortName,
        shifts: shifts,
        isClosed: isClosed,
        isOpen: false,
      };
    });
  };

  // تبدیل days به فرمت API برای ذخیره
  const convertDaysToApiFormat = (days: WorkingDay[]) => {
    const result: any = {};

    days.forEach((day) => {
      const dayKey = Object.keys(DAYS_MAP).find(
        (key) => DAYS_MAP[key as keyof typeof DAYS_MAP].id === day.id,
      );

      if (dayKey) {
        // اگر روز تعطیل است یا شیفت‌ها خالی هستند
        if (day.isClosed || day.shifts.length === 0) {
          result[dayKey] = {
            shift1: {
              start_time: "00:00:00",
              end_time: "00:00:00",
            },
            shift2: {
              start_time: "00:00:00",
              end_time: "00:00:00",
            },
          };
          return;
        }

        // شیفت اول
        const shift1 = day.shifts[0];
        // شیفت دوم (اگر وجود داشته باشد)
        const shift2 = day.shifts[1] || null;

        result[dayKey] = {
          shift1: {
            start_time: shift1?.from ? `${shift1.from}:00` : "00:00:00",
            end_time: shift1?.to ? `${shift1.to}:00` : "00:00:00",
          },
          shift2: {
            start_time: shift2?.from ? `${shift2.from}:00` : "00:00:00",
            end_time: shift2?.to ? `${shift2.to}:00` : "00:00:00",
          },
        };
      }
    });

    return {
      daily_working_hours: result,
    };
  };

  // وقتی داده از API میاد، state رو آپدیت کن
  useEffect(() => {
    if (data) {
      const convertedDays = convertApiDataToDays(data);
      setDays(convertedDays);
    }
  }, [data]);

  const updateDay = (
    dayId: number,
    updater: (day: WorkingDay) => WorkingDay,
  ) => {
    setDays((currentDays) =>
      currentDays.map((day) => (day.id === dayId ? updater(day) : day)),
    );
  };

  const toggleDay = (dayId: number) => {
    updateDay(dayId, (day) => ({
      ...day,
      isOpen: !day.isOpen,
    }));
  };

  const toggleClosed = (dayId: number) => {
    updateDay(dayId, (day) => {
      if (day.isClosed) {
        // باز کردن روز با یک شیفت پیش‌فرض
        return {
          ...day,
          isClosed: false,
          shifts: [
            {
              id: Date.now(),
              from: "09:00",
              to: "18:00",
            },
          ],
        };
      }

      // بستن روز
      return {
        ...day,
        isClosed: true,
        shifts: [],
      };
    });
  };

  const updateShift = (
    dayId: number,
    shiftId: number,
    field: "from" | "to",
    value: string,
  ) => {
    updateDay(dayId, (day) => ({
      ...day,
      shifts: day.shifts.map((shift) =>
        shift.id === shiftId
          ? {
              ...shift,
              [field]: value,
            }
          : shift,
      ),
    }));
  };

  const removeShift = (dayId: number, shiftId: number) => {
    updateDay(dayId, (day) => ({
      ...day,
      shifts: day.shifts.filter((shift) => shift.id !== shiftId),
    }));
  };

  const addShift = (dayId: number) => {
    updateDay(dayId, (day) => {
      // اگر روز تعطیل است، اول تعطیل رو بردار و یک شیفت اضافه کن
      if (day.isClosed) {
        return {
          ...day,
          isClosed: false,
          shifts: [
            {
              id: Date.now(),
              from: "09:00",
              to: "18:00",
            },
          ],
        };
      }

      // اگر ۲ شیفت داره، دیگه اضافه نکن
      if (day.shifts.length >= 2) {
        return day;
      }

      // اضافه کردن شیفت جدید
      return {
        ...day,
        shifts: [
          ...day.shifts,
          {
            id: Date.now(),
            from: "09:00",
            to: "18:00",
          },
        ],
      };
    });
  };

  const handleApplyToAll = (dayId: number, checked: boolean) => {
    setApplyToAll((current) => ({
      ...current,
      [dayId]: checked,
    }));

    if (!checked) {
      return;
    }

    const sourceDay = days.find((day) => day.id === dayId);

    if (!sourceDay || sourceDay.isClosed) {
      return;
    }

    setDays((currentDays) =>
      currentDays.map((day) => {
        if (day.name === "جمعه") {
          return day;
        }

        if (day.id === dayId) {
          return day;
        }

        return {
          ...day,
          isClosed: false,
          shifts: sourceDay.shifts.slice(0, 2).map((shift) => ({
            ...shift,
            id: Date.now() + Math.random(),
          })),
        };
      }),
    );
  };

  const handleSave = () => {
    const apiData = convertDaysToApiFormat(days);
    updateWorkingHours.mutate(apiData);
  };

  const getShiftSummary = (day: WorkingDay) => {
    if (day.isClosed) {
      return null;
    }

    if (day.shifts.length === 0) {
      return null;
    }

    if (day.shifts.length === 1) {
      return (
        <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {day.shifts[0].from} - {day.shifts[0].to}
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
        <span>
          {day.shifts[0].from} - {day.shifts[0].to}
        </span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>
          {day.shifts[1].from} - {day.shifts[1].to}
        </span>
      </span>
    );
  };

  if (!currentShop) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">
          لطفاً یک فروشگاه انتخاب کنید
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">
          در حال بارگذاری...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center">
        <div className="text-red-500">خطا در دریافت اطلاعات</div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        bg-gray-50
        pb-28
        text-gray-900
        dark:bg-[#0f172a]
        dark:text-white
      "
    >
      <main className="mx-auto w-full max-w-[700px] px-4 pt-5">
        <div className="mb-5">
          <h2 className="mb-2 text-base font-bold">روز و ساعت کاری</h2>

          <p className="text-sm leading-7 text-gray-500 dark:text-gray-400">
            زمان کاری فروشگاه خود را تنظیم کنید تا مشتریان از ساعات فعالیت شما
            مطلع شوند و از مراجعه در ساعات غیرفعال کاری جلوگیری شود.
          </p>
        </div>

        <div className="mb-4 flex items-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            روز و ساعت کاری
          </p>
          <p className="text-xs mr-2 text-gray-400">اختیاری</p>
        </div>

        <div className="space-y-3">
          {days.map((day) => (
            <div
              key={day.id}
              className="
                overflow-hidden
                rounded-2xl
                border
                border-gray-200
                bg-white
                shadow-sm
                dark:border-gray-800
                dark:bg-[#1e293b]
              "
            >
              <button
                type="button"
                onClick={() => toggleDay(day.id)}
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  gap-4
                  px-5
                  py-4
                  text-right
                  transition
                  hover:bg-gray-50
                  dark:hover:bg-[#253449]
                "
              >
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-gray-500 dark:text-gray-400" />

                  <span className="text-sm font-medium">{day.name}</span>
                </div>

                <div className="flex items-center gap-3">
                  {day.isClosed ? (
                    <span className="text-xs font-medium text-red-500">
                      تعطیل
                    </span>
                  ) : (
                    getShiftSummary(day)
                  )}

                  {day.isOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              </button>

              {day.isOpen && (
                <div className="border-t border-gray-100 dark:border-gray-800">
                  <div className="px-5 py-5">
                    {/* بخش شیفت‌ها */}
                    {day.isClosed ? (
                      <div className="mb-5 rounded-xl bg-gray-50 px-4 py-5 text-center dark:bg-[#0f172a]">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          فروشگاه در این روز تعطیل است.
                        </p>
                      </div>
                    ) : (
                      <>
                        {day.shifts.map((shift, index) => (
                          <div key={shift.id} className="mb-6 last:mb-5">
                            <div className="mb-3 flex items-center justify-between">
                              <div>
                                <h3 className="text-sm font-bold">
                                  شیفت {index === 0 ? "اول" : "دوم"}
                                </h3>

                                <p className="mt-1 text-[11px] text-gray-400">
                                  مثال از ۰۹:۰۰ تا ۱۳:۰۰
                                </p>
                              </div>

                              {day.shifts.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeShift(day.id, shift.id)}
                                  className="
                                    flex
                                    h-8
                                    w-8
                                    items-center
                                    justify-center
                                    rounded-lg
                                    text-gray-400
                                    transition
                                    hover:bg-red-50
                                    hover:text-red-500
                                    dark:hover:bg-red-500/10
                                  "
                                  aria-label="حذف شیفت"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                              <div>
                                <label className="mb-1.5 block text-xs text-gray-500 dark:text-gray-400">
                                  از
                                </label>

                                <TimeInput
                                  value={shift.from}
                                  onChange={(value) =>
                                    updateShift(day.id, shift.id, "from", value)
                                  }
                                />
                              </div>

                              <span className="mt-6 text-xs text-gray-400">
                                تا
                              </span>

                              <div>
                                <label className="mb-1.5 block text-xs text-gray-500 dark:text-gray-400">
                                  تا
                                </label>

                                <TimeInput
                                  value={shift.to}
                                  onChange={(value) =>
                                    updateShift(day.id, shift.id, "to", value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {day.shifts.length < 2 && (
                      <button
                        type="button"
                        onClick={() => addShift(day.id)}
                        className="
      group
      w-full
      flex
      items-center
      justify-center
      gap-2
      rounded-xl
      border-2
      border-dashed
      border-gray-300
      bg-gray-50/50
      px-4
      py-3
      text-sm
      font-medium
      text-gray-500
      transition-all
      hover:border-blue-400
      hover:bg-blue-50/50
      hover:text-blue-600
      dark:border-gray-700
      dark:bg-[#0f172a]/50
      dark:text-gray-400
      dark:hover:border-blue-500
      dark:hover:bg-blue-500/10
      dark:hover:text-blue-400
    "
                      >
                        <Plus className="h-5 w-5 transition-transform group-hover:scale-110" />
                        افزودن شیفت جدید
                      </button>
                    )}

                    {day.name !== "جمعه" && (
                      <div className="mt-4 flex items-center justify-between gap-4 py-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          این ساعات کاری، برای همه‌ی روزها اعمال شود.
                        </span>

                        <Switch
                          checked={!!applyToAll[day.id]}
                          onChange={(checked) =>
                            handleApplyToAll(day.id, checked)
                          }
                        />
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between gap-4 py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        در این روز، فروشگاه تعطیل است.
                      </span>

                      <Switch
                        checked={day.isClosed}
                        onChange={() => toggleClosed(day.id)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <div
        className="
                          fixed
                          bottom-0
                          left-1/2
                          z-30
                          w-full
                          max-w-[700px]
                          -translate-x-1/2
                          border-t
                          border-gray-200
                          bg-white
                          px-5
                          py-4
                          shadow-[0_-4px_15px_rgba(0,0,0,0.08)]
                      "
      >
        <button
          type="button"
          onClick={handleSave}
          disabled={updateWorkingHours.isPending}
          className="
                              flex
                              h-11
                              w-full
                              items-center
                              justify-center
                              rounded-lg
                              bg-blue-600
                              text-sm
                              font-medium
                              text-white
                              transition
                              hover:bg-blue-700
                              disabled:cursor-not-allowed
                              disabled:bg-gray-300
                          "
        >
          {updateWorkingHours.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "ذخیره"
          )}
        </button>
      </div>
    </div>
  );
}
