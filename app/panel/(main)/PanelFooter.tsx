"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Home,
    Flag,
    Plus,
    BarChart3,
    MoreHorizontal,
} from "lucide-react";

const items = [
    {
        title: "خانه",
        href: "/panel",
        icon: Home,
    },
    {
        title: "گزارش",
        href: "/panel/reports",
        icon: Flag,
    },
    {
        title: "افزودن محصول",
        href: "/panel/products/create",
        icon: Plus,
        main: true,
    },
    {
        title: "آمار",
        href: "/panel/statistics",
        icon: BarChart3,
    },
    {
        title: "بیشتر",
        href: "/panel/more",
        icon: MoreHorizontal,
    },
];

export default function PanelFooter() {
    const pathname = usePathname();

    const [isAtBottom, setIsAtBottom] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // اگر صفحه اصلاً اسکرول ندارد،
            // Footer همیشه نمایش داده شود.
            if (documentHeight <= windowHeight) {
                setIsAtBottom(false);
                return;
            }

            const distanceFromBottom =
                documentHeight - (scrollTop + windowHeight);

            // فقط وقتی واقعاً به انتهای صفحه رسیدیم مخفی شود
            setIsAtBottom(distanceFromBottom <= 20);
        };

        // اجرای اولیه
        handleScroll();

        window.addEventListener("scroll", handleScroll, {
            passive: true,
        });

        window.addEventListener("resize", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, []);

    return (
        <footer
            className={`
        fixed
        bottom-0
        left-1/2
        z-50
        h-[82px]
        w-full
        max-w-[700px]
        -translate-x-1/2
        border-t
        border-gray-200
        bg-white
        dark:border-gray-800
        dark:bg-[#212b36]

        transition-all
        duration-300
        ease-in-out

        ${isAtBottom
                    ? "translate-y-full opacity-0 pointer-events-none"
                    : "translate-y-0 opacity-100"
                }
      `}
        >
            <nav className="grid h-full grid-cols-5 px-4">
                {items.map((item) => {
                    const Icon = item.icon;

                    const isActive =
                        item.href === "/panel"
                            ? pathname === "/panel"
                            : pathname.startsWith(item.href);

                    // =========================
                    // افزودن محصول
                    // =========================

                    if (item.main) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="
                  flex
                  h-full
                  flex-col
                  items-center
                  justify-center
                  gap-1
                "
                            >
                                <div
                                    className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-blue-600
                    text-white
                  "
                                >
                                    <Plus className="h-6 w-6" />
                                </div>

                                <span className="text-xs font-medium text-blue-600">
                                    {item.title}
                                </span>
                            </Link>
                        );
                    }

                    // =========================
                    // بقیه آیتم‌ها
                    // =========================

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="
                flex
                h-full
                flex-col
                items-center
                justify-center
                gap-1
              "
                        >
                            <div
                                className={`
                  flex
                  h-9
                  w-14
                  items-center
                  justify-center
                  rounded-full

                  ${isActive
                                        ? "bg-blue-50 dark:bg-blue-950/40"
                                        : ""
                                    }
                `}
                            >
                                <Icon
                                    className={`
                    h-5
                    w-5

                    ${isActive
                                            ? "text-blue-600"
                                            : "text-gray-500 dark:text-gray-400"
                                        }
                  `}
                                />
                            </div>

                            <span
                                className={`
                  text-xs

                  ${isActive
                                        ? "font-semibold text-blue-600"
                                        : "text-gray-500 dark:text-gray-400"
                                    }
                `}
                            >
                                {item.title}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </footer>
    );
}