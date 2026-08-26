"use client";

import { useState, useEffect } from "react";
import { Monitor, Moon, Sun, Check } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { cn } from "@/lib/utils";

export default function Theme({ title }: { title?: string }) {
  const [mounted, setMounted] = useState(false);
  const { setTheme, theme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const themes = [
    {
      name: "light",
      title: "روشن",
      subtitle: "سفید",
      icon: Sun,
      preview: "bg-white border-gray-200",
      bar: "bg-gray-100",
      text: "bg-gray-800",
      accent: "bg-blue-500",
    },
    {
      name: "dark",
      title: "تاریک",
      subtitle: "تیره",
      icon: Moon,
      preview: "bg-[#0f172a] border-gray-700",
      bar: "bg-[#1e293b]",
      text: "bg-gray-300",
      accent: "bg-blue-400",
    },
    {
      name: "system",
      title: "سیستم",
      subtitle: "دستگاه",
      icon: Monitor,
      preview:
        "bg-gradient-to-br from-white to-[#0f172a] border-gray-300 dark:border-gray-600",
      bar: "bg-gradient-to-r from-gray-100 to-[#1e293b]",
      text: "bg-gray-600",
      accent: "bg-gradient-to-r from-blue-500 to-blue-400",
    },
  ] as const;

  const current = theme ?? "system";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={cn(
            "group flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all",
          )}
        >
          <span className="relative flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors group-hover:bg-white dark:group-hover:bg-gray-700">
            {mounted ? (
              <>
                {current === "light" && <Sun size={16} />}
                {current === "dark" && <Moon size={16} />}
                {current === "system" && <Monitor size={16} />}
              </>
            ) : (
              <Monitor size={16} />
            )}
          </span>
          {title && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {title}
            </span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent
        className={cn(
          "sm:max-w-[420px] p-0 gap-0 overflow-hidden border-gray-200 dark:border-gray-800",
          "[&>button]:left-3 [&>button]:right-auto [&>button]:top-3"
        )}
      >
        <DialogHeader className="px-5 pt-5 pb-2">
          <DialogTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            ظاهر
          </DialogTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            حالت نمایش مورد نظر خود را انتخاب کنید
          </p>
        </DialogHeader>

        <div className="p-5 pt-3 flex gap-2.5">
          {themes.map((item) => {
            const Icon = item.icon;
            const isActive = current === item.name;

            return (
              <button
                key={item.name}
                onClick={() => setTheme(item.name)}
                className={cn(
                  "relative flex-1 flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition-all duration-200",
                  isActive
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm"
                    : "border-gray-200 dark:border-gray-800 bg-transparent hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                )}
              >
                {/* Mini Preview Mockup */}
                <div
                  className={cn(
                    "w-full aspect-[4/3] rounded-lg border overflow-hidden flex flex-col gap-1 p-1.5 transition-colors",
                    item.preview
                  )}
                >
                  <div className={cn("h-2 w-full rounded-sm", item.bar)} />
                  <div className="flex gap-1 flex-1">
                    <div
                      className={cn("w-1/3 h-full rounded-sm", item.accent)}
                    />
                    <div className="flex-1 flex flex-col gap-1">
                      <div
                        className={cn(
                          "h-1.5 w-3/4 rounded-sm",
                          item.text,
                          "opacity-40"
                        )}
                      />
                      <div
                        className={cn(
                          "h-1.5 w-1/2 rounded-sm",
                          item.text,
                          "opacity-20"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1">
                    <Icon
                      size={14}
                      className={cn(
                        "transition-colors",
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400"
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        isActive
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-gray-900 dark:text-gray-100"
                      )}
                    >
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {item.subtitle}
                  </p>
                </div>

                {/* Active Indicator */}
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
                    isActive
                      ? "bg-blue-500 text-white scale-100 opacity-100"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400 scale-90 opacity-0"
                  )}
                >
                  <Check size={12} strokeWidth={3} />
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}