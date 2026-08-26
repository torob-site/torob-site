"use client";

import {
    createContext,
    useContext,
    useEffect,
    type ReactNode,
} from "react";

import { useRouter } from "next/navigation";
import axios from "axios";

import { useGetMyShops } from "@/lib/apis";

type PanelAccessContextType = {
    ready: boolean;
};

const PanelAccessContext =
    createContext<PanelAccessContextType>({
        ready: false,
    });

export function PanelAccessProvider({
    children,
}: {
    children: ReactNode;
}) {
    const router = useRouter();

    const {
        data: shops,
        isPending,
        isError,
        error,
        isSuccess,
    } = useGetMyShops();

    /**
     * -----------------------------------------
     * بررسی وضعیت دسترسی
     * -----------------------------------------
     */
    useEffect(() => {
        if (isPending) {
            return;
        }

        /**
         * ---------------------------------------
         * API ERROR
         * ---------------------------------------
         */
        if (isError) {
            const status = axios.isAxiosError(error)
                ? error.response?.status
                : undefined;

            console.log(
                "🔥 PANEL API ERROR:",
                status,
                error
            );

            /**
             * Token معتبر نیست
             */
            if (status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("shop_id");

                router.replace("/panel/login");

                return;
            }

            return;
        }

        /**
         * ---------------------------------------
         * API SUCCESS
         * ---------------------------------------
         */
        if (isSuccess) {
            /**
             * کاربر shop ندارد
             */
            if (!shops || shops.length === 0) {
                localStorage.removeItem("shop_id");

                router.replace("/sell/register");

                return;
            }
        }
    }, [
        isPending,
        isError,
        error,
        isSuccess,
        shops,
        router,
    ]);

    /**
     * -----------------------------------------
     * Loading
     * -----------------------------------------
     *
     * تا وقتی مشخص نشده کاربر کجاست،
     * پنل را render نمی‌کنیم.
     */
    if (isPending) {
        return <PanelLoading />;
    }

    /**
     * -----------------------------------------
     * 401
     * -----------------------------------------
     */
    if (isError) {
        const status = axios.isAxiosError(error)
            ? error.response?.status
            : undefined;

        if (status === 401) {
            return <PanelLoading />;
        }

        /**
         * خطای غیر 401
         */
        return (
            <PanelError />
        );
    }

    /**
     * -----------------------------------------
     * بدون Shop
     * -----------------------------------------
     */
    if (
        isSuccess &&
        (!shops || shops.length === 0)
    ) {
        return <PanelLoading />;
    }

    /**
     * -----------------------------------------
     * همه چیز OK
     * -----------------------------------------
     */
    return (
        <PanelAccessContext.Provider
            value={{
                ready: true,
            }}
        >
            {children}
        </PanelAccessContext.Provider>
    );
}

/**
 * ---------------------------------------------
 * Loading
 * ---------------------------------------------
 */
function PanelLoading() {
    return (
        <div
            dir="rtl"
            className="
                flex
                min-h-screen
                items-center
                justify-center
                bg-white
                dark:bg-[#212b36]
            "
        >
            <div
                className="
                    h-7
                    w-7
                    animate-spin
                    rounded-full
                    border-2
                    border-gray-300
                    border-t-blue-600
                "
            />
        </div>
    );
}

/**
 * ---------------------------------------------
 * Error
 * ---------------------------------------------
 */
function PanelError() {
    return (
        <div
            dir="rtl"
            className="
                flex
                min-h-screen
                items-center
                justify-center
                bg-white
                text-sm
                text-gray-600
                dark:bg-[#212b36]
                dark:text-gray-300
            "
        >
            خطایی در دریافت اطلاعات رخ داده است.
        </div>
    );
}

/**
 * ---------------------------------------------
 * Context Hook
 * ---------------------------------------------
 */
export function usePanelAccess() {
    return useContext(
        PanelAccessContext
    );
}